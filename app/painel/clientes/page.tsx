import Link from "next/link";
import { CreditCard, Users } from "lucide-react";
import PageHeader from "@/components/admin/page-header";
import SearchInput from "@/components/admin/search-input";
import ClientsTable, { NewClientButton } from "./clients-table";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/display";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export const metadata = { title: "Clientes" };

const PER_PAGE = 20;

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireSession();
  const { q, page } = await searchParams;

  const current = Math.max(1, Number(page) || 1);
  const term = q?.trim();

  const where = term
    ? {
        OR: [
          { name: { contains: term } },
          { company: { contains: term } },
          { email: { contains: term } },
          { phone: { contains: term } },
          { document: { contains: term } },
          { city: { contains: term } },
        ],
      }
    : {};

  const [clients, total] = await Promise.all([
    db.client.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (current - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { _count: { select: { boards: true } } },
    }),
    db.client.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <>
      <PageHeader
        title="Clientes"
        description={
          total === 0
            ? "Cadastre os clientes que compraram placas."
            : `${total} cliente${total === 1 ? "" : "s"} cadastrado${total === 1 ? "" : "s"}.`
        }
      />

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <SearchInput
            placeholder="Buscar por nome, empresa, e-mail, telefone ou cidade..."
            className="min-w-[240px] flex-1"
          />
          <NewClientButton />
        </div>

        {clients.length === 0 ? (
          term ? (
            <EmptyState
              icon={Users}
              title="Nenhum cliente encontrado"
              description={`Nada corresponde a "${term}". Tente outro termo.`}
            />
          ) : (
            <EmptyState
              icon={Users}
              title="Nenhum cliente cadastrado"
              description="Cadastre o primeiro cliente para depois vincular as placas a ele."
              action={<NewClientButton />}
            />
          )
        ) : (
          <ClientsTable clients={clients} />
        )}

        {totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-line px-5 py-3.5 text-[13px]">
            <p className="text-[#8a97b1]">
              Página {current} de {totalPages}
            </p>
            <div className="flex gap-2">
              <PageLink
                disabled={current <= 1}
                href={`/painel/clientes?${new URLSearchParams({ ...(term ? { q: term } : {}), page: String(current - 1) })}`}
              >
                Anterior
              </PageLink>
              <PageLink
                disabled={current >= totalPages}
                href={`/painel/clientes?${new URLSearchParams({ ...(term ? { q: term } : {}), page: String(current + 1) })}`}
              >
                Próxima
              </PageLink>
            </div>
          </div>
        ) : null}
      </Card>

      {total > 0 ? (
        <p className="mt-4 flex items-center gap-1.5 text-[13px] text-[#8a97b1]">
          <CreditCard className="size-3.5" />
          Clique em um cliente para ver as placas vinculadas a ele.
        </p>
      ) : null}
    </>
  );
}

function PageLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="cursor-not-allowed rounded-lg border border-line px-3 py-1.5 font-semibold text-[#c2cde0]">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="rounded-lg border border-line px-3 py-1.5 font-semibold text-[#3b4a68] transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
    >
      {children}
    </Link>
  );
}
