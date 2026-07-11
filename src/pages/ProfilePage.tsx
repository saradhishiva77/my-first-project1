import { useEffect, useState } from 'react';
import { User, Mail, Shield, Save, CheckCircle2, Loader2, Calendar } from 'lucide-react';
import { Card, CardHeader, Badge } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export function ProfilePage() {
  const { session, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [stats, setStats] = useState({ predictions: 0, reports: 0 });

  useEffect(() => {
    setFullName(profile?.full_name ?? '');
  }, [profile]);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const { count } = await supabase
        .from('predictions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);
      setStats({ predictions: count ?? 0, reports: count ?? 0 });
    })();
  }, [session]);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await supabase.from('profiles').update({ full_name: fullName, updated_at: new Date().toISOString() }).eq('id', session?.user.id);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Profile</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your account information</p>
      </div>

      {/* Profile header */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-violet-500 flex items-center justify-center text-white font-display font-bold text-2xl">
            {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1">
            <h2 className="font-display font-bold text-xl text-white">{profile?.full_name ?? 'User'}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge color={profile?.role === 'admin' ? 'cyan' : 'slate'}>
                <Shield className="w-3 h-3" /> {profile?.role}
              </Badge>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Joined {new Date(profile?.created_at ?? Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-accent-400" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-white tabular-nums">{stats.predictions}</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Predictions Made</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-white tabular-nums">{stats.reports}</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Reports Saved</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Edit form */}
      <Card>
        <CardHeader title="Account Settings" subtitle="Update your profile" icon={User} />
        <div className="p-5 pt-2 space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input className="input pl-10 opacity-60 cursor-not-allowed" value={session?.user?.email ?? ''} disabled />
            </div>
            <p className="text-xs text-slate-500 mt-1">Email cannot be changed.</p>
          </div>
          <div>
            <label className="label">Role</label>
            <input className="input opacity-60 cursor-not-allowed" value={profile?.role ?? 'user'} disabled />
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </Card>
    </div>
  );
}
