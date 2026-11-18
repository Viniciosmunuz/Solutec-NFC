"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyButton({
  value,
  label = "Copiar",
  className,
  size = "md",
}: {
  value: string;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg font-semibold text-brand-700 transition-colors hover:bg-brand-50",
        size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-[13px]",
        className,
      )}
    >
      {copied ? (
        <Check className="size-3.5 text-success" />
      ) : (
        <Copy className="size-3.5" />
      )}
      {copied ? "Copiado!" : label}
    </button>
  );
}

export function Dropdown({
  items,
  trigger,
  align = "right",
}: {
  items: {
    label: string;
    icon?: React.ElementType;
    onClick?: () => void;
    href?: string;
    danger?: boolean;
    separatorBefore?: boolean;
  }[];
  trigger?: React.ReactNode;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const [spot, setSpot] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const MENU_WIDTH = 208; // w-52

  /**
   * Calcula onde o menu deve aparecer, em coordenadas da janela.
   *
   * O menu é renderizado em portal, fora da árvore do gatilho, porque dentro
   * de uma tabela com rolagem horizontal um menu posicionado por `absolute`
   * fica recortado pelo contêiner — e ainda faz surgir barras de rolagem.
   * Em portal com `fixed` ele ignora qualquer `overflow` de ancestral.
   */
  const place = () => {
    const el = ref.current?.firstElementChild as HTMLElement | undefined;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const left =
      align === "right"
        ? Math.max(8, r.right - MENU_WIDTH)
        : Math.min(r.left, window.innerWidth - MENU_WIDTH - 8);
    setSpot({ top: r.bottom + 6, left });
  };

  useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent) => {
      const alvo = e.target as Node;
      if (ref.current?.contains(alvo)) return;
      if (menuRef.current?.contains(alvo)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    // Rolou ou redimensionou: o menu ficaria solto do gatilho. Fecha.
    const onMove = () => setOpen(false);

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [open]);

  const menu = (
    <div
      ref={menuRef}
      role="menu"
      style={{ top: spot?.top ?? 0, left: spot?.left ?? 0, width: MENU_WIDTH }}
      className="fixed z-50 overflow-hidden rounded-xl border border-line bg-white p-1.5 shadow-pop animate-fade"
    >
          {items.map((item, i) => {
            const Icon = item.icon;
            const content = (
              <>
                {Icon ? <Icon className="size-4" /> : null}
                {item.label}
              </>
            );
            const className = cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
              item.danger
                ? "text-danger hover:bg-danger-soft"
                : "text-[#3b4a68] hover:bg-brand-50 hover:text-brand-700",
            );
            return (
              <div key={item.label}>
                {item.separatorBefore && i > 0 ? (
                  <div className="my-1 h-px bg-line" />
                ) : null}
                {item.href ? (
                  <a href={item.href} className={className} onClick={() => setOpen(false)}>
                    {content}
                  </a>
                ) : (
                  <button
                    type="button"
                    role="menuitem"
                    className={className}
                    onClick={() => {
                      setOpen(false);
                      item.onClick?.();
                    }}
                  >
                    {content}
                  </button>
                )}
              </div>
            );
          })}
    </div>
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Mais ações"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          if (!open) place();
          setOpen((v) => !v);
        }}
        className="grid size-9 place-items-center rounded-lg text-[#6b7a99] transition-colors hover:bg-[#f1f4f9] hover:text-[#10233f]"
      >
        {trigger ?? <MoreVertical className="size-4.5" />}
      </button>
      {open && spot ? createPortal(menu, document.body) : null}
    </div>
  );
}

export function Tabs({
  tabs,
  value,
  onChange,
}: {
  tabs: { value: string; label: string; count?: number }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-line no-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            "relative shrink-0 px-4 py-3 text-[13px] font-semibold transition-colors",
            value === tab.value
              ? "text-brand-700"
              : "text-[#8a97b1] hover:text-[#3b4a68]",
          )}
        >
          {tab.label}
          {typeof tab.count === "number" ? (
            <span className="ml-1.5 rounded-full bg-[#eef1f6] px-1.5 py-0.5 text-[11px] font-bold text-[#6b7a99]">
              {tab.count}
            </span>
          ) : null}
          {value === tab.value ? (
            <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-600" />
          ) : null}
        </button>
      ))}
    </div>
  );
}
