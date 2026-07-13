import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { FeatureCollection, Geometry } from 'geojson';
import { allCountryRisks, type CountryRiskView, BAND_COLORS, BAND_LABELS, type RiskBand } from '../lib/worldData';
import { COUNTRIES, CONTINENTS, type CountryInfo } from '../data/countries';

const NAME_MAP: Record<string, string> = {
  'United States of America': 'United States',
  'Russian Federation': 'Russia',
  'Dem. Rep. Congo': 'DR Congo',
  'Czechia': 'Czech Republic',
  'Bosnia and Herz.': 'Bosnia and Herzegovina',
  'S. Sudan': 'South Sudan',
  'Central African Rep.': 'Central African Republic',
  'Eq. Guinea': 'Equatorial Guinea',
  'Dem. Rep. Korea': 'North Korea',
  'Republic of Korea': 'South Korea',
  'Dominican Rep.': 'Dominican Republic',
  'W. Sahara': 'Western Sahara',
  'Falkland Is.': 'Falkland Islands',
  'Fr. S. Antarctic Lands': 'French Southern Lands',
  'Solomon Is.': 'Solomon Islands',
  'N. Cyprus': 'Northern Cyprus',
  'Somaliland': 'Somalia',
  "Côte d'Ivoire": 'Ivory Coast',
};

const COUNTRY_BY_NAME: Record<string, CountryInfo> = COUNTRIES.reduce<Record<string, CountryInfo>>((acc, c) => {
  acc[c.name] = c;
  return acc;
}, {});

