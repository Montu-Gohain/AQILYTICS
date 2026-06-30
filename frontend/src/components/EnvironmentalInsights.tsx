import type { Alert, KPIData } from "@/types";
import { formatDateTime, getAQICategory } from "@/lib/utils";
import { EmptyState } from "./ErrorState";

interface EnvironmentalInsightsProps {
  kpis: KPIData | null;
  alerts: Alert[];
  city: string;
}

export function EnvironmentalInsights({ kpis, alerts, city }: EnvironmentalInsightsProps) {
  if (!kpis) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3">
          Environmental insights
        </h3>
        <EmptyState message="Insights will appear once data loads for this city." />
      </div>
    );
  }

  const avgCategory = getAQICategory(kpis.averageAQI);
  const mostRecentAlert = alerts[0];

  const insights = [
    {
      label: "Peak pollution",
      text: `Peak pollution in ${city} was recorded at ${formatDateTime(
        kpis.peakPollutionTime
      )}, reaching an AQI of ${kpis.peakAQI}.`,
    },
    {
      label: "Current category",
      text: `The average AQI for the selected period is ${kpis.averageAQI?.toFixed?.(1) ?? kpis.averageAQI}, categorized as "${avgCategory.label}".`,
    },
    {
      label: "Hazardous days",
      text: `${kpis.hazardousDays} day${kpis.hazardousDays === 1 ? "" : "s"} in this period exceeded safe air quality limits, out of ${kpis.totalRecords} total recorded measurements.`,
    },
    {
      label: "Latest alert",
      text: mostRecentAlert
        ? `Most recent alert: "${mostRecentAlert.message}" (${mostRecentAlert.severity}, ${formatDateTime(mostRecentAlert.created_at)}).`
        : "No recent alerts have been recorded for this city.",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3">
        Environmental insights
      </h3>
      <ul className="space-y-3">
        {insights.map((insight) => (
          <li key={insight.label} className="flex gap-3">
            <span className="h-5 w-5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
              •
            </span>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {insight.text}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
