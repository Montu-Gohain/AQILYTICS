"use client";

import { useEffect, useMemo, useState } from "react";
import type { FilterState, Measurement } from "@/types";
import { api } from "@/lib/api";
import { formatDateTime, getAQICategory } from "@/lib/utils";
import { LoadingState } from "./LoadingState";
import { ErrorState, EmptyState } from "./ErrorState";

interface MeasurementsTableProps {
  filters: FilterState;
  refreshKey: number;
  onDataChange?: (rows: Measurement[]) => void;
}

export function MeasurementsTable({
  filters,
  refreshKey,
  onDataChange,
}: MeasurementsTableProps) {
  const [rows, setRows] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

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
        limit: 25,
      });
      setRows(data);
      onDataChange?.(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load measurements.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.city, filters.pollutant, filters.start, filters.end, refreshKey]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        r.city.toLowerCase().includes(q) ||
        r.state.toLowerCase().includes(q) ||
        r.pollutant_name.toLowerCase().includes(q) ||
        r.pollutant_code.toLowerCase().includes(q) ||
        r.source.toLowerCase().includes(q),
    );
  }, [rows, search]);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Recent measurements
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Showing up to 25 most recent records
          </p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search city, pollutant, source..."
          className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 w-full sm:w-64"
        />
      </div>

      {loading ? (
        <LoadingState label="Loading measurements..." rows={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : filteredRows.length === 0 ? (
        <EmptyState message="No measurements match your filters." />
      ) : (
        <div className="overflow-x-auto -mx-1">
          <div className="max-h-96 overflow-y-auto px-1">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white dark:bg-slate-900">
                <tr className="text-left text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <th className="py-2 pr-3 font-semibold">Time</th>
                  <th className="py-2 pr-3 font-semibold">City</th>
                  <th className="py-2 pr-3 font-semibold">State</th>
                  <th className="py-2 pr-3 font-semibold">Pollutant Metric</th>
                  <th className="py-2 pr-3 font-semibold">Value</th>
                  <th className="py-2 pr-3 font-semibold">Unit</th>
                  <th className="py-2 pr-3 font-semibold">Source</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const numericValue = parseFloat(row.value);
                  const isAQI = row.pollutant_code === "AQI";
                  const cat = isAQI ? getAQICategory(numericValue) : null;
                  const highlight = cat && numericValue >= 201;
                  return (
                    <tr
                      key={row.id}
                      className={`border-b border-slate-100 dark:border-slate-800/60 ${
                        highlight ? "bg-red-50/60 dark:bg-red-500/5" : ""
                      }`}
                    >
                      <td className="py-2 pr-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDateTime(row.measured_at)}
                      </td>
                      <td className="py-2 pr-3 text-slate-700 dark:text-slate-200">
                        {row.city}
                      </td>
                      <td className="py-2 pr-3 text-slate-500 dark:text-slate-400">
                        {row.state}
                      </td>
                      <td className="py-2 pr-3 text-slate-700 dark:text-slate-200">
                        {row.pollutant_name}
                      </td>
                      <td
                        className={`py-2 pr-3 font-medium ${
                          cat ? cat.text : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {row.value}
                      </td>
                      <td className="py-2 pr-3 text-slate-400 dark:text-slate-400">
                        {row.unit}
                      </td>
                      <td className="py-2 pr-3 text-slate-400 dark:text-slate-500 whitespace-nowrap">
                        {row.source}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
