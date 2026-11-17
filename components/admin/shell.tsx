"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "@/components/admin/sidebar";
import { ToastProvider } from "@/components/ui/toast";
import { SolutecLogo } from "@/components/brand/logo";

export default function AdminShell({
  user,
  children,
}: {
  user: { name: string; email: string; role: string; avatarUrl?: string | null };
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-canvas">
        <Sidebar user={user} open={open} onClose={() => setOpen(false)} />

        {/* Barra superior apenas no mobile */}
        <div className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/85 px-4 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
            className="grid size-10 place-items-center rounded-xl text-[#3b4a68] transition-colors hover:bg-brand-50"
          >
            <Menu className="size-5" />
          </button>
          <SolutecLogo size={24} className="text-brand-600" />
        </div>

        <main className="lg:pl-[260px]">
          <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
