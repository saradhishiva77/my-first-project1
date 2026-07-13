import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';

interface WeatherData {
  city: string;
  temp: number;
  feelsLike: number;
  condition: string;
  conditionCode: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  uvIndex: number;
  isDay: boolean;
  hourly: { time: number; temp: number; rain: number; code: number }[];
}

// WMO weather code → label
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
  if (code === 0) return isDay ? <Sun className={className} /> : <Sun className={className} />;
  if (code <= 2) return <Cloud className={className} />;
  if (code === 3) return <Cloud className={className} />;
  if (code <= 67 || (code >= 80 && code <= 82)) return <CloudRain className={className} />;
  if (code <= 77 || (code >= 85 && code <= 86)) return <CloudSnow className={className} />;
  if (code >= 95) return <CloudLightning className={className} />;
  return <Cloud className={className} />;
}

function weatherGradient(code: number, isDay: boolean): string {
  if (code === 0 && isDay) return 'from-sky-500/20 to-amber-400/10';
  if (code === 0 && !isDay) return 'from-slate-700/20 to-blue-900/10';
  if (code <= 2) return 'from-sky-500/15 to-slate-500/10';
  if (code <= 49) return 'from-slate-500/20 to-slate-600/10';
  if (code <= 82) return 'from-blue-500/20 to-cyan-500/10';
  if (code >= 95) return 'from-slate-600/20 to-yellow-500/10';
  return 'from-slate-500/10 to-slate-600/10';
}

const CITIES = [
  { name: 'New Delhi', lat: 28.6139, lon: 77.209 },
  { name: 'Mumbai', lat: 19.076, lon: 72.8777 },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
  { name: 'Hyderabad', lat: 17.385, lon: 78.4867 },
  { name: 'Bhopal', lat: 23.2599, lon: 77.4126 },
];

export function WeatherWidget() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [cityIdx, setCityIdx] = useState(0);

  async function fetchWeather(idx: number) {
    setLoading(true);
    setError(false);
    const city = CITIES[idx];
    try {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}` +
        `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,` +
        `weather_code,is_day,surface_pressure,visibility` +
        `&hourly=temperature_2m,precipitation_probability,weather_code&timezone=auto&forecast_days=1`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('fetch failed');
      const json = await res.json();

      const c = json.current;
      const now = new Date();
      const hourlyTimes: string[] = json.hourly.time;
      const hourlyTemps: number[] = json.hourly.temperature_2m;
      const hourlyRain: number[] = json.hourly.precipitation_probability;
      const hourlyCodes: number[] = json.hourly.weather_code;

      // Next 8 hours from current
      const currentHour = now.getHours();
      const hourlySlice = hourlyTimes
        .map((t, i) => ({
          time: new Date(t).getHours(),
          temp: Math.round(hourlyTemps[i]),
          rain: hourlyRain[i],
          code: hourlyCodes[i],
        }))
        .filter((h) => h.time >= currentHour)
        .slice(0, 8);

      setData({
        city: city.name,
        temp: Math.round(c.temperature_2m),
        feelsLike: Math.round(c.apparent_temperature),
        condition: wmoLabel(c.weather_code),
        conditionCode: c.weather_code,
        humidity: c.relative_humidity_2m,
        windSpeed: Math.round(c.wind_speed_10m),
        visibility: Math.round((c.visibility ?? 10000) / 1000),
        pressure: Math.round(c.surface_pressure),
        uvIndex: 0,
        isDay: c.is_day === 1,
        hourly: hourlySlice,
      });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchWeather(cityIdx); }, [cityIdx]);

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Header gradient */}
      <div className={`relative p-5 bg-gradient-to-br ${data ? weatherGradient(data.conditionCode, data.isDay) : 'from-slate-500/10 to-slate-600/10'}`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <MapPin className="w-3 h-3" />
              <select
                value={cityIdx}
                onChange={(e) => setCityIdx(Number(e.target.value))}
                className="bg-transparent text-slate-400 focus:outline-none cursor-pointer text-xs"
              >
                {CITIES.map((c, i) => <option key={c.name} value={i} className="bg-slate-900">{c.name}</option>)}
              </select>
            </div>
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Today's Weather</p>
            {loading ? (
              <div className="flex items-center gap-2 mt-3">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                <span className="text-slate-400 text-sm">Fetching live data…</span>
              </div>
            ) : error ? (
              <p className="text-slate-400 text-sm mt-2">Unable to load weather</p>
            ) : data ? (
              <>
                <div className="flex items-end gap-2">
                  <span className="text-6xl font-display font-bold text-white tabular-nums">{data.temp}°</span>
                  <span className="text-slate-400 text-sm mb-3">C</span>
                </div>
                <p className="text-slate-300 text-sm">{data.condition}</p>
                <p className="text-slate-500 text-xs mt-0.5">Feels like {data.feelsLike}°C</p>
              </>
            ) : null}
          </div>
          <div className="flex flex-col items-end gap-2">
            {!loading && data && (
              <WeatherIcon code={data.conditionCode} isDay={data.isDay} className="w-16 h-16 text-white/70" />
            )}
            <button
              onClick={() => fetchWeather(cityIdx)}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-white ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats row */}
        {!loading && data && (
          <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/10">
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
    </div>
  );
}
