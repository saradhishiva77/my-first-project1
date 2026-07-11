import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.warn('Supabase env vars missing. Auth/persistence will be disabled.');
}

export const supabase = createClient(url ?? '', anonKey ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type UserRole = 'admin' | 'user';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface PredictionRow {
  id: string;
  user_id: string;
  state: string;
  district: string | null;
  inputs: Record<string, number | string>;
  results: Record<string, number | string>;
  recommendations: string[];
  confidence_score: number;
  risk_level: string;
  affected_population: number | null;
  created_at: string;
}

export interface AlertRow {
  id: string;
  level: 'green' | 'yellow' | 'orange' | 'red';
  state: string | null;
  disaster_type: string | null;
  title: string;
  message: string;
  source: string;
  created_by: string | null;
  created_at: string;
}

export interface IncidentReportRow {
  id: string;
  user_id: string;
  disaster_type: string;
  description: string;
  latitude: number;
  longitude: number;
  location_name: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  photo_url: string | null;
  status: 'active' | 'resolved' | 'verified';
  created_at: string;
}

export interface DatasetRow {
  id: string;
  name: string;
  filename: string;
  row_count: number;
  status: 'ready' | 'training' | 'deprecated';
  uploaded_by: string | null;
  created_at: string;
}
