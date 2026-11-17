"use client";

import { Check } from "lucide-react";
import { COLOR_PRESETS } from "@/lib/templates";
import { cn } from "@/lib/utils";

export default function ColorPicker({
  label,
  value,
  onChange,
  presets = COLOR_PRESETS,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  presets?: string[];
}) {
  const normalized = value.toLowerCase();
  const list = presets.includes(normalized.toUpperCase())
    ? presets
    : [...presets];

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] font-semibold text-[#3b4a68]">{label}</span>
      <div className="flex flex-wrap items-center gap-2">
        {list.map((hex) => {
          const active = hex.toLowerCase() === normalized;
          return (
            <button
              key={hex}
              type="button"
              aria-label={`Usar a cor ${hex}`}
              onClick={() => onChange(hex)}
              className={cn(
                "grid size-8 place-items-center rounded-full transition-transform hover:scale-110",
                active && "ring-2 ring-offset-2",
              )}
              style={{
                backgroundColor: hex,
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.08)",
                ...(active ? { "--tw-ring-color": hex } as React.CSSProperties : {}),
              }}
            >
              {active ? (
                <Check className="size-4 text-white drop-shadow" strokeWidth={3} />
              ) : null}
            </button>
          );
        })}

        <label className="relative grid size-8 cursor-pointer place-items-center overflow-hidden rounded-full border border-dashed border-[#c2cde0] bg-white text-[10px] font-bold text-[#8a97b1] transition-colors hover:border-brand-400 hover:text-brand-600">
          <span
            className="absolute inset-0"
            style={{
              backgroundImage:
                "conic-gradient(#d93b3b,#d98300,#0f9d58,#1596a3,#1b54b0,#6b4fd8,#c2557f,#d93b3b)",
              opacity: 0.85,
            }}
          />
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label={`${label}: escolher cor personalizada`}
          />
        </label>

        <span className="ml-1 rounded-lg bg-[#f1f4f9] px-2 py-1 font-mono text-[11px] font-semibold uppercase text-[#6b7a99]">
          {value}
        </span>
      </div>
    </div>
  );
}
