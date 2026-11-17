"use client";

import { Signal, Wifi, BatteryFull } from "lucide-react";

/**
 * Moldura de smartphone. O conteúdo é exatamente o mesmo componente que
 * renderiza a página pública, então o que o operador vê aqui é o que sai.
 */
export default function PhonePreview({
  children,
  url,
}: {
  children: React.ReactNode;
  url?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-[300px] shrink-0">
        {/* corpo */}
        <div className="relative overflow-hidden rounded-[42px] bg-[#0e2143] p-[10px] shadow-float ring-1 ring-black/10">
          <div className="relative h-[600px] overflow-hidden rounded-[33px] bg-white">
            {/* barra de status */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex h-11 items-center justify-between px-6 text-[11px] font-semibold text-white mix-blend-difference">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <Signal className="size-3" />
                <Wifi className="size-3" />
                <BatteryFull className="size-3.5" />
              </div>
            </div>
            {/* ilha dinâmica */}
            <div className="pointer-events-none absolute left-1/2 top-2 z-30 h-6 w-[88px] -translate-x-1/2 rounded-full bg-[#0e2143]" />

            <div className="no-scrollbar h-full overflow-y-auto">
              <div className="min-h-full pt-11">{children}</div>
            </div>
          </div>
        </div>
      </div>

      {url ? (
        <p className="max-w-[300px] truncate rounded-full bg-[#eef1f6] px-3 py-1.5 text-center font-mono text-[11px] text-[#6b7a99]">
          {url}
        </p>
      ) : null}
    </div>
  );
}
