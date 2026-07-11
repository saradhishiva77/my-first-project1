import { supabase } from './supabase';

export interface FeedEvent {
  id: string;
  source: string;
  disaster_type: string;
  title: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  magnitude: number | null;
  timestamp: string;
  url: string | null;
}

export interface FeedResponse {
  events: FeedEvent[];
  count: number;
  fetched_at: string;
}

export async function fetchDisasterFeed(): Promise<FeedEvent[]> {
  try {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/disaster-feed`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) return [];
    const data: FeedResponse = await res.json();
    if (!data.events || !Array.isArray(data.events)) return [];
    return data.events;
  } catch {
    return [];
  }
}

export const SEVERITY_COLORS: Record<FeedEvent['severity'], string> = {
  low: '#10b981',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
};

export const SEVERITY_LABELS: Record<FeedEvent['severity'], string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

// --- Incident Reports ---

export interface IncidentReport {
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

export async function fetchIncidentReports(): Promise<IncidentReport[]> {
  const { data, error } = await supabase
    .from('incident_reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) return [];
  return (data as IncidentReport[]) ?? [];
}

export async function createIncidentReport(
  report: Omit<IncidentReport, 'id' | 'user_id' | 'created_at' | 'status'>
): Promise<IncidentReport | null> {
  const { data, error } = await supabase
    .from('incident_reports')
    .insert({ ...report, status: 'active' })
    .select()
    .maybeSingle();
  if (error) return null;
  return data as IncidentReport;
}

export async function updateIncidentStatus(
  id: string,
  status: IncidentReport['status']
): Promise<boolean> {
  const { error } = await supabase
    .from('incident_reports')
    .update({ status })
    .eq('id', id);
  return !error;
}
