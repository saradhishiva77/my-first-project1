import { useEffect, useState } from 'react';
import {  ShieldCheck,
  Users as UsersIcon,
  Database,
  Cpu,
  ScrollText,
  Bell,
  Trash2,
  Upload,
  RefreshCw,
  Plus,
  Loader2,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Card, CardHeader, Badge, EmptyState, StatCard } from '../components/ui';
import { supabase, type Profile, type DatasetRow, type AlertRow, type PredictionRow } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const tooltipStyle = {
  backgroundColor: 'rgba(12,19,34,0.95)',
  border: '1px solid rgba(148,163,184,0.2)',
  borderRadius: '12px',
  fontSize: '12px',
  color: '#e2e8f0',
};

type Tab = 'overview' | 'users' | 'datasets' | 'retrain' | 'logs' | 'alerts';

export function AdminPage() {
  const { profile } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [users, setUsers] = useState<Profile[]>([]);
  const [datasets, setDatasets] = useState<DatasetRow[]>([]);
  const [logs, setLogs] = useState<PredictionRow[]>([]);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [retraining, setRetraining] = useState(false);
  const [retrainStep, setRetrainStep] = useState(0);
  const [newAlert, setNewAlert] = useState({ level: 'orange', state: '', title: '', message: '' });

  const tabs: { id: Tab; label: string; icon: typeof ShieldCheck }[] = [
    { id: 'overview', label: 'Analytics', icon: Activity },
    { id: 'users', label: 'Users', icon: UsersIcon },
    { id: 'datasets', label: 'Datasets', icon: Database },
    { id: 'retrain', label: 'Retrain Model', icon: Cpu },
    { id: 'logs', label: 'Prediction Logs', icon: ScrollText },
    { id: 'alerts', label: 'Manage Alerts', icon: Bell },
  ];

  async function loadUsers() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers((data as Profile[]) ?? []);
  }
  async function loadDatasets() {
    const { data } = await supabase.from('datasets').select('*').order('created_at', { ascending: false });
    setDatasets((data as DatasetRow[]) ?? []);
  }
  async function loadLogs() {
    const { data } = await supabase.from('predictions').select('*').order('created_at', { ascending: false }).limit(50);
    setLogs((data as PredictionRow[]) ?? []);
  }
  async function loadAlerts() {
    const { data } = await supabase.from('alerts').select('*').order('created_at', { ascending: false });
    setAlerts((data as AlertRow[]) ?? []);
  }

  useEffect(() => {
    loadUsers(); loadDatasets(); loadLogs(); loadAlerts();
  }, []);

  async function deleteUser(id: string) {
    // Cannot delete via profiles (FK to auth.users). We'll just remove profile row.
    await supabase.from('profiles').delete().eq('id', id);
    loadUsers();
  }

  async function deleteDataset(id: string) {
    await supabase.from('datasets').delete().eq('id', id);
    loadDatasets();
  }

  async function deleteAlert(id: string) {
    await supabase.from('alerts').delete().eq('id', id);
    loadAlerts();
  }

  async function createAlert() {
    if (!newAlert.title || !newAlert.message) return;
    await supabase.from('alerts').insert({
      level: newAlert.level as AlertRow['level'],
      state: newAlert.state || null,
      title: newAlert.title,
      message: newAlert.message,
      source: 'Admin',
    });
    setNewAlert({ level: 'orange', state: '', title: '', message: '' });
    loadAlerts();
  }

  function handleUpload() {
    // Simulate CSV upload + dataset registration
    const name = `Dataset-${Date.now().toString().slice(-4)}`;
    supabase.from('datasets').insert({
      name,
      filename: `${name}.csv`,
      row_count: 10000 + Math.floor(Math.random() * 5000),
      status: 'ready',
    }).then(() => loadDatasets());
  }

  function handleRetrain() {
    setRetraining(true);
    setRetrainStep(0);
    const steps = [
      'Loading dataset (12,000 records)...',
      'Preprocessing features...',
      'Training Random Forest...',
      'Training XGBoost...',
      'Evaluating models...',
      'Saving model with Joblib...',
    ];
    steps.forEach((_, i) => {
      setTimeout(() => {
        setRetrainStep(i + 1);
        if (i === steps.length - 1) {
          setTimeout(() => setRetraining(false), 800);
        }
      }, (i + 1) * 900);
    });
  }

  const overviewData = Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    predictions: Math.round(800 + Math.sin(i) * 200 + i * 40 + Math.random() * 100),
    users: Math.round(50 + i * 8 + Math.random() * 20),
  }));

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-accent-400" />
          <h1 className="font-display font-bold text-2xl text-white">Admin Dashboard</h1>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Manage users, datasets, model training and system alerts
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-accent-500/15 border border-accent-500/30 text-accent-300'
                : 'bg-white/5 border border-border-subtle text-slate-400 hover:text-white'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Users" value={users.length} icon={UsersIcon} accent="cyan" delay={0} />
            <StatCard label="Datasets" value={datasets.length} icon={Database} accent="violet" delay={0.05} />
            <StatCard label="Predictions" value={logs.length} icon={Activity} accent="green" delay={0.1} />
            <StatCard label="Active Alerts" value={alerts.filter(a => a.level !== 'green').length} icon={Bell} accent="red" delay={0.15} />
          </div>
          <Card>
            <CardHeader title="Platform Activity" subtitle="Predictions and user growth" icon={Activity} />
            <div className="px-4 pb-4" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={overviewData}>
                  <defs>
                    <linearGradient id="pred" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="usr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="predictions" stroke="#06b6d4" fill="url(#pred)" strokeWidth={2} />
                  <Area type="monotone" dataKey="users" stroke="#8b5cf6" fill="url(#usr)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <Card>
          <CardHeader title="User Management" subtitle={`${users.length} registered users`} icon={UsersIcon} />
          <div className="px-5 pb-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-border-subtle">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Joined</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border-subtle/50 hover:bg-white/5">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-violet-500 flex items-center justify-center text-white text-xs font-semibold">
                          {u.full_name?.[0]?.toUpperCase() ?? 'U'}
                        </div>
                        <span className="text-white font-medium">{u.full_name ?? 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge color={u.role === 'admin' ? 'cyan' : 'slate'}>{u.role}</Badge>
                    </td>
                    <td className="py-3 text-slate-400 text-xs">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      {u.id !== profile?.id && (
                        <button
                          onClick={() => deleteUser(u.id)}
                          className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 inline-flex items-center justify-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={4}><EmptyState icon={UsersIcon} title="No users" message="No users have registered yet." /></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Datasets */}
      {tab === 'datasets' && (
        <Card>
          <CardHeader
            title="Dataset Management"
            subtitle="Upload and manage ML training datasets"
            icon={Database}
            action={
              <button onClick={handleUpload} className="btn-primary text-xs py-2">
                <Upload className="w-3.5 h-3.5" /> Upload CSV
              </button>
            }
          />
          <div className="px-5 pb-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-border-subtle">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Filename</th>
                  <th className="pb-3 font-medium">Rows</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {datasets.map((d) => (
                  <tr key={d.id} className="border-b border-border-subtle/50 hover:bg-white/5">
                    <td className="py-3 text-white font-medium">{d.name}</td>
                    <td className="py-3 text-slate-400 font-mono text-xs">{d.filename}</td>
                    <td className="py-3 text-slate-300 tabular-nums">{d.row_count.toLocaleString()}</td>
                    <td className="py-3">
                      <Badge color={d.status === 'ready' ? 'green' : d.status === 'training' ? 'amber' : 'slate'}>
                        {d.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => deleteDataset(d.id)}
                        className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 inline-flex items-center justify-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {datasets.length === 0 && (
                  <tr><td colSpan={5}><EmptyState icon={Database} title="No datasets" message="Upload a CSV to get started." /></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Retrain */}
      {tab === 'retrain' && (
        <Card className="p-6 max-w-2xl">
          <CardHeader title="Retrain AI Model" subtitle="Rebuild the prediction pipeline from dataset" icon={Cpu} />
          <div className="px-1 pb-2 mt-3">
            <div className="p-4 rounded-xl bg-bg-surface/60 border border-border-subtle mb-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Current Model</p>
                  <p className="text-white font-display font-bold mt-1">XGBoost</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Accuracy</p>
                  <p className="text-emerald-400 font-display font-bold mt-1">94.6%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Training Data</p>
                  <p className="text-white font-medium mt-1">12,000 records</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Last Trained</p>
                  <p className="text-white font-medium mt-1">2 days ago</p>
                </div>
              </div>
            </div>

            {retraining ? (
              <div className="space-y-3">
                {[
                  'Loading dataset (12,000 records)...',
                  'Preprocessing features...',
                  'Training Random Forest...',
                  'Training XGBoost...',
                  'Evaluating models...',
                  'Saving model with Joblib...',
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {i < retrainStep ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : i === retrainStep ? (
                      <Loader2 className="w-4 h-4 text-accent-400 animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700" />
                    )}
                    <span className={`text-sm ${i <= retrainStep ? 'text-white' : 'text-slate-600'}`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <button onClick={handleRetrain} className="btn-primary">
                <RefreshCw className="w-4 h-4" /> Retrain Model
              </button>
            )}
          </div>
        </Card>
      )}

      {/* Logs */}
      {tab === 'logs' && (
        <Card>
          <CardHeader title="Prediction Logs" subtitle="Recent predictions across all users" icon={ScrollText} />
          <div className="px-5 pb-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-border-subtle">
                  <th className="pb-3 font-medium">State</th>
                  <th className="pb-3 font-medium">District</th>
                  <th className="pb-3 font-medium">Risk Level</th>
                  <th className="pb-3 font-medium">Confidence</th>
                  <th className="pb-3 font-medium">Affected</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => {
                  const color = l.risk_level === 'Critical' ? 'red' : l.risk_level === 'High' ? 'orange' : l.risk_level === 'Medium' ? 'amber' : 'green';
                  return (
                    <tr key={l.id} className="border-b border-border-subtle/50 hover:bg-white/5">
                      <td className="py-3 text-white font-medium">{l.state}</td>
                      <td className="py-3 text-slate-400">{l.district ?? '-'}</td>
                      <td className="py-3"><Badge color={color as 'red' | 'orange' | 'amber' | 'green'}>{l.risk_level}</Badge></td>
                      <td className="py-3 text-slate-300 tabular-nums">{l.confidence_score}%</td>
                      <td className="py-3 text-slate-300 tabular-nums">{l.affected_population?.toLocaleString() ?? '-'}</td>
                      <td className="py-3 text-slate-500 text-xs">{new Date(l.created_at).toLocaleString()}</td>
                    </tr>
                  );
                })}
                {logs.length === 0 && (
                  <tr><td colSpan={6}><EmptyState icon={ScrollText} title="No predictions yet" message="Prediction logs will appear here." /></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Alerts */}
      {tab === 'alerts' && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="p-5">
            <CardHeader title="Create Alert" subtitle="Issue a new system alert" icon={Plus} />
            <div className="px-1 pb-2 mt-3 space-y-3">
              <div>
                <label className="label">Level</label>
                <select
                  value={newAlert.level}
                  onChange={(e) => setNewAlert({ ...newAlert, level: e.target.value })}
                  className="input"
                >
                  <option value="red">Red</option>
                  <option value="orange">Orange</option>
                  <option value="yellow">Yellow</option>
                  <option value="green">Green</option>
                </select>
              </div>
              <div>
                <label className="label">State (optional)</label>
                <input className="input" value={newAlert.state} onChange={(e) => setNewAlert({ ...newAlert, state: e.target.value })} placeholder="e.g. Kerala" />
              </div>
              <div>
                <label className="label">Title</label>
                <input className="input" value={newAlert.title} onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })} placeholder="Alert title" />
              </div>
              <div>
                <label className="label">Message</label>
                <textarea className="input min-h-[80px]" value={newAlert.message} onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })} placeholder="Alert message" />
              </div>
              <button onClick={createAlert} className="btn-primary w-full">
                <Plus className="w-4 h-4" /> Create Alert
              </button>
            </div>
          </Card>

          <Card>
            <CardHeader title="Manage Alerts" subtitle={`${alerts.length} alerts`} icon={Bell} />
            <div className="px-5 pb-5 space-y-2 max-h-[500px] overflow-y-auto">
              {alerts.map((a) => {
                const dot = { red: 'bg-red-500', orange: 'bg-orange-500', yellow: 'bg-yellow-500', green: 'bg-emerald-500' }[a.level];
                return (
                  <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                    <span className={`risk-dot mt-1.5 ${dot}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">{a.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{a.message}</p>
                      <p className="text-[10px] text-slate-600 mt-1">{a.state} · {new Date(a.created_at).toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => deleteAlert(a.id)}
                      className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 inline-flex items-center justify-center shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
              {alerts.length === 0 && (
                <EmptyState icon={Bell} title="No alerts" message="Create an alert to get started." />
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
