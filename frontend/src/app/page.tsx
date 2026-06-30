"use client";

import { useCallback, useEffect, useState } from "react";
import type { Alert, KPIData, Measurement } from "@/types";
import { Header } from "@/components/Header";
import { FilterPanel, DEFAULT_FILTERS } from "@/components/FilterPanel";
import { KPICards } from "@/components/KPICards";
import { PollutionTrendChart } from "@/components/PollutionTrendChart";
import { ForecastLineChart } from "@/components/ForecastLineChart";
import { ForecastBarChart } from "@/components/ForecastBarChart";
import { AlertsPanel } from "@/components/AlertsPanel";
import { MeasurementsTable } from "@/components/MeasurementsTable";
import { MultiCityComparisonChart } from "@/components/MultiCityComparisonChart";
import { PollutantOverview } from "@/components/PollutantOverview";
import { EnvironmentalInsights } from "@/components/EnvironmentalInsights";
import { api } from "@/lib/api";
import { exportMeasurementsToCSV } from "@/lib/utils";
import type { FilterState } from "@/types";

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-3">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
        {eyebrow}
      </span>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-0.5">{title}</h2>
    </div>
  );
}

export default function DashboardPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [refreshKey, setRefreshKey] = useState(0);

  // Shared state for EnvironmentalInsights (avoids a third redundant fetch)
  const [insightKpis, setInsightKpis] = useState<KPIData | null>(null);
  const [insightAlerts, setInsightAlerts] = useState<Alert[]>([]);
  const [tableRows, setTableRows] = useState<Measurement[]>([]);

  const loadInsightData = useCallback(async () => {
    if (!filters.city) return;
    try {
      const [kpis, alerts] = await Promise.all([
        api.kpis({ city: filters.city, start: filters.start, end: filters.end }),
        api.alerts({ city: filters.city }),
      ]);
      setInsightKpis(kpis);
      setInsightAlerts(alerts);
    } catch {
      // Insights are best-effort; individual sections show their own errors
    }
  }, [filters.city, filters.start, filters.end]);

  useEffect(() => {
    loadInsightData();
  }, [loadInsightData, refreshKey]);

  function handleRefresh() {
    setRefreshKey((k) => k + 1);
  }

  function handleReset() {
    setFilters((prev) => ({ ...DEFAULT_FILTERS, city: prev.city }));
    setRefreshKey((k) => k + 1);
  }

  function handleExport() {
    exportMeasurementsToCSV(tableRows, `aqilytics-${filters.city || "export"}.csv`);
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onRefresh={handleRefresh}
          onReset={handleReset}
          onExport={handleExport}
          exportDisabled={tableRows.length === 0}
        />

        <section>
          <SectionHeading eyebrow="Overview" title="Key performance indicators" />
          <KPICards filters={filters} refreshKey={refreshKey} />
        </section>

        <section>
          <SectionHeading eyebrow="Trends" title="Pollution trend over time" />
          <PollutionTrendChart filters={filters} refreshKey={refreshKey} />
        </section>

        <section>
          <SectionHeading eyebrow="Prediction" title="AQI forecast" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ForecastLineChart city={filters.city} refreshKey={refreshKey} />
            <ForecastBarChart city={filters.city} refreshKey={refreshKey} />
          </div>
        </section>

        <section>
          <SectionHeading eyebrow="Monitoring" title="Alerts and recent activity" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <AlertsPanel city={filters.city} refreshKey={refreshKey} />
            <EnvironmentalInsights kpis={insightKpis} alerts={insightAlerts} city={filters.city} />
          </div>
        </section>

        <section>
          <SectionHeading eyebrow="Data" title="Recent measurements" />
          <MeasurementsTable
            filters={filters}
            refreshKey={refreshKey}
            onDataChange={setTableRows}
          />
        </section>

        <section>
          <SectionHeading eyebrow="Comparison" title="Multi-city AQI comparison" />
          <MultiCityComparisonChart start={filters.start} end={filters.end} />
        </section>

        <section>
          <SectionHeading eyebrow="Reference" title="Pollutant overview" />
          <PollutantOverview />
        </section>
      </div>

      <footer className="border-t border-slate-200 dark:border-slate-800 mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center text-center gap-1.5">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Master of Computer Application (MCA)
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">By</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Student Name: Montu Gohain
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Enrollment No: 024MCA110131
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              Under the guidance of
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Guide/Mentor Name: Dr. Vandana Sivaraj
            </p>

            <p className="text-xs text-slate-400 dark:text-slate-600 mt-5">
              AQIlytics — Air Quality Monitoring &amp; Pollution Trend Visualization Dashboard
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
