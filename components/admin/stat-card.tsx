import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

const tones = {
  blue: "bg-brand-50 text-brand-600",
  violet: "bg-[#efeafd] text-[#6b4fd8]",
  green: "bg-success-soft text-success",
  amber: "bg-warning-soft text-warning",
  slate: "bg-[#eef1f6] text-[#51618a]",
  rose: "bg-danger-soft text-danger",
} as const;

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = "blue",
  trend,
  hint,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  tone?: keyof typeof tones;
  trend?: number;
  hint?: string;
}) {
  const TrendIcon =
    trend === undefined || trend === 0
      ? Minus
      : trend > 0
        ? ArrowUpRight
        : ArrowDownRight;

  const trendColor =
    trend === undefined || trend === 0
      ? "text-[#8a97b1]"
      : trend > 0
        ? "text-success"
        : "text-danger";

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card transition-shadow hover:shadow-pop">
      <div className="flex items-start justify-between gap-3">
        <div className={cn("grid size-11 place-items-center rounded-xl", tones[tone])}>
          <Icon className="size-5" strokeWidth={2.2} />
        </div>
        {trend !== undefined ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full bg-[#f6f8fc] px-2 py-1 text-[11px] font-bold",
              trendColor,
            )}
          >
            <TrendIcon className="size-3" />
            {trend > 0 ? "+" : ""}
            {trend}%
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-[13px] font-semibold text-[#6b7a99]">{label}</p>
      <p className="mt-0.5 text-[28px] font-bold leading-tight tracking-tight text-[#10233f]">
        {typeof value === "number" ? formatNumber(value) : value}
      </p>
      {hint ? <p className="mt-1 text-xs text-[#9aa7bf]">{hint}</p> : null}
    </div>
  );
}
