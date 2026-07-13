import { Menu, Bell, LogOut, Search, X, Map, Brain, Bell as BellIcon, Globe2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, type AlertRow } from '../lib/supabase';
import { STATES } from '../data/states';
import { COUNTRIES } from '../data/countries';

interface SearchResult {
  id: string;
  label: string;
  sublabel: string;
  icon: typeof Map;
  action: () => void;
}

const DISASTER_TYPES = ['Flood', 'Cyclone', 'Earthquake', 'Landslide', 'Heatwave', 'Wildfire'];

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  // Search state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Close bell on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Close search on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const runSearch = useCallback((q: string) => {
    const trimmed = q.trim().toLowerCase();
    if (!trimmed) { setResults([]); return; }

    const found: SearchResult[] = [];

    // Match Indian states → Risk Map
    STATES.filter((s) => s.name.toLowerCase().includes(trimmed))
      .slice(0, 4)
      .forEach((s) => {
        found.push({
          id: `state-${s.code}`,
          label: s.name,
          sublabel: 'Indian State · Risk Map',
          icon: Map,
          action: () => navigate('/map'),
        });
      });

    // Match countries → Risk Map (world tab)
    COUNTRIES.filter((c) => c.name.toLowerCase().includes(trimmed))
      .slice(0, 4)
      .forEach((c) => {
        found.push({
          id: `country-${c.name}`,
          label: c.name,
          sublabel: 'Country · World Risk Map',
          icon: Globe2,
          action: () => navigate('/map'),
        });
      });

    // Match disaster types → Predict page
    DISASTER_TYPES.filter((d) => d.toLowerCase().includes(trimmed))
      .forEach((d) => {
        found.push({
          id: `disaster-${d}`,
          label: d,
          sublabel: 'Disaster Type · Predict Risk',
          icon: Brain,
          action: () => navigate('/predict'),
        });
      });

    // Quick nav shortcuts
    const NAV = [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Risk Map', path: '/map' },
      { label: 'Predict Risk', path: '/predict' },
      { label: 'Alert Center', path: '/alerts' },
      { label: 'My Predictions', path: '/history' },
    ];
    NAV.filter((n) => n.label.toLowerCase().includes(trimmed)).forEach((n) => {
      found.push({
        id: `nav-${n.path}`,
        label: n.label,
        sublabel: 'Page',
        icon: BellIcon,
        action: () => navigate(n.path),
      });
    });

    setResults(found.slice(0, 8));
  }, [navigate]);

  useEffect(() => {
    runSearch(query);
  }, [query, runSearch]);

  function select(r: SearchResult) {
    r.action();
    setQuery('');
    setResults([]);
    setSearchOpen(false);
  }

  function clear() {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  }

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

      {/* Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md" ref={searchRef}>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { setSearchOpen(false); setQuery(''); }
              if (e.key === 'Enter' && results.length > 0) select(results[0]);
            }}
            placeholder="Search states, countries, disasters, pages..."
            className="input pl-10 pr-8 py-2 text-sm"
          />
          {query && (
            <button
              onClick={clear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Dropdown */}
          {searchOpen && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 glass-strong rounded-xl overflow-hidden z-50 shadow-xl">
              {results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => select(r)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-accent-500/10 border border-accent-500/20 flex items-center justify-center flex-shrink-0">
                    <r.icon className="w-3.5 h-3.5 text-accent-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{r.label}</p>
                    <p className="text-[11px] text-slate-500">{r.sublabel}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchOpen && query && results.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 glass-strong rounded-xl overflow-hidden z-50 shadow-xl px-4 py-6 text-center">
              <p className="text-sm text-slate-400">No results for &quot;{query}&quot;</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-300 font-medium">Live</span>
        </div>

        {/* Bell */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setBellOpen((o) => !o)}
            className="relative w-10 h-10 rounded-xl bg-white/5 border border-border-subtle flex items-center justify-center hover:border-accent-500/40 transition-colors"
          >
            <Bell className="w-4.5 h-4.5 text-slate-300" />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-semibold">
                {alerts.length}
              </span>
            )}
          </button>
          {bellOpen && (
            <div className="absolute right-0 top-12 w-80 glass-strong p-3 z-50 rounded-xl">
              <p className="text-xs font-semibold text-white uppercase tracking-wider px-2 mb-2">
                Recent Alerts
              </p>
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {alerts.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-white/5 cursor-pointer"
                    onClick={() => { navigate('/alerts'); setBellOpen(false); }}
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
          onClick={async () => { await signOut(); navigate('/login'); }}
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
