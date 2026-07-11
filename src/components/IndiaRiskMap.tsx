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
  const rafRef = useRef<number>(0);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    fetch('/geo/india-states-simple.geojson')
      .then((r) => r.json())
      .then(setGeoData)
      .catch(() => {});
  }, []);

  // Radar sweep animation
  useEffect(() => {
    let start = performance.now();
    const animate = (now: number) => {
      const elapsed = (now - start) / 1000;
      setSweepAngle((elapsed * 30) % 360);
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

  // Compute projection and paths
  const { paths, centroids } = useMemo(() => {
    if (!geoData) return { paths: [], centroids: {} as Record<string, [number, number]> };

    // India bounds: approximately lon 68-97, lat 6-37
    const projection = geoMercator()
      .scale(800)
      .center([82, 22])
      .translate([500, 500]);

    const pathGen = geoPath(projection);
    const features = geoData.features as GeoFeature[];
    const centroids: Record<string, [number, number]> = {};

    const paths = features.map((f) => {
      const rawName = f.properties.NAME_1;
      const stateName = GEOJSON_NAME_MAP[rawName] ?? rawName;
      const stateInfo = STATE_BY_NAME[stateName];
      const d = pathGen(f) ?? '';
      const centroid = pathGen.centroid(f);
      if (stateInfo) {
        centroids[stateName] = [centroid[0], centroid[1]];
      }
      return { d, stateName, stateInfo, rawName };
    });

    return { paths, centroids };
  }, [geoData]);

  const viewBox = '0 0 1000 1000';

  return (
    <div className="relative w-full">
      <svg ref={svgRef} viewBox={viewBox} className="w-full h-full" style={{ minHeight: 500 }}>
        <defs>
          <linearGradient id="radarSweepIndia" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
            <stop offset="80%" stopColor="#06b6d4" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.18" />
          </linearGradient>
          <filter id="stateGlowIndia" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
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

        {/* Radar sweep */}
        <g transform="translate(500, 500)">
          <circle cx="0" cy="0" r="450" fill="none" stroke="rgba(6,182,212,0.06)" strokeWidth="1" />
          <circle cx="0" cy="0" r="300" fill="none" stroke="rgba(6,182,212,0.05)" strokeWidth="1" />
          <circle cx="0" cy="0" r="150" fill="none" stroke="rgba(6,182,212,0.04)" strokeWidth="1" />
          <motion.g
            animate={{ rotate: sweepAngle }}
            transition={{ duration: 0.1, ease: 'linear' }}
            style={{ transformOrigin: '0px 0px' }}
          >
            <path d="M0 0 L450 0 A450 450 0 0 1 225 390 Z" fill="url(#radarSweepIndia)" />
          </motion.g>
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
                fillOpacity={isSelected ? 0.85 : isHover ? 0.7 : 0.5}
                stroke={isSelected ? '#fff' : isHover ? 'rgba(255,255,255,0.6)' : 'rgba(7,11,20,0.6)'}
                strokeWidth={isSelected ? 2 : isHover ? 1.5 : 0.8}
                strokeLinejoin="round"
                filter={isSelected ? 'url(#stateGlowIndia)' : undefined}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHover(p.stateName)}
                onMouseLeave={() => setHover(null)}
                onClick={() => {
                  setSelected(p.stateName);
                  const v = viewFor(p.stateName);
                  if (v) onSelect?.(v);
                }}
              />
              {/* Pulsing dot for critical states */}
              {band === 'critical' && !isSelected && (
                <motion.circle
                  cx={cx}
                  cy={cy}
                  r="5"
                  fill="#ef4444"
                  animate={{ opacity: [1, 0.3, 1], scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="pointer-events-none"
                />
              )}
              {/* State code label */}
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                className="pointer-events-none select-none"
                fill={isHover || isSelected ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)'}
                fontWeight={isHover || isSelected ? '700' : '600'}
              >
                {p.stateInfo.code}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hover && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-2 right-2 glass-strong px-3 py-2 rounded-xl text-xs pointer-events-none z-10"
          >
            <p className="font-semibold text-white">{hover}</p>
            <p className="text-slate-400 mt-0.5">
              Risk:{' '}
              <span style={{ color: colorFor(hover) }}>{BAND_LABELS[bandFor(hover)]}</span>{' '}
              ({viewFor(hover)?.result.riskScore.toFixed(0)}%)
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-4 justify-center">
        {(['safe', 'medium', 'high', 'critical'] as RiskBand[]).map((b) => (
          <div key={b} className="flex items-center gap-2">
            <span className="risk-dot" style={{ backgroundColor: BAND_COLORS[b] }} />
            <span className="text-xs text-slate-400">{BAND_LABELS[b]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
