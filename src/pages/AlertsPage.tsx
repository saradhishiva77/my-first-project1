import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Radio,
  AlertTriangle,
  CheckCircle2,
  Filter,
  RefreshCw,
  Globe2,
  Plus,
  MapPin,
} from 'lucide-react';
import { Card, CardHeader, Badge, EmptyState } from '../components/ui';
import { supabase, type AlertRow } from '../lib/supabase';
import { liveAlertFeed } from '../lib/mockData';
import { fetchDisasterFeed, SEVERITY_COLORS, SEVERITY_LABELS, type FeedEvent } from '../lib/disasterFeed';
import { IncidentReportForm } from '../components/IncidentReportForm';

const LEVEL_CONFIG = {
  red: { color: 'red', label: 'Red', bg: 'bg-red-500/10 border-red-500/20', dot: 'bg-red-500' },
  orange: { color: 'orange', label: 'Orange', bg: 'bg-orange-500/10 border-orange-500/20', dot: 'bg-orange-500' },
  yellow: { color: 'amber', label: 'Yellow', bg: 'bg-yellow-500/10 border-yellow-500/20', dot: 'bg-yellow-500' },
  green: { color: 'green', label: 'Green', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-500' },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'red' | 'orange' | 'yellow' | 'green'>('all');
  const [feedEvents, setFeedEvents] = useState<FeedEvent[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });
    setAlerts((data as AlertRow[]) ?? []);
    setLoading(false);
  }, []);

  const loadFeed = useCallback(async () => {
    setFeedLoading(true);
    const events = await fetchDisasterFeed();
    setFeedEvents(events);
    setFeedLoading(false);
  }, []);

  useEffect(() => { load(); loadFeed(); }, [load, loadFeed]);

  const feed = liveAlertFeed();
  const filtered = filter === 'all' ? alerts : alerts.filter((a) => a.level === filter);

  const counts = {
    red: alerts.filter((a) => a.level === 'red').length,
    orange: alerts.filter((a) => a.level === 'orange').length,
    yellow: alerts.filter((a) => a.level === 'yellow').length,
    green: alerts.filter((a) => a.level === 'green').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Alert Center</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time disaster alerts and emergency notifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowReportForm(true)} className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> Report Incident
          </button>
          <button onClick={() => { load(); loadFeed(); }} className="btn-outline text-sm">
            <RefreshCw className={`w-4 h-4 ${loading || feedLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Level summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['red', 'orange', 'yellow', 'green'] as const).map((lvl, i) => {
          const cfg = LEVEL_CONFIG[lvl];
          return (
            <motion.div
              key={lvl}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass glass-hover p-5 border ${cfg.bg}`}
            >
              <div className="flex items-center justify-between">
                <span className={`risk-dot ${cfg.dot}`} />
                <span className="text-3xl font-display font-bold text-white tabular-nums">
                  {counts[lvl]}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2 uppercase tracking-wider">
                {cfg.label} Alert{counts[lvl] !== 1 ? 's' : ''}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Live global disaster feed */}
      <Card>
        <CardHeader
          title="Live Global Disaster Feed"
          subtitle="Real-time data from USGS & GDACS"
          icon={Globe2}
          action={
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className={`w-2 h-2 rounded-full ${feedLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}`} />
                {feedLoading ? 'Fetching...' : 'Live'}
              </span>
            </div>
          }
        />
        <div className="px-5 pb-5 space-y-2.5 max-h-[400px] overflow-y-auto">
          {feedLoading && (
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton h-16" />
              ))}
            </>
          )}
          {!feedLoading && feedEvents.length === 0 && (
            <EmptyState icon={Globe2} title="No live events" message="Unable to fetch live disaster data. Try refreshing." />
          )}
          {!feedLoading && feedEvents.map((e, i) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-start gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <span className="risk-dot mt-1.5" style={{ backgroundColor: SEVERITY_COLORS[e.severity] }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-white">{e.title}</p>
                  <Badge color={e.severity === 'critical' ? 'red' : e.severity === 'high' ? 'orange' : e.severity === 'medium' ? 'amber' : 'green'}>
                    {SEVERITY_LABELS[e.severity]}
                  </Badge>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider bg-white/5 px-1.5 py-0.5 rounded">{e.source}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{e.description}</p>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                  <span className="capitalize">{e.disaster_type}</span>
                  {e.magnitude && <span>· M{e.magnitude}</span>}
                  {e.latitude && e.longitude && (
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5" /> {e.latitude.toFixed(2)}, {e.longitude.toFixed(2)}
                    </span>
                  )}
                  <span>· {timeAgo(e.timestamp)}</span>
                  {e.url && (
                    <a href={e.url} target="_blank" rel="noopener noreferrer" className="text-accent-400 hover:text-accent-300">
                      Details
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent alerts */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent Alerts"
            subtitle="System-wide disaster notifications"
            icon={Bell}
            action={
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as typeof filter)}
                  className="bg-bg-surface border border-border-subtle rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-accent-500/40"
                >
                  <option value="all">All Levels</option>
                  <option value="red">Red</option>
                  <option value="orange">Orange</option>
                  <option value="yellow">Yellow</option>
                  <option value="green">Green</option>
                </select>
              </div>
            }
          />
          <div className="px-5 pb-5 space-y-2.5 max-h-[560px] overflow-y-auto">
            {loading && (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-20" />
                ))}
              </>
            )}
            {!loading && filtered.length === 0 && (
              <EmptyState icon={Bell} title="No alerts found" message="No alerts match the selected filter." />
            )}
            {!loading && filtered.map((a, i) => {
              const cfg = LEVEL_CONFIG[a.level];
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className={`risk-dot mt-1.5 ${cfg.dot}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white">{a.title}</p>
                      <Badge color={cfg.color as 'red' | 'orange' | 'amber' | 'green'}>{cfg.label}</Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{a.message}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                      {a.state && <span>{a.state}</span>}
                      {a.disaster_type && <span>· {a.disaster_type}</span>}
                      <span>· {a.source}</span>
                      <span>· {new Date(a.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>

        {/* Live feed + emergency */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Live Notifications" subtitle="AI engine feed" icon={Radio} />
            <div className="px-5 pb-5 space-y-2 max-h-[260px] overflow-y-auto">
              {feed.map((f, i) => {
                const cfg = LEVEL_CONFIG[f.level === 'critical' ? 'red' : f.level === 'high' ? 'orange' : f.level === 'medium' ? 'yellow' : 'green'];
                return (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/5"
                  >
                    <span className={`risk-dot mt-1.5 ${cfg.dot}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate">{f.disaster} · {f.state}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{f.message}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">{f.time}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <p className="text-sm font-semibold text-white">Emergency Protocols</p>
            </div>
            <div className="space-y-2">
              {[
                { label: 'National Emergency: 112', ok: true },
                { label: 'NDRF Response Teams: Active', ok: true },
                { label: 'IMD Weather Feed: Online', ok: true },
                { label: 'USGS Seismic Feed: Online', ok: true },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${s.ok ? 'text-emerald-400' : 'text-red-400'}`} />
                  <span className="text-slate-300">{s.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {showReportForm && <IncidentReportForm onClose={() => setShowReportForm(false)} />}
    </div>
  );
}
