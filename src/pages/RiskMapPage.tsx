import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map as MapIcon,
  Globe2,
  X,
  CloudRain,
  Thermometer,
  Droplets,
  Wind,
  Waves,
  Users,
  Trees,
  Mountain,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Plus,
  MapPin,
} from 'lucide-react';
import { IndiaRiskMap } from '../components/IndiaRiskMap';
import { WorldRiskMap } from '../components/WorldRiskMap';
import { Card, CardHeader, Badge } from '../components/ui';
import { type StateRiskView, BAND_COLORS, BAND_LABELS } from '../lib/mockData';
import { type CountryRiskView } from '../lib/worldData';
import { DISASTER_LABELS } from '../lib/prediction';
import { fetchIncidentReports, type IncidentReport } from '../lib/disasterFeed';
import { IncidentReportForm } from '../components/IncidentReportForm';

type Tab = 'india' | 'world';
type SelectedView =
  | { type: 'india'; data: StateRiskView }
  | { type: 'world'; data: CountryRiskView }
  | null;

export function RiskMapPage() {
  const [tab, setTab] = useState<Tab>('india');
  const [selected, setSelected] = useState<SelectedView>(null);
  const [showReports, setShowReports] = useState(false);
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);

  const loadIncidents = useCallback(async () => {
    const data = await fetchIncidentReports();
    setIncidents(data);
  }, []);

  useEffect(() => { loadIncidents(); }, [loadIncidents]);

  const detailRows = (v: StateRiskView | CountryRiskView) => {
    const isIndia = (v as StateRiskView).state !== undefined;
    const src = isIndia ? (v as StateRiskView).state : (v as CountryRiskView).country;
    return [
      { icon: CloudRain, label: 'Rainfall', value: `${src.avgRainfall} mm` },
      { icon: Thermometer, label: 'Temperature', value: `${src.avgTemp}°C` },
      { icon: Droplets, label: 'Humidity', value: `${src.avgHumidity}%` },
      { icon: Wind, label: 'Wind Speed', value: `${src.avgWindSpeed} km/h` },
      ...(isIndia ? [{ icon: Waves, label: 'River Level', value: `${(src as StateRiskView['state']).avgRiverLevel} m` }] : []),
      { icon: Users, label: 'Population', value: `${src.population}M` },
      { icon: Trees, label: 'Forest Cover', value: `${src.forestCover}%` },
      { icon: Mountain, label: 'Elevation', value: `${src.elevation} m` },
    ];
  };

  const riskRows = (v: StateRiskView | CountryRiskView) =>
    v.result.risks.slice(0, 6).map((r) => ({
      label: r.label,
      value: r.probability,
      color:
        r.probability >= 75 ? '#ef4444' : r.probability >= 55 ? '#f97316' : r.probability >= 35 ? '#eab308' : '#10b981',
    }));

  const selectedName = selected?.type === 'india' ? selected.data.state.name : selected?.type === 'world' ? selected.data.country.name : '';
  const selectedCapital = selected?.type === 'india' ? selected.data.state.capital : selected?.type === 'world' ? selected.data.country.capital || selected.data.country.name : '';
  const selectedColor = selected?.data.color ?? BAND_COLORS.safe;
  const selectedBand = selected?.data.band ?? 'safe';
  const selectedResult = selected?.data.result;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Interactive Risk Map</h1>
          <p className="text-sm text-slate-400 mt-1">
            Click any {tab === 'india' ? 'state' : 'country'} to view detailed risk assessment and AI recommendations
          </p>
        </div>
        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl glass">
          <button
            onClick={() => { setTab('india'); setSelected(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === 'india'
                ? 'bg-accent-500/20 text-accent-300'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            India
          </button>
          <button
            onClick={() => { setTab('world'); setSelected(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === 'world'
                ? 'bg-accent-500/20 text-accent-300'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Globe2 className="w-4 h-4" />
            World
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <CardHeader
            title={tab === 'india' ? 'India Risk Choropleth' : 'Global Risk Choropleth'}
            subtitle={tab === 'india' ? 'State-level disaster risk classification' : 'Country-level disaster risk classification'}
            icon={tab === 'india' ? MapIcon : Globe2}
            action={
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowReportForm(true)}
                  className="btn-outline text-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Report
                </button>
                <button
                  onClick={() => setShowReports(!showReports)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    showReports
                      ? 'bg-accent-500/20 text-accent-300 border border-accent-500/40'
                      : 'bg-white/5 text-slate-400 border border-border-subtle hover:bg-white/10'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 inline mr-1" />
                  {showReports ? 'Hide' : 'Show'} Reports ({incidents.length})
                </button>
              </div>
            }
          />
          <div className="mt-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                {tab === 'india' ? (
                  <IndiaRiskMap onSelect={(v) => setSelected({ type: 'india', data: v })} />
                ) : (
                  <WorldRiskMap onSelect={(v) => setSelected({ type: 'world', data: v })} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Community incident reports overlay */}
          {showReports && incidents.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border-subtle">
              <p className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-3">
                Community Incident Reports
              </p>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {incidents.map((r) => (
                  <div key={r.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <span
                      className="risk-dot mt-1.5"
                      style={{
                        backgroundColor:
                          r.severity === 'critical' ? '#ef4444' :
                          r.severity === 'high' ? '#f97316' :
                          r.severity === 'medium' ? '#eab308' : '#10b981',
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white capitalize">{r.disaster_type}</span>
                        <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded ${
                          r.status === 'active' ? 'bg-red-500/15 text-red-300' :
                          r.status === 'verified' ? 'bg-emerald-500/15 text-emerald-300' :
                          'bg-slate-500/15 text-slate-300'
                        }`}>
                          {r.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{r.description}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                        {r.location_name && <span>{r.location_name}</span>}
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5" /> {r.latitude.toFixed(2)}, {r.longitude.toFixed(2)}
                        </span>
                        <span>· {new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Side panel */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selected && selectedResult ? (
              <motion.div
                key={selectedName}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                <Card className="overflow-hidden">
                  <div
                    className="p-5 relative"
                    style={{ background: `linear-gradient(135deg, ${selectedColor}30, transparent)` }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="font-display font-bold text-xl text-white">{selectedName}</h2>
                        <p className="text-sm text-slate-400 mt-0.5">Capital: {selectedCapital}</p>
                        {selected.type === 'world' && (
                          <p className="text-xs text-slate-500 mt-0.5">{selected.data.country.continent}</p>
                        )}
                      </div>
                      <button
                        onClick={() => setSelected(null)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <span
                        className="chip border"
                        style={{
                          backgroundColor: `${selectedColor}20`,
                          color: selectedColor,
                          borderColor: `${selectedColor}40`,
                        }}
                      >
                        <span className="risk-dot" style={{ backgroundColor: selectedColor }} />
                        {BAND_LABELS[selectedBand]} Risk
                      </span>
                      <Badge color="cyan">Score: {selectedResult.riskScore.toFixed(0)}%</Badge>
                    </div>
                  </div>

                  <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
                    {/* Top disaster */}
                    <div className="p-4 rounded-xl bg-white/5 border border-border-subtle">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-accent-400" />
                        <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">AI Prediction</p>
                      </div>
                      <p className="text-lg font-display font-bold text-white">
                        {DISASTER_LABELS[selectedResult.topDisaster]} Risk
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        Confidence: <span className="text-white font-medium">{selectedResult.confidence}%</span>
                      </p>
                    </div>

                    {/* Risk probabilities */}
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-3">Disaster Probabilities</p>
                      <div className="space-y-2.5">
                        {riskRows(selected.data).map((r) => (
                          <div key={r.label}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-slate-300">{r.label}</span>
                              <span className="text-white font-medium tabular-nums">{r.value.toFixed(1)}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${r.value}%` }}
                                transition={{ duration: 0.6 }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: r.color }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Environmental details */}
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-3">Current Conditions</p>
                      <div className="grid grid-cols-2 gap-2.5">
                        {detailRows(selected.data).map((d) => (
                          <div key={d.label} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5">
                            <d.icon className="w-4 h-4 text-accent-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{d.label}</p>
                              <p className="text-sm text-white font-medium truncate">{d.value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Disaster history */}
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-3">Disaster History</p>
                      <div className="space-y-2">
                        {[
                          { d: selectedResult.topDisaster === 'flood' ? 'Flood' : 'Cyclone', y: '2023', s: 'High' },
                          { d: 'Heatwave', y: '2022', s: 'Medium' },
                          { d: 'Landslide', y: '2021', s: 'Low' },
                        ].map((h, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                              <span className="text-sm text-slate-300">{h.d}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">{h.y}</span>
                              <Badge color={h.s === 'High' ? 'red' : h.s === 'Medium' ? 'orange' : 'amber'}>{h.s}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Suggested actions */}
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-3">Suggested Actions</p>
                      <div className="space-y-2">
                        {selectedResult.recommendations.slice(0, 4).map((r, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                            <p className="text-sm text-slate-300">{r}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass p-8 text-center h-full flex flex-col items-center justify-center"
              >
                {tab === 'india' ? (
                  <MapIcon className="w-10 h-10 text-slate-600 mb-3" />
                ) : (
                  <Globe2 className="w-10 h-10 text-slate-600 mb-3" />
                )}
                <p className="font-display font-semibold text-white">
                  Select a {tab === 'india' ? 'state' : 'country'}
                </p>
                <p className="text-sm text-slate-400 mt-1 max-w-xs">
                  Click any {tab === 'india' ? 'state on the map' : 'country on the map'} to view its detailed risk assessment,
                  weather conditions and AI-generated recommendations.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {showReportForm && (
        <IncidentReportForm
          onClose={() => setShowReportForm(false)}
          onSubmitted={loadIncidents}
        />
      )}
    </div>
  );
}
