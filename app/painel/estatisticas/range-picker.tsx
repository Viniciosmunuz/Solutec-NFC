"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarRange } from "lucide-react";
import { RANGES } from "@/lib/ranges";

export default function RangePicker() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("range") ?? "30d";

  return (
    <div className="relative">
      <CalendarRange className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8a97b1]" />
      <select
        aria-label="Período"
        value={current}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("range", e.target.value);
          router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }}
        className="h-10.5 cursor-pointer appearance-none rounded-xl border border-line bg-white pl-9 pr-9 text-[13px] font-semibold text-[#3b4a68] outline-none transition-all focus:border-brand-400 focus:ring-4 focus:ring-brand-500/12"
      >
        {RANGES.map((range) => (
          <option key={range.value} value={range.value}>
            {range.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8a97b1]">
        ▾
      </span>
    </div>
  );
}
