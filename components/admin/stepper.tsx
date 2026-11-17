"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Stepper({
  steps,
  current,
  onGoTo,
}: {
  steps: string[];
  current: number;
  onGoTo?: (index: number) => void;
}) {
  return (
    <ol className="flex items-start">
      {steps.map((label, index) => {
        const done = index < current;
        const active = index === current;
        const clickable = Boolean(onGoTo) && index <= current;

        return (
          <li key={label} className="flex min-w-0 flex-1 items-start">
            <div className="flex min-w-0 flex-1 flex-col items-center">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onGoTo?.(index)}
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-full border-2 text-[13px] font-bold transition-all",
                  done &&
                    "border-brand-600 bg-brand-600 text-white hover:brightness-110",
                  active &&
                    "border-brand-600 bg-white text-brand-700 shadow-[0_0_0_4px_rgba(27,84,176,0.14)]",
                  !done && !active && "border-[#d2dae8] bg-white text-[#9aa7bf]",
                  clickable && "cursor-pointer",
                )}
              >
                {done ? <Check className="size-4" strokeWidth={3} /> : index + 1}
              </button>
              <span
                className={cn(
                  "mt-2 w-full truncate px-1 text-center text-[12px] font-semibold",
                  active ? "text-brand-700" : done ? "text-[#3b4a68]" : "text-[#9aa7bf]",
                )}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <div
                className={cn(
                  "mt-[18px] h-0.5 w-full min-w-3 flex-1 rounded-full transition-colors",
                  index < current ? "bg-brand-600" : "bg-[#e6eaf2]",
                )}
                style={{ marginLeft: -8, marginRight: -8 }}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
