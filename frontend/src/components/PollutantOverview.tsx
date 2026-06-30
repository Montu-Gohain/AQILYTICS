"use client";

import { useEffect, useState } from "react";
import type { Pollutant } from "@/types";
import { api } from "@/lib/api";
import { LoadingState } from "./LoadingState";
import { ErrorState, EmptyState } from "./ErrorState";

const ICONS: Record<string, string> = {
  AQI: "◐",
  "PM2.5": "◌",
  PM10: "○",
  CO: "≋",
  NO2: "⌬",
  SO2: "⚛",
  O3: "◎",
  TEMP: "°",
  HUMIDITY: "≈",
};

export function PollutantOverview() {
  const [pollutants, setPollutants] = useState<Pollutant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.pollutants();
      setPollutants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pollutants.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          Monitored pollutants
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Parameters tracked across all monitoring stations
        </p>
      </div>

      {loading ? (
        <LoadingState label="Loading pollutant list..." rows={2} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : pollutants.length === 0 ? (
        <EmptyState message="No pollutant definitions available." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {pollutants.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="h-7 w-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-bold">
                  {ICONS[p.code] ?? "•"}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{p.code}</span>
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-snug">
                {p.name}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{p.unit}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 line-clamp-2">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
