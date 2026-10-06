import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface UserProfile {
  clerk_user_id: string;
  email: string;
  name?: string;
  plan: "free" | "pro";
  free_sessions_used: number;
  credits: number;
  last_reset_date?: string;
  stripe_customer_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SessionRecord {
  id?: string;
  clerk_user_id: string;
  domain: string;
  session_type: "interview" | "quiz";
  score?: Record<string, unknown>;
  feedback?: Record<string, unknown> | Array<unknown>;
  duration_seconds?: number;
  completed_at?: string;
}

// In-memory fallback cache for local dev / offline mode
const memoryStore = {
  profiles: new Map<string, UserProfile>(),
  sessions: [] as SessionRecord[],
};

/**
 * Checks whether the user's monthly free session quota should be reset.
 * Resets if last_reset_date is from a prior calendar month or missing.
 */
export function shouldResetMonthly(lastResetDateStr?: string): boolean {
  if (!lastResetDateStr) return true;
  const lastReset = new Date(lastResetDateStr);
  if (isNaN(lastReset.getTime())) return true;
  const now = new Date();
  const resetYearMonth = lastReset.getUTCFullYear() * 12 + lastReset.getUTCMonth();
  const currentYearMonth = now.getUTCFullYear() * 12 + now.getUTCMonth();
  return currentYearMonth > resetYearMonth;
}

async function checkAndApplyMonthlyReset(
  client: SupabaseClient | null,
  profile: UserProfile
): Promise<UserProfile> {
  if (!shouldResetMonthly(profile.last_reset_date)) {
    return profile;
  }

  const nowIso = new Date().toISOString();
  if (client) {
    try {
      // First try updating with last_reset_date
      const { data, error } = await client
        .from("user_profiles")
        .update({
          free_sessions_used: 0,
          credits: 5,
          last_reset_date: nowIso,
          updated_at: nowIso,
        })
        .eq("clerk_user_id", profile.clerk_user_id)
        .select()
        .single();

      if (!error && data) {
        return data as UserProfile;
      }

      // Fallback if column 'last_reset_date' does not exist yet in Supabase table
      if (error) {
        console.warn("[DB:Supabase] Reset update with last_reset_date failed, trying fallback:", error.message);
        const { data: fallbackData } = await client
          .from("user_profiles")
          .update({
            free_sessions_used: 0,
            credits: 5,
            updated_at: nowIso,
          })
          .eq("clerk_user_id", profile.clerk_user_id)
          .select()
          .single();
        if (fallbackData) {
          const res = fallbackData as UserProfile;
          res.last_reset_date = nowIso;
          return res;
        }
      }
    } catch (e) {
      console.warn("[DB:Supabase] checkAndApplyMonthlyReset error:", e);
    }
  }

  // Fallback update on in-memory object
  profile.free_sessions_used = 0;
  profile.credits = 5;
  profile.last_reset_date = nowIso;
  profile.updated_at = nowIso;
  memoryStore.profiles.set(profile.clerk_user_id, profile);
  return profile;
}

// Singleton Supabase admin client cache
let cachedClient: SupabaseClient | null = null;
let clientInitialized = false;

export function getSupabaseAdminClient(): SupabaseClient | null {
  if (clientInitialized) return cachedClient;

  let rawUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!rawUrl || !key) {
    console.info("[DB:Memory] Supabase credentials not found in env — using in-memory fallback store.");
    clientInitialized = true;
    cachedClient = null;
    return null;
  }

  // Normalize project URL: strip /rest/v1/ or trailing slashes if user copied REST endpoint
  const url = rawUrl.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");

  try {
    cachedClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    clientInitialized = true;
    console.info("[DB:Supabase] Supabase client successfully initialized.");
    return cachedClient;
  } catch (e) {
    console.warn("[DB] Could not initialize Supabase client:", e);
    clientInitialized = true;
    cachedClient = null;
    return null;
  }
}

export async function getOrCreateUserProfile(
  userId: string,
  email: string = "user@example.com",
  name: string = "Candidate"
): Promise<UserProfile> {
  const client = getSupabaseAdminClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("user_profiles")
        .select("*")
        .eq("clerk_user_id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.warn("[DB:Supabase] get profile error:", error.message);
      }

      if (data) {
        return await checkAndApplyMonthlyReset(client, data as UserProfile);
      }

      // Create new profile
      const newProfile: UserProfile = {
        clerk_user_id: userId,
        email,
        name,
        plan: "free",
        free_sessions_used: 0,
        credits: 5,
        last_reset_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      let { data: inserted, error: insertError } = await client
        .from("user_profiles")
        .insert(newProfile)
        .select()
        .single();

      if (insertError && insertError.message?.includes("last_reset_date")) {
        const { last_reset_date, ...withoutReset } = newProfile;
        const res = await client
          .from("user_profiles")
          .insert(withoutReset)
          .select()
          .single();
        inserted = res.data;
        insertError = res.error;
      }

      if (!insertError && inserted) {
        return inserted as UserProfile;
      }
    } catch (e) {
      console.warn("[DB:Supabase] getOrCreateUserProfile failed, using memory store:", e);
    }
  }

  // Memory fallback
  let profile = memoryStore.profiles.get(userId);
  if (!profile) {
    profile = {
      clerk_user_id: userId,
      email,
      name,
      plan: "free",
      free_sessions_used: 0,
      credits: 5,
      last_reset_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memoryStore.profiles.set(userId, profile);
  } else if (shouldResetMonthly(profile.last_reset_date)) {
    profile.free_sessions_used = 0;
    profile.credits = 5;
    profile.last_reset_date = new Date().toISOString();
    profile.updated_at = new Date().toISOString();
    memoryStore.profiles.set(userId, profile);
  }
  return profile;
}

