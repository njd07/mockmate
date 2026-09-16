-- MockMate Supabase Postgres Database Schema
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

CREATE TABLE IF NOT EXISTS public.user_profiles (
  clerk_user_id TEXT PRIMARY KEY,
  email TEXT,
  name TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  free_sessions_used INTEGER DEFAULT 0,
  credits INTEGER DEFAULT 3,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.session_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  domain TEXT NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('interview', 'quiz')),
  score JSONB,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_history ENABLE ROW LEVEL SECURITY;

-- Allow read/write access via service role key (backend server functions)
CREATE POLICY "Allow server functions full access on user_profiles"
  ON public.user_profiles FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow server functions full access on session_history"
  ON public.session_history FOR ALL
  USING (true)
  WITH CHECK (true);
