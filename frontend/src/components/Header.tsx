"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ThemeToggle } from "./ThemeToggle";

type ConnectionStatus = "checking" | "online" | "offline";

const BADGES = [
  "Real-time / Historical Analytics",
  "PostgreSQL",
  "Express.js API",
  "Next.js Dashboard",
];

export function Header() {
  const [status, setStatus] = useState<ConnectionStatus>("checking");

  useEffect(() => {
    let cancelled = false;

    async function checkHealth() {
      setStatus("checking");
      try {
        const res = await api.health();
        // Backend returns { status: "ok", database: "connected", time: "..." }
        const isOnline = res?.status === "ok" && res?.database === "connected";
        if (!cancelled) setStatus(isOnline ? "online" : "offline");
      } catch {
        if (!cancelled) setStatus("offline");
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const statusConfig = {
    checking: { dot: "bg-amber-400", label: "Checking connection...", text: "text-amber-600 dark:text-amber-400" },
    online: { dot: "bg-emerald-500", label: "Backend connected", text: "text-emerald-600 dark:text-emerald-400" },
    offline: { dot: "bg-red-500", label: "Backend unreachable", text: "text-red-600 dark:text-red-400" },
  }[status];

  return (
    <header className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-emerald-50/60 via-white to-white dark:from-emerald-500/5 dark:via-slate-950 dark:to-slate-950">
      <div className="absolute inset-0 -z-10 opacity-40 dark:opacity-20">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-sky-300/30 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-600/20">
                AQ
              </div>
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
                  AQIlytics
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Air quality intelligence platform
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur px-3.5 py-1.5 text-xs font-medium ${statusConfig.text}`}
              >
                <span className={`h-2 w-2 rounded-full ${statusConfig.dot} ${status === "checking" ? "animate-pulse" : ""}`} />
                {statusConfig.label}
              </div>
              <ThemeToggle />
            </div>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold tracking-tight text-slate-900 dark:text-white leading-tight max-w-3xl">
              Air Quality Monitoring &amp; Pollution Trend Visualization
            </h1>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Interactive dashboard for monitoring AQI, pollutant concentration trends,
              hazardous alerts, and short-term AQI forecasting.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {BADGES.map((badge) => (
              <span
                key={badge}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
