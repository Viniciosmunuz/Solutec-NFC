"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";

/** Busca que escreve na URL (?q=) com debounce — mantém o estado ao recarregar. */
export default function SearchInput({
  placeholder = "Buscar...",
  paramName = "q",
  className,
}: {
  placeholder?: string;
  paramName?: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const current = searchParams.get(paramName) ?? "";
  const [value, setValue] = useState(current);

  // Se a URL mudar por fora (voltar/avançar, limpar filtro), o campo acompanha.
  // Ajuste durante a renderização — é o padrão recomendado para estado
  // derivado de prop, e evita o render extra de um useEffect.
  const [lastFromUrl, setLastFromUrl] = useState(current);
  if (current !== lastFromUrl) {
    setLastFromUrl(current);
    setValue(current);
  }

  useEffect(() => {
    if (value === current) return;
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(paramName, value);
      else params.delete(paramName);
      params.delete("page");
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className={className}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9aa7bf]" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-11 w-full rounded-xl border border-line bg-white pl-10 pr-10 text-sm text-[#10233f] placeholder:text-[#9aa7bf] outline-none transition-all focus:border-brand-400 focus:ring-4 focus:ring-brand-500/12"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          {pending ? (
            <Loader2 className="size-4 animate-spin text-brand-500" />
          ) : value ? (
            <button
              type="button"
              aria-label="Limpar busca"
              onClick={() => setValue("")}
              className="grid size-5 place-items-center rounded-full text-[#9aa7bf] hover:bg-[#f1f4f9] hover:text-[#10233f]"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </span>
      </div>
    </div>
  );
}
