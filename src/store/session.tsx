import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { getUserStatus, startInterviewSession } from "@/lib/user.functions";

export type Settings = {
  voice: boolean;
  voiceId: string;
  useOllama: boolean;
  ollamaUrl: string;
  ollamaModel: string;
  groqApiKey: string;
  geminiApiKey: string;
};

const DEFAULTS: Settings = {
  voice: true,
  voiceId: "en-US-ChristopherNeural",
  useOllama: false,
  ollamaUrl: "http://localhost:11434",
  ollamaModel: "mistral:7b-instruct-q3_K_M",
  groqApiKey: "",
  geminiApiKey: "",
};

export type User = {
  id: string;
  email: string;
  name?: string;
  imageUrl?: string;
};

type SessionCtx = {
  user: User | null;
  loading: boolean;
  isPro: boolean;
  freeSessionsUsed: number;
  remainingFree: number;
  credits: number;
  refreshProfile: () => Promise<void>;
  consumeSession: (domain: string) => Promise<boolean>;
  settings: Settings;
  setSettings: (s: Partial<Settings>) => void;
  signOut: () => Promise<void>;
  setCustomUser: (u: User | null) => void;
};

const SessionContext = createContext<SessionCtx | null>(null);

export function SessionProvider({
  children,
  clerkUser = null,
  onClerkSignOut,
}: {
  children: ReactNode;
  clerkUser?: User | null;
  onClerkSignOut?: () => Promise<void>;
}) {
  const [localUser, setLocalUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("mockmate:user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const activeUser = clerkUser || localUser;
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [freeSessionsUsed, setFreeSessionsUsed] = useState(0);
  const [remainingFree, setRemainingFree] = useState(5);
  const [credits, setCredits] = useState(5);

  const [settings, setSettingsState] = useState<Settings>(() => {
    if (typeof window === "undefined") return DEFAULTS;
    try {
      const raw = localStorage.getItem("mockmate:settings");
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  const refreshProfile = useCallback(async () => {
    if (!activeUser?.id) {
      setLoading(false);
      return;
    }
    try {
      const res = await getUserStatus({
        data: {
          userId: activeUser.id,
          email: activeUser.email,
          name: activeUser.name,
        },
      });

      const localUsedStr = typeof window !== "undefined" ? localStorage.getItem(`mockmate:used:${activeUser.id}`) : null;
      const localUsed = localUsedStr ? parseInt(localUsedStr, 10) : 0;
      const serverUsed = res.profile.free_sessions_used || 0;
      const effectiveUsed = Math.max(serverUsed, isNaN(localUsed) ? 0 : localUsed);
      const effectiveRemaining = res.isPro ? 999 : Math.max(0, 5 - effectiveUsed);

      setIsPro(res.isPro);
      setFreeSessionsUsed(effectiveUsed);
      setRemainingFree(effectiveRemaining);
      setCredits(res.isPro ? 999 : Math.max(0, 5 - effectiveUsed));
    } catch (e) {
      console.warn("[Session] Could not fetch profile:", e);
    } finally {
      setLoading(false);
    }
  }, [activeUser?.id, activeUser?.email, activeUser?.name]);

  const consumeSession = useCallback(async (domain: string) => {
    if (!activeUser?.id || isPro) return true;

    // Optimistically update local session state and storage immediately
    setFreeSessionsUsed((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem(`mockmate:used:${activeUser.id}`, String(next));
      } catch {}
      return next;
    });
    setRemainingFree((prev) => Math.max(0, prev - 1));
    setCredits((prev) => Math.max(0, prev - 1));

    try {
      await startInterviewSession({
        data: {
          userId: activeUser.id,
          domain,
        },
      });
      await refreshProfile();
      return true;
    } catch (e) {
      console.warn("[Session] Could not decrement session on server:", e);
      return false;
    }
  }, [activeUser?.id, isPro, refreshProfile]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const setSettings = (patch: Partial<Settings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem("mockmate:settings", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const setCustomUser = (u: User | null) => {
    setLocalUser(u);
    if (u) {
      try {
        localStorage.setItem("mockmate:user", JSON.stringify(u));
      } catch {}
    } else {
      try {
        localStorage.removeItem("mockmate:user");
      } catch {}
    }
  };

  const signOut = async () => {
    if (onClerkSignOut) {
      await onClerkSignOut();
    }
    setCustomUser(null);
    setIsPro(false);
    setFreeSessionsUsed(0);
    setRemainingFree(5);
  };

  return (
    <SessionContext.Provider
      value={{
        user: activeUser,
        loading,
        isPro,
        freeSessionsUsed,
        remainingFree,
        credits,
        refreshProfile,
        consumeSession,
        settings,
        setSettings,
        signOut,
        setCustomUser,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}
