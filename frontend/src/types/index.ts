// ── Core entities ───────────────────────────────────────────────────────────

export interface City {
  id: number;
  city: string;
  state: string;
  country: string;
  latitude: string;
  longitude: string;
}

export interface Pollutant {
  id: number;
  code: string;
  name: string;
  unit: string;
  description: string;
}

export interface Measurement {
  id: number;
  city: string;
  state: string;
  pollutant_code: string;
  pollutant_name: string;
  value: string;
  unit: string;
  measured_at: string;
  source: string;
}

export interface KPIData {
  averageAQI: number;
  peakAQI: number;
  peakPollutionTime: string;
  safeDays: number;
  hazardousDays: number;
  totalRecords: number;
}

export interface ForecastPoint {
  predicted_at: string;
  predicted_aqi: number;
  method: string;
}

export interface Alert {
  id: number;
  city: string;
  alert_type: string;
  severity: string;
  message: string;
  created_at: string;
}

export interface HealthStatus {
  status: string;
  database: string;
  time: string;
}

// ── API envelope shapes ─────────────────────────────────────────────────────

export interface ApiListResponse<T> {
  success: boolean;
  count: number;
  data: T[];
}

export interface ApiDataResponse<T> {
  success: boolean;
  data: T;
}

export interface ForecastResponse {
  success: boolean;
  city: string;
  data: ForecastPoint[];
}

// ── AQI categorisation ──────────────────────────────────────────────────────

export type AQICategory =
  | "Good"
  | "Satisfactory"
  | "Moderate"
  | "Poor"
  | "Very Poor"
  | "Severe";

export interface AQICategoryInfo {
  label: AQICategory;
  min: number;
  max: number;
  color: string; // tailwind bg class
  text: string; // tailwind text class
  border: string; // tailwind border class
  hex: string; // for charts
}

// ── Filter state ─────────────────────────────────────────────────────────

export interface FilterState {
  city: string;
  pollutant: string;
  start: string;
  end: string;
  category: AQICategory | "All";
}

// ── Async request state helper ──────────────────────────────────────────────

export interface RequestState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
