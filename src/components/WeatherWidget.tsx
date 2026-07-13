import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud,
  CloudRain,
  Sun,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Loader2,
  MapPin,
  RefreshCw,
  LocateFixed,
  AlertTriangle,
  Waves,
  Flame,
  Mountain,
  ChevronDown,
  ChevronUp,
  Navigation,
} from 'lucide-react';
import { allStateRisks, BAND_COLORS, BAND_LABELS, type RiskBand } from '../lib/mockData';
import { STATES } from '../data/states';

interface WeatherData {
  city: string;
  region: string;
  lat: number;
  lon: number;
  temp: number;
  feelsLike: number;
  condition: string;
  conditionCode: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  isDay: boolean;
  hourly: { time: number; temp: number; rain: number; code: number }[];
}

interface NearbyDisaster {
  stateName: string;
  distKm: number;
  band: RiskBand;
  topDisaster: string;
  probability: number;
}

type LocationMode = 'gps' | 'city';

const CITIES = [
  { name: 'New Delhi', region: 'Delhi', lat: 28.6139, lon: 77.209 },
  { name: 'Mumbai', region: 'Maharashtra', lat: 19.076, lon: 72.8777 },
  { name: 'Chennai', region: 'Tamil Nadu', lat: 13.0827, lon: 80.2707 },
  { name: 'Kolkata', region: 'West Bengal', lat: 22.5726, lon: 88.3639 },
  { name: 'Bengaluru', region: 'Karnataka', lat: 12.9716, lon: 77.5946 },
  { name: 'Hyderabad', region: 'Telangana', lat: 17.385, lon: 78.4867 },
  { name: 'Bhopal', region: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126 },
  { name: 'Jaipur', region: 'Rajasthan', lat: 26.9124, lon: 75.7873 },
  { name: 'Ahmedabad', region: 'Gujarat', lat: 23.0225, lon: 72.5714 },
  { name: 'Lucknow', region: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462 },
  { name: 'Patna', region: 'Bihar', lat: 25.5941, lon: 85.1376 },
  { name: 'Bhubaneswar', region: 'Odisha', lat: 20.2961, lon: 85.8245 },
];

