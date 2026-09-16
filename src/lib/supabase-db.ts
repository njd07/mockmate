import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface UserProfile {
  clerk_user_id: string;
  email: string;
  name?: string;
  plan: "free" | "pro";
  free_sessions_used: number;
  credits: number;
  stripe_customer_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SessionRecord {
  id?: string;
  clerk_user_id: string;
  domain: string;
  session_type: "interview" | "quiz";
  score?: Record<string, any>;
  completed_at?: string;
}

// In-memory fallback cache for local dev / offline mode
const memoryStore = {
  profiles: new Map<string, UserProfile>(),
  sessions: [] as SessionRecord[],
};

function getSupabaseAdminClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;
  try {
    return createClient(url, key, {
      auth: { persistSession: false },
    });
  } catch (e) {
    console.warn("[DB] Could not initialize Supabase client:", e);
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
        console.warn("[DB] Supabase get profile warning:", error.message);
      }

      if (data) {
        return data as UserProfile;
      }

      // Create new profile
      const newProfile: UserProfile = {
        clerk_user_id: userId,
        email,
        name,
        plan: "free",
        free_sessions_used: 0,
        credits: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: inserted, error: insertError } = await client
        .from("user_profiles")
        .insert(newProfile)
        .select()
        .single();

      if (!insertError && inserted) {
        return inserted as UserProfile;
      }
    } catch (e) {
      console.warn("[DB] Supabase operation failed, using memory store:", e);
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
      credits: 3,
      created_at: new Date().toISOString(),
    };
    memoryStore.profiles.set(userId, profile);
  }
  return profile;
}

export async function recordCompletedSession(
  userId: string,
  domain: string,
  sessionType: "interview" | "quiz",
  score?: Record<string, unknown>
): Promise<UserProfile> {
  const client = getSupabaseAdminClient();
  const sessionEntry: SessionRecord = {
    clerk_user_id: userId,
    domain,
    session_type: sessionType,
    score,
    completed_at: new Date().toISOString(),
  };

  if (client) {
    try {
      // 1. Log session
      await client.from("session_history").insert(sessionEntry);

      // 2. Fetch current profile
      const { data: profile } = await client
        .from("user_profiles")
        .select("*")
        .eq("clerk_user_id", userId)
        .single();

      if (profile) {
        const nextUsed = (profile.free_sessions_used || 0) + 1;
        const nextCredits = Math.max(0, (profile.credits || 3) - 1);
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
      console.warn("[DB] Supabase record failed, using memory store:", e);
    }
  }

  // Memory fallback
  memoryStore.sessions.push(sessionEntry);
  const profile = await getOrCreateUserProfile(userId);
  profile.free_sessions_used += 1;
  profile.credits = Math.max(0, profile.credits - 1);
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
      const { data, error } = await client
        .from("user_profiles")
        .update({
          plan,
          ...(stripeCustomerId ? { stripe_customer_id: stripeCustomerId } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq("clerk_user_id", userId)
        .select()
        .single();

      if (!error && data) return data as UserProfile;
    } catch (e) {
      console.warn("[DB] Supabase set plan failed, using memory store:", e);
    }
  }

  const profile = await getOrCreateUserProfile(userId);
  profile.plan = plan;
  if (stripeCustomerId) profile.stripe_customer_id = stripeCustomerId;
  profile.updated_at = new Date().toISOString();
  memoryStore.profiles.set(userId, profile);
  return profile;
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
      console.warn("[DB] Supabase credit adjust failed:", e);
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
      console.warn("[DB] Supabase get history failed:", e);
    }
  }

  return memoryStore.sessions.filter((s) => s.clerk_user_id === userId);
}
