/*
# Add Incident Reports Table

1. Overview
   Adds a new `incident_reports` table for user-submitted disaster reports.
   Users can report local disasters (flood, fire, landslide, etc.) with location
   coordinates, an optional photo URL, and a severity level. Reports are visible
   to all authenticated users and can be overlaid on the risk map as a heatmap.

2. New Tables
   - `incident_reports`
     - `id` (uuid, primary key)
     - `user_id` (uuid, not null, defaults to auth.uid(), references auth.users)
     - `disaster_type` (text, not null) — flood, cyclone, earthquake, landslide, heatwave, wildfire, other
     - `description` (text, not null) — user description of the incident
     - `latitude` (double precision, not null)
     - `longitude` (double precision, not null)
     - `location_name` (text) — human-readable location (e.g. "Mumbai, Maharashtra")
     - `severity` (text, not null, default 'medium') — low, medium, high, critical
     - `photo_url` (text) — optional URL to an uploaded photo
     - `status` (text, not null, default 'active') — active, resolved, verified
     - `created_at` (timestamptz, default now())

3. Security
   - RLS enabled on `incident_reports`.
   - SELECT: all authenticated users can read all reports (community visibility).
   - INSERT: authenticated users can insert their own reports (user_id defaults to auth.uid()).
   - UPDATE: owners can update their own reports (e.g. mark resolved).
   - DELETE: owners can delete their own reports.

4. Indexes
   - `idx_incident_reports_created_at` on `created_at DESC`
   - `idx_incident_reports_disaster_type` on `disaster_type`
   - `idx_incident_reports_status` on `status`
*/

CREATE TABLE IF NOT EXISTS incident_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  disaster_type text NOT NULL CHECK (disaster_type IN ('flood','cyclone','earthquake','landslide','heatwave','wildfire','other')),
  description text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  location_name text,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  photo_url text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','resolved','verified')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE incident_reports ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read all incident reports (community visibility)
DROP POLICY IF EXISTS "select_all_incident_reports" ON incident_reports;
CREATE POLICY "select_all_incident_reports"
  ON incident_reports FOR SELECT TO authenticated
  USING (true);

-- Users can insert their own incident reports
DROP POLICY IF EXISTS "insert_own_incident_reports" ON incident_reports;
CREATE POLICY "insert_own_incident_reports"
  ON incident_reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own incident reports
DROP POLICY IF EXISTS "update_own_incident_reports" ON incident_reports;
CREATE POLICY "update_own_incident_reports"
  ON incident_reports FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own incident reports
DROP POLICY IF EXISTS "delete_own_incident_reports" ON incident_reports;
CREATE POLICY "delete_own_incident_reports"
  ON incident_reports FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_incident_reports_created_at ON incident_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incident_reports_disaster_type ON incident_reports(disaster_type);
CREATE INDEX IF NOT EXISTS idx_incident_reports_status ON incident_reports(status);
