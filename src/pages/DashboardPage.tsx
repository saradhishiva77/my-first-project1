import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  Bell,
  AlertTriangle,
  Flame,
  Users,
  CloudSun,
  BrainCircuit,
  TrendingUp,
  CloudRain,
  Thermometer,
  PieChart as PieIcon,
  BarChart3,
  Target,
  Calendar,
  History,
  MapPin,
  Globe2,
  Layers,
  Activity,
} from 'lucide-react';
import { fetchDisasterFeed, SEVERITY_COLORS, SEVERITY_LABELS, type FeedEvent } from '../lib/disasterFeed';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardHeader, StatCard } from '../components/ui';
import {
  dashboardStats,
  disasterTrendData,
  rainfallTrendData,
  temperatureTrendData,
  disasterDistribution,
  riskComparison,
  predictionAccuracy,
  monthlyAnalysis,
  historicalTimeline,
  liveAlertFeed,
  worldDisasterTrend,
  worldDisasterDistribution,
  continentRiskBreakdown,
  worldHistoricalTimeline,
} from '../lib/mockData';
import { WeatherWidget } from '../components/WeatherWidget';
import { DisasterSafetyGuide } from '../components/DisasterSafetyGuide';

const tooltipStyle = {
  backgroundColor: 'rgba(12,19,34,0.95)',
  border: '1px solid rgba(148,163,184,0.2)',
  borderRadius: '12px',
  fontSize: '12px',
  color: '#e2e8f0',
};

