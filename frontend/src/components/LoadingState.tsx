export function LoadingState({
  label = "Loading data...",
  rows = 3,
}: {
  label?: string;
  rows?: number;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 px-4">
      <div className="h-8 w-8 rounded-full border-2 border-emerald-200 border-t-emerald-600 animate-spin" />
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <div className="w-full max-w-md space-y-2 mt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-3 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse"
            style={{ width: `${85 - i * 12}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 animate-pulse">
      <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-800 mb-3" />
      <div className="h-7 w-28 rounded bg-slate-200 dark:bg-slate-800 mb-2" />
      <div className="h-3 w-32 rounded bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}
