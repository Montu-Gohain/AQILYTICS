import type { AQICategory, AQICategoryInfo, Measurement } from "@/types";

// ── AQI category lookup table ───────────────────────────────────────────────

export const AQI_CATEGORIES: AQICategoryInfo[] = [
  {
    label: "Good",
    min: 0,
    max: 50,
    color: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/30",
    hex: "#10b981",
  },
  {
    label: "Satisfactory",
    min: 51,
    max: 100,
    color: "bg-lime-500",
    text: "text-lime-600 dark:text-lime-400",
    border: "border-lime-500/30",
    hex: "#84cc16",
  },
  {
    label: "Moderate",
    min: 101,
    max: 200,
    color: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/30",
    hex: "#f59e0b",
  },
  {
    label: "Poor",
    min: 201,
    max: 300,
    color: "bg-orange-500",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-500/30",
    hex: "#f97316",
  },
  {
    label: "Very Poor",
    min: 301,
    max: 400,
    color: "bg-red-500",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-500/30",
    hex: "#ef4444",
  },
  {
    label: "Severe",
    min: 401,
    max: Infinity,
    color: "bg-purple-600",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/30",
    hex: "#9333ea",
  },
];

export function getAQICategory(value: number | null | undefined): AQICategoryInfo {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return AQI_CATEGORIES[0];
  }
  return (
    AQI_CATEGORIES.find((c) => value >= c.min && value <= c.max) ??
    AQI_CATEGORIES[AQI_CATEGORIES.length - 1]
  );
}

export function categoryNameToInfo(name: AQICategory): AQICategoryInfo {
  return AQI_CATEGORIES.find((c) => c.label === name) ?? AQI_CATEGORIES[0];
}

export function severityStyles(severity: string): {
  bg: string;
  text: string;
  border: string;
  hex: string;
} {
  const s = severity.toLowerCase();
  if (s.includes("severe") || s.includes("hazard")) {
    return {
      bg: "bg-purple-500/10",
      text: "text-purple-600 dark:text-purple-400",
      border: "border-purple-500/30",
      hex: "#9333ea",
    };
  }
  if (s.includes("very poor")) {
    return {
      bg: "bg-red-500/10",
      text: "text-red-600 dark:text-red-400",
      border: "border-red-500/30",
      hex: "#ef4444",
    };
  }
  if (s.includes("poor")) {
    return {
      bg: "bg-orange-500/10",
      text: "text-orange-600 dark:text-orange-400",
      border: "border-orange-500/30",
      hex: "#f97316",
    };
  }
  if (s.includes("moderate")) {
    return {
      bg: "bg-amber-500/10",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-500/30",
      hex: "#f59e0b",
    };
  }
  return {
    bg: "bg-slate-500/10",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-500/30",
    hex: "#64748b",
  };
}

// ── Formatting helpers ───────────────────────────────────────────────────────

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function formatTimeOnly(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function formatChartTick(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function formatNumber(value: number | string | null | undefined, decimals = 1): string {
  if (value === null || value === undefined) return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return "—";
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

// ── CSV export ───────────────────────────────────────────────────────────────

export function exportMeasurementsToCSV(rows: Measurement[], filename = "aqilytics-export.csv") {
  if (!rows.length) return;
  const headers = ["Time", "City", "State", "Pollutant", "Value", "Unit", "Source"];
  const lines = rows.map((r) =>
    [
      r.measured_at,
      r.city,
      r.state,
      `${r.pollutant_name} (${r.pollutant_code})`,
      r.value,
      r.unit,
      r.source,
    ]
      .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
      .join(",")
  );
  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ── Comparison chart colors (distinct, accessible) ──────────────────────────

export const COMPARISON_COLORS = [
  "#2563eb", // blue
  "#16a34a", // green
  "#ea580c", // orange
  "#9333ea", // purple
  "#db2777", // pink
  "#0891b2", // cyan
  "#ca8a04", // yellow
];

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
