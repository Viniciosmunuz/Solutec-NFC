import Link from "next/link";
import { CreditCard, Plus } from "lucide-react";
import PageHeader from "@/components/admin/page-header";
import SearchInput from "@/components/admin/search-input";
import BoardsTable from "./boards-table";
import StatusFilter from "./status-filter";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/display";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export const metadata = { title: "Minhas Placas" };

const PER_PAGE = 20;

export default async function PlacasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  await requireSession();
  const { q, status, page } = await searchParams;

  const current = Math.max(1, Number(page) || 1);
  const term = q?.trim();
  const statusFilter =
    status && ["ativa", "inativa", "producao"].includes(status) ? status : undefined;

  const where = {
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(term
      ? {
          OR: [
            { name: { contains: term } },
            { slug: { contains: term } },
            { code: { contains: term } },
            { client: { name: { contains: term } } },
            { client: { company: { contains: term } } },
            { customization: { displayName: { contains: term } } },
          ],
        }
      : {}),
  };

  const [boards, total, counts] = await Promise.all([
    db.board.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (current - 1) * PER_PAGE,
      take: PER_PAGE,
      include: {
        client: { select: { id: true, name: true, company: true } },
        template: { select: { name: true } },
        customization: { select: { displayName: true, avatarUrl: true } },
        _count: { select: { visits: true, clicks: true } },
      },
    }),
    db.board.count({ where }),
    db.board.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const byStatus = Object.fromEntries(
    counts.map((c) => [c.status, c._count._all]),
  ) as Record<string, number>;
  const totalAll = counts.reduce((s, c) => s + c._count._all, 0);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const qs = (extra: Record<string, string>) =>
    `/painel/placas?${new URLSearchParams({
      ...(term ? { q: term } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
      ...extra,
    })}`;

  return (
    <>
      <PageHeader
        title="Minhas Placas"
        description={
          totalAll === 0
            ? "Cadastre a primeira placa NFC da operação."
            : `${totalAll} placa${totalAll === 1 ? "" : "s"} no sistema.`
        }
        action={
          <ButtonLink href="/painel/placas/nova">
            <Plus className="size-4" />
            Nova placa
          </ButtonLink>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-line p-4">
          <div className="flex flex-wrap items-center gap-3">
            <SearchInput
              placeholder="Buscar por nome, cliente, código ou URL..."
              className="min-w-[240px] flex-1"
            />
          </div>
          <StatusFilter
            counts={{
              todos: totalAll,
              ativa: byStatus.ativa ?? 0,
              producao: byStatus.producao ?? 0,
              inativa: byStatus.inativa ?? 0,
            }}
          />
        </div>

        {boards.length === 0 ? (
          term || statusFilter ? (
            <EmptyState
              icon={CreditCard}
              title="Nenhuma placa encontrada"
              description="Ajuste a busca ou o filtro de status."
            />
          ) : (
            <EmptyState
              icon={CreditCard}
              title="Nenhuma placa cadastrada"
              description="Crie a primeira placa: escolha o cliente, o template, personalize e publique."
              action={
                <ButtonLink href="/painel/placas/nova">
                  <Plus className="size-4" />
                  Criar primeira placa
                </ButtonLink>
              }
            />
          )
        ) : (
          <BoardsTable boards={boards} />
        )}

        {totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-line px-5 py-3.5 text-[13px]">
            <p className="text-[#8a97b1]">
              Página {current} de {totalPages}
            </p>
            <div className="flex gap-2">
              {current > 1 ? (
                <Link
                  href={qs({ page: String(current - 1) })}
                  className="rounded-lg border border-line px-3 py-1.5 font-semibold text-[#3b4a68] transition-colors hover:border-brand-300 hover:bg-brand-50"
                >
                  Anterior
                </Link>
              ) : null}
              {current < totalPages ? (
                <Link
                  href={qs({ page: String(current + 1) })}
                  className="rounded-lg border border-line px-3 py-1.5 font-semibold text-[#3b4a68] transition-colors hover:border-brand-300 hover:bg-brand-50"
                >
                  Próxima
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </Card>
    </>
  );
}
