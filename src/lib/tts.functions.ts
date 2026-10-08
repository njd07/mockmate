import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

const Input = z.object({
  text: z.string().min(1).max(4000),
  voiceId: z.string().optional(),
});

// Available Edge TTS voices for natural interview narration
export const EDGE_TTS_VOICES = [
  { id: "en-US-ChristopherNeural", name: "Christopher (US Male - Professional)", gender: "Male" },
  { id: "en-US-GuyNeural", name: "Guy (US Male - Conversational)", gender: "Male" },
  { id: "en-US-JennyNeural", name: "Jenny (US Female - Warm)", gender: "Female" },
  { id: "en-US-AriaNeural", name: "Aria (US Female - Crisp)", gender: "Female" },
  { id: "en-IN-PrabhatNeural", name: "Prabhat (Indian Male - Tech Lead)", gender: "Male" },
  { id: "en-IN-NeerjaNeural", name: "Neerja (Indian Female - Clear)", gender: "Female" },
] as const;

export const DEFAULT_VOICE = "en-US-ChristopherNeural";

/**
 * Clean text specifically for spoken speech so technical jargon and symbols
 * sound natural and conversational rather than robotic.
 */
export function cleanTextForSpeech(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/```[\s\S]*?```/g, " ") // remove entire code blocks
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
    .replace(/\*([^*]+)\*/g, "$1") // italic
    .replace(/#{1,6}\s+/g, "") // heading hashes
    .replace(/^\s*[-*+]\s+/gm, "") // list bullets
    .replace(/^\s*\d+\.\s+/gm, "") // numbered lists
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // markdown links
    .replace(/O\(([nN1kKmM]|log\s*[nN]|n\s*\^?\s*2)\)/g, (match, p1) => `O of ${p1}`) // pronounce complexities cleanly
    .replace(/O\(1\)/gi, "O of 1")
    .replace(/O\(n\)/gi, "O of n")
    .replace(/O\(n\s*log\s*n\)/gi, "O of n log n")
    .replace(/[<>_~{}[\]]/g, " ") // remove special braces and characters
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Synthesize speech using Microsoft Edge TTS (high fidelity neural voice).
 * Tries local edge-tts binary first if installed, falls back to msedge-tts websocket client.
 */
export const synthesizeSpeech = createServerFn({ method: "POST" })
  .validator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const voice = data.voiceId || DEFAULT_VOICE;
    const cleanText = cleanTextForSpeech(data.text);

    if (!cleanText) {
      return { ok: false as const, error: "Empty speech text" };
    }

    // 1. Try local edge-tts binary (super fast ~1s, flawless neural quality)
    try {
      const tmpFile = path.join(os.tmpdir(), `mockmate_tts_${Date.now()}_${Math.random().toString(36).slice(2)}.mp3`);
      const cliResult = await new Promise<Buffer | null>((resolve) => {
        // Try common edge-tts locations
        const binary = fs.existsSync("/home/nrishan/.local/bin/edge-tts")
          ? "/home/nrishan/.local/bin/edge-tts"
          : "edge-tts";

        execFile(
          binary,
          ["--voice", voice, "--text", cleanText, "--write-media", tmpFile],
          { timeout: 7000 },
          (err) => {
            if (err || !fs.existsSync(tmpFile)) {
              return resolve(null);
            }
            try {
              const buf = fs.readFileSync(tmpFile);
              try { fs.unlinkSync(tmpFile); } catch {}
              resolve(buf);
            } catch {
              resolve(null);
            }
          }
        );
      });

      if (cliResult && cliResult.byteLength > 500) {
        return { ok: true as const, audioBase64: cliResult.toString("base64") };
      }
    } catch {
      // Fall through to msedge-tts library
    }

    // 2. Fallback to msedge-tts isomorphic library with socket cleanup
    let ttsInstance: MsEdgeTTS | null = null;
    try {
      ttsInstance = new MsEdgeTTS();
      await ttsInstance.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

      const streamPromise = new Promise<Buffer>((resolve, reject) => {
        if (!ttsInstance) return reject(new Error("No TTS instance"));
        const { audioStream } = ttsInstance.toStream(cleanText);
        const chunks: Buffer[] = [];

        audioStream.on("data", (chunk: Buffer) => chunks.push(chunk));
        audioStream.on("end", () => resolve(Buffer.concat(chunks)));
        audioStream.on("error", (err: Error) => reject(err));
      });

      const timeoutPromise = new Promise<Buffer>((_, reject) =>
        setTimeout(() => reject(new Error("TTS_TIMEOUT")), 8500)
      );

      const buf = await Promise.race([streamPromise, timeoutPromise]);
      const b64 = buf.toString("base64");
      return { ok: true as const, audioBase64: b64 };
    } catch (e) {
      console.warn("[TTS] Edge TTS fallback failed:", (e as Error).message);
      return { ok: false as const, error: (e as Error).message };
    } finally {
      if (ttsInstance) {
        try {
          ttsInstance.close();
        } catch {}
      }
    }
  });
