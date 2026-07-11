// Synthetic data generators for dashboard charts, alerts, and state risk maps.
// Deterministic-ish (seeded by date) so the dashboard is stable within a session
// but appears to update over time.

import { STATES, type StateInfo } from '../data/states';
import { predictRisk, type PredictionInput, type PredictionResult } from './prediction';

export function stateRisk(s: StateInfo): PredictionResult {
  const input: PredictionInput = {
    state: s.name,
    district: s.capital,
    rainfall: s.avgRainfall * 0.04 + (Math.sin(s.cx + s.cy) * 30),
    temperature: s.avgTemp + Math.cos(s.cx) * 3,
    humidity: s.avgHumidity + Math.sin(s.cy) * 6,
    windSpeed: s.avgWindSpeed + Math.cos(s.cx * 2) * 4,
    riverLevel: s.avgRiverLevel + Math.sin(s.cx) * 1.2,
    populationDensity: (s.population * 1_000_000) / 50_000,
    forestCover: s.forestCover,
    elevation: s.elevation,
    season: currentSeason(),
  };
  return predictRisk(input, s);
}

export function currentSeason(): PredictionInput['season'] {
  const m = new Date().getMonth();
  if (m >= 6 && m <= 8) return 'Monsoon';
  if (m >= 9 && m <= 10) return 'Post-Monsoon';
  if (m >= 3 && m <= 5) return 'Summer';
  return 'Winter';
}

export type RiskBand = 'safe' | 'medium' | 'high' | 'critical';

export function bandFromScore(score: number): RiskBand {
  if (score >= 75) return 'critical';
  if (score >= 55) return 'high';
  if (score >= 35) return 'medium';
  return 'safe';
}

export const BAND_COLORS: Record<RiskBand, string> = {
  safe: '#10b981',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
};

export const BAND_LABELS: Record<RiskBand, string> = {
  safe: 'Safe',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export interface StateRiskView {
  state: StateInfo;
  result: PredictionResult;
  band: RiskBand;
  color: string;
}

export function allStateRisks(): StateRiskView[] {
  return STATES.map((s) => {
    const result = stateRisk(s);
    return {
      state: s,
      result,
      band: bandFromScore(result.riskScore),
      color: BAND_COLORS[bandFromScore(result.riskScore)],
    };
  });
}

// Chart data -------------------------------------------------------------

export function disasterTrendData() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((m, i) => {
    const monsoonBoost = i >= 5 && i <= 8 ? 1.5 : 1;
    return {
      month: m,
      floods: Math.round(20 + Math.sin(i) * 10 + i * 2 * monsoonBoost),
      cyclones: Math.round(8 + Math.cos(i) * 6 + (i >= 4 && i <= 10 ? 5 : 0)),
      earthquakes: Math.round(5 + Math.abs(Math.sin(i * 0.7)) * 4),
      landslides: Math.round(6 + Math.sin(i + 1) * 5 + (i >= 5 && i <= 8 ? 8 : 0)),
      heatwaves: Math.round(i >= 2 && i <= 5 ? 25 - i * 1.5 : 4),
      wildfires: Math.round(i >= 2 && i <= 5 ? 18 - i : 6),
    };
  });
}

export function rainfallTrendData() {
  const days = Array.from({ length: 14 }, (_, i) => i + 1);
  return days.map((d) => ({
    day: `D${d}`,
    rainfall: Math.round(40 + Math.sin(d * 0.6) * 35 + Math.random() * 20),
    riverLevel: +(5 + Math.sin(d * 0.4) * 1.8 + Math.random() * 0.5).toFixed(2),
  }));
}

export function temperatureTrendData() {
  const days = Array.from({ length: 14 }, (_, i) => i + 1);
  return days.map((d) => ({
    day: `D${d}`,
    max: Math.round(32 + Math.sin(d * 0.5) * 6 + Math.random() * 3),
    min: Math.round(22 + Math.cos(d * 0.5) * 3 + Math.random() * 2),
    avg: Math.round(27 + Math.sin(d * 0.5) * 4),
  }));
}

export function disasterDistribution() {
  return [
    { name: 'Flood', value: 32, color: '#06b6d4' },
    { name: 'Cyclone', value: 18, color: '#8b5cf6' },
    { name: 'Earthquake', value: 12, color: '#f59e0b' },
    { name: 'Landslide', value: 14, color: '#ec4899' },
    { name: 'Heatwave', value: 15, color: '#ef4444' },
    { name: 'Wildfire', value: 9, color: '#f97316' },
  ];
}

export function riskComparison() {
  return [
    { disaster: 'Flood', predicted: 82, actual: 78 },
    { disaster: 'Cyclone', predicted: 64, actual: 61 },
    { disaster: 'Earthquake', predicted: 28, actual: 30 },
    { disaster: 'Landslide', predicted: 71, actual: 68 },
    { disaster: 'Heatwave', predicted: 58, actual: 55 },
    { disaster: 'Wildfire', predicted: 44, actual: 47 },
  ];
}

export function predictionAccuracy() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((m, i) => ({
    month: m,
    accuracy: +(88 + Math.sin(i * 0.7) * 6 + Math.random() * 2).toFixed(1),
    target: 90,
  }));
}

export function monthlyAnalysis() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((m, i) => ({
    month: m,
    alerts: Math.round(15 + Math.sin(i) * 10 + (i >= 5 && i <= 8 ? 25 : 0)),
    resolved: Math.round(12 + Math.sin(i) * 8 + (i >= 5 && i <= 8 ? 20 : 0)),
    casualties: Math.round(Math.max(0, Math.sin(i + 1) * 8 + (i >= 5 && i <= 8 ? 6 : 0))),
  }));
}

