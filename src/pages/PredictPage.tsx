import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { jsPDF } from 'jspdf';
import {
  Brain,
  Loader2,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Users,
  ShieldAlert,
  Cpu,
  Sliders,
  FormInput,
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui';
import { RiskGauge } from '../components/RiskGauge';
import { STATE_NAMES, STATE_BY_NAME } from '../data/states';
import { predictRisk, riskLevelBg, type PredictionInput, type PredictionResult } from '../lib/prediction';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const tooltipStyle = {
  backgroundColor: 'rgba(12,19,34,0.95)',
  border: '1px solid rgba(148,163,184,0.2)',
  borderRadius: '12px',
  fontSize: '12px',
  color: '#e2e8f0',
};

const SEASONS: PredictionInput['season'][] = ['Winter', 'Summer', 'Monsoon', 'Post-Monsoon'];

function Field({
  label,
  value,
  onChange,
  type = 'number',
  suffix,
}: {
  label: string;
  value: number | string;
  onChange: (v: string) => void;
  type?: string;
  suffix?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export function PredictPage() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [saved, setSaved] = useState(false);
  const [mode, setMode] = useState<'form' | 'simulator'>('form');

  const [state, setState] = useState('Kerala');
  const [district, setDistrict] = useState('Kochi');
  const [rainfall, setRainfall] = useState('180');
  const [temperature, setTemperature] = useState('29');
  const [humidity, setHumidity] = useState('82');
  const [windSpeed, setWindSpeed] = useState('28');
  const [riverLevel, setRiverLevel] = useState('8.5');
  const [popDensity, setPopDensity] = useState('860');
  const [forestCover, setForestCover] = useState('50');
  const [elevation, setElevation] = useState('200');
  const [season, setSeason] = useState<PredictionInput['season']>('Monsoon');

  // Simulator: numeric values for sliders
  const [simRainfall, setSimRainfall] = useState(180);
  const [simTemp, setSimTemp] = useState(29);
  const [simHumidity, setSimHumidity] = useState(82);
  const [simWind, setSimWind] = useState(28);
  const [simRiver, setSimRiver] = useState(8.5);
  const [simForest, setSimForest] = useState(50);
  const [simElevation, setSimElevation] = useState(200);
  const [simSeason, setSimSeason] = useState<PredictionInput['season']>('Monsoon');
  const [simState, setSimState] = useState('Kerala');

  // Live prediction for simulator
  const simResult = useMemo(() => {
    if (mode !== 'simulator') return null;
    const input: PredictionInput = {
      state: simState,
      district: STATE_BY_NAME[simState]?.capital ?? simState,
      rainfall: simRainfall,
      temperature: simTemp,
      humidity: simHumidity,
      windSpeed: simWind,
      riverLevel: simRiver,
      populationDensity: (STATE_BY_NAME[simState]?.population ?? 35) * 1_000_000 / 50_000,
      forestCover: simForest,
      elevation: simElevation,
      season: simSeason,
    };
    return predictRisk(input, STATE_BY_NAME[simState]);
  }, [mode, simState, simRainfall, simTemp, simHumidity, simWind, simRiver, simForest, simElevation, simSeason]);

  // Auto-run prediction when switching to simulator mode
  useEffect(() => {
    if (mode === 'simulator' && simResult) {
      setResult(simResult);
    }
  }, [mode, simResult]);

  function handlePredict() {
    setLoading(true);
    setSaved(false);
    setTimeout(() => {
      const input: PredictionInput = {
        state,
        district,
        rainfall: Number(rainfall),
        temperature: Number(temperature),
        humidity: Number(humidity),
        windSpeed: Number(windSpeed),
        riverLevel: Number(riverLevel),
        populationDensity: Number(popDensity),
        forestCover: Number(forestCover),
        elevation: Number(elevation),
        season,
      };
      const res = predictRisk(input, STATE_BY_NAME[state]);
      setResult(res);
      setLoading(false);
    }, 900);
  }

  async function handleSave() {
    if (!result || !session || saved) return;
    const input: PredictionInput = {
      state, district, rainfall: Number(rainfall), temperature: Number(temperature),
      humidity: Number(humidity), windSpeed: Number(windSpeed), riverLevel: Number(riverLevel),
      populationDensity: Number(popDensity), forestCover: Number(forestCover),
      elevation: Number(elevation), season,
    };
    await supabase.from('predictions').insert({
      state,
      district,
      inputs: input,
      results: { risks: result.risks, topProbability: result.topProbability },
      recommendations: result.recommendations,
      confidence_score: result.confidence,
      risk_level: result.riskLevel,
      affected_population: result.affectedPopulation,
    });
    setSaved(true);
  }

  function handleDownload() {
    if (!result) return;
    const doc = new jsPDF();
    const w = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(7, 11, 20);
    doc.rect(0, 0, w, 30, 'F');
    doc.setTextColor(6, 182, 212);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('DisasterAI — Risk Prediction Report', 14, 18);
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);

    let y = 42;
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Input Parameters', 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const inputs = [
      `State: ${state}`, `District: ${district}`, `Season: ${season}`,
      `Rainfall: ${rainfall} mm`, `Temperature: ${temperature} C`, `Humidity: ${humidity}%`,
      `Wind Speed: ${windSpeed} km/h`, `River Level: ${riverLevel} m`,
      `Population Density: ${popDensity}/sq km`, `Forest Cover: ${forestCover}%`,
      `Elevation: ${elevation} m`,
    ];
    inputs.forEach((line, i) => {
      doc.text(line, 14 + (i % 2) * 95, y);
      if (i % 2 === 1) y += 6;
    });

    y += 8;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Prediction Results', 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Top Disaster: ${result.risks[0].label}`, 14, y); y += 6;
    doc.text(`Risk Probability: ${result.topProbability.toFixed(1)}%`, 14, y); y += 6;
    doc.text(`Risk Level: ${result.riskLevel}`, 14, y); y += 6;
    doc.text(`Confidence Score: ${result.confidence}%`, 14, y); y += 6;
    doc.text(`Affected Population (est.): ${result.affectedPopulation.toLocaleString()}`, 14, y); y += 6;
    doc.text(`Model Used: ${result.modelInfo.model} (${result.modelInfo.accuracy}% accuracy)`, 14, y); y += 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Disaster Risk Breakdown', 14, y); y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    result.risks.forEach((r) => {
      doc.text(`${r.label}: ${r.probability.toFixed(1)}%`, 14, y);
      y += 6;
    });

    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Emergency Recommendations', 14, y); y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    result.recommendations.forEach((r, i) => {
      const lines = doc.splitTextToSize(`${i + 1}. ${r}`, w - 28);
      doc.text(lines, 14, y);
      y += lines.length * 6;
    });

    doc.save(`disaster-ai-report-${state}-${Date.now()}.pdf`);
  }

  function reset() {
    setResult(null);
    setSaved(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Predict Disaster Risk</h1>
        <p className="text-sm text-slate-400 mt-1">
          Enter environmental parameters to generate an AI-powered risk assessment
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMode('form')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            mode === 'form'
              ? 'bg-accent-500/20 text-accent-300 border border-accent-500/40'
              : 'bg-white/5 text-slate-400 border border-border-subtle hover:bg-white/10'
          }`}
        >
          <FormInput className="w-4 h-4" /> Form Mode
        </button>
        <button
          onClick={() => setMode('simulator')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            mode === 'simulator'
              ? 'bg-accent-500/20 text-accent-300 border border-accent-500/40'
              : 'bg-white/5 text-slate-400 border border-border-subtle hover:bg-white/10'
          }`}
        >
          <Sliders className="w-4 h-4" /> What-If Simulator
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Form or Simulator */}
        {mode === 'simulator' ? (
          <Card className="p-5">
            <CardHeader title="What-If Simulator" subtitle="Adjust sliders to see risk change in real time" icon={Sliders} />
            <div className="px-1 pb-2 space-y-5 mt-2">
              {/* State selector */}
              <div>
                <label className="label">State / Region</label>
                <select className="input" value={simState} onChange={(e) => setSimState(e.target.value)}>
                  {STATE_NAMES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Season selector */}
              <div>
                <label className="label">Season</label>
                <div className="flex gap-2">
                  {(['Winter', 'Summer', 'Monsoon', 'Post-Monsoon'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSimSeason(s)}
                      className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        simSeason === s
                          ? 'bg-accent-500/20 text-accent-300 border border-accent-500/40'
                          : 'bg-white/5 text-slate-400 border border-border-subtle hover:bg-white/10'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders */}
              {[
                { label: 'Rainfall', unit: 'mm', value: simRainfall, set: setSimRainfall, min: 0, max: 300, step: 5 },
                { label: 'Temperature', unit: '°C', value: simTemp, set: setSimTemp, min: 10, max: 50, step: 1 },
                { label: 'Humidity', unit: '%', value: simHumidity, set: setSimHumidity, min: 20, max: 100, step: 1 },
                { label: 'Wind Speed', unit: 'km/h', value: simWind, set: setSimWind, min: 0, max: 80, step: 1 },
                { label: 'River Level', unit: 'm', value: simRiver, set: setSimRiver, min: 0, max: 12, step: 0.1 },
                { label: 'Forest Cover', unit: '%', value: simForest, set: setSimForest, min: 0, max: 80, step: 1 },
                { label: 'Elevation', unit: 'm', value: simElevation, set: setSimElevation, min: 0, max: 2500, step: 50 },
              ].map((slider) => (
                <div key={slider.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="label mb-0">{slider.label}</label>
                    <span className="text-sm font-semibold text-accent-300 tabular-nums">
                      {slider.value}{slider.unit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={slider.min}
                    max={slider.max}
                    step={slider.step}
                    value={slider.value}
                    onChange={(e) => slider.set(parseFloat(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-accent-500"
                  />
                </div>
              ))}

              <div className="p-3 rounded-xl bg-accent-500/10 border border-accent-500/20">
                <p className="text-xs text-accent-300">
                  Risk score updates live as you move the sliders. Try increasing rainfall during Monsoon season to see flood risk spike.
                </p>
              </div>
            </div>
          </Card>
        ) : (
        <Card className="p-5">
          <CardHeader title="Input Parameters" subtitle="Environmental & geographic data" icon={Brain} />
          <div className="px-1 pb-2 space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">State</label>
                <select className="input" value={state} onChange={(e) => setState(e.target.value)}>
                  {STATE_NAMES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Field label="District" value={district} onChange={setDistrict} type="text" />
            </div>
            <div>
              <label className="label">Season</label>
              <div className="grid grid-cols-4 gap-2">
                {SEASONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSeason(s)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      season === s
                        ? 'bg-accent-500/20 border border-accent-500/40 text-accent-300'
                        : 'bg-white/5 border border-border-subtle text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Rainfall" value={rainfall} onChange={setRainfall} suffix="mm" />
              <Field label="Temperature" value={temperature} onChange={setTemperature} suffix="°C" />
              <Field label="Humidity" value={humidity} onChange={setHumidity} suffix="%" />
              <Field label="Wind Speed" value={windSpeed} onChange={setWindSpeed} suffix="km/h" />
              <Field label="River Level" value={riverLevel} onChange={setRiverLevel} suffix="m" />
              <Field label="Population Density" value={popDensity} onChange={setPopDensity} suffix="/km²" />
              <Field label="Forest Cover" value={forestCover} onChange={setForestCover} suffix="%" />
              <Field label="Elevation" value={elevation} onChange={setElevation} suffix="m" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handlePredict} disabled={loading} className="btn-primary flex-1">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                {loading ? 'Analyzing...' : 'Predict Risk'}
              </button>
              {result && (
                <button onClick={reset} className="btn-outline">
                  <RotateCcw className="w-4 h-4" /> Reset
                </button>
              )}
            </div>
          </div>
        </Card>
        )}

        {/* Result */}
        <div>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="p-8 h-full flex flex-col items-center justify-center min-h-[400px]">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-accent-500/20 border-t-accent-500 animate-spin" />
                    <Brain className="w-6 h-6 text-accent-400 absolute inset-0 m-auto" />
                  </div>
                  <p className="text-sm text-slate-400 mt-4">Running AI prediction model...</p>
                  <p className="text-xs text-slate-600 mt-1">XGBoost · 6 disaster types · 12K training records</p>
                </Card>
              </motion.div>
            ) : result ? (
              <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card className="p-5">
                  {/* Gauge + level */}
                  <div className="flex flex-col items-center mb-5">
                    <RiskGauge value={result.topProbability} label={result.risks[0].label} size={200} />
                    <span className={`chip border mt-3 ${riskLevelBg(result.riskLevel)}`}>
                      <ShieldAlert className="w-3.5 h-3.5" />
                      {result.riskLevel} Risk
                    </span>
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    <div className="p-3 rounded-xl bg-white/5 text-center">
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Confidence</p>
                      <p className="text-lg font-display font-bold text-white mt-1">{result.confidence}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 text-center">
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Affected</p>
                      <p className="text-lg font-display font-bold text-white mt-1">
                        {(result.affectedPopulation / 1_000_000).toFixed(2)}M
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 text-center">
                      <p className="text-xs text-slate-500 uppercase tracking-wider">Model</p>
                      <p className="text-lg font-display font-bold text-white mt-1">{result.modelInfo.model}</p>
                    </div>
                  </div>

                  {/* Prediction graph */}
                  <div className="mb-5">
                    <p className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-2">
                      Prediction Probability by Disaster
                    </p>
                    <div style={{ height: 180 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={result.risks} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" horizontal={false} />
                          <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis type="category" dataKey="label" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} width={70} />
                          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(148,163,184,0.05)' }} />
                          <Bar dataKey="probability" radius={[0, 4, 4, 0]}>
                            {result.risks.map((r) => (
                              <Cell key={r.type} fill={r.probability >= 75 ? '#ef4444' : r.probability >= 55 ? '#f97316' : r.probability >= 35 ? '#eab308' : '#10b981'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Model comparison */}
                  <div className="p-3 rounded-xl bg-white/5 mb-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Cpu className="w-3.5 h-3.5 text-accent-400" />
                      <p className="text-xs text-slate-400 font-medium">Model Comparison</p>
                    </div>
                    <div className="space-y-1.5">
                      {result.modelInfo.compared.map((m) => (
                        <div key={m.model} className="flex items-center justify-between text-xs">
                          <span className="text-slate-300">{m.model}</span>
                          <span className="text-slate-400">
                            Acc: <span className="text-white font-medium">{m.accuracy}%</span> · F1: <span className="text-white font-medium">{m.f1}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button onClick={handleDownload} className="btn-primary flex-1">
                      <Download className="w-4 h-4" /> Download PDF
                    </button>
                    <button onClick={handleSave} disabled={saved || !session} className="btn-outline">
                      {saved ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <CheckCircle2 className="w-4 h-4" />}
                      {saved ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="p-8 h-full flex flex-col items-center justify-center min-h-[400px]">
                  <Brain className="w-12 h-12 text-slate-600 mb-4" />
                  <p className="font-display font-semibold text-white">No prediction yet</p>
                  <p className="text-sm text-slate-400 mt-1 max-w-xs text-center">
                    Fill in the environmental parameters and click Predict Risk to generate an AI assessment.
                  </p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Recommendations */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader
                title="Emergency Recommendations"
                subtitle={`AI-generated actions for ${result.risks[0].label} risk`}
                icon={AlertTriangle}
              />
              <div className="p-5 pt-2 grid md:grid-cols-2 gap-3">
                {result.recommendations.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-border-subtle"
                  >
                    <div className="w-7 h-7 rounded-lg bg-accent-500/15 border border-accent-500/25 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-accent-300">{i + 1}</span>
                    </div>
                    <p className="text-sm text-slate-200 pt-0.5">{r}</p>
                  </motion.div>
                ))}
              </div>
              <div className="px-5 pb-5">
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 flex items-center gap-3">
                  <Users className="w-5 h-5 text-red-400 shrink-0" />
                  <p className="text-sm text-slate-300">
                    <span className="text-white font-semibold">Affected Population Estimate:</span>{' '}
                    {result.affectedPopulation.toLocaleString()} people in {state} may be impacted.
                    Initiate evacuation protocols if risk level is High or Critical.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
