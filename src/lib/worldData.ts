import { predictRisk, type PredictionInput, type PredictionResult } from './prediction';
import { COUNTRIES, type CountryInfo } from '../data/countries';
import { bandFromScore, BAND_COLORS, BAND_LABELS, type RiskBand } from './mockData';

export interface CountryRiskView {
  country: CountryInfo;
  result: PredictionResult;
  band: RiskBand;
  color: string;
}

export function countryRisk(c: CountryInfo): PredictionResult {
  const input: PredictionInput = {
    state: c.name,
    district: c.capital || c.name,
    rainfall: c.avgRainfall * 0.04 + (Math.sin(c.cx + c.cy) * 30),
    temperature: c.avgTemp + Math.cos(c.cx) * 3,
    humidity: c.avgHumidity + Math.sin(c.cy) * 6,
    windSpeed: c.avgWindSpeed + Math.cos(c.cx * 2) * 4,
    riverLevel: 5 + Math.sin(c.cx) * 1.2,
    populationDensity: (c.population * 1_000_000) / 50_000,
    forestCover: c.forestCover,
    elevation: c.elevation,
    season: currentSeason(),
  };
  return predictRisk(input);
}

export function currentSeason(): PredictionInput['season'] {
  const m = new Date().getMonth();
  if (m >= 6 && m <= 8) return 'Monsoon';
  if (m >= 9 && m <= 10) return 'Post-Monsoon';
  if (m >= 3 && m <= 5) return 'Summer';
  return 'Winter';
}

export function allCountryRisks(): CountryRiskView[] {
  return COUNTRIES.map((c) => {
    const result = countryRisk(c);
    return {
      country: c,
      result,
      band: bandFromScore(result.riskScore),
      color: BAND_COLORS[bandFromScore(result.riskScore)],
    };
  });
}

export { BAND_COLORS, BAND_LABELS, type RiskBand };