export function historicalTimeline() {
  const events = [
    { year: '2018', event: 'Kerala Floods', type: 'Flood', severity: 'Critical' },
    { year: '2019', event: 'Cyclone Fani', type: 'Cyclone', severity: 'High' },
    { year: '2020', event: 'Cyclone Amphan', type: 'Cyclone', severity: 'Critical' },
    { year: '2021', event: 'Uttarakhand Flood', type: 'Flood', severity: 'High' },
    { year: '2021', event: 'Cyclone Yaas', type: 'Cyclone', severity: 'High' },
    { year: '2022', event: 'Assam Floods', type: 'Flood', severity: 'Critical' },
    { year: '2023', event: 'Himachal Landslides', type: 'Landslide', severity: 'Critical' },
    { year: '2023', event: 'Cyclone Biparjoy', type: 'Cyclone', severity: 'High' },
    { year: '2024', event: 'Delhi Heatwave', type: 'Heatwave', severity: 'High' },
    { year: '2024', event: 'Wayanad Landslide', type: 'Landslide', severity: 'Critical' },
  ];
  return events;
}

export function liveAlertFeed(): {
  id: string;
  level: RiskBand;
  state: string;
  disaster: string;
  message: string;
  time: string;
}[] {
  const risks = allStateRisks()
    .filter((r) => r.band !== 'safe')
    .sort((a, b) => b.result.riskScore - a.result.riskScore)
    .slice(0, 8);
  return risks.map((r, i) => ({
    id: `${r.state.code}-${i}`,
    level: r.band,
    state: r.state.name,
    disaster: r.result.risks[0].label,
    message: `${r.result.risks[0].label} risk at ${r.result.topProbability}% in ${r.state.name}. ${r.result.recommendations[0]}`,
    time: `${i + 1}m ago`,
  }));
}

export function dashboardStats() {
  const risks = allStateRisks();
  const active = risks.filter((r) => r.band === 'critical' || r.band === 'high').length;
  const highRiskStates = risks.filter((r) => r.band === 'critical').length;
  const popAtRisk = risks
    .filter((r) => r.band !== 'safe')
    .reduce((sum, r) => sum + r.state.population, 0);
  return {
    todaysAlerts: risks.filter((r) => r.band !== 'safe').length,
    activeDisasters: active,
    highRiskStates,
    populationAtRisk: Math.round(popAtRisk * 1_000_000),
    weatherStatus: 'Monsoon Active',
    aiPredictionsToday: 1284 + Math.floor(Math.random() * 200),
  };
}

// World disaster data ----------------------------------------------------

export function worldDisasterTrend() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((m, i) => ({
    month: m,
    floods: Math.round(45 + Math.sin(i) * 15 + i * 3),
    cyclones: Math.round(22 + Math.cos(i) * 10 + (i >= 4 && i <= 10 ? 8 : 0)),
    earthquakes: Math.round(18 + Math.abs(Math.sin(i * 0.6)) * 8),
    wildfires: Math.round(15 + (i >= 2 && i <= 8 ? 20 - i * 1.2 : 5)),
    volcanoes: Math.round(4 + Math.sin(i * 0.8) * 2),
    tsunamis: Math.round(2 + Math.cos(i * 0.5) * 1.5),
  }));
}

export function worldDisasterDistribution() {
  return [
    { name: 'Flood', value: 35, color: '#06b6d4' },
    { name: 'Cyclone', value: 22, color: '#8b5cf6' },
    { name: 'Earthquake', value: 18, color: '#f59e0b' },
    { name: 'Wildfire', value: 12, color: '#f97316' },
    { name: 'Landslide', value: 8, color: '#ec4899' },
    { name: 'Volcano', value: 5, color: '#ef4444' },
  ];
}

export function continentRiskBreakdown() {
  return [
    { continent: 'Asia', floods: 42, cyclones: 28, earthquakes: 25, wildfires: 15, population: 4700 },
    { continent: 'Europe', floods: 15, cyclones: 5, earthquakes: 8, wildfires: 12, population: 750 },
    { continent: 'N. America', floods: 18, cyclones: 22, earthquakes: 15, wildfires: 28, population: 580 },
    { continent: 'S. America', floods: 20, cyclones: 8, earthquakes: 12, wildfires: 10, population: 430 },
    { continent: 'Africa', floods: 25, cyclones: 10, earthquakes: 8, wildfires: 8, population: 1400 },
    { continent: 'Oceania', floods: 8, cyclones: 15, earthquakes: 10, wildfires: 18, population: 45 },
  ];
}

export function worldHistoricalTimeline() {
  return [
    { year: '2023', event: 'Turkey–Syria Earthquake', country: 'Turkey', type: 'Earthquake', severity: 'Critical' },
    { year: '2023', event: 'Cyclone Mocha', country: 'Myanmar', type: 'Cyclone', severity: 'Critical' },
    { year: '2023', event: 'Hawaii Wildfires', country: 'USA', type: 'Wildfire', severity: 'Critical' },
    { year: '2023', event: 'Morocco Earthquake', country: 'Morocco', type: 'Earthquake', severity: 'Critical' },
    { year: '2024', event: 'Japan Earthquake', country: 'Japan', type: 'Earthquake', severity: 'High' },
    { year: '2024', event: 'Brazil Floods', country: 'Brazil', type: 'Flood', severity: 'Critical' },
    { year: '2024', event: 'Philippines Typhoon', country: 'Philippines', type: 'Cyclone', severity: 'High' },
    { year: '2024', event: 'California Wildfires', country: 'USA', type: 'Wildfire', severity: 'High' },
    { year: '2024', event: 'Afghanistan Floods', country: 'Afghanistan', type: 'Flood', severity: 'Critical' },
    { year: '2024', event: 'Spain Floods', country: 'Spain', type: 'Flood', severity: 'Critical' },
  ];
}
