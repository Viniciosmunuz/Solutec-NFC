import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  CreditCard,
  Eye,
  FileText,
  Mail,
  MapPin,
  Phone,
  Plus,
  Receipt,
} from "lucide-react";
import PageHeader from "@/components/admin/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Avatar, EmptyState } from "@/components/ui/display";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { formatDate, formatNumber } from "@/lib/utils";
import { displayUrl } from "@/lib/urls";
import EditClientButton from "./edit-client-button";

export default async function ClienteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;

  const client = await db.client.findUnique({
    where: { id },
    include: {
      boards: {
        orderBy: { createdAt: "desc" },
        include: {
          template: { select: { name: true } },
          customization: { select: { displayName: true, avatarUrl: true } },
          _count: { select: { visits: true, clicks: true } },
        },
      },
    },
  });

  if (!client) notFound();

  const totalVisits = client.boards.reduce((s, b) => s + b._count.visits, 0);
  const totalClicks = client.boards.reduce((s, b) => s + b._count.clicks, 0);

  const address = [
    client.address,
    client.number,
    client.district,
    client.city && client.state ? `${client.city}/${client.state}` : client.city,
    client.zip,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <PageHeader
        backHref="/painel/clientes"
        eyebrow="Cliente"
        title={client.name}
        description={client.company ?? undefined}
        action={
          <>
            <EditClientButton
              client={{
                id: client.id,
                name: client.name,
                company: client.company ?? "",
                email: client.email ?? "",
                phone: client.phone ?? "",
                document: client.document ?? "",
                zip: client.zip ?? "",
                address: client.address ?? "",
                number: client.number ?? "",
                district: client.district ?? "",
                city: client.city ?? "",
                state: client.state ?? "",
                notes: client.notes ?? "",
              }}
            />
            <ButtonLink href={`/painel/placas/nova?cliente=${client.id}`}>
              <Plus className="size-4" />
              Nova placa
            </ButtonLink>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Dados */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardBody className="flex flex-col items-center gap-3 py-7 text-center">
              <Avatar name={client.name} size={72} />
              <div>
                <p className="text-[17px] font-bold text-[#10233f]">
                  {client.name}
                </p>
                {client.company ? (
                  <p className="mt-0.5 flex items-center justify-center gap-1 text-[13px] text-[#6b7a99]">
                    <Building2 className="size-3.5" />
                    {client.company}
                  </p>
                ) : null}
              </div>
              <p className="text-[12px] text-[#9aa7bf]">
                Cliente desde {formatDate(client.createdAt)}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Dados de contato" />
            <CardBody className="flex flex-col gap-3.5">
              <Info icon={Phone} label="Telefone" value={client.phone} />
              <Info icon={Mail} label="E-mail" value={client.email} />
              <Info icon={Receipt} label="CPF / CNPJ" value={client.document} />
              <Info icon={MapPin} label="Endereço" value={address || null} />
              <Info icon={FileText} label="Observações" value={client.notes} />
            </CardBody>
          </Card>

          <div className="grid grid-cols-3 gap-3">
            <MiniStat label="Placas" value={client.boards.length} />
            <MiniStat label="Acessos" value={totalVisits} />
            <MiniStat label="Cliques" value={totalClicks} />
          </div>
        </div>

        {/* Placas */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Placas do cliente"
            description={`${client.boards.length} placa(s) vinculada(s)`}
          />
          {client.boards.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="Nenhuma placa ainda"
              description="Crie a primeira placa NFC deste cliente."
              action={
                <ButtonLink href={`/painel/placas/nova?cliente=${client.id}`}>
                  <Plus className="size-4" />
                  Criar placa
                </ButtonLink>
              }
            />
          ) : (
            <ul className="divide-y divide-line">
              {client.boards.map((board) => (
                <li key={board.id}>
                  <div className="flex items-center gap-3.5 px-5 py-4 transition-colors hover:bg-[#fafbfd]">
                    <Avatar
                      src={board.customization?.avatarUrl}
                      name={board.customization?.displayName ?? board.name}
                      size={44}
                      square
                    />
                    <Link href={`/painel/placas/${board.id}`} className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[14px] font-semibold text-[#10233f]">
                          {board.name}
                        </p>
                        <StatusBadge status={board.status} />
                      </div>
                      <p className="mt-0.5 truncate font-mono text-[11.5px] text-[#8a97b1]">
                        {displayUrl(board.slug)}
                      </p>
                      <p className="mt-1 text-[12px] text-[#6b7a99]">
                        {board.template.name} ·{" "}
                        {formatNumber(board._count.visits)} acessos ·{" "}
                        {formatNumber(board._count.clicks)} cliques
                      </p>
                    </Link>
                    <a
                      href={`/p/${board.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Abrir página pública"
                      className="grid size-9 shrink-0 place-items-center rounded-lg text-[#8a97b1] transition-colors hover:bg-brand-50 hover:text-brand-700"
                    >
                      <Eye className="size-4.5" />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-[#f1f4f9] text-[#6b7a99]">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#9aa7bf]">
          {label}
        </p>
        <p className="mt-0.5 break-words text-[13.5px] text-[#3b4a68]">
          {value || <span className="text-[#c2cde0]">Não informado</span>}
        </p>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-line bg-white p-3 text-center shadow-card">
      <p className="text-[19px] font-bold leading-tight text-[#10233f]">
        {formatNumber(value)}
      </p>
      <p className="mt-0.5 text-[11px] font-semibold text-[#8a97b1]">{label}</p>
    </div>
  );
}
