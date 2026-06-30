import { AQI_CATEGORIES, getAQICategory } from "@/lib/utils";

export function AQICategoryBadge({ value }: { value: number | null | undefined }) {
  const cat = getAQICategory(value);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cat.border} ${cat.text} bg-white dark:bg-slate-900`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cat.color}`} />
      {cat.label}
    </span>
  );
}

export function AQIScale({ value }: { value: number | null | undefined }) {
  const current = getAQICategory(value);
  const clamped = value != null ? Math.min(Math.max(value, 0), 500) : 0;
  const percent = (clamped / 500) * 100;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Current AQI category
        </span>
        <AQICategoryBadge value={value} />
      </div>

      <div className="relative h-3 w-full rounded-full overflow-hidden flex">
        {AQI_CATEGORIES.map((cat) => {
          const width =
            cat.max === Infinity ? 100 - cat.min / 5 : ((cat.max - cat.min + 1) / 500) * 100;
          return <div key={cat.label} className={cat.color} style={{ width: `${width}%` }} />;
        })}
        {value != null && (
          <div
            className="absolute top-0 h-3 w-0.5 bg-slate-900 dark:bg-white"
            style={{ left: `${percent}%` }}
          />
        )}
      </div>

      <div className="flex justify-between mt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
        <span>0</span>
        <span>100</span>
        <span>200</span>
        <span>300</span>
        <span>400</span>
        <span>500+</span>
      </div>
    </div>
  );
}
