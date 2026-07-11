import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Map,
  Brain,
  Bell,
  ShieldCheck,
  User,
  Activity,
  CloudRain,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: ('admin' | 'user')[];
}

const NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/map', label: 'Risk Map', icon: Map },
  { to: '/predict', label: 'Predict Risk', icon: Brain },
  { to: '/alerts', label: 'Alert Center', icon: Bell },
  { to: '/history', label: 'My Predictions', icon: Activity },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/admin', label: 'Admin Panel', icon: ShieldCheck, roles: ['admin'] },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { role, profile } = useAuth();
  const location = useLocation();
  const items = NAV.filter((n) => !n.roles || n.roles.includes(role ?? 'user'));

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 z-50 flex flex-col
          bg-bg-surface/90 backdrop-blur-2xl border-r border-border-subtle
          transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-border-subtle">
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center shadow-glow">
              <CloudRain className="w-5 h-5 text-white" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            </div>
            <div>
              <p className="font-display font-bold text-white text-sm leading-tight">
                DisasterAI
              </p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                Risk Intelligence
              </p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
          {items.map((item) => {
            const active = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${active ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent-500/20 to-accent-500/5 border border-accent-500/30"
                    transition={{ type: 'spring', duration: 0.4 }}
                  />
                )}
                <item.icon className="w-4.5 h-4.5 relative z-10" />
                <span className="relative z-10">{item.label}</span>
                {active && (
                  <ChevronRight className="w-4 h-4 relative z-10 ml-auto text-accent-400" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User card */}
        <div className="p-3 border-t border-border-subtle">
          <div className="glass p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500 to-violet-500 flex items-center justify-center text-white font-semibold text-sm">
              {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">
                {profile?.full_name ?? 'User'}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-accent-400">
                {role}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