export async function recordCompletedSession(
  userId: string,
  domain: string,
  sessionType: "interview" | "quiz",
  score?: Record<string, unknown>,
  feedback?: Record<string, unknown> | Array<unknown>,
  durationSeconds: number = 0
): Promise<UserProfile> {
  const client = getSupabaseAdminClient();
  const sessionEntry: SessionRecord = {
    clerk_user_id: userId,
    domain,
    session_type: sessionType,
    score,
    feedback,
    duration_seconds: durationSeconds,
    completed_at: new Date().toISOString(),
  };

  if (client) {
    try {
      // 1. Log session
      await client.from("session_history").insert(sessionEntry);

      // 2. Fetch current profile
      const { data: rawProfile } = await client
        .from("user_profiles")
        .select("*")
        .eq("clerk_user_id", userId)
        .single();

      if (rawProfile) {
        const profile = await checkAndApplyMonthlyReset(client, rawProfile as UserProfile);
        // Only count against free sessions / credits for real mock interviews, NOT for MCQ quizzes
        const isInterview = sessionType === "interview";
        const nextUsed = isInterview ? (profile.free_sessions_used || 0) + 1 : (profile.free_sessions_used || 0);
        const nextCredits = isInterview ? Math.max(0, (profile.credits || 5) - 1) : (profile.credits ?? 5);

        const { data: updated } = await client
          .from("user_profiles")
          .update({
            free_sessions_used: nextUsed,
            credits: nextCredits,
            updated_at: new Date().toISOString(),
          })
          .eq("clerk_user_id", userId)
          .select()
          .single();

        if (updated) return updated as UserProfile;
      }
    } catch (e) {
      console.warn("[DB:Supabase] recordCompletedSession failed, using memory store:", e);
    }
  }

  // Memory fallback
  memoryStore.sessions.push(sessionEntry);
  const profile = await getOrCreateUserProfile(userId);
  if (sessionType === "interview") {
    profile.free_sessions_used += 1;
    profile.credits = Math.max(0, profile.credits - 1);
  }
  profile.updated_at = new Date().toISOString();
  memoryStore.profiles.set(userId, profile);
  return profile;
}

export async function setUserPlan(
  userId: string,
  plan: "free" | "pro",
  stripeCustomerId?: string
): Promise<UserProfile> {
  const client = getSupabaseAdminClient();
  if (client) {
    try {
      const updateData: Partial<UserProfile> = {
        plan,
        updated_at: new Date().toISOString(),
      };
      if (stripeCustomerId) {
        updateData.stripe_customer_id = stripeCustomerId;
      }

      const { data, error } = await client
        .from("user_profiles")
        .update(updateData)
        .eq("clerk_user_id", userId)
        .select()
        .single();

      if (!error && data) return data as UserProfile;
    } catch (e) {
      console.warn("[DB:Supabase] setUserPlan failed, using memory store:", e);
    }
  }

  const profile = await getOrCreateUserProfile(userId);
  profile.plan = plan;
  if (stripeCustomerId) profile.stripe_customer_id = stripeCustomerId;
  profile.updated_at = new Date().toISOString();
  memoryStore.profiles.set(userId, profile);
  return profile;
}

export async function getUserByStripeCustomerId(
  stripeCustomerId: string
): Promise<UserProfile | null> {
  const client = getSupabaseAdminClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("user_profiles")
        .select("*")
        .eq("stripe_customer_id", stripeCustomerId)
        .maybeSingle();

      if (!error && data) return data as UserProfile;
    } catch (e) {
      console.warn("[DB:Supabase] getUserByStripeCustomerId failed:", e);
    }
  }

  for (const profile of memoryStore.profiles.values()) {
    if (profile.stripe_customer_id === stripeCustomerId) {
      return profile;
    }
  }
  return null;
}

export async function adjustUserCredits(
  userId: string,
  creditDelta: number
): Promise<UserProfile> {
  const client = getSupabaseAdminClient();
  if (client) {
    try {
      const { data: profile } = await client
        .from("user_profiles")
        .select("credits")
        .eq("clerk_user_id", userId)
        .single();

      const newCredits = Math.max(0, ((profile?.credits as number) || 0) + creditDelta);
      const { data, error } = await client
        .from("user_profiles")
        .update({ credits: newCredits, updated_at: new Date().toISOString() })
        .eq("clerk_user_id", userId)
        .select()
        .single();

      if (!error && data) return data as UserProfile;
    } catch (e) {
      console.warn("[DB:Supabase] adjustUserCredits failed:", e);
    }
  }

  const profile = await getOrCreateUserProfile(userId);
  profile.credits = Math.max(0, profile.credits + creditDelta);
  profile.updated_at = new Date().toISOString();
  memoryStore.profiles.set(userId, profile);
  return profile;
}

export async function getUserSessionHistory(userId: string): Promise<SessionRecord[]> {
  const client = getSupabaseAdminClient();
  if (client) {
    try {
      const { data, error } = await client
        .from("session_history")
        .select("*")
        .eq("clerk_user_id", userId)
        .order("completed_at", { ascending: false });

      if (!error && data) return data as SessionRecord[];
    } catch (e) {
      console.warn("[DB:Supabase] getUserSessionHistory failed:", e);
    }
  }

  return memoryStore.sessions.filter((s) => s.clerk_user_id === userId);
}
