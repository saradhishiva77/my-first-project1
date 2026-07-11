/*
# AI Disaster Risk Prediction Dashboard — Core Schema

1. Overview
   Multi-user application with Supabase email/password auth and role-based access
   (admin / user). Stores user profiles with a role, prediction history, system
   alerts, and ML dataset metadata.

2. New Tables
   - profiles: extends auth.users with a role (admin/user), full_name, avatar_url.
   - predictions: per-user disaster risk predictions with inputs, results, AI recommendations.
   - alerts: system-wide disaster alerts (level, state, message, source).
   - datasets: metadata for uploaded CSV datasets used by the ML pipeline.

3. Security
   - RLS enabled on every table.
   - profiles: each authenticated user can read/update their own profile; admins
     can read all profiles (for the admin user-management screen).
   - predictions: owner-scoped CRUD (auth.uid() = user_id). user_id defaults to
     auth.uid() so inserts omitting it still succeed.
   - alerts: readable by all authenticated users; only admins can insert/update/delete.
   - datasets: readable by all authenticated users; only admins can insert/update/delete.
   - Role checks use raw_app_meta_data.role via a helper expression.
*/

-- Helper: current user's role from JWT app metadata (admin/user). Defaults to 'user'.
-- We compare against raw_app_meta_data which is user-immutable and set by an admin.

-- PROFILES ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin','user')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "select_all_profiles_admin" ON profiles;
CREATE POLICY "select_all_profiles_admin"
  ON profiles FOR SELECT TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- PREDICTIONS ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  state text NOT NULL,
  district text,
  inputs jsonb NOT NULL,
  results jsonb NOT NULL,
  recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  confidence_score numeric NOT NULL,
  risk_level text NOT NULL,
  affected_population integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_predictions" ON predictions;
CREATE POLICY "select_own_predictions"
  ON predictions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_predictions" ON predictions;
CREATE POLICY "insert_own_predictions"
  ON predictions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_predictions" ON predictions;
CREATE POLICY "update_own_predictions"
  ON predictions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_predictions" ON predictions;
CREATE POLICY "delete_own_predictions"
  ON predictions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ALERTS -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL CHECK (level IN ('green','yellow','orange','red')),
  state text,
  disaster_type text,
  title text NOT NULL,
  message text NOT NULL,
  source text NOT NULL DEFAULT 'AI Engine',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_alerts_auth" ON alerts;
CREATE POLICY "select_alerts_auth"
  ON alerts FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "insert_alerts_admin" ON alerts;
CREATE POLICY "insert_alerts_admin"
  ON alerts FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "update_alerts_admin" ON alerts;
CREATE POLICY "update_alerts_admin"
  ON alerts FOR UPDATE TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "delete_alerts_admin" ON alerts;
CREATE POLICY "delete_alerts_admin"
  ON alerts FOR DELETE TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- DATASETS ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS datasets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  filename text NOT NULL,
  row_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'ready' CHECK (status IN ('ready','training','deprecated')),
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_datasets_auth" ON datasets;
CREATE POLICY "select_datasets_auth"
  ON datasets FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "insert_datasets_admin" ON datasets;
CREATE POLICY "insert_datasets_admin"
  ON datasets FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "update_datasets_admin" ON datasets;
CREATE POLICY "update_datasets_admin"
  ON datasets FOR UPDATE TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "delete_datasets_admin" ON datasets;
CREATE POLICY "delete_datasets_admin"
  ON datasets FOR DELETE TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- INDEXES -----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_datasets_created_at ON datasets(created_at DESC);

-- Trigger to auto-create a profile row on new auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'), 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();