// Haversine distance in km
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function wmoLabel(code: number): string {
  if (code === 0) return 'Clear Sky';
  if (code <= 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code <= 49) return 'Foggy';
  if (code <= 57) return 'Drizzle';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Rain Showers';
  if (code <= 86) return 'Snow Showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

function WeatherIcon({ code, isDay, className }: { code: number; isDay: boolean; className?: string }) {
  if (code === 0 && isDay) return <Sun className={className} />;
  if (code === 0) return <Sun className={className} />;
  if (code <= 3) return <Cloud className={className} />;
  if (code <= 67 || (code >= 80 && code <= 82)) return <CloudRain className={className} />;
  if (code <= 77 || (code >= 85 && code <= 86)) return <CloudSnow className={className} />;
  if (code >= 95) return <CloudLightning className={className} />;
  return <Cloud className={className} />;
}

function weatherGradient(code: number, isDay: boolean): string {
  if (code === 0 && isDay) return 'from-sky-500/20 to-amber-400/10';
  if (code === 0) return 'from-slate-700/20 to-blue-900/10';
  if (code <= 2) return 'from-sky-500/15 to-slate-500/10';
  if (code <= 49) return 'from-slate-500/20 to-slate-600/10';
  if (code <= 82) return 'from-blue-500/20 to-cyan-500/10';
  if (code >= 95) return 'from-slate-600/20 to-yellow-500/10';
  return 'from-slate-500/10 to-slate-600/10';
}

const DISASTER_ICONS: Record<string, typeof Waves> = {
  flood: Waves, cyclone: Wind, earthquake: Mountain,
  landslide: Mountain, heatwave: Flame, wildfire: Flame,
};

// Reverse-geocode lat/lon to a city name via Open-Meteo geocoding
async function reverseGeocode(lat: number, lon: number): Promise<{ city: string; region: string }> {
  try {
    // Use nominatim for reverse geocoding (free, no key)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (!res.ok) throw new Error();
    const data = await res.json();
    const city =
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.county ||
      'My Location';
    const region =
      data.address?.state || data.address?.region || '';
    return { city, region };
  } catch {
    return { city: 'My Location', region: '' };
  }
}

async function fetchWeatherData(lat: number, lon: number, city: string, region: string): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,` +
    `weather_code,is_day,surface_pressure,visibility` +
    `&hourly=temperature_2m,precipitation_probability,weather_code&timezone=auto&forecast_days=1`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('weather fetch failed');
  const json = await res.json();

  const c = json.current;
  const currentHour = new Date().getHours();
  const hourlyTimes: string[] = json.hourly.time;
  const hourlyTemps: number[] = json.hourly.temperature_2m;
  const hourlyRain: number[] = json.hourly.precipitation_probability;
  const hourlyCodes: number[] = json.hourly.weather_code;

  const hourlySlice = hourlyTimes
    .map((t, i) => ({
      time: new Date(t).getHours(),
      temp: Math.round(hourlyTemps[i]),
      rain: hourlyRain[i],
      code: hourlyCodes[i],
    }))
    .filter((h) => h.time >= currentHour)
    .slice(0, 8);

  return {
    city, region, lat, lon,
    temp: Math.round(c.temperature_2m),
    feelsLike: Math.round(c.apparent_temperature),
    condition: wmoLabel(c.weather_code),
    conditionCode: c.weather_code,
    humidity: c.relative_humidity_2m,
    windSpeed: Math.round(c.wind_speed_10m),
    visibility: Math.round((c.visibility ?? 10000) / 1000),
    pressure: Math.round(c.surface_pressure),
    isDay: c.is_day === 1,
    hourly: hourlySlice,
  };
}

function getNearbyDisasters(lat: number, lon: number): NearbyDisaster[] {
  const risks = allStateRisks();
  return STATES
    .map((s) => {
      const dist = haversine(lat, lon, s.cy * 0.1 + 20, s.cx * 0.1 + 72);
      const risk = risks.find((r) => r.state.code === s.code);
      if (!risk) return null;
      return {
        stateName: s.name,
        distKm: Math.round(dist),
        band: risk.band,
        topDisaster: risk.result.risks[0]?.label ?? 'Unknown',
        probability: Math.round(risk.result.risks[0]?.probability ?? 0),
      };
    })
    .filter((x): x is NearbyDisaster => x !== null && x.band !== 'safe')
    .sort((a, b) => a.distKm - b.distKm)
    .slice(0, 5);
}

export function WeatherWidget() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cityIdx, setCityIdx] = useState(0);
  const [mode, setMode] = useState<LocationMode>('city');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [nearbyDisasters, setNearbyDisasters] = useState<NearbyDisaster[]>([]);
  const [showDisasters, setShowDisasters] = useState(true);

  const fetchByCoords = useCallback(async (lat: number, lon: number, city: string, region: string) => {
    setLoading(true);
    setError(null);
    try {
      const weather = await fetchWeatherData(lat, lon, city, region);
      setData(weather);
      setNearbyDisasters(getNearbyDisasters(lat, lon));
    } catch {
      setError('Unable to load weather data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByCity = useCallback(async (idx: number) => {
    const city = CITIES[idx];
    await fetchByCoords(city.lat, city.lon, city.name, city.region);
  }, [fetchByCoords]);

  const requestGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setMode('gps');
        const { city, region } = await reverseGeocode(latitude, longitude);
        await fetchByCoords(latitude, longitude, city, region);
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        setGpsError(
          err.code === 1
            ? 'Location permission denied. Please allow access in your browser settings.'
            : 'Unable to determine your location. Try selecting a city.'
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [fetchByCoords]);

  useEffect(() => {
    // Try GPS on mount, fall back to first city
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setMode('gps');
          const { city, region } = await reverseGeocode(latitude, longitude);
          await fetchByCoords(latitude, longitude, city, region);
        },
        () => {
          // No permission — use default city silently
          fetchByCity(0);
        },
        { timeout: 5000 }
      );
    } else {
      fetchByCity(0);
    }
  }, [fetchByCoords, fetchByCity]);

  function handleCityChange(idx: number) {
    setCityIdx(idx);
    setMode('city');
    setGpsError(null);
    fetchByCity(idx);
  }

  function handleRefresh() {
    if (mode === 'gps' && data) {
      fetchByCoords(data.lat, data.lon, data.city, data.region);
    } else {
      fetchByCity(cityIdx);
    }
  }

  return (
    <div className="glass rounded-2xl overflow-hidden flex flex-col">
      {/* Header gradient */}
      <div className={`relative p-5 bg-gradient-to-br ${data ? weatherGradient(data.conditionCode, data.isDay) : 'from-slate-500/10 to-slate-600/10'}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Location row */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <MapPin className="w-3 h-3 shrink-0" />
                {mode === 'gps' && data ? (
                  <span className="font-medium text-accent-300 truncate max-w-[140px]">
                    {data.city}{data.region ? `, ${data.region}` : ''}
                  </span>
                ) : (
                  <select
                    value={cityIdx}
                    onChange={(e) => handleCityChange(Number(e.target.value))}
                    className="bg-transparent text-slate-300 focus:outline-none cursor-pointer text-xs max-w-[140px]"
                  >
                    {CITIES.map((c, i) => (
                      <option key={c.name} value={i} className="bg-slate-900">{c.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* GPS button */}
              <button
                onClick={requestGPS}
                disabled={gpsLoading}
                title="Use my GPS location"
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium border transition-all ${
                  mode === 'gps'
                    ? 'bg-accent-500/20 text-accent-300 border-accent-500/40'
                    : 'bg-white/10 text-slate-400 border-white/10 hover:bg-white/20 hover:text-white'
                }`}
              >
                {gpsLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <LocateFixed className="w-3 h-3" />
                )}
                {mode === 'gps' ? 'GPS Active' : 'Use GPS'}
              </button>
            </div>

            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Today's Weather</p>

            {loading ? (
              <div className="flex items-center gap-2 mt-3">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                <span className="text-slate-400 text-sm">
                  {gpsLoading ? 'Getting your location…' : 'Fetching weather…'}
                </span>
              </div>
            ) : error ? (
              <p className="text-slate-400 text-sm mt-2">{error}</p>
            ) : data ? (
              <>
                <div className="flex items-end gap-2">
                  <span className="text-6xl font-display font-bold text-white tabular-nums leading-none">
                    {data.temp}°
                  </span>
                  <span className="text-slate-400 text-sm mb-2">C</span>
                </div>
                <p className="text-slate-300 text-sm mt-1">{data.condition}</p>
                <p className="text-slate-500 text-xs mt-0.5">Feels like {data.feelsLike}°C</p>
              </>
            ) : null}

            {gpsError && (
              <p className="text-amber-400 text-xs mt-2 flex items-start gap-1">
                <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                {gpsError}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            {!loading && data && (
              <WeatherIcon code={data.conditionCode} isDay={data.isDay} className="w-14 h-14 text-white/70" />
            )}
            <button
              onClick={handleRefresh}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              title="Refresh weather"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-white ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats row */}
        {!loading && data && (
          <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/10">
            {[
              { icon: Droplets, label: 'Humidity', value: `${data.humidity}%` },
              { icon: Wind, label: 'Wind', value: `${data.windSpeed} km/h` },
              { icon: Eye, label: 'Visibility', value: `${data.visibility} km` },
              { icon: Gauge, label: 'Pressure', value: `${data.pressure} hPa` },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <s.icon className="w-4 h-4 text-white/50 mx-auto mb-1" />
                <p className="text-white text-xs font-semibold">{s.value}</p>
                <p className="text-white/40 text-[10px]">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hourly forecast */}
      {!loading && data && data.hourly.length > 0 && (
        <div className="px-4 py-3 border-t border-border-subtle">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">Hourly Forecast</p>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {data.hourly.map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 px-2.5 py-2 rounded-xl bg-white/5 min-w-[52px]"
              >
                <span className="text-[10px] text-slate-400">{h.time}:00</span>
                <WeatherIcon code={h.code} isDay={h.time >= 6 && h.time < 18} className="w-4 h-4 text-slate-300" />
                <span className="text-xs font-semibold text-white">{h.temp}°</span>
                {h.rain > 0 && (
                  <span className="text-[9px] text-blue-300">{h.rain}%</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Nearby disasters panel */}
      {!loading && nearbyDisasters.length > 0 && (
        <div className="border-t border-border-subtle">
          <button
            onClick={() => setShowDisasters((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Navigation className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-medium text-slate-300">
                Nearby Disaster Alerts
              </span>
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-[10px] text-amber-300 font-semibold">
                {nearbyDisasters.filter((d) => d.band === 'critical' || d.band === 'high').length} active
              </span>
            </div>
            {showDisasters
              ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
              : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          <AnimatePresence>
            {showDisasters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-2">
                  {nearbyDisasters.map((d, i) => {
                    const Icon = DISASTER_ICONS[d.topDisaster.toLowerCase()] ?? AlertTriangle;
                    const color = BAND_COLORS[d.band];
                    return (
                      <motion.div
                        key={d.stateName}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-border-subtle"
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${color}18`, border: `1px solid ${color}33` }}
                        >
                          <Icon className="w-3.5 h-3.5" style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{d.stateName}</p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {d.topDisaster} · {d.probability}% risk
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-lg"
                            style={{ backgroundColor: `${color}18`, color }}
                          >
                            {BAND_LABELS[d.band]}
                          </span>
                          <p className="text-[10px] text-slate-600 mt-0.5">{d.distKm} km</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
