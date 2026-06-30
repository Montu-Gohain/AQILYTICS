"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ForecastPoint } from "@/types";
import { api } from "@/lib/api";
import { formatChartTick, formatDateTime } from "@/lib/utils";
import { LoadingState } from "./LoadingState";
import { ErrorState, EmptyState } from "./ErrorState";

interface ForecastLineChartProps {
  city: string;
  refreshKey: number;
}

function ForecastTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ForecastPoint }[];
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 shadow-lg text-xs">
      <p className="font-medium text-slate-900 dark:text-white mb-1">
        {formatDateTime(point.predicted_at)}
      </p>
      <p className="text-slate-700 dark:text-slate-300">
        Predicted AQI: <span className="font-semibold">{point.predicted_aqi}</span>
      </p>
      <p className="text-slate-400 dark:text-slate-500 mt-0.5">Method: {point.method}</p>
    </div>
  );
}

export function ForecastLineChart({ city, refreshKey }: ForecastLineChartProps) {
  const [data, setData] = useState<ForecastPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!city) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.forecast({ city, hours: 24 });
      setData(res.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load forecast.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, refreshKey]);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            AQI forecast — next 24 hours
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">{city || "—"}</p>
        </div>
      </div>

      <div className="mt-3">
        {loading ? (
          <LoadingState label="Generating forecast..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : data.length === 0 ? (
          <EmptyState message="No forecast data available for this city." />
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
                <XAxis
                  dataKey="predicted_at"
                  tickFormatter={formatChartTick}
                  tick={{ fontSize: 10, fill: "currentColor" }}
                  className="text-slate-400"
                  minTickGap={40}
                />
                <YAxis tick={{ fontSize: 10, fill: "currentColor" }} className="text-slate-400" width={40} />
                <Tooltip content={<ForecastTooltip />} />
                <Line
                  type="monotone"
                  dataKey="predicted_aqi"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  strokeDasharray="5 3"
                  dot={{ r: 2.5, fill: "#6366f1" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3 italic">
        Forecast generated using moving average model
      </p>
    </div>
  );
}
