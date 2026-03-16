import clsx from "clsx";

interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaType?: "positive" | "negative" | "neutral";
  help?: string;
  highlightBox?: boolean; // When true, colors the entire card background
}

export function MetricCard({
  label,
  value,
  delta,
  deltaType = "neutral",
  help,
  highlightBox = false,
}: MetricCardProps) {
  return (
    <div
      className={clsx(
        "metric-card",
        highlightBox && deltaType === "positive" && "bg-green-50 border-green-200",
        highlightBox && deltaType === "negative" && "bg-red-50 border-red-200"
      )}
      title={help}
    >
      <p className="text-xs font-medium text-secondary uppercase tracking-wide mb-1">
        {label}
      </p>
      <p
        className={clsx(
          "text-2xl font-bold",
          highlightBox && deltaType === "positive" && "text-green-700",
          highlightBox && deltaType === "negative" && "text-red-700",
          !highlightBox && "text-primary"
        )}
      >
        {value}
      </p>
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
