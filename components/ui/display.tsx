/**
 * Componentes de exibição sem estado nem eventos.
 *
 * Ficam fora de misc.tsx (que é "use client") de propósito: assim um Server
 * Component pode passar `icon={AlgumIcone}` para <EmptyState> sem cruzar a
 * fronteira server/client, que só aceita objetos simples.
 */

import { cn, initials } from "@/lib/utils";

export function Avatar({
  src,
  name,
  size = 40,
  square,
  className,
}: {
  src?: string | null;
  name: string;
  size?: number;
  square?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden bg-brand-100 font-bold text-brand-700",
        square ? "rounded-xl" : "rounded-full",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(11, size / 2.6) }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="size-full object-cover" />
      ) : (
        initials(name || "?")
      )}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
        <Icon className="size-7" />
      </div>
      <h3 className="mt-4 text-base font-bold text-[#10233f]">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-[#6b7a99]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
