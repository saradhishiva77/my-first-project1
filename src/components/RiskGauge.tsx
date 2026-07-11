import { motion } from 'framer-motion';

export function RiskGauge({
  value,
  label,
  size = 220,
}: {
  value: number; // 0-100
  label: string;
  size?: number;
}) {
  const stroke = 16;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const arc = 0.75; // 270 degrees
  const dash = circumference * arc;
  const offset = dash * (1 - value / 100);

  const color =
    value >= 75 ? '#ef4444' : value >= 55 ? '#f97316' : value >= 35 ? '#eab308' : '#10b981';

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-[135deg]">
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="rgba(148,163,184,0.12)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
          />
          <motion.circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            initial={{ strokeDashoffset: dash }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="font-display font-bold text-white tabular-nums"
            style={{ fontSize: size * 0.18 }}
          >
            {value.toFixed(1)}%
          </motion.span>
          <span className="text-xs uppercase tracking-widest text-slate-400 mt-1">{label}</span>
        </div>
      </div>
    </div>
  );
}
