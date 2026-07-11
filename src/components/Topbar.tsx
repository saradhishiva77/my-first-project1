import { Menu, Bell, LogOut, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { supabase, type AlertRow } from '../lib/supabase';

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (data) setAlerts(data as AlertRow[]);
    })();
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const levelColor: Record<string, string> = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500',
    green: 'bg-emerald-500',
  };

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center gap-4 px-4 lg:px-6 bg-bg-base/70 backdrop-blur-xl border-b border-border-subtle">
      <button onClick={onMenu} className="lg:hidden text-slate-300 hover:text-white">
        <Menu className="w-5 h-5" />
      </button>

      <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            placeholder="Search states, disasters, alerts..."
            className="input pl-10 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-300 font-medium">Live</span>
        </div>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="relative w-10 h-10 rounded-xl bg-white/5 border border-border-subtle flex items-center justify-center hover:border-accent-500/40 transition-colors"
          >
            <Bell className="w-4.5 h-4.5 text-slate-300" />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-semibold">
                {alerts.length}
              </span>
            )}
          </button>
          {open && (
            <div className="absolute right-0 top-12 w-80 glass-strong p-3 z-50">
              <p className="text-xs font-semibold text-white uppercase tracking-wider px-2 mb-2">
                Recent Alerts
              </p>
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {alerts.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-white/5 cursor-pointer"
                  >
                    <span className={`risk-dot mt-1.5 ${levelColor[a.level]}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{a.title}</p>
                      <p className="text-xs text-slate-400 line-clamp-2">{a.message}</p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {a.state} · {new Date(a.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-6">No alerts</p>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={async () => {
            await signOut();
            navigate('/login');
          }}
          className="w-10 h-10 rounded-xl bg-white/5 border border-border-subtle flex items-center justify-center hover:border-red-500/40 hover:text-red-400 text-slate-300 transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4.5 h-4.5" />
        </button>

        <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-border-subtle">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500 to-violet-500 flex items-center justify-center text-white font-semibold text-sm">
            {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium text-white">{profile?.full_name ?? 'User'}</p>
            <p className="text-[10px] text-slate-500">Signed in</p>
          </div>
        </div>
      </div>
    </header>
  );
}
