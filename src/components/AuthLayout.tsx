import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { CloudRain, Shield, Activity, Map, Brain, Bell } from 'lucide-react';

export function AuthLayout({ children }: { children: ReactNode }) {
  const features = [
    { icon: Brain, label: 'AI Risk Prediction' },
    { icon: Map, label: 'Interactive Risk Map' },
    { icon: Activity, label: 'Real-time Analytics' },
    { icon: Bell, label: 'Emergency Alerts' },
    { icon: Shield, label: 'Role-based Access' },
  ];
  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col w-1/2 relative overflow-hidden bg-hero-gradient p-12">
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <div className="absolute inset-0 bg-radial-glow" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center shadow-glow-lg">
            <CloudRain className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-white text-xl">DisasterAI</p>
            <p className="text-xs text-slate-400 uppercase tracking-widest">
              Risk Intelligence Platform
            </p>
          </div>
        </motion.div>

        <div className="relative z-10 mt-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display font-bold text-4xl text-white leading-tight text-balance"
          >
            Predict disasters before they strike with{' '}
            <span className="gradient-text">AI-powered intelligence</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 mt-4 max-w-md"
          >
            Real-time risk analytics for floods, cyclones, earthquakes, landslides,
            heatwaves and wildfires across India — powered by machine learning and
            environmental data.
          </motion.p>
          <div className="grid grid-cols-2 gap-3 mt-8 max-w-md">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="glass p-3 flex items-center gap-2.5"
              >
                <f.icon className="w-4 h-4 text-accent-400" />
                <span className="text-sm text-slate-300">{f.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

export function AuthField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="input"
      />
    </div>
  );
}

export function AuthError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">
      {message}
    </div>
  );
}

export function useAuthForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  return { loading, setLoading, error, setError };
}
