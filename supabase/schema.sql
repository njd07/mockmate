-- MockMate Supabase Postgres Database Schema
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- It is safe to run multiple times (idempotent)

-- 1. User Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  clerk_user_id TEXT PRIMARY KEY,
  email TEXT,
  name TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  free_sessions_used INTEGER DEFAULT 0,
  credits INTEGER DEFAULT 5,
  last_reset_date TIMESTAMPTZ DEFAULT NOW(),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Session History Table (Interviews & Quizzes)
CREATE TABLE IF NOT EXISTS public.session_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  domain TEXT NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('interview', 'quiz')),
  score JSONB,
  feedback JSONB,
  duration_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns if table already exists from previous runs
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'last_reset_date') THEN
    ALTER TABLE public.user_profiles ADD COLUMN last_reset_date TIMESTAMPTZ DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'session_history' AND column_name = 'feedback') THEN
    ALTER TABLE public.session_history ADD COLUMN feedback JSONB;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'session_history' AND column_name = 'duration_seconds') THEN
    ALTER TABLE public.session_history ADD COLUMN duration_seconds INTEGER DEFAULT 0;
  END IF;
END $$;

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_session_history_user 
  ON public.session_history (clerk_user_id);

CREATE INDEX IF NOT EXISTS idx_session_history_completed 
  ON public.session_history (completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer 
  ON public.user_profiles (stripe_customer_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_history ENABLE ROW LEVEL SECURITY;

-- 5. Access Policies (Server Functions use Service Role Key)
DROP POLICY IF EXISTS "Allow server functions full access on user_profiles" ON public.user_profiles;
CREATE POLICY "Allow server functions full access on user_profiles"
  ON public.user_profiles FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow server functions full access on session_history" ON public.session_history;
CREATE POLICY "Allow server functions full access on session_history"
  ON public.session_history FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. Trigger for automated updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER set_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =========================================================================
-- USEFUL ADMIN SQL QUERIES (Run in Supabase SQL Editor as needed)
-- =========================================================================

-- 1. Upgrade a specific user to 'pro' plan by email:
-- UPDATE public.user_profiles SET plan = 'pro' WHERE email = 'user@example.com';

-- 2. Upgrade a specific user to 'pro' plan by clerk_user_id:
-- UPDATE public.user_profiles SET plan = 'pro' WHERE clerk_user_id = 'user_2t...';

-- 3. Downgrade a specific user back to 'free' plan:
-- UPDATE public.user_profiles SET plan = 'free' WHERE email = 'user@example.com';

-- 4. Reset a user's monthly free sessions manually back to 5 available:
-- UPDATE public.user_profiles 
-- SET free_sessions_used = 0, credits = 5, last_reset_date = NOW() 
-- WHERE email = 'user@example.com';

-- 5. View all registered users and their current plan & usage:
-- SELECT clerk_user_id, email, name, plan, free_sessions_used, credits, last_reset_date, updated_at 
-- FROM public.user_profiles 
-- ORDER BY created_at DESC;
