import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { geoMercator, geoPath } from 'd3-geo';
import type { FeatureCollection, Geometry } from 'geojson';
import { allStateRisks, type StateRiskView, BAND_COLORS, BAND_LABELS, type RiskBand } from '../lib/mockData';
import { GEOJSON_NAME_MAP, STATE_BY_NAME } from '../data/states';

interface GeoFeature {
  type: 'Feature';
  properties: { NAME_1: string; [key: string]: unknown };
  geometry: Geometry;
}

export function IndiaRiskMap({ onSelect }: { onSelect?: (view: StateRiskView) => void }) {
  const risks = allStateRisks();
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [geoData, setGeoData] = useState<FeatureCollection | null>(null);
  const [sweepAngle, setSweepAngle] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/geo/india-states-simple.geojson')
      .then((r) => r.json())
      .then(setGeoData)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const animate = (now: number) => {
      setSweepAngle(((now / 1000) * 30) % 360);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const colorFor = (name: string) =>
    risks.find((x) => x.state.name === name)?.color ?? BAND_COLORS.safe;

  const bandFor = (name: string): RiskBand =>
    risks.find((x) => x.state.name === name)?.band ?? 'safe';

  const viewFor = (name: string): StateRiskView | undefined =>
    risks.find((x) => x.state.name === name);

  const { paths, centroids } = useMemo(() => {
    if (!geoData) return { paths: [], centroids: {} as Record<string, [number, number]> };

    const projection = geoMercator().scale(800).center([82, 22]).translate([500, 500]);
    const pathGen = geoPath(projection);
    const features = geoData.features as GeoFeature[];
    const centroids: Record<string, [number, number]> = {};

    const paths = features.map((f) => {
      const rawName = f.properties.NAME_1;
      const stateName = GEOJSON_NAME_MAP[rawName] ?? rawName;
      const stateInfo = STATE_BY_NAME[stateName];
      const d = pathGen(f) ?? '';
      const centroid = pathGen.centroid(f);
      if (stateInfo) centroids[stateName] = [centroid[0], centroid[1]];
      return { d, stateName, stateInfo, rawName };
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
      {!geoData && (
        <div className="flex items-center justify-center h-[500px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Loading map data…</p>
          </div>
        </div>
      )}

      {geoData && (
        <svg viewBox="0 0 1000 1000" className="w-full" style={{ minHeight: 500 }}>
          <defs>
            <linearGradient id="radarSweepIndia" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
              <stop offset="80%" stopColor="#06b6d4" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.18" />
            </linearGradient>
            <filter id="stateGlowIndia" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <pattern id="gridIndia" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M20 0 L0 0 L0 20" fill="none" stroke="rgba(148,163,184,0.04)" strokeWidth="0.5" />
            </pattern>
          </defs>

          <rect width="1000" height="1000" fill="url(#gridIndia)" />

          {/* Radar rings */}
          <g transform="translate(500, 500)">
            {[450, 300, 150].map((r) => (
              <circle key={r} cx="0" cy="0" r={r} fill="none" stroke="rgba(6,182,212,0.06)" strokeWidth="1" />
            ))}
            <g transform={`rotate(${sweepAngle})`}>
              <path d="M0 0 L450 0 A450 450 0 0 1 225 390 Z" fill="url(#radarSweepIndia)" />
            </g>
          </g>

          {/* State polygons */}
          {paths.map((p, i) => {
            if (!p.stateInfo) return null;
            const color = colorFor(p.stateName);
            const isSelected = selected === p.stateName;
            const isHover = hover === p.stateName;
            const band = bandFor(p.stateName);
            const [cx, cy] = centroids[p.stateName] ?? [0, 0];
            return (
              <g key={i}>
                <path
                  d={p.d}
                  fill={color}
                  fillOpacity={isSelected ? 0.9 : isHover ? 0.75 : 0.5}
                  stroke={isSelected ? '#fff' : isHover ? 'rgba(255,255,255,0.7)' : 'rgba(7,11,20,0.6)'}
                  strokeWidth={isSelected ? 2.5 : isHover ? 1.8 : 0.8}
                  strokeLinejoin="round"
                  filter={isSelected ? 'url(#stateGlowIndia)' : undefined}
                  style={{ cursor: 'pointer', transition: 'fill-opacity 0.15s, stroke-width 0.15s' }}
                  onMouseEnter={() => setHover(p.stateName)}
                  onClick={() => {
                    setSelected(p.stateName);
                    const v = viewFor(p.stateName);
                    if (v) onSelect?.(v);
                  }}
                />
                {band === 'critical' && !isSelected && (
                  <motion.circle
                    cx={cx} cy={cy} r="6"
                    fill="#ef4444"
                    animate={{ opacity: [1, 0.2, 1], r: [6, 9, 6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="pointer-events-none"
                  />
                )}
                <text
                  x={cx} y={cy}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="13"
                  className="pointer-events-none select-none"
                  fill={isHover || isSelected ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.65)'}
                  fontWeight={isHover || isSelected ? '700' : '600'}
                >
                  {p.stateInfo.code}
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
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="pointer-events-none absolute z-20 glass-strong px-3 py-2.5 rounded-xl text-xs shadow-xl"
            style={{
              left: mousePos.x + 14,
              top: mousePos.y - 36,
              transform: mousePos.x > (containerRef.current?.clientWidth ?? 600) - 180
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
