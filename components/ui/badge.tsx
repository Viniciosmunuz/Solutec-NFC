import { cn } from "@/lib/utils";

export const BOARD_STATUS = {
  ativa: { label: "Ativa", className: "bg-success-soft text-success" },
  inativa: { label: "Inativa", className: "bg-[#eef1f6] text-[#6b7a99]" },
  producao: { label: "Em produção", className: "bg-warning-soft text-warning" },
} as const;

export type BoardStatus = keyof typeof BOARD_STATUS;

export function StatusBadge({ status }: { status: string }) {
  const def =
    BOARD_STATUS[status as BoardStatus] ?? BOARD_STATUS.producao;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide",
        def.className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {def.label}
    </span>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "brand" | "success" | "warning" | "danger";
  className?: string;
}) {
  const tones = {
    neutral: "bg-[#eef1f6] text-[#51618a]",
    brand: "bg-brand-50 text-brand-700",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-danger",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
