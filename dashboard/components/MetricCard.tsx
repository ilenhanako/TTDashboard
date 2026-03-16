import clsx from "clsx";

interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaType?: "positive" | "negative" | "neutral";
  help?: string;
}

export function MetricCard({
  label,
  value,
  delta,
  deltaType = "neutral",
  help,
}: MetricCardProps) {
  return (
    <div className="metric-card" title={help}>
      <p className="text-xs font-medium text-secondary uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-primary">{value}</p>
      {delta && (
        <p
          className={clsx(
            "text-sm mt-1",
            deltaType === "positive" && "text-success",
            deltaType === "negative" && "text-warning",
            deltaType === "neutral" && "text-secondary"
          )}
        >
          {delta}
        </p>
      )}
    </div>
  );
}
