"use client";

import { useEffect, useRef, useState } from "react";
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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Mais ações"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="grid size-9 place-items-center rounded-lg text-[#6b7a99] transition-colors hover:bg-[#f1f4f9] hover:text-[#10233f]"
      >
        {trigger ?? <MoreVertical className="size-4.5" />}
      </button>
      {open ? (
        <div
          role="menu"
          className={cn(
            "absolute z-50 mt-1.5 w-52 overflow-hidden rounded-xl border border-line bg-white p-1.5 shadow-pop animate-fade",
            align === "right" ? "right-0" : "left-0",
          )}
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
      ) : null}
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