export function DashboardPage() {
  const stats = dashboardStats();
  const trend = disasterTrendData();
  const rainfall = rainfallTrendData();
  const temp = temperatureTrendData();
  const dist = disasterDistribution();
  const compare = riskComparison();
  const accuracy = predictionAccuracy();
  const monthly = monthlyAnalysis();
  const timeline = historicalTimeline();
  const feed = liveAlertFeed();
  const [feedEvents, setFeedEvents] = useState<FeedEvent[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);

  useEffect(() => {
    fetchDisasterFeed().then((events) => {
      setFeedEvents(events);
      setFeedLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time disaster risk intelligence across India
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-300">{stats.weatherStatus}</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Today's Alerts" value={stats.todaysAlerts} icon={Bell} accent="amber" delay={0} trend={{ value: '12%', up: true }} />
        <StatCard label="Active Disasters" value={stats.activeDisasters} icon={AlertTriangle} accent="red" delay={0.05} />
        <StatCard label="High Risk States" value={stats.highRiskStates} icon={Flame} accent="orange" delay={0.1} />
        <StatCard label="Population at Risk" value={`${(stats.populationAtRisk / 1_000_000).toFixed(1)}M`} icon={Users} accent="violet" delay={0.15} />
        <StatCard label="Weather Status" value={stats.weatherStatus} icon={CloudSun} accent="cyan" delay={0.2} />
        <StatCard label="AI Predictions Today" value={stats.aiPredictionsToday.toLocaleString()} icon={BrainCircuit} accent="green" delay={0.25} trend={{ value: '8%', up: true }} />
      </div>

      {/* Weather + Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Live weather widget */}
        <WeatherWidget />

        {/* Disaster Trend — spans 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader title="Disaster Trend" subtitle="Monthly occurrences by disaster type" icon={TrendingUp} />
          <div className="px-4 pb-4" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  {['#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899', '#ef4444', '#f97316'].map((c, i) => (
                    <linearGradient key={i} id={`g${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={c} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={c} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="floods" stroke="#06b6d4" fill="url(#g0)" strokeWidth={2} />
                <Area type="monotone" dataKey="cyclones" stroke="#8b5cf6" fill="url(#g1)" strokeWidth={2} />
                <Area type="monotone" dataKey="earthquakes" stroke="#f59e0b" fill="url(#g2)" strokeWidth={2} />
                <Area type="monotone" dataKey="landslides" stroke="#ec4899" fill="url(#g3)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Disaster Distribution */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader title="Disaster Distribution" subtitle="Share by type" icon={PieIcon} />
          <div className="px-4 pb-4" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dist}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  stroke="rgba(7,11,20,0.6)"
                >
                  {dist.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Rainfall Trend" subtitle="Last 14 days (mm)" icon={CloudRain} />
          <div className="px-4 pb-4" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={rainfall}>
                <defs>
                  <linearGradient id="rain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="rainfall" stroke="#06b6d4" fill="url(#rain)" strokeWidth={2} />
                <Line type="monotone" dataKey="riverLevel" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Temperature Trend" subtitle="Max / Min / Avg (°C)" icon={Thermometer} />
          <div className="px-4 pb-4" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={temp}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="max" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="avg" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="min" stroke="#06b6d4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Monthly Analysis" subtitle="Alerts, resolved and casualties" icon={Calendar} />
          <div className="px-4 pb-4" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(148,163,184,0.05)' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="alerts" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="casualties" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Risk Comparison" subtitle="Predicted vs Actual" icon={BarChart3} />
          <div className="px-4 pb-4" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={compare}>
                <PolarGrid stroke="rgba(148,163,184,0.12)" />
                <PolarAngleAxis dataKey="disaster" stroke="#64748b" fontSize={10} />
                <PolarRadiusAxis stroke="#475569" fontSize={9} angle={90} />
                <Radar name="Predicted" dataKey="predicted" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                <Radar name="Actual" dataKey="actual" stroke="#f97316" fill="#f97316" fillOpacity={0.2} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Prediction accuracy */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Prediction Accuracy" subtitle="Model performance vs target" icon={Target} />
          <div className="px-4 pb-4" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={accuracy}>
                <defs>
                  <linearGradient id="acc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[80, 100]} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="accuracy" stroke="#10b981" fill="url(#acc)" strokeWidth={2} />
                <Line type="monotone" dataKey="target" stroke="#64748b" strokeDasharray="4 4" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Historical Timeline */}
        <Card>
          <CardHeader title="Historical Timeline" subtitle="Major disasters in recent years" icon={History} />
          <div className="px-5 pb-5 space-y-2 max-h-[260px] overflow-y-auto">
            {timeline.map((e, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className={`risk-dot ${e.severity === 'Critical' ? 'bg-red-500' : 'bg-orange-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{e.event}</p>
                  <p className="text-xs text-slate-500">{e.type} · {e.year}</p>
                </div>
                <span className={`chip border text-[10px] ${e.severity === 'Critical' ? 'bg-red-500/10 text-red-300 border-red-500/20' : 'bg-orange-500/10 text-orange-300 border-orange-500/20'}`}>
                  {e.severity}
                </span>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Live Alert Feed */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Live Alert Feed" subtitle="Real-time notifications" icon={Bell} />
          <div className="px-5 pb-5 space-y-2 max-h-[360px] overflow-y-auto">
            {feed.map((a, i) => {
              const color = { safe: 'bg-emerald-500', medium: 'bg-yellow-500', high: 'bg-orange-500', critical: 'bg-red-500' }[a.level];
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className={`risk-dot mt-1.5 ${color}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-white truncate">{a.disaster} · {a.state}</p>
                      <span className="text-[10px] text-slate-500 shrink-0">{a.time}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{a.message}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>

        {/* Live global disaster feed */}
        <Card>
          <CardHeader
            title="Live Global Disaster Feed"
            subtitle="Real-time data from USGS & GDACS"
            icon={Globe2}
            action={
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className={`w-2 h-2 rounded-full ${feedLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}`} />
                {feedLoading ? 'Fetching...' : `${feedEvents.length} events`}
              </span>
            }
          />
          <div className="px-5 pb-5 space-y-2 max-h-[360px] overflow-y-auto">
            {feedLoading && [1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-14" />)}
            {!feedLoading && feedEvents.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">Unable to fetch live data right now.</p>
            )}
            {!feedLoading && feedEvents.slice(0, 15).map((e) => (
              <div key={e.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <span className="risk-dot mt-1.5" style={{ backgroundColor: SEVERITY_COLORS[e.severity] }} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{e.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                    <span className="capitalize">{e.disaster_type}</span>
                    <span>· {SEVERITY_LABELS[e.severity]}</span>
                    <span>· {e.source}</span>
                    {e.latitude && e.longitude && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" /> {e.latitude.toFixed(1)}, {e.longitude.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Disaster Safety Guide */}
      <DisasterSafetyGuide />

      {/* World disaster section */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Global Disaster Trend" subtitle="Worldwide disaster events by type (2024)" icon={Globe2} />
          <div className="px-5 pb-5" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={worldDisasterTrend()}>
                <defs>
                  <linearGradient id="wFloods" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="wCyclones" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="wWildfires" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="floods" stroke="#06b6d4" fill="url(#wFloods)" strokeWidth={2} />
                <Area type="monotone" dataKey="cyclones" stroke="#8b5cf6" fill="url(#wCyclones)" strokeWidth={2} />
                <Area type="monotone" dataKey="wildfires" stroke="#f97316" fill="url(#wWildfires)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Global Disaster Share" subtitle="Distribution by type" icon={Layers} />
          <div className="px-5 pb-5" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={worldDisasterDistribution()}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {worldDisasterDistribution().map((e, i) => (
                    <Cell key={i} fill={e.color} stroke="rgba(7,11,20,0.5)" strokeWidth={1} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Continent Risk Breakdown" subtitle="Disaster frequency by continent" icon={Activity} />
          <div className="px-5 pb-5" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={continentRiskBreakdown()}>
                <PolarGrid stroke="rgba(148,163,184,0.1)" />
                <PolarAngleAxis dataKey="continent" stroke="#94a3b8" fontSize={10} />
                <PolarRadiusAxis stroke="#475569" fontSize={9} />
                <Radar name="Floods" dataKey="floods" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                <Radar name="Cyclones" dataKey="cyclones" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                <Radar name="Earthquakes" dataKey="earthquakes" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                <Radar name="Wildfires" dataKey="wildfires" stroke="#f97316" fill="#f97316" fillOpacity={0.2} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="World Disaster Timeline" subtitle="Major global disasters (2023–2024)" icon={Globe2} />
          <div className="px-5 pb-5 space-y-2 max-h-[280px] overflow-y-auto">
            {worldHistoricalTimeline().map((e, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className={`risk-dot ${e.severity === 'Critical' ? 'bg-red-500' : 'bg-orange-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{e.event}</p>
                  <p className="text-xs text-slate-500">{e.country} · {e.type}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{e.year}</span>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
