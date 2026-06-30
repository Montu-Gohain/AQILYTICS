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
import type { FilterState, Measurement } from "@/types";
import { api } from "@/lib/api";
import { formatChartTick, formatDateTime } from "@/lib/utils";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./ErrorState";

interface PollutionTrendChartProps {
  filters: FilterState;
  refreshKey: number;
}

interface ChartPoint {
  measured_at: string;
  value: number;
}

function TrendTooltip({
  active,
  payload,
  unit,
  pollutantName,
  city,
}: {
  active?: boolean;
  payload?: { payload: ChartPoint }[];
  unit: string;
  pollutantName: string;
  city: string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 shadow-lg text-xs">
      <p className="font-medium text-slate-900 dark:text-white mb-1">
        {formatDateTime(point.measured_at)}
      </p>
      <p className="text-slate-500 dark:text-slate-400">{city}</p>
      <p className="text-slate-700 dark:text-slate-300">
        {pollutantName}: <span className="font-semibold">{point.value}</span> {unit}
      </p>
    </div>
  );
}

export function PollutionTrendChart({ filters, refreshKey }: PollutionTrendChartProps) {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!filters.city) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.measurements({
        city: filters.city,
        pollutant: filters.pollutant,
        start: filters.start,
        end: filters.end,
        limit: 300,
      });
      setMeasurements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load measurements.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.city, filters.pollutant, filters.start, filters.end, refreshKey]);

  const chartData: ChartPoint[] = measurements
    .map((m) => ({ measured_at: m.measured_at, value: parseFloat(m.value) }))
    .filter((p) => !Number.isNaN(p.value))
    .sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime());

  const unit = measurements[0]?.unit ?? "";
  const pollutantName = measurements[0]?.pollutant_name ?? filters.pollutant;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Pollution trend
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {filters.pollutant}
            {unit ? ` · measured in ${unit}` : ""} · {filters.city || "—"}
          </p>
        </div>
      </div>

      <div className="mt-3">
        {loading ? (
          <LoadingState label="Loading trend data..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : chartData.length === 0 ? (
          <EmptyState
            message="No measurement data for this selection."
            hint="Try a wider date range or a different pollutant."
          />
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
                <XAxis
                  dataKey="measured_at"
                  tickFormatter={formatChartTick}
                  tick={{ fontSize: 10, fill: "currentColor" }}
                  className="text-slate-400"
                  minTickGap={40}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "currentColor" }}
                  className="text-slate-400"
                  width={40}
                />
                <Tooltip
                  content={
                    <TrendTooltip unit={unit} pollutantName={pollutantName} city={filters.city} />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
