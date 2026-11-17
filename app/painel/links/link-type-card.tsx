"use client";

import { getLinkType } from "@/lib/links";
import { formatNumber, hexToRgba } from "@/lib/utils";

export default function LinkTypeCard({
  type,
  used,
  clicks,
}: {
  type: string;
  used: number;
  clicks: number;
}) {
  const def = getLinkType(type);
  const Icon = def.icon;

  return (
    <div className="flex gap-3 rounded-xl border border-line bg-white p-3.5 transition-shadow hover:shadow-card">
      <span
        className="grid size-10 shrink-0 place-items-center rounded-xl"
        style={{
          backgroundColor: hexToRgba(def.color, 0.12),
          color: def.color,
        }}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[13.5px] font-bold text-[#10233f]">
            {def.label}
          </p>
          <span className="shrink-0 rounded-full bg-[#f1f4f9] px-2 py-0.5 text-[10.5px] font-bold text-[#6b7a99]">
            {formatNumber(used)} uso(s)
          </span>
        </div>
        <p className="mt-0.5 text-[11.5px] leading-snug text-[#8a97b1]">
          {def.hint}
        </p>
        <p className="mt-1.5 truncate font-mono text-[11px] text-[#c2cde0]">
          ex.: {def.placeholder}
        </p>
        {clicks > 0 ? (
          <p className="mt-1 text-[11px] font-semibold text-success">
            {formatNumber(clicks)} clique(s) em 30 dias
          </p>
        ) : null}
      </div>
    </div>
  );
}
