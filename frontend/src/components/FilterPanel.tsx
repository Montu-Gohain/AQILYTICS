"use client";

import { useEffect, useState } from "react";
import type { AQICategory, City, FilterState, Pollutant } from "@/types";
import { api } from "@/lib/api";
import { daysAgoISO, todayISO } from "@/lib/utils";

const CATEGORY_OPTIONS: (AQICategory | "All")[] = [
  "All",
  "Good",
  "Satisfactory",
  "Moderate",
  "Poor",
  "Very Poor",
  "Severe",
];

export const DEFAULT_FILTERS: FilterState = {
  city: "",
  pollutant: "AQI",
  start: daysAgoISO(7),
  end: todayISO(),
  category: "All",
};

interface FilterPanelProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onRefresh: () => void;
  onReset: () => void;
  onExport: () => void;
  exportDisabled?: boolean;
}

export function FilterPanel({
  filters,
  onChange,
  onRefresh,
  onReset,
  onExport,
  exportDisabled,
}: FilterPanelProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [pollutants, setPollutants] = useState<Pollutant[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      setLoadingOptions(true);
      setOptionsError(null);
      try {
        const [cityList, pollutantList] = await Promise.all([
          api.cities(),
          api.pollutants(),
        ]);
        if (cancelled) return;
        setCities(cityList);
        setPollutants(pollutantList);
        if (!filters.city && cityList.length > 0) {
          onChange({ ...filters, city: cityList[0].city });
        }
      } catch (err) {
        if (!cancelled) {
          setOptionsError(
            err instanceof Error
              ? err.message
              : "Failed to load filter options.",
          );
        }
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    }

    loadOptions();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (patch: Partial<FilterState>) =>
    onChange({ ...filters, ...patch });

  return (
    <section className="sticky top-2 z-30">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-sm p-4 sm:p-5">
        {optionsError ? (
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="text-red-600 dark:text-red-400">
              {optionsError}
            </span>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <FieldWrap label="City">
              <select
                value={filters.city}
                onChange={(e) => update({ city: e.target.value })}
                disabled={loadingOptions}
                className="select-field"
              >
                {cities.length === 0 && <option value="">No cities</option>}
                {cities.map((c) => (
                  <option key={c.id} value={c.city}>
                    {c.city}
                  </option>
                ))}
              </select>
            </FieldWrap>

            <FieldWrap label="Pollutant">
              <select
                value={filters.pollutant}
                onChange={(e) => update({ pollutant: e.target.value })}
                disabled={loadingOptions}
                className="select-field"
              >
                {pollutants.map((p) => (
                  <option key={p.id} value={p.code}>
                    {p.code} — {p.name}
                  </option>
                ))}
              </select>
            </FieldWrap>

            <FieldWrap label="Start date">
              <input
                type="date"
                value={filters.start}
                max={filters.end}
                onChange={(e) => update({ start: e.target.value })}
                className="select-field"
              />
            </FieldWrap>

            <FieldWrap label="End date">
              <input
                type="date"
                value={filters.end}
                min={filters.start}
                max={todayISO()}
                onChange={(e) => update({ end: e.target.value })}
                className="select-field"
              />
            </FieldWrap>

            <FieldWrap label="AQI category">
              <select
                value={filters.category}
                onChange={(e) =>
                  update({ category: e.target.value as AQICategory | "All" })
                }
                className="select-field"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FieldWrap>

            <div className="flex items-end gap-2 col-span-2 sm:col-span-3 lg:col-span-1">
              <button
                onClick={onRefresh}
                className="flex-1 h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onReset}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Reset filters
          </button>
          <button
            onClick={onExport}
            disabled={exportDisabled}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Export CSV
          </button>
        </div>
      </div>

      <style jsx global>{`
        .select-field {
          width: 100%;
          height: 36px;
          border-radius: 0.5rem;
          border: 1px solid rgb(226 232 240);
          background: white;
          padding: 0 10px;
          font-size: 13px;
          color: rgb(15 23 42);
        }
        .dark .select-field {
          border-color: rgb(30 41 59);
          background: rgb(15 23 42);
          color: rgb(241 245 249);
        }
        .dark input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
        }
        .select-field:focus {
          outline: none;
          border-color: rgb(16 185 129);
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.15);
        }
      `}</style>
    </section>
  );
}

function FieldWrap({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}
