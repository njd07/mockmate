import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { getUserStatus } from "@/lib/user.functions";

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
  voiceId: "en-US-AriaNeural",
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
  const [remainingFree, setRemainingFree] = useState(3);
  const [credits, setCredits] = useState(3);

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
      setIsPro(res.isPro);
      setFreeSessionsUsed(res.profile.free_sessions_used || 0);
      setRemainingFree(res.remainingFree);
      setCredits(res.profile.credits ?? 3);
    } catch (e) {
      console.warn("[Session] Could not fetch profile:", e);
    } finally {
      setLoading(false);
    }
  }, [activeUser?.id, activeUser?.email, activeUser?.name]);

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
    setRemainingFree(3);
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
