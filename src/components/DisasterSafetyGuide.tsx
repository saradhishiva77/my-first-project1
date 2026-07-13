import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  Waves,
  Wind,
  Flame,
  Mountain,
  Thermometer,
  ActivitySquare,
} from 'lucide-react';

type Phase = 'before' | 'after';

interface DisasterGuide {
  type: string;
  icon: typeof Waves;
  color: string;
  before: string[];
  after: string[];
}

const GUIDES: DisasterGuide[] = [
  {
    type: 'Flood',
    icon: Waves,
    color: '#06b6d4',
    before: [
      'Move to higher ground immediately if warned',
      'Stock 3-day emergency kit: water, food, medicines, documents',
      'Disconnect electrical appliances; turn off gas supply',
      'Fill bathtubs and containers with clean water',
      'Keep rubber boots and emergency contacts ready',
      'Never ignore evacuation orders — act early',
    ],
    after: [
      'Do not return home until authorities declare it safe',
      'Avoid walking or driving through floodwaters',
      'Check for structural damage before entering buildings',
      'Boil all drinking water; avoid tap water until cleared',
      'Document damage with photos before cleaning up',
      'Watch for signs of waterborne illness — diarrhea, vomiting',
    ],
  },
  {
    type: 'Cyclone',
    icon: Wind,
    color: '#8b5cf6',
    before: [
      'Stay tuned to IMD alerts and cyclone track updates',
      'Board up windows and secure loose outdoor items',
      'Store food, water, candles, torch and first aid kit',
      'Identify nearest cyclone shelter in your locality',
      'Keep vehicles fueled; evacuate coastal zones immediately',
      'Trim trees near your home to reduce flying debris risk',
    ],
    after: [
      'Stay indoors until the "All Clear" is officially given',
      'Beware of downed power lines — assume all are live',
      'Inspect roof, walls and foundation before re-entering',
      'Report any gas leaks to authorities immediately',
      'Help neighbours, especially elderly and children',
      'Avoid areas with standing water and uprooted trees',
    ],
  },
  {
    type: 'Earthquake',
    icon: ActivitySquare,
    color: '#f59e0b',
    before: [
      'Secure heavy furniture and appliances to walls',
      'Know "Drop, Cover, Hold On" — practice with family',
      'Identify safe spots: under sturdy tables, away from windows',
      'Store emergency kit with water, food, torch, first aid',
      'Know how to shut off gas, water and electricity at home',
      'Avoid placing heavy items on high shelves',
    ],
    after: [
      'Check yourself and others for injuries before moving',
      'Evacuate if you smell gas — do not use open flames',
      'Expect aftershocks — take cover each time they happen',
      'Stay away from damaged buildings and bridges',
      'Use text messages — phone networks are often overloaded',
      'Check for fire hazards from damaged gas lines',
    ],
  },
  {
    type: 'Landslide',
    icon: Mountain,
    color: '#ec4899',
    before: [
      'Monitor soil saturation after heavy rain in hilly areas',
      'Evacuate if you see cracks in slopes or hear cracking sounds',
      'Keep drains around your home clear of debris',
      'Avoid building on steep slopes or cliff bases',
      'Plant trees to stabilize soil on slopes near your home',
      'Know your evacuation route to higher, stable ground',
    ],
    after: [
      'Stay away from the slide area — more slides can follow',
      'Report broken utility lines to prevent secondary hazards',
      'Check with local authorities before returning home',
      'Watch for flooding after a slide — it often follows',
      'Document damage for insurance and disaster relief claims',
      'Help locate missing persons by reporting to NDRF teams',
    ],
  },
  {
    type: 'Heatwave',
    icon: Thermometer,
    color: '#ef4444',
    before: [
      'Stay indoors between 12 PM and 4 PM on hot days',
      'Drink 2–3 litres of water per day even if not thirsty',
      'Wear light, loose cotton clothing and carry an umbrella',
      'Check on elderly, children, and outdoor workers regularly',
      'Install window shades or use wet curtains to cool rooms',
      'Keep medicines like ORS packets and electrolytes ready',
    ],
    after: [
      'Monitor for heat exhaustion: heavy sweating, weakness, dizziness',
      'Move affected persons to shade and apply cool wet cloths',
      'Seek medical help for heat stroke: confusion, no sweating',
      'Replenish electrolytes lost through sweating',
      'Rest and avoid physical exertion for 24–48 hours',
      'Report any community members showing serious symptoms',
    ],
  },
  {
    type: 'Wildfire',
    icon: Flame,
    color: '#f97316',
    before: [
      'Clear dry vegetation within 30 m of your home ("defensible space")',
      'Keep gutters clear of leaves — they catch embers easily',
      'Close all windows and doors to block smoke and embers',
      'Prepare emergency bag and be ready to evacuate in minutes',
      'Know two evacuation routes from your area',
      'Monitor satellite fire-tracking portals (NASA FIRMS)',
    ],
    after: [
      'Do not return until authorities confirm the area is safe',
      'Wear an N95 mask — ash contains toxic particles',
      'Check for hidden hotspots and smouldering embers',
      'Avoid running water in streams — ash makes it toxic',
      'Document property damage with photos before cleanup',
      'Watch for respiratory symptoms — seek medical care early',
    ],
  },
];

const phaseConfig = {
  before: {
    icon: ShieldCheck,
    label: 'Before Disaster',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    text: 'text-emerald-300',
    dot: 'bg-emerald-400',
  },
  after: {
    icon: ShieldAlert,
    label: 'After Disaster',
    bg: 'bg-amber-500/10 border-amber-500/30',
    text: 'text-amber-300',
    dot: 'bg-amber-400',
  },
};

export function DisasterSafetyGuide() {
  const [active, setActive] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('before');

  const guide = GUIDES.find((g) => g.type === active);
  const cfg = phaseConfig[phase];

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-white text-sm">Disaster Safety Guide</h3>
          <p className="text-xs text-slate-400 mt-0.5">What to do before and after each disaster</p>
        </div>
        {/* Phase toggle */}
        <div className="flex rounded-xl overflow-hidden border border-border-subtle">
          {(['before', 'after'] as Phase[]).map((p) => {
            const c = phaseConfig[p];
            return (
              <button
                key={p}
                onClick={() => setPhase(p)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all ${
                  phase === p
                    ? `${c.bg} ${c.text}`
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <c.icon className="w-3.5 h-3.5" />
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Disaster type pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {GUIDES.map((g) => (
          <button
            key={g.type}
            onClick={() => setActive(active === g.type ? null : g.type)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              active === g.type
                ? 'text-white border-transparent'
                : 'bg-white/5 text-slate-400 border-border-subtle hover:text-white hover:bg-white/10'
            }`}
            style={active === g.type ? { backgroundColor: `${g.color}22`, borderColor: `${g.color}55`, color: g.color } : {}}
          >
            <g.icon className="w-3.5 h-3.5" />
            {g.type}
          </button>
        ))}
      </div>

      {/* Tips panel */}
      <AnimatePresence mode="wait">
        {guide ? (
          <motion.div
            key={guide.type + phase}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className={`rounded-xl border p-4 ${cfg.bg}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <guide.icon className="w-4 h-4" style={{ color: guide.color }} />
              <span className="font-display font-semibold text-sm text-white">{guide.type}</span>
              <span className={`ml-auto text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
            </div>
            <div className="space-y-2">
              {guide[phase].map((tip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-2.5"
                >
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                  <p className="text-sm text-slate-200 leading-relaxed">{tip}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-border-subtle bg-white/5 p-6 text-center"
          >
            <ShieldCheck className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Select a disaster type above to view safety guidelines</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
