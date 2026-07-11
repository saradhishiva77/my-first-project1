import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CloudRain,
  ArrowRight,
  Brain,
  Map,
  Activity,
  Bell,
  ShieldCheck,
  TrendingUp,
  Globe2,
  Zap,
} from 'lucide-react';
import { RiskGauge } from '../components/RiskGauge';

export function LandingPage() {
  const features = [
    { icon: Brain, title: 'AI Risk Prediction', desc: 'XGBoost & Random Forest models trained on 12,000+ historical records predict disaster probability with 94% accuracy.' },
    { icon: Map, title: 'Interactive Risk Map', desc: 'State-level choropleth of India showing real-time risk bands from Safe to Critical with detailed drill-down.' },
    { icon: Activity, title: 'Real-time Analytics', desc: 'Animated charts for disaster trends, rainfall, temperature, distribution and prediction accuracy.' },
    { icon: Bell, title: 'Emergency Alert Center', desc: 'Color-coded alerts (Green/Yellow/Orange/Red) with live notifications and emergency messaging.' },
    { icon: ShieldCheck, title: 'Role-based Access', desc: 'Secure JWT authentication with admin and user roles controlling access to sensitive operations.' },
    { icon: TrendingUp, title: 'Prediction History', desc: 'Save, download and revisit every prediction report as a professional PDF document.' },
  ];

  const stats = [
    { value: '94.6%', label: 'Model Accuracy' },
    { value: '6', label: 'Disaster Types' },
    { value: '28+', label: 'States Covered' },
    { value: '12K+', label: 'Training Records' },
  ];

  return (
    <div className="min-h-screen bg-hero-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="absolute inset-0 bg-radial-glow" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center shadow-glow">
            <CloudRain className="w-5 h-5 text-white" />
          </div>
          <p className="font-display font-bold text-white text-lg">DisasterAI</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
          <Link to="/register" className="btn-primary text-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 pt-16 lg:pt-24 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/20 text-xs text-accent-300 mb-6"
            >
              <Zap className="w-3.5 h-3.5" />
              AI-Powered Disaster Intelligence
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="font-display font-bold text-4xl lg:text-6xl text-white leading-[1.1] text-balance"
            >
              Predict disasters{' '}
              <span className="gradient-text">before they strike</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-slate-400 mt-6 text-lg max-w-lg"
            >
              A real-time AI analytics platform estimating flood, cyclone,
              earthquake, landslide, heatwave and wildfire risk across India —
              with confidence scores and emergency recommendations.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex flex-wrap gap-3 mt-8"
            >
              <Link to="/register" className="btn-primary">
                Launch Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/login" className="btn-outline">Sign In</Link>
            </motion.div>
            <div className="grid grid-cols-4 gap-4 mt-12">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                >
                  <p className="font-display font-bold text-2xl text-white">{s.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="glass-strong p-8 flex flex-col items-center"
          >
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-4">
              Live Risk Assessment
            </p>
            <RiskGauge value={82.4} label="Flood Risk" size={240} />
            <div className="w-full grid grid-cols-3 gap-3 mt-6">
              {[
                { label: 'Confidence', value: '96%' },
                { label: 'Risk Level', value: 'Critical' },
                { label: 'Affected', value: '2.1M' },
              ].map((x) => (
                <div key={x.label} className="text-center p-3 rounded-xl bg-white/5">
                  <p className="text-sm font-display font-bold text-white">{x.value}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">{x.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12 pb-20">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl text-white">Everything you need to respond faster</h2>
          <p className="text-slate-400 mt-3 max-w-2xl mx-auto">
            From predictive modeling to emergency alerts, DisasterAI brings every
            tool needed for disaster risk management into one dashboard.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass glass-hover p-6"
            >
              <div className="w-11 h-11 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-accent-400" />
              </div>
              <h3 className="font-display font-semibold text-white">{f.title}</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 lg:px-12 pb-24">
        <div className="glass-strong p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-glow opacity-50" />
          <div className="relative z-10">
            <Globe2 className="w-10 h-10 text-accent-400 mx-auto mb-4" />
            <h2 className="font-display font-bold text-3xl text-white">Ready to build a safer future?</h2>
            <p className="text-slate-400 mt-3 max-w-lg mx-auto">
              Create your free account and start predicting disaster risks with AI.
            </p>
            <Link to="/register" className="btn-primary mt-6 inline-flex">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border-subtle py-6 text-center text-xs text-slate-500">
        DisasterAI · AI Disaster Risk Prediction Dashboard · Built for academic demonstration
      </footer>
    </div>
  );
}
