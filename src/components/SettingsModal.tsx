import { useState } from "react";
import { X } from "lucide-react";
import { useSession } from "@/store/session";
import { GlowButton } from "./GlowButton";
import { EDGE_TTS_VOICES, DEFAULT_VOICE } from "@/lib/tts.functions";

export function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { settings, setSettings } = useSession();
  const [tab, setTab] = useState<"engine" | "voice" | "about">("engine");
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-up">
      <div className="glass-strong rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-md hover:bg-muted">
          <X className="h-5 w-5" />
        </button>
        <div className="p-6 border-b border-border">
          <h2 className="font-mono text-xl text-[var(--primary)]">[ SETTINGS ]</h2>
        </div>
        <div className="flex gap-1 px-6 pt-4 border-b border-border">
          {(["engine", "voice", "about"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-wider border-b-2 transition-colors ${
                tab === t ? "border-[var(--primary)] text-[var(--primary)]" : "border-transparent text-muted-foreground"
              }`}>
              {t}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4">
          {tab === "engine" && (
            <>
              <div>
                <label className="font-mono text-xs uppercase text-muted-foreground">Groq API Key (primary — fastest)</label>
                <input type="password" value={settings.groqApiKey}
                  onChange={(e) => setSettings({ groqApiKey: e.target.value })}
                  placeholder="gsk_..."
                  className="w-full mt-1 px-3 py-2 bg-input rounded-md font-mono text-sm border border-border focus:outline-none focus:border-[var(--primary)]" />
                <p className="text-xs text-muted-foreground mt-1">
                  Free at <a href="https://console.groq.com" target="_blank" rel="noopener" className="underline text-[var(--primary)]">console.groq.com</a>. Used first for blazing-fast inference.
                </p>
              </div>
              <div>
                <label className="font-mono text-xs uppercase text-muted-foreground">Gemini API Key (fallback)</label>
                <input type="password" value={settings.geminiApiKey}
                  onChange={(e) => setSettings({ geminiApiKey: e.target.value })}
                  placeholder="AIza..."
                  className="w-full mt-1 px-3 py-2 bg-input rounded-md font-mono text-sm border border-border focus:outline-none focus:border-[var(--primary)]" />
                <p className="text-xs text-muted-foreground mt-1">
                  Free at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" className="underline text-[var(--primary)]">aistudio.google.com</a>. Final cloud fallback.
                </p>
              </div>
              <hr className="border-border" />
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={settings.useOllama}
                  onChange={(e) => setSettings({ useOllama: e.target.checked })} />
                <span className="font-mono text-sm">Use Local Ollama (offline fallback)</span>
              </label>
              {settings.useOllama && (
                <>
                  <input value={settings.ollamaUrl} onChange={(e) => setSettings({ ollamaUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-input rounded-md font-mono text-sm border border-border" placeholder="http://localhost:11434" />
                  <input value={settings.ollamaModel} onChange={(e) => setSettings({ ollamaModel: e.target.value })}
                    className="w-full px-3 py-2 bg-input rounded-md font-mono text-sm border border-border" placeholder="llama3.1" />
                </>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                LLM priority: <span className="text-[var(--primary)]">Groq</span> → <span className="text-muted-foreground">Ollama</span> → <span className="text-[var(--accent)]">Gemini</span> → retry loop (30s deadline)
              </p>
            </>
          )}
          {tab === "voice" && (
            <>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={settings.voice}
                  onChange={(e) => setSettings({ voice: e.target.checked })} />
                <span className="font-mono text-sm">Enable voice (Edge TTS)</span>
              </label>
              <div>
                <label className="font-mono text-xs uppercase text-muted-foreground">Voice</label>
                <select value={settings.voiceId} onChange={(e) => setSettings({ voiceId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-input rounded-md font-mono text-sm border border-border focus:outline-none focus:border-[var(--primary)]">
                  {EDGE_TTS_VOICES.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Microsoft Edge TTS — free, natural voices. No API key needed.
                </p>
              </div>
            </>
          )}
          {tab === "about" && (
            <div className="font-mono text-sm space-y-3 text-muted-foreground">
              <p><span className="text-[var(--primary)]">MockMate v1.0</span> — AI-powered mock interview platform</p>
              <p>4 domains · Voice + text interviews · MCQ quizzes with free-form judging · Edge TTS</p>
              <p>Built for CS freshers preparing for placement interviews. LLM via Groq / Ollama / Gemini with smart failover.</p>
            </div>
          )}
        </div>

        <div className="p-6 pt-0 flex justify-end">
          <GlowButton onClick={onClose}>Close</GlowButton>
        </div>
      </div>
    </div>
  );
}
