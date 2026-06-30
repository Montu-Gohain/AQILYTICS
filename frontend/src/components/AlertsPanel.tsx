"use client";

import { useEffect, useState } from "react";
import type { Alert } from "@/types";
import { api } from "@/lib/api";
import { formatDateTime, severityStyles } from "@/lib/utils";
import { LoadingState } from "./LoadingState";
import { ErrorState, EmptyState } from "./ErrorState";

interface AlertsPanelProps {
  city: string;
  refreshKey: number;
}

export function AlertsPanel({ city, refreshKey }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!city) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.alerts({ city });
      setAlerts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load alerts.");
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
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          Hazardous alerts
        </h3>
        {alerts.length > 0 && (
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            {alerts.length} active
          </span>
        )}
      </div>

      {loading ? (
        <LoadingState label="Checking for alerts..." rows={2} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : alerts.length === 0 ? (
        <EmptyState message="No active alerts for this city." hint="That's good news." />
      ) : (
        <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
          {alerts.map((alert) => {
            const style = severityStyles(alert.severity);
            return (
              <div
                key={alert.id}
                className={`rounded-xl border ${style.border} ${style.bg} p-3.5`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className={`text-xs font-bold ${style.text}`}>{alert.severity}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                    {formatDateTime(alert.created_at)}
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-snug">
                  {alert.message}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                  <span>{alert.city}</span>
                  <span>·</span>
                  <span>{alert.alert_type}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