export function WorldRiskMap({ onSelect }: { onSelect?: (view: CountryRiskView) => void }) {
  const risks = allCountryRisks();
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [continent, setContinent] = useState('All');
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/geo/world-110m.json')
      .then((r) => r.json())
      .then((topo) => {
        const fc = feature(topo, topo.objects.countries) as unknown as FeatureCollection;
        setGeoData(fc);
      })
      .catch(() => {});
  }, []);

  const colorFor = (name: string) =>
    risks.find((x) => x.country.name === name)?.color ?? BAND_COLORS.safe;

  const bandFor = (name: string): RiskBand =>
    risks.find((x) => x.country.name === name)?.band ?? 'safe';

  const viewFor = (name: string): CountryRiskView | undefined =>
    risks.find((x) => x.country.name === name);

  const { paths, centroids } = useMemo(() => {
    if (!geoData) return { paths: [] as { d: string; countryName: string; countryInfo?: CountryInfo }[], centroids: {} as Record<string, [number, number]> };

    const projection = geoNaturalEarth1().scale(180).translate([500, 250]);
    const pathGen = geoPath(projection);
    const features = geoData.features as unknown as { type: 'Feature'; properties: { name: string; [k: string]: unknown }; geometry: Geometry }[];
    const centroids: Record<string, [number, number]> = {};

    const paths = features.map((f) => {
      const rawName = f.properties.name as string;
      const countryName = NAME_MAP[rawName] ?? rawName;
      const countryInfo = COUNTRY_BY_NAME[countryName];
      const d = pathGen(f) ?? '';
      const centroid = pathGen.centroid(f);
      if (countryInfo) centroids[countryName] = [centroid[0], centroid[1]];
      return { d, countryName, countryInfo };
    });

    return { paths, centroids };
  }, [geoData]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHover(null)}
    >
      {/* Continent filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {CONTINENTS.map((c) => (
          <button
            key={c}
            onClick={() => setContinent(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              continent === c
                ? 'bg-accent-500/20 text-accent-300 border border-accent-500/40'
                : 'bg-white/5 text-slate-400 border border-border-subtle hover:bg-white/10'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {!geoData && (
        <div className="flex items-center justify-center h-[480px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Loading world map…</p>
          </div>
        </div>
      )}

      {geoData && (
        <svg viewBox="0 0 1000 500" className="w-full h-full" style={{ minHeight: 480 }}>
          <defs>
            <pattern id="worldGridReal" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M20 0 L0 0 L0 20" fill="none" stroke="rgba(148,163,184,0.04)" strokeWidth="0.5" />
            </pattern>
            <filter id="countryGlowReal" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="oceanGlowReal" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(6,182,212,0.04)" />
              <stop offset="100%" stopColor="rgba(6,182,212,0)" />
            </radialGradient>
          </defs>

          <rect width="1000" height="500" fill="url(#worldGridReal)" />
          <rect width="1000" height="500" fill="url(#oceanGlowReal)" />
          {[100, 200, 300, 400].map((y) => (
            <line key={`h${y}`} x1="0" y1={y} x2="1000" y2={y} stroke="rgba(148,163,184,0.05)" strokeWidth="0.5" strokeDasharray="4 4" />
          ))}
          {[200, 400, 600, 800].map((x) => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="500" stroke="rgba(148,163,184,0.05)" strokeWidth="0.5" strokeDasharray="4 4" />
          ))}

          {paths.map((p, i) => {
            if (!p.countryInfo) {
              return (
                <path
                  key={i}
                  d={p.d}
                  fill="rgba(148,163,184,0.08)"
                  fillOpacity={0.4}
                  stroke="rgba(7,11,20,0.4)"
                  strokeWidth={0.5}
                  strokeLinejoin="round"
                />
              );
            }
            const color = colorFor(p.countryName);
            const isSelected = selected === p.countryName;
            const isHover = hover === p.countryName;
            const band = bandFor(p.countryName);
            const dimmed = continent !== 'All' && p.countryInfo.continent !== continent;
            const [cx, cy] = centroids[p.countryName] ?? [0, 0];
            return (
              <g key={i}>
                <path
                  d={p.d}
                  fill={color}
                  fillOpacity={dimmed ? 0.1 : isSelected ? 0.88 : isHover ? 0.72 : 0.48}
                  stroke={isSelected ? '#fff' : isHover ? 'rgba(255,255,255,0.6)' : 'rgba(7,11,20,0.5)'}
                  strokeWidth={isSelected ? 1.5 : isHover ? 1.2 : 0.5}
                  strokeLinejoin="round"
                  filter={isSelected ? 'url(#countryGlowReal)' : undefined}
                  style={{ cursor: dimmed ? 'default' : 'pointer', transition: 'fill-opacity 0.15s' }}
                  onMouseEnter={() => !dimmed && setHover(p.countryName)}
                  onClick={() => {
                    if (dimmed) return;
                    setSelected(p.countryName);
                    const v = viewFor(p.countryName);
                    if (v) onSelect?.(v);
                  }}
                />
                {band === 'critical' && !isSelected && !dimmed && (
                  <motion.circle
                    cx={cx} cy={cy} r="4"
                    fill="#ef4444"
                    animate={{ opacity: [1, 0.3, 1], scale: [1, 1.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="pointer-events-none"
                  />
                )}
                <text
                  x={cx} y={cy}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="10"
                  className="pointer-events-none select-none"
                  fill={isHover || isSelected ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)'}
                  fontWeight={isHover || isSelected ? '700' : '600'}
                >
                  {p.countryInfo.code}
                </text>
              </g>
            );
          })}
        </svg>
      )}

      {/* Cursor-following tooltip */}
      <AnimatePresence>
        {hover && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="pointer-events-none absolute z-20 glass-strong px-3 py-2.5 rounded-xl text-xs shadow-xl"
            style={{
              left: mousePos.x + 14,
              top: mousePos.y - 36,
              transform: mousePos.x > (containerRef.current?.clientWidth ?? 800) - 200
                ? 'translateX(-110%)'
                : 'translateX(0)',
            }}
          >
            <p className="font-semibold text-white">{hover}</p>
            <p className="text-slate-400 mt-0.5">
              Risk: <span style={{ color: colorFor(hover) }}>{BAND_LABELS[bandFor(hover)]}</span>
              {'  '}·{'  '}{viewFor(hover)?.result.riskScore.toFixed(0)}%
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-4 justify-center">
        {(['safe', 'medium', 'high', 'critical'] as RiskBand[]).map((b) => (
          <div key={b} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: BAND_COLORS[b] }} />
            <span className="text-xs text-slate-400">{BAND_LABELS[b]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
