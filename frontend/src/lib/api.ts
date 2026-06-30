import type {
  Alert,
  ApiDataResponse,
  ApiListResponse,
  City,
  ForecastResponse,
  HealthStatus,
  KPIData,
  Measurement,
  Pollutant,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5050/api";

class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      "Could not reach the backend. Please check that the API server is running."
    );
  }

  if (!res.ok) {
    throw new ApiError(`Request failed with status ${res.status}`, res.status);
  }

  try {
    return (await res.json()) as T;
  } catch {
    throw new ApiError("Received an invalid response from the server.");
  }
}

function buildQuery(params: Record<string, string | number | undefined | null>): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  });
  const str = qs.toString();
  return str ? `?${str}` : "";
}

export const api = {
  async health(): Promise<HealthStatus> {
    return request<HealthStatus>("/health");
  },

  async cities(): Promise<City[]> {
    const res = await request<ApiListResponse<City>>("/cities");
    return res.data ?? [];
  },

  async pollutants(): Promise<Pollutant[]> {
    const res = await request<ApiListResponse<Pollutant>>("/pollutants");
    return res.data ?? [];
  },

  async measurements(params: {
    city?: string;
    pollutant?: string;
    start?: string;
    end?: string;
    limit?: number;
  }): Promise<Measurement[]> {
    const query = buildQuery(params);
    const res = await request<ApiListResponse<Measurement>>(`/measurements${query}`);
    return res.data ?? [];
  },

  async kpis(params: { city?: string; start?: string; end?: string }): Promise<KPIData | null> {
    const query = buildQuery(params);
    const res = await request<ApiDataResponse<KPIData>>(`/kpis${query}`);
    return res.data ?? null;
  },

  async forecast(params: { city?: string; hours?: number }): Promise<ForecastResponse> {
    const query = buildQuery(params);
    return request<ForecastResponse>(`/forecast${query}`);
  },

  async alerts(params: { city?: string }): Promise<Alert[]> {
    const query = buildQuery(params);
    const res = await request<ApiListResponse<Alert>>(`/alerts${query}`);
    return res.data ?? [];
  },
};

export { ApiError, BASE_URL };
