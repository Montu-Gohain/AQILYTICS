"use client";

import { useEffect, useState } from "react";
import type { FilterState, KPIData } from "@/types";
import { api } from "@/lib/api";
import { formatDateTime, formatNumber, getAQICategory } from "@/lib/utils";
import { CardSkeleton } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { AQIScale } from "./AQICategoryBadge";

interface KPICardsProps {
  filters: FilterState;
  refreshKey: number;
}

interface KPIDefinition {
  label: string;
  value: string;
  description: string;
  icon: string;
  accentText: string;
  accentBg: string;
}

export function KPICards({ filters, refreshKey }: KPICardsProps) {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!filters.city) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.kpis({
        city: filters.city,
        start: filters.start,
        end: filters.end,
      });
      setKpis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load KPIs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.city, filters.start, filters.end, refreshKey]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  if (!kpis) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-sm text-slate-500">
        No KPI data available for this selection.
      </div>
    );
  }

  const avgCategory = getAQICategory(kpis.averageAQI);
  const peakCategory = getAQICategory(kpis.peakAQI);

  const cards: KPIDefinition[] = [
    {
      label: "Average AQI",
      value: formatNumber(kpis.averageAQI),
      description: avgCategory.label,
      icon: "◐",
      accentText: avgCategory.text,
      accentBg: avgCategory.color,
    },
    {
      label: "Peak AQI",
      value: formatNumber(kpis.peakAQI, 0),
      description: peakCategory.label,
      icon: "▲",
      accentText: peakCategory.text,
      accentBg: peakCategory.color,
    },
    {
      label: "Peak pollution time",
      value: formatDateTime(kpis.peakPollutionTime),
      description: "Highest recorded reading",
      icon: "◷",
      accentText: "text-sky-600 dark:text-sky-400",
      accentBg: "bg-sky-500",
    },
    {
      label: "Safe days",
      value: String(kpis.safeDays),
      description: "Days within safe AQI range",
      icon: "✓",
      accentText: "text-emerald-600 dark:text-emerald-400",
      accentBg: "bg-emerald-500",
    },
    {
      label: "Hazardous days",
      value: String(kpis.hazardousDays),
      description: "Days exceeding safe limits",
      icon: "!",
      accentText: "text-red-600 dark:text-red-400",
      accentBg: "bg-red-500",
    },
    {
      label: "Total records",
      value: formatNumber(kpis.totalRecords, 0),
      description: "Measurements in period",
      icon: "▤",
      accentText: "text-slate-600 dark:text-slate-300",
      accentBg: "bg-slate-500",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {card.label}
              </span>
              <span
                className={`h-6 w-6 rounded-lg ${card.accentBg}/10 ${card.accentText} flex items-center justify-center text-xs font-bold`}
              >
                {card.icon}
              </span>
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white leading-tight truncate">
              {card.value}
            </p>
            <p className={`text-xs mt-1 font-medium ${card.accentText}`}>{card.description}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <AQIScale value={kpis.averageAQI} />
      </div>
    </div>
  );
}
