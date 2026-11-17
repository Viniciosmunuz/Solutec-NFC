"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  LayoutTemplate,
  Link2,
  LogOut,
  Settings,
  Users,
  X,
} from "lucide-react";
import { SolutecLogo } from "@/components/brand/logo";
import { Avatar } from "@/components/ui/display";
import { signOut } from "@/app/login/actions";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/painel", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/painel/placas", label: "Minhas Placas", icon: CreditCard },
  { href: "/painel/clientes", label: "Clientes", icon: Users },
  { href: "/painel/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/painel/links", label: "Links", icon: Link2 },
  { href: "/painel/estatisticas", label: "Estatísticas", icon: BarChart3 },
  { href: "/painel/configuracoes", label: "Configurações", icon: Settings },
];

export default function Sidebar({
  user,
  open,
  onClose,
}: {
  user: { name: string; email: string; role: string; avatarUrl?: string | null };
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const isActive = (item: (typeof NAV)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-40 bg-[#0e2143]/50 backdrop-blur-[2px] lg:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-nav transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Marca */}
        <div className="flex h-[72px] shrink-0 items-center justify-between px-5">
          <Link href="/painel" className="text-white">
            <SolutecLogo size={28} tagline="Placas NFC" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="grid size-9 place-items-center rounded-lg text-white/60 hover:bg-white/10 lg:hidden"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <p className="px-3 pb-2 pt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
            Menu
          </p>
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => {
              const active = isActive(item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition-all duration-150",
                      active
                        ? "bg-brand-600 text-white shadow-[0_6px_18px_rgba(27,84,176,0.45)]"
                        : "text-white/55 hover:bg-white/[0.07] hover:text-white",
                    )}
                  >
                    <item.icon
                      className={cn(
                        "size-[18px] shrink-0 transition-transform",
                        !active && "group-hover:scale-110",
                      )}
                      strokeWidth={active ? 2.4 : 2}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Usuário */}
        <div className="shrink-0 border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <Avatar
              src={user.avatarUrl}
              name={user.name}
              size={36}
              className="bg-brand-600 text-white"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-white">
                {user.name}
              </p>
              <p className="truncate text-[11px] capitalize text-white/40">
                {user.role === "admin" ? "Administrador" : "Operador"}
              </p>
            </div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold text-white/55 transition-colors hover:bg-white/[0.07] hover:text-white"
            >
              <LogOut className="size-[18px]" />
              Sair
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
