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
 * Synthesize speech using Microsoft Edge TTS (free, no API key required).
 * Returns base64-encoded MP3 audio.
 * Falls back gracefully — the client should use browser speechSynthesis if this fails.
 */
export const synthesizeSpeech = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const voice = data.voiceId || DEFAULT_VOICE;
    console.log(`[TTS] Edge TTS voice=${voice}, text length=${data.text.length}`);

    try {
      const tts = new MsEdgeTTS();
      await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

      const { audioStream } = tts.toStream(data.text);
      const chunks: Buffer[] = [];

      await new Promise<void>((resolve, reject) => {
        audioStream.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
        });
        audioStream.on("end", () => resolve());
        audioStream.on("error", (err: Error) => reject(err));
      });

      const buf = Buffer.concat(chunks);
      const b64 = buf.toString("base64");
      console.log(`[TTS] Success, audio size=${buf.byteLength} bytes`);
      return { ok: true as const, audioBase64: b64 };
    } catch (e) {
      console.error("[TTS] Edge TTS error:", (e as Error).message);
      return { ok: false as const, error: (e as Error).message };
    }
  });
