import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

const Input = z.object({
  text: z.string().min(1).max(4000),
  voiceId: z.string().optional(),
});

// Available Edge TTS voices for interview narration
export const EDGE_TTS_VOICES = [
  { id: "en-US-AriaNeural", name: "Aria (US Female)", gender: "Female" },
  { id: "en-US-GuyNeural", name: "Guy (US Male)", gender: "Male" },
  { id: "en-US-JennyNeural", name: "Jenny (US Female)", gender: "Female" },
  { id: "en-US-ChristopherNeural", name: "Christopher (US Male)", gender: "Male" },
  { id: "en-IN-NeerjaNeural", name: "Neerja (Indian Female)", gender: "Female" },
  { id: "en-IN-PrabhatNeural", name: "Prabhat (Indian Male)", gender: "Male" },
] as const;

export const DEFAULT_VOICE = "en-US-AriaNeural";

/**
 * Strip markdown symbols, asterisks, backticks, and code formatting so speech sounds natural.
 */
export function cleanTextForSpeech(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/```[\s\S]*?```/g, " ") // remove code blocks
    .replace(/`([^`]+)`/g, "$1") // remove inline code backticks
    .replace(/\*\*([^*]+)\*\*/g, "$1") // remove bold **text**
    .replace(/\*([^*]+)\*/g, "$1") // remove italic *text*
    .replace(/#{1,6}\s+/g, "") // remove heading hashes
    .replace(/^\s*[-*+]\s+/gm, "") // remove list bullets
    .replace(/^\s*\d+\.\s+/gm, "") // remove numbered lists
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // remove links, keep text
    .replace(/[<>_~]/g, " ") // remove special chars
    .replace(/\s+/g, " ") // normalize whitespace
    .trim();
}

/**
 * Synthesize speech using Microsoft Edge TTS (free, no API key required).
 * Returns base64-encoded MP3 audio.
 * Falls back gracefully — the client will use browser speechSynthesis if this fails.
 */
export const synthesizeSpeech = createServerFn({ method: "POST" })
  .validator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const voice = data.voiceId || DEFAULT_VOICE;
    const cleanText = cleanTextForSpeech(data.text);

    if (!cleanText) {
      return { ok: false as const, error: "Empty speech text" };
    }

    console.log(`[TTS] Edge TTS voice=${voice}, clean text len=${cleanText.length}`);

    try {
      const tts = new MsEdgeTTS();
      await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

      const streamPromise = new Promise<Buffer>((resolve, reject) => {
        const { audioStream } = tts.toStream(cleanText);
        const chunks: Buffer[] = [];

        audioStream.on("data", (chunk: Buffer) => chunks.push(chunk));
        audioStream.on("end", () => resolve(Buffer.concat(chunks)));
        audioStream.on("error", (err: Error) => reject(err));
      });

      // 6.5s timeout protection for serverless functions
      const timeoutPromise = new Promise<Buffer>((_, reject) =>
        setTimeout(() => reject(new Error("TTS_TIMEOUT")), 6500)
      );

      const buf = await Promise.race([streamPromise, timeoutPromise]);
      const b64 = buf.toString("base64");
      console.log(`[TTS] Success, audio size=${buf.byteLength} bytes`);
      return { ok: true as const, audioBase64: b64 };
    } catch (e) {
      console.error("[TTS] Edge TTS error:", (e as Error).message);
      return { ok: false as const, error: (e as Error).message };
    }
  });
