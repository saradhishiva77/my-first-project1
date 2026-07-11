// World countries with simplified geographic SVG polygon paths.
// Coordinates are in a 0-100 viewBox (equirectangular projection).
// Polygons are hand-simplified for choropleth use.

export interface CountryInfo {
  name: string;
  code: string; // ISO 2-letter
  capital: string;
  continent: string;
  population: number; // millions
  avgRainfall: number; // mm
  avgTemp: number; // C
  avgHumidity: number; // %
  avgWindSpeed: number; // km/h
  forestCover: number; // %
  elevation: number; // m
  coastline: boolean;
  seismic: 'low' | 'moderate' | 'high';
  path: string;
  cx: number;
  cy: number;
}

export const COUNTRIES: CountryInfo[] = [
  // North America
  {
    name: 'United States', code: 'US', capital: 'Washington D.C.', continent: 'North America', population: 331,
    avgRainfall: 800, avgTemp: 18, avgHumidity: 55, avgWindSpeed: 16, forestCover: 33, elevation: 500,
    coastline: true, seismic: 'high',
    path: 'M12 28 L28 26 L30 34 L26 40 L22 46 L14 44 L10 36 Z',
    cx: 20, cy: 36,
  },
  {
    name: 'Canada', code: 'CA', capital: 'Ottawa', continent: 'North America', population: 38,
    avgRainfall: 600, avgTemp: 5, avgHumidity: 55, avgWindSpeed: 18, forestCover: 38, elevation: 600,
    coastline: true, seismic: 'high',
    path: 'M8 16 L28 14 L30 26 L14 28 L8 24 Z',
    cx: 18, cy: 21,
  },
  {
    name: 'Mexico', code: 'MX', capital: 'Mexico City', continent: 'North America', population: 128,
    avgRainfall: 750, avgTemp: 22, avgHumidity: 55, avgWindSpeed: 14, forestCover: 33, elevation: 1100,
    coastline: true, seismic: 'high',
    path: 'M14 44 L26 42 L28 50 L22 54 L16 52 Z',
    cx: 21, cy: 48,
  },
  {
    name: 'Brazil', code: 'BR', capital: 'Brasilia', continent: 'South America', population: 214,
    avgRainfall: 1800, avgTemp: 25, avgHumidity: 75, avgWindSpeed: 12, forestCover: 59, elevation: 300,
    coastline: true, seismic: 'low',
    path: 'M30 58 L40 56 L42 66 L38 74 L32 72 L28 64 Z',
    cx: 35, cy: 65,
  },
  {
    name: 'Argentina', code: 'AR', capital: 'Buenos Aires', continent: 'South America', population: 45,
    avgRainfall: 600, avgTemp: 18, avgHumidity: 60, avgWindSpeed: 18, forestCover: 11, elevation: 400,
    coastline: true, seismic: 'moderate',
    path: 'M30 72 L36 70 L38 82 L34 88 L30 86 L28 78 Z',
    cx: 33, cy: 79,
  },
  {
    name: 'Chile', code: 'CL', capital: 'Santiago', continent: 'South America', population: 19,
    avgRainfall: 500, avgTemp: 14, avgHumidity: 60, avgWindSpeed: 16, forestCover: 24, elevation: 800,
    coastline: true, seismic: 'high',
    path: 'M26 70 L28 68 L30 86 L26 88 Z',
    cx: 27, cy: 78,
  },
  {
    name: 'Colombia', code: 'CO', capital: 'Bogota', continent: 'South America', population: 51,
    avgRainfall: 2500, avgTemp: 25, avgHumidity: 80, avgWindSpeed: 12, forestCover: 52, elevation: 500,
    coastline: true, seismic: 'high',
    path: 'M26 56 L30 54 L32 60 L28 62 L26 60 Z',
    cx: 28, cy: 58,
  },
  {
    name: 'Peru', code: 'PE', capital: 'Lima', continent: 'South America', population: 33,
    avgRainfall: 800, avgTemp: 20, avgHumidity: 60, avgWindSpeed: 14, forestCover: 56, elevation: 1500,
    coastline: true, seismic: 'high',
    path: 'M26 60 L30 58 L32 68 L28 70 L24 66 Z',
    cx: 28, cy: 64,
  },
  {
    name: 'Venezuela', code: 'VE', capital: 'Caracas', continent: 'South America', population: 28,
    avgRainfall: 1400, avgTemp: 26, avgHumidity: 75, avgWindSpeed: 12, forestCover: 56, elevation: 400,
    coastline: true, seismic: 'low',
    path: 'M30 54 L34 52 L36 58 L32 58 Z',
    cx: 33, cy: 56,
  },
  // Europe
  {
    name: 'United Kingdom', code: 'GB', capital: 'London', continent: 'Europe', population: 67,
    avgRainfall: 1200, avgTemp: 10, avgHumidity: 75, avgWindSpeed: 20, forestCover: 13, elevation: 100,
    coastline: true, seismic: 'low',
    path: 'M46 24 L50 22 L52 28 L48 30 L46 28 Z',
    cx: 49, cy: 26,
  },
  {
    name: 'France', code: 'FR', capital: 'Paris', continent: 'Europe', population: 67,
    avgRainfall: 800, avgTemp: 12, avgHumidity: 70, avgWindSpeed: 16, forestCover: 31, elevation: 300,
    coastline: true, seismic: 'low',
    path: 'M48 28 L54 28 L56 34 L50 36 L46 32 Z',
    cx: 51, cy: 32,
  },
  {
    name: 'Germany', code: 'DE', capital: 'Berlin', continent: 'Europe', population: 83,
    avgRainfall: 800, avgTemp: 10, avgHumidity: 70, avgWindSpeed: 16, forestCover: 32, elevation: 250,
    coastline: false, seismic: 'low',
    path: 'M52 26 L56 26 L58 32 L54 34 L50 30 Z',
    cx: 54, cy: 30,
  },
  {
    name: 'Spain', code: 'ES', capital: 'Madrid', continent: 'Europe', population: 47,
    avgRainfall: 600, avgTemp: 16, avgHumidity: 60, avgWindSpeed: 14, forestCover: 37, elevation: 600,
    coastline: true, seismic: 'moderate',
    path: 'M42 34 L48 34 L48 40 L44 42 L40 38 Z',
    cx: 44, cy: 38,
  },
  {
    name: 'Italy', code: 'IT', capital: 'Rome', continent: 'Europe', population: 60,
    avgRainfall: 800, avgTemp: 15, avgHumidity: 65, avgWindSpeed: 14, forestCover: 32, elevation: 500,
    coastline: true, seismic: 'high',
    path: 'M52 32 L56 32 L58 40 L54 42 L50 38 Z',
    cx: 54, cy: 37,
  },
  {
    name: 'Russia', code: 'RU', capital: 'Moscow', continent: 'Europe/Asia', population: 144,
    avgRainfall: 500, avgTemp: 2, avgHumidity: 60, avgWindSpeed: 18, forestCover: 50, elevation: 300,
    coastline: true, seismic: 'high',
    path: 'M56 16 L88 14 L90 24 L72 28 L58 26 L54 20 Z',
    cx: 72, cy: 21,
  },
  {
    name: 'Ukraine', code: 'UA', capital: 'Kyiv', continent: 'Europe', population: 44,
    avgRainfall: 600, avgTemp: 9, avgHumidity: 65, avgWindSpeed: 16, forestCover: 17, elevation: 200,
    coastline: false, seismic: 'low',
    path: 'M56 24 L64 22 L66 28 L60 30 L56 28 Z',
    cx: 61, cy: 26,
  },
  {
    name: 'Turkey', code: 'TR', capital: 'Ankara', continent: 'Asia', population: 85,
    avgRainfall: 600, avgTemp: 16, avgHumidity: 60, avgWindSpeed: 14, forestCover: 29, elevation: 1100,
    coastline: true, seismic: 'high',
    path: 'M56 34 L64 32 L66 38 L60 40 L56 38 Z',
    cx: 61, cy: 36,
  },
  // Asia
  {
    name: 'China', code: 'CN', capital: 'Beijing', continent: 'Asia', population: 1412,
    avgRainfall: 700, avgTemp: 12, avgHumidity: 60, avgWindSpeed: 14, forestCover: 23, elevation: 800,
    coastline: true, seismic: 'high',
    path: 'M68 28 L84 26 L86 36 L80 40 L72 38 L66 32 Z',
    cx: 76, cy: 33,
  },
  {
    name: 'India', code: 'IN', capital: 'New Delhi', continent: 'Asia', population: 1408,
    avgRainfall: 1200, avgTemp: 25, avgHumidity: 65, avgWindSpeed: 14, forestCover: 24, elevation: 300,
    coastline: true, seismic: 'moderate',
    path: 'M64 36 L72 34 L74 44 L70 50 L66 48 L62 40 Z',
    cx: 68, cy: 42,
  },
  {
    name: 'Japan', code: 'JP', capital: 'Tokyo', continent: 'Asia', population: 125,
    avgRainfall: 1700, avgTemp: 15, avgHumidity: 70, avgWindSpeed: 20, forestCover: 68, elevation: 400,
    coastline: true, seismic: 'high',
    path: 'M86 30 L90 28 L92 34 L88 36 L86 32 Z',
    cx: 89, cy: 33,
  },
  {
    name: 'Indonesia', code: 'ID', capital: 'Jakarta', continent: 'Asia', population: 274,
    avgRainfall: 2700, avgTemp: 28, avgHumidity: 80, avgWindSpeed: 12, forestCover: 49, elevation: 200,
    coastline: true, seismic: 'high',
    path: 'M78 52 L88 50 L90 56 L82 58 L78 56 Z',
    cx: 84, cy: 54,
  },
  {
    name: 'Pakistan', code: 'PK', capital: 'Islamabad', continent: 'Asia', population: 225,
    avgRainfall: 500, avgTemp: 22, avgHumidity: 50, avgWindSpeed: 14, forestCover: 5, elevation: 600,
    coastline: true, seismic: 'high',
    path: 'M60 34 L66 32 L68 40 L62 42 L58 38 Z',
    cx: 63, cy: 37,
  },
  {
    name: 'Bangladesh', code: 'BD', capital: 'Dhaka', continent: 'Asia', population: 166,
    avgRainfall: 2600, avgTemp: 26, avgHumidity: 80, avgWindSpeed: 14, forestCover: 11, elevation: 100,
    coastline: true, seismic: 'moderate',
    path: 'M70 40 L74 40 L74 44 L70 44 Z',
    cx: 72, cy: 42,
  },
  {
    name: 'Thailand', code: 'TH', capital: 'Bangkok', continent: 'Asia', population: 70,
    avgRainfall: 1600, avgTemp: 27, avgHumidity: 75, avgWindSpeed: 12, forestCover: 32, elevation: 300,
    coastline: true, seismic: 'moderate',
    path: 'M74 44 L78 42 L78 52 L74 52 Z',
    cx: 76, cy: 48,
  },
  {
    name: 'Vietnam', code: 'VN', capital: 'Hanoi', continent: 'Asia', population: 97,
    avgRainfall: 1800, avgTemp: 25, avgHumidity: 78, avgWindSpeed: 14, forestCover: 48, elevation: 400,
    coastline: true, seismic: 'moderate',
    path: 'M78 44 L82 42 L82 52 L78 52 Z',
    cx: 80, cy: 47,
  },
  {
    name: 'Philippines', code: 'PH', capital: 'Manila', continent: 'Asia', population: 110,
    avgRainfall: 2300, avgTemp: 27, avgHumidity: 80, avgWindSpeed: 18, forestCover: 25, elevation: 200,
    coastline: true, seismic: 'high',
    path: 'M84 44 L88 44 L88 52 L84 52 Z',
    cx: 86, cy: 48,
  },
  {
    name: 'Saudi Arabia', code: 'SA', capital: 'Riyadh', continent: 'Asia', population: 35,
    avgRainfall: 200, avgTemp: 26, avgHumidity: 40, avgWindSpeed: 16, forestCover: 1, elevation: 700,
    coastline: true, seismic: 'moderate',
    path: 'M56 40 L64 38 L66 46 L60 48 L56 44 Z',
    cx: 61, cy: 43,
  },
  {
    name: 'Iran', code: 'IR', capital: 'Tehran', continent: 'Asia', population: 85,
    avgRainfall: 300, avgTemp: 22, avgHumidity: 45, avgWindSpeed: 16, forestCover: 7, elevation: 1200,
    coastline: true, seismic: 'high',
    path: 'M58 34 L66 32 L68 40 L62 42 L58 38 Z',
    cx: 63, cy: 37,
  },
  {
    name: 'South Korea', code: 'KR', capital: 'Seoul', continent: 'Asia', population: 52,
    avgRainfall: 1300, avgTemp: 13, avgHumidity: 70, avgWindSpeed: 14, forestCover: 64, elevation: 300,
    coastline: true, seismic: 'low',
    path: 'M84 32 L88 30 L88 36 L84 36 Z',
    cx: 86, cy: 33,
  },
  {
    name: 'Kazakhstan', code: 'KZ', capital: 'Astana', continent: 'Asia', population: 19,
    avgRainfall: 300, avgTemp: 8, avgHumidity: 50, avgWindSpeed: 18, forestCover: 1, elevation: 500,
    coastline: false, seismic: 'high',
    path: 'M58 24 L72 22 L74 30 L64 32 L58 28 Z',
    cx: 66, cy: 27,
  },
  // Africa
  {
    name: 'Nigeria', code: 'NG', capital: 'Abuja', continent: 'Africa', population: 213,
    avgRainfall: 1200, avgTemp: 27, avgHumidity: 70, avgWindSpeed: 12, forestCover: 28, elevation: 300,
    coastline: true, seismic: 'low',
    path: 'M46 50 L52 48 L54 54 L50 56 L46 54 Z',
    cx: 50, cy: 52,
  },
  {
    name: 'Egypt', code: 'EG', capital: 'Cairo', continent: 'Africa', population: 104,
    avgRainfall: 100, avgTemp: 24, avgHumidity: 40, avgWindSpeed: 14, forestCover: 0, elevation: 300,
    coastline: true, seismic: 'low',
    path: 'M52 44 L58 42 L58 50 L54 52 L50 48 Z',
    cx: 54, cy: 47,
  },
  {
    name: 'South Africa', code: 'ZA', capital: 'Pretoria', continent: 'Africa', population: 60,
    avgRainfall: 500, avgTemp: 18, avgHumidity: 55, avgWindSpeed: 18, forestCover: 15, elevation: 1000,
    coastline: true, seismic: 'low',
    path: 'M50 66 L56 64 L58 72 L54 76 L50 74 L48 70 Z',
    cx: 53, cy: 70,
  },
  {
    name: 'Ethiopia', code: 'ET', capital: 'Addis Ababa', continent: 'Africa', population: 118,
    avgRainfall: 1000, avgTemp: 24, avgHumidity: 60, avgWindSpeed: 12, forestCover: 15, elevation: 2000,
    coastline: false, seismic: 'moderate',
    path: 'M54 52 L60 50 L62 56 L56 58 L52 54 Z',
    cx: 57, cy: 54,
  },
  {
    name: 'Kenya', code: 'KE', capital: 'Nairobi', continent: 'Africa', population: 54,
    avgRainfall: 700, avgTemp: 24, avgHumidity: 65, avgWindSpeed: 14, forestCover: 6, elevation: 1500,
    coastline: true, seismic: 'low',
    path: 'M56 56 L60 54 L62 60 L58 62 L54 60 Z',
    cx: 58, cy: 58,
  },
  {
    name: 'DR Congo', code: 'CD', capital: 'Kinshasa', continent: 'Africa', population: 92,
    avgRainfall: 1800, avgTemp: 26, avgHumidity: 80, avgWindSpeed: 10, forestCover: 56, elevation: 400,
    coastline: false, seismic: 'low',
    path: 'M50 54 L56 52 L58 60 L52 62 L48 58 Z',
    cx: 53, cy: 57,
  },
  {
    name: 'Algeria', code: 'DZ', capital: 'Algiers', continent: 'Africa', population: 44,
    avgRainfall: 200, avgTemp: 22, avgHumidity: 45, avgWindSpeed: 14, forestCover: 1, elevation: 800,
    coastline: true, seismic: 'low',
    path: 'M44 40 L52 38 L54 46 L48 48 L44 46 Z',
    cx: 49, cy: 43,
  },
  {
    name: 'Morocco', code: 'MA', capital: 'Rabat', continent: 'Africa', population: 37,
    avgRainfall: 300, avgTemp: 20, avgHumidity: 55, avgWindSpeed: 16, forestCover: 12, elevation: 800,
    coastline: true, seismic: 'moderate',
    path: 'M42 38 L48 36 L48 42 L44 44 L40 42 Z',
    cx: 44, cy: 40,
  },
  // Oceania
  {
    name: 'Australia', code: 'AU', capital: 'Canberra', continent: 'Oceania', population: 26,
    avgRainfall: 500, avgTemp: 22, avgHumidity: 50, avgWindSpeed: 18, forestCover: 17, elevation: 300,
    coastline: true, seismic: 'low',
    path: 'M80 60 L92 58 L94 68 L86 72 L80 70 L78 64 Z',
    cx: 86, cy: 65,
  },
  {
    name: 'New Zealand', code: 'NZ', capital: 'Wellington', continent: 'Oceania', population: 5,
    avgRainfall: 1700, avgTemp: 14, avgHumidity: 75, avgWindSpeed: 22, forestCover: 37, elevation: 500,
    coastline: true, seismic: 'high',
    path: 'M92 72 L96 70 L96 78 L92 78 Z',
    cx: 94, cy: 74,
  },
];

export const COUNTRY_BY_CODE = COUNTRIES.reduce<Record<string, CountryInfo>>((acc, c) => {
  acc[c.code] = c;
  return acc;
}, {});

export const CONTINENTS = ['All', 'Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania'];
