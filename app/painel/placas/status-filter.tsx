"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "todos", label: "Todas" },
  { value: "ativa", label: "Ativas" },
  { value: "producao", label: "Em produção" },
  { value: "inativa", label: "Inativas" },
] as const;

export default function StatusFilter({
  counts,
}: {
  counts: Record<string, number>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("status") ?? "todos";

  function select(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "todos") params.delete("status");
    else params.set("status", value);
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar">
      {OPTIONS.map((option) => {
        const active = current === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => select(option.value)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition-colors",
              active
                ? "bg-brand-600 text-white shadow-[0_4px_12px_rgba(27,84,176,0.3)]"
                : "bg-[#f1f4f9] text-[#6b7a99] hover:bg-brand-50 hover:text-brand-700",
            )}
          >
            {option.label}
            <span className={cn("ml-1.5", active ? "opacity-70" : "opacity-55")}>
              {counts[option.value] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
