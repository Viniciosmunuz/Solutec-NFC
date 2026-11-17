"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMounted } from "@/lib/use-mounted";

type ToastTone = "success" | "error" | "info";

type Toast = {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastContextValue = {
  toast: (
    title: string,
    options?: { description?: string; tone?: ToastTone },
  ) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast precisa estar dentro de <ToastProvider>");
  return ctx;
}

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const mounted = useIsMounted();

  const remove = useCallback(
    (id: number) => setToasts((t) => t.filter((x) => x.id !== id)),
    [],
  );

  const toast = useCallback<ToastContextValue["toast"]>(
    (title, options) => {
      const id = ++counter;
      setToasts((t) => [
        ...t,
        { id, title, description: options?.description, tone: options?.tone ?? "info" },
      ]);
      setTimeout(() => remove(id), 4500);
    },
    [remove],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toast,
      success: (title, description) => toast(title, { description, tone: "success" }),
      error: (title, description) => toast(title, { description, tone: "error" }),
    }),
    [toast],
  );

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  };
  const tones = {
    success: "text-success",
    error: "text-danger",
    info: "text-brand-600",
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted
        ? createPortal(
            <div className="pointer-events-none fixed bottom-4 right-4 z-200 flex w-[min(92vw,360px)] flex-col gap-2.5">
              {toasts.map((t) => {
                const Icon = icons[t.tone];
                return (
                  <div
                    key={t.id}
                    className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-line bg-white p-3.5 shadow-pop animate-in-up"
                  >
                    <Icon className={cn("mt-0.5 size-5 shrink-0", tones[t.tone])} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#10233f]">
                        {t.title}
                      </p>
                      {t.description ? (
                        <p className="mt-0.5 text-[13px] leading-snug text-[#6b7a99]">
                          {t.description}
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      aria-label="Fechar aviso"
                      onClick={() => remove(t.id)}
                      className="-mr-1 -mt-1 grid size-7 place-items-center rounded-lg text-[#9aa7bf] transition-colors hover:bg-[#f1f4f9]"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>,
            document.body,
          )
        : null}
    </ToastContext.Provider>
  );
}
