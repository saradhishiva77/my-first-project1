import { type ReactNode, type HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';

export function Card({
  children,
  className = '',
  hover = false,
  ...props
}: { children: ReactNode; hover?: boolean } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`glass ${hover ? 'glass-hover' : ''} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  icon: Icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between p-5 pb-3">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center">
            <Icon className="w-4.5 h-4.5 text-accent-400" />
          </div>
        )}
        <div>
          <h3 className="font-display font-semibold text-white text-sm">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  accent = 'cyan',
  delay = 0,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; up: boolean };
  accent?: 'cyan' | 'orange' | 'red' | 'green' | 'violet' | 'amber';
  delay?: number;
}) {
  const accents: Record<string, string> = {
    cyan: 'from-accent-500/20 to-accent-500/5 text-accent-400 border-accent-500/20',
    orange: 'from-orange-500/20 to-orange-500/5 text-orange-400 border-orange-500/20',
    red: 'from-red-500/20 to-red-500/5 text-red-400 border-red-500/20',
    green: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20',
    violet: 'from-violet-500/20 to-violet-500/5 text-violet-400 border-violet-500/20',
    amber: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/20',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="stat-card"
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accents[accent]} border flex items-center justify-center`}
        >
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-lg ${
              trend.up ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
            }`}
          >
            {trend.up ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <p className="text-2xl font-display font-bold text-white tabular-nums">{value}</p>
      <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{label}</p>
    </motion.div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function Badge({
  children,
  color = 'slate',
  className = '',
}: {
  children: ReactNode;
  color?: 'slate' | 'cyan' | 'green' | 'amber' | 'orange' | 'red' | 'violet';
  className?: string;
}) {
  const colors: Record<string, string> = {
    slate: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
    cyan: 'bg-accent-500/10 text-accent-300 border-accent-500/20',
    green: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    orange: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
    red: 'bg-red-500/10 text-red-300 border-red-500/20',
    violet: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  };
  return (
    <span className={`chip border ${colors[color]} ${className}`}>{children}</span>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-border-subtle flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-slate-500" />
      </div>
      <h3 className="font-display font-semibold text-white">{title}</h3>
      <p className="text-sm text-slate-400 mt-1 max-w-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
