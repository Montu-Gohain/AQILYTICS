"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { City, Measurement } from "@/types";
import { api } from "@/lib/api";
import { COMPARISON_COLORS, formatChartTick, formatDateTime } from "@/lib/utils";
import { LoadingState } from "./LoadingState";
import { ErrorState, EmptyState } from "./ErrorState";

interface MultiCityComparisonChartProps {
  start: string;
  end: string;
  defaultCities?: string[];
}

interface MergedPoint {
  measured_at: string;
  timestamp: number;
  [city: string]: string | number;
}

function ComparisonTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { dataKey: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 shadow-lg text-xs space-y-1">
      <p className="font-medium text-slate-900 dark:text-white">{formatDateTime(label)}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }} className="font-medium">
          {entry.dataKey}: {entry.value}
        </p>
      ))}
    </div>
  );
}

export function MultiCityComparisonChart({
  start,
  end,
  defaultCities = [],
}: MultiCityComparisonChartProps) {
  const [allCities, setAllCities] = useState<City[]>([]);
  const [selected, setSelected] = useState<string[]>(defaultCities);
  const [chartData, setChartData] = useState<MergedPoint[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load city list once
  useEffect(() => {
    let cancelled = false;
    api
      .cities()
      .then((cities) => {
        if (cancelled) return;
        setAllCities(cities);
        if (selected.length === 0 && cities.length > 0) {
          setSelected(cities.slice(0, Math.min(3, cities.length)).map((c) => c.city));
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load city list.");
      })
      .finally(() => {
        if (!cancelled) setLoadingCities(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadComparison() {
    if (selected.length === 0) {
      setChartData([]);
      return;
    }
    setLoadingData(true);
    setError(null);
    try {
      const results = await Promise.all(
        selected.map((city) =>
          api
            .measurements({ city, pollutant: "AQI", start, end, limit: 300 })
            .then((data) => ({ city, data }))
            .catch(() => ({ city, data: [] as Measurement[] }))
        )
      );

      // Merge into a single timeline keyed by measured_at
      const merged = new Map<string, MergedPoint>();
      results.forEach(({ city, data }) => {
        data.forEach((m) => {
          const value = parseFloat(m.value);
          if (Number.isNaN(value)) return;
          const key = m.measured_at;
          if (!merged.has(key)) {
            merged.set(key, {
              measured_at: key,
              timestamp: new Date(key).getTime(),
            });
          }
          merged.get(key)![city] = value;
        });
      });

      const sortedPoints = Array.from(merged.values()).sort(
        (a, b) => a.timestamp - b.timestamp
      );
      setChartData(sortedPoints);
    } catch {
      setError("Failed to build comparison chart.");
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => {
    if (selected.length > 0) loadComparison();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, start, end]);

  function toggleCity(city: string) {
    setSelected((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          Multi-city AQI comparison
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Select cities to compare AQI trends side by side
        </p>
      </div>

      {loadingCities ? (
        <LoadingState label="Loading cities..." rows={1} />
      ) : (
        <div className="flex flex-wrap gap-2 mb-4">
          {allCities.map((c, i) => {
            const active = selected.includes(c.city);
            const color = COMPARISON_COLORS[selected.indexOf(c.city) % COMPARISON_COLORS.length];
            return (
              <button
                key={c.id}
                onClick={() => toggleCity(c.city)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  active
                    ? "text-white border-transparent"
                    : "text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
                style={active ? { backgroundColor: color } : undefined}
              >
                {c.city}
              </button>
            );
          })}
        </div>
      )}

      {error ? (
        <ErrorState message={error} onRetry={loadComparison} />
      ) : selected.length === 0 ? (
        <EmptyState message="Select at least one city to view comparison." />
      ) : loadingData ? (
        <LoadingState label="Building comparison chart..." />
      ) : chartData.length === 0 ? (
        <EmptyState message="No AQI data available for the selected cities and date range." />
      ) : (
        <div className="h-80 w-full">
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
              <YAxis tick={{ fontSize: 10, fill: "currentColor" }} className="text-slate-400" width={40} />
              <Tooltip content={<ComparisonTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {selected.map((city, i) => (
                <Line
                  key={city}
                  type="monotone"
                  dataKey={city}
                  stroke={COMPARISON_COLORS[i % COMPARISON_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                  activeDot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
