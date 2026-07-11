// India states with geographic and climate data.
// SVG path field is kept for backward compatibility but the map now uses
// real GeoJSON data from public/geo/india-states-simple.geojson.

export interface StateInfo {
  name: string;
  code: string;
  capital: string;
  population: number; // millions
  avgRainfall: number; // mm
  avgTemp: number; // C
  avgHumidity: number; // %
  avgWindSpeed: number; // km/h
  avgRiverLevel: number; // m
  forestCover: number; // %
  elevation: number; // m
  coastline: boolean;
  seismic: 'low' | 'moderate' | 'high';
  path: string;
  cx: number;
  cy: number;
}

export const STATES: StateInfo[] = [
  { name: 'Jammu & Kashmir', code: 'JK', capital: 'Srinagar', population: 13, avgRainfall: 1000, avgTemp: 16, avgHumidity: 58, avgWindSpeed: 12, avgRiverLevel: 4, forestCover: 55, elevation: 2500, coastline: false, seismic: 'high', path: '', cx: 76, cy: 34 },
  { name: 'Himachal Pradesh', code: 'HP', capital: 'Shimla', population: 7.5, avgRainfall: 1400, avgTemp: 18, avgHumidity: 60, avgWindSpeed: 14, avgRiverLevel: 5, forestCover: 66, elevation: 2200, coastline: false, seismic: 'high', path: '', cx: 77, cy: 31 },
  { name: 'Punjab', code: 'PB', capital: 'Chandigarh', population: 30, avgRainfall: 600, avgTemp: 24, avgHumidity: 50, avgWindSpeed: 12, avgRiverLevel: 4, forestCover: 4, elevation: 280, coastline: false, seismic: 'low', path: '', cx: 75, cy: 31 },
  { name: 'Haryana', code: 'HR', capital: 'Chandigarh', population: 27, avgRainfall: 550, avgTemp: 25, avgHumidity: 50, avgWindSpeed: 12, avgRiverLevel: 4, forestCover: 4, elevation: 270, coastline: false, seismic: 'moderate', path: '', cx: 76, cy: 29 },
  { name: 'Delhi', code: 'DL', capital: 'New Delhi', population: 32, avgRainfall: 700, avgTemp: 25, avgHumidity: 50, avgWindSpeed: 13, avgRiverLevel: 4, forestCover: 20, elevation: 220, coastline: false, seismic: 'moderate', path: '', cx: 77, cy: 28 },
  { name: 'Uttarakhand', code: 'UK', capital: 'Dehradun', population: 11, avgRainfall: 1600, avgTemp: 20, avgHumidity: 62, avgWindSpeed: 13, avgRiverLevel: 5, forestCover: 45, elevation: 1800, coastline: false, seismic: 'high', path: '', cx: 79, cy: 30 },
  { name: 'Rajasthan', code: 'RJ', capital: 'Jaipur', population: 68, avgRainfall: 400, avgTemp: 26, avgHumidity: 40, avgWindSpeed: 13, avgRiverLevel: 3, forestCover: 5, elevation: 350, coastline: false, seismic: 'low', path: '', cx: 74, cy: 27 },
  { name: 'Uttar Pradesh', code: 'UP', capital: 'Lucknow', population: 240, avgRainfall: 1000, avgTemp: 26, avgHumidity: 60, avgWindSpeed: 11, avgRiverLevel: 7, forestCover: 6, elevation: 200, coastline: false, seismic: 'moderate', path: '', cx: 80, cy: 27 },
  { name: 'Bihar', code: 'BR', capital: 'Patna', population: 124, avgRainfall: 1100, avgTemp: 26, avgHumidity: 68, avgWindSpeed: 11, avgRiverLevel: 8.5, forestCover: 7, elevation: 170, coastline: false, seismic: 'moderate', path: '', cx: 85, cy: 25 },
  { name: 'Sikkim', code: 'SK', capital: 'Gangtok', population: 0.7, avgRainfall: 2800, avgTemp: 18, avgHumidity: 75, avgWindSpeed: 12, avgRiverLevel: 6, forestCover: 47, elevation: 2800, coastline: false, seismic: 'high', path: '', cx: 88, cy: 27 },
  { name: 'Arunachal Pradesh', code: 'AR', capital: 'Itanagar', population: 1.5, avgRainfall: 2400, avgTemp: 22, avgHumidity: 75, avgWindSpeed: 10, avgRiverLevel: 8, forestCover: 80, elevation: 1200, coastline: false, seismic: 'high', path: '', cx: 94, cy: 28 },
  { name: 'Assam', code: 'AS', capital: 'Dispur', population: 35, avgRainfall: 2200, avgTemp: 24, avgHumidity: 78, avgWindSpeed: 12, avgRiverLevel: 9, forestCover: 35, elevation: 200, coastline: false, seismic: 'high', path: '', cx: 92, cy: 26 },
  { name: 'Nagaland', code: 'NL', capital: 'Kohima', population: 2, avgRainfall: 1800, avgTemp: 21, avgHumidity: 76, avgWindSpeed: 10, avgRiverLevel: 4, forestCover: 75, elevation: 1000, coastline: false, seismic: 'high', path: '', cx: 94, cy: 26 },
  { name: 'Manipur', code: 'MN', capital: 'Imphal', population: 3.2, avgRainfall: 1500, avgTemp: 22, avgHumidity: 75, avgWindSpeed: 10, avgRiverLevel: 5, forestCover: 75, elevation: 800, coastline: false, seismic: 'high', path: '', cx: 94, cy: 24 },
  { name: 'Mizoram', code: 'MZ', capital: 'Aizawl', population: 1.2, avgRainfall: 2500, avgTemp: 23, avgHumidity: 78, avgWindSpeed: 10, avgRiverLevel: 4, forestCover: 85, elevation: 900, coastline: false, seismic: 'moderate', path: '', cx: 92, cy: 23 },
  { name: 'Tripura', code: 'TR', capital: 'Agartala', population: 4, avgRainfall: 2200, avgTemp: 25, avgHumidity: 78, avgWindSpeed: 10, avgRiverLevel: 5, forestCover: 60, elevation: 200, coastline: false, seismic: 'moderate', path: '', cx: 91, cy: 23 },
  { name: 'Meghalaya', code: 'ML', capital: 'Shillong', population: 3, avgRainfall: 3500, avgTemp: 20, avgHumidity: 80, avgWindSpeed: 12, avgRiverLevel: 6, forestCover: 75, elevation: 1000, coastline: false, seismic: 'high', path: '', cx: 91, cy: 25 },
  { name: 'Madhya Pradesh', code: 'MP', capital: 'Bhopal', population: 85, avgRainfall: 1100, avgTemp: 25, avgHumidity: 55, avgWindSpeed: 11, avgRiverLevel: 5, forestCover: 25, elevation: 400, coastline: false, seismic: 'low', path: '', cx: 78, cy: 23 },
  { name: 'Chhattisgarh', code: 'CG', capital: 'Raipur', population: 30, avgRainfall: 1300, avgTemp: 27, avgHumidity: 60, avgWindSpeed: 10, avgRiverLevel: 6, forestCover: 41, elevation: 320, coastline: false, seismic: 'low', path: '', cx: 82, cy: 21 },
  { name: 'Jharkhand', code: 'JH', capital: 'Ranchi', population: 38, avgRainfall: 1200, avgTemp: 25, avgHumidity: 62, avgWindSpeed: 11, avgRiverLevel: 5, forestCover: 29, elevation: 380, coastline: false, seismic: 'low', path: '', cx: 85, cy: 23 },
  { name: 'West Bengal', code: 'WB', capital: 'Kolkata', population: 98, avgRainfall: 1800, avgTemp: 26, avgHumidity: 72, avgWindSpeed: 14, avgRiverLevel: 8, forestCover: 19, elevation: 150, coastline: true, seismic: 'moderate', path: '', cx: 88, cy: 23 },
  { name: 'Odisha', code: 'OD', capital: 'Bhubaneswar', population: 46, avgRainfall: 1500, avgTemp: 27, avgHumidity: 70, avgWindSpeed: 16, avgRiverLevel: 7, forestCover: 33, elevation: 200, coastline: true, seismic: 'moderate', path: '', cx: 85, cy: 20 },
  { name: 'Gujarat', code: 'GJ', capital: 'Gandhinagar', population: 60, avgRainfall: 800, avgTemp: 28, avgHumidity: 55, avgWindSpeed: 16, avgRiverLevel: 5, forestCover: 8, elevation: 200, coastline: true, seismic: 'moderate', path: '', cx: 71, cy: 22 },
  { name: 'Maharashtra', code: 'MH', capital: 'Mumbai', population: 124, avgRainfall: 1400, avgTemp: 27, avgHumidity: 65, avgWindSpeed: 14, avgRiverLevel: 6, forestCover: 17, elevation: 300, coastline: true, seismic: 'moderate', path: '', cx: 76, cy: 19 },
  { name: 'Goa', code: 'GA', capital: 'Panaji', population: 1.6, avgRainfall: 2800, avgTemp: 27, avgHumidity: 76, avgWindSpeed: 15, avgRiverLevel: 5, forestCover: 20, elevation: 80, coastline: true, seismic: 'low', path: '', cx: 74, cy: 15 },
  { name: 'Telangana', code: 'TG', capital: 'Hyderabad', population: 38, avgRainfall: 900, avgTemp: 27, avgHumidity: 58, avgWindSpeed: 12, avgRiverLevel: 4, forestCover: 18, elevation: 400, coastline: false, seismic: 'low', path: '', cx: 79, cy: 17 },
  { name: 'Andhra Pradesh', code: 'AP', capital: 'Amaravati', population: 53, avgRainfall: 940, avgTemp: 28, avgHumidity: 65, avgWindSpeed: 14, avgRiverLevel: 6.5, forestCover: 33, elevation: 180, coastline: true, seismic: 'low', path: '', cx: 80, cy: 16 },
  { name: 'Karnataka', code: 'KA', capital: 'Bengaluru', population: 67, avgRainfall: 1100, avgTemp: 25, avgHumidity: 60, avgWindSpeed: 13, avgRiverLevel: 5, forestCover: 20, elevation: 600, coastline: true, seismic: 'low', path: '', cx: 76, cy: 15 },
  { name: 'Kerala', code: 'KL', capital: 'Thiruvananthapuram', population: 34, avgRainfall: 3000, avgTemp: 27, avgHumidity: 78, avgWindSpeed: 14, avgRiverLevel: 7, forestCover: 50, elevation: 200, coastline: true, seismic: 'moderate', path: '', cx: 76, cy: 10 },
  { name: 'Tamil Nadu', code: 'TN', capital: 'Chennai', population: 77, avgRainfall: 950, avgTemp: 28, avgHumidity: 68, avgWindSpeed: 15, avgRiverLevel: 5, forestCover: 20, elevation: 250, coastline: true, seismic: 'low', path: '', cx: 78, cy: 11 },
  // Union Territories
  { name: 'Andaman and Nicobar', code: 'AN', capital: 'Port Blair', population: 0.4, avgRainfall: 3000, avgTemp: 27, avgHumidity: 80, avgWindSpeed: 18, avgRiverLevel: 3, forestCover: 85, elevation: 200, coastline: true, seismic: 'high', path: '', cx: 93, cy: 12 },
  { name: 'Chandigarh', code: 'CH', capital: 'Chandigarh', population: 1.1, avgRainfall: 1000, avgTemp: 23, avgHumidity: 55, avgWindSpeed: 12, avgRiverLevel: 3, forestCover: 15, elevation: 320, coastline: false, seismic: 'moderate', path: '', cx: 77, cy: 31 },
  { name: 'Dadra and Nagar Haveli and Daman and Diu', code: 'DD', capital: 'Daman', population: 0.6, avgRainfall: 2000, avgTemp: 27, avgHumidity: 75, avgWindSpeed: 14, avgRiverLevel: 3, forestCover: 40, elevation: 50, coastline: true, seismic: 'low', path: '', cx: 73, cy: 20 },
  { name: 'Lakshadweep', code: 'LD', capital: 'Kavaratti', population: 0.07, avgRainfall: 1600, avgTemp: 27, avgHumidity: 80, avgWindSpeed: 20, avgRiverLevel: 2, forestCover: 30, elevation: 10, coastline: true, seismic: 'low', path: '', cx: 73, cy: 10 },
  { name: 'Puducherry', code: 'PY', capital: 'Puducherry', population: 1.6, avgRainfall: 1200, avgTemp: 28, avgHumidity: 75, avgWindSpeed: 15, avgRiverLevel: 4, forestCover: 10, elevation: 30, coastline: true, seismic: 'low', path: '', cx: 80, cy: 12 },
];

// Map GeoJSON NAME_1 property to our StateInfo name
export const GEOJSON_NAME_MAP: Record<string, string> = {
  'Jammu and Kashmir': 'Jammu & Kashmir',
  'Orissa': 'Odisha',
  'Uttaranchal': 'Uttarakhand',
  'Dadra and Nagar Haveli': 'Dadra and Nagar Haveli and Daman and Diu',
  'Daman and Diu': 'Dadra and Nagar Haveli and Daman and Diu',
};

export const STATE_BY_NAME = STATES.reduce<Record<string, StateInfo>>((acc, s) => {
  acc[s.name] = s;
  return acc;
}, {});

export const STATE_NAMES = STATES.map((s) => s.name);
