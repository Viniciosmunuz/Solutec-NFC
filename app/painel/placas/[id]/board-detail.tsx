"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  Download,
  ExternalLink,
  Eye,
  LayoutTemplate,
  Link2,
  MousePointerClick,
  Nfc,
  Pencil,
  Power,
  PowerOff,
  QrCode,
  Trash2,
  User,
} from "lucide-react";
import PhonePreview from "@/components/admin/phone-preview";
import AccessChart from "@/components/admin/access-chart";
import PublicPage, {
  type PublicCustomization,
} from "@/components/public/PublicPage";
import { Card, CardBody } from "@/components/ui/card";
import { Button, ButtonLink } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { CopyButton, Tabs } from "@/components/ui/misc";
import { Avatar } from "@/components/ui/display";
import { ConfirmDialog } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { deleteBoard, setBoardStatus } from "@/lib/actions/boards";
import { getLinkType } from "@/lib/links";
import { categoryLabel } from "@/lib/templates";
import { displayUrl, publicUrl } from "@/lib/urls";
import { formatDateTime, formatNumber, hexToRgba } from "@/lib/utils";

type LinkRow = {
  id: string;
  type: string;
  label: string;
  value: string;
  url: string;
  active: boolean;
  asSocial: boolean;
};

type Board = {
  id: string;
  code: string;
  slug: string;
  name: string;
  status: string;
  notes: string | null;
  createdAt: Date;
  client: {
    id: string;
    name: string;
    company: string | null;
    phone: string | null;
    email: string | null;
  };
  template: { key: string; name: string; category: string };
  customization: PublicCustomization;
  links: LinkRow[];
  createdBy: string | null;
};

type Stats = {
  visits: number;
  clicks: number;
  visitsPeriod: number;
  clicksPeriod: number;
  ctr: number;
  series: { date: string; visits: number; clicks: number }[];
  links: { label: string; type: string; clicks: number }[];
  devices: { device: string; count: number }[];
  sources: { source: string; count: number }[];
};

export default function BoardDetail({
  board,
  stats,
  initialTab,
  justCreated,
}: {
  board: Board;
  stats: Stats;
  initialTab: string;
  justCreated: boolean;
}) {
  const router = useRouter();
  const { success, error } = useToast();
  const [tab, setTab] = useState(initialTab);
  const [deleting, setDeleting] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [working, setWorking] = useState(false);

  const url = publicUrl(board.slug);
  const activeLinks = board.links.filter((l) => l.active);

  async function toggle() {
    setWorking(true);
    const next = board.status === "ativa" ? "inativa" : "ativa";
    const result = await setBoardStatus(board.id, next);
    setWorking(false);
    if (!result.ok) {
      error("Não foi possível alterar o status", result.error);
      return;
    }
    success(next === "ativa" ? "Placa ativada" : "Placa desativada");
    router.refresh();
  }

  async function confirmDelete() {
    setRemoving(true);
    const result = await deleteBoard(board.id);
    setRemoving(false);
    if (!result.ok) {
      error("Não foi possível excluir", result.error);
      return;
    }
    success("Placa excluída");
    router.push("/painel/placas");
  }

  return (
    <>
      {justCreated ? (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-success/20 bg-success-soft px-4 py-3.5">
          <Nfc className="size-5 shrink-0 text-success" />
          <p className="min-w-0 flex-1 text-[13.5px] font-medium text-[#0b6b3e]">
            Placa criada! Grave esta URL no chip:{" "}
            <span className="font-mono font-bold">{displayUrl(board.slug)}</span>
          </p>
          <CopyButton value={url} />
        </div>
      ) : null}

      {/* Ações principais */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <ButtonLink href={`/painel/placas/${board.id}/editar`}>
          <Pencil className="size-4" />
          Editar
        </ButtonLink>
        <ButtonLink href={`/p/${board.slug}`} target="_blank" variant="secondary">
          <ExternalLink className="size-4" />
          Ver página
        </ButtonLink>
        <Button variant="secondary" onClick={toggle} loading={working}>
          {board.status === "ativa" ? (
            <>
              <PowerOff className="size-4" />
              Desativar
            </>
          ) : (
            <>
              <Power className="size-4" />
              Ativar
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          onClick={() => setDeleting(true)}
          className="text-danger hover:bg-danger-soft hover:text-danger"
        >
          <Trash2 className="size-4" />
          Excluir
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="overflow-hidden">
          <div className="px-5 pt-1">
            <Tabs
              value={tab}
              onChange={setTab}
              tabs={[
                { value: "informacoes", label: "Informações" },
                { value: "links", label: "Links", count: board.links.length },
                { value: "estatisticas", label: "Estatísticas" },
                { value: "qrcode", label: "QR Code" },
              ]}
            />
          </div>

          {/* ---------- Informações ---------- */}
          {tab === "informacoes" ? (
            <CardBody className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-[#fafbfd] p-4">
                <Avatar
                  src={board.customization.avatarUrl}
                  name={board.customization.displayName}
                  size={64}
                  square
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[16px] font-bold text-[#10233f]">
                      {board.customization.displayName}
                    </p>
                    <StatusBadge status={board.status} />
                  </div>
                  {board.customization.headline ? (
                    <p className="text-[13px] text-[#6b7a99]">
                      {board.customization.headline}
                    </p>
                  ) : null}
                  <p className="mt-1 font-mono text-[11.5px] text-[#9aa7bf]">
                    Código da placa: {board.code}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Info2
                  icon={User}
                  label="Cliente"
                  value={
                    <Link
                      href={`/painel/clientes/${board.client.id}`}
                      className="font-semibold text-brand-700 hover:underline"
                    >
                      {board.client.company ?? board.client.name}
                    </Link>
                  }
                />
                <Info2
                  icon={LayoutTemplate}
                  label="Template"
                  value={`${board.template.name} · ${categoryLabel(board.template.category)}`}
                />
                <Info2
                  icon={CalendarDays}
                  label="Criada em"
                  value={`${formatDateTime(board.createdAt)}${board.createdBy ? ` por ${board.createdBy}` : ""}`}
                />
                <Info2
                  icon={Link2}
                  label="Links"
                  value={`${activeLinks.length} ativo(s) de ${board.links.length}`}
                />
              </div>

              <div className="rounded-2xl border border-line p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#9aa7bf]">
                  URL da placa (permanente)
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <code className="min-w-0 flex-1 truncate rounded-lg bg-[#f1f4f9] px-3 py-2 font-mono text-[12.5px] text-[#3b4a68]">
                    {url}
                  </code>
                  <CopyButton value={url} />
                </div>
                <p className="mt-2 flex items-start gap-1.5 text-[12px] leading-relaxed text-[#8a97b1]">
                  <Nfc className="mt-px size-3.5 shrink-0" />
                  Editar design, links ou status não altera este endereço — o chip
                  gravado continua válido para sempre.
                </p>
              </div>

              {board.notes ? (
                <div className="rounded-2xl bg-warning-soft p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-warning">
                    Observações
                  </p>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-[#6b4a12]">
                    {board.notes}
                  </p>
                </div>
              ) : null}
            </CardBody>
          ) : null}

          {/* ---------- Links ---------- */}
          {tab === "links" ? (
            board.links.length === 0 ? (
              <CardBody>
                <p className="py-10 text-center text-sm text-[#8a97b1]">
                  Nenhum link cadastrado nesta placa.
                </p>
              </CardBody>
            ) : (
              <ul className="divide-y divide-line">
                {board.links.map((link) => {
                  const def = getLinkType(link.type);
                  const Icon = def.icon;
                  const clicks =
                    stats.links.find((l) => l.label === link.label)?.clicks ?? 0;
                  return (
                    <li
                      key={link.id}
                      className="flex items-center gap-3 px-5 py-3.5"
                    >
                      <span
                        className="grid size-9 shrink-0 place-items-center rounded-lg"
                        style={{
                          backgroundColor: hexToRgba(def.color, 0.12),
                          color: def.color,
                        }}
                      >
                        <Icon className="size-[18px]" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-semibold text-[#10233f]">
                          {link.label}
                          {link.asSocial ? (
                            <span className="ml-2 rounded-full bg-[#eef1f6] px-2 py-0.5 text-[10px] font-bold text-[#6b7a99]">
                              SOCIAL
                            </span>
                          ) : null}
                        </p>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate font-mono text-[11.5px] text-[#9aa7bf] hover:text-brand-600 hover:underline"
                        >
                          {link.url}
                        </a>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[13px] font-bold text-[#10233f]">
                          {formatNumber(clicks)}
                        </p>
                        <p className="text-[10.5px] text-[#9aa7bf]">cliques/30d</p>
                      </div>
                      {!link.active ? (
                        <span className="shrink-0 rounded-full bg-[#eef1f6] px-2 py-1 text-[10px] font-bold text-[#8a97b1]">
                          INATIVO
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )
          ) : null}

          {/* ---------- Estatísticas ---------- */}
          {tab === "estatisticas" ? (
            <CardBody className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MiniStat icon={Eye} label="Acessos (total)" value={stats.visits} />
                <MiniStat icon={Eye} label="Acessos (30d)" value={stats.visitsPeriod} />
                <MiniStat
                  icon={MousePointerClick}
                  label="Cliques (30d)"
                  value={stats.clicksPeriod}
                />
                <MiniStat
                  icon={BarChart3}
                  label="Conversão"
                  value={`${stats.ctr}%`}
                />
              </div>

              <div>
                <p className="mb-2 text-[13px] font-bold text-[#10233f]">
                  Evolução nos últimos 30 dias
                </p>
                <AccessChart data={stats.series} height={240} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Breakdown
                  title="Links mais clicados"
                  rows={stats.links.map((l) => ({ label: l.label, value: l.clicks }))}
                  empty="Nenhum clique ainda."
                />
                <div className="flex flex-col gap-4">
                  <Breakdown
                    title="Dispositivos"
                    rows={stats.devices.map((d) => ({
                      label: d.device,
                      value: d.count,
                    }))}
                    empty="Sem acessos ainda."
                  />
                  <Breakdown
                    title="Origem do acesso"
                    rows={stats.sources.map((s) => ({
                      label: s.source,
                      value: s.count,
                    }))}
                    empty="Sem acessos ainda."
                  />
                </div>
              </div>
            </CardBody>
          ) : null}

          {/* ---------- QR Code ---------- */}
          {tab === "qrcode" ? (
            <CardBody className="flex flex-col items-center gap-5 py-8">
              <div className="rounded-3xl border border-line bg-white p-5 shadow-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/p/${board.slug}/qrcode?size=640`}
                  alt={`QR Code de ${board.name}`}
                  className="size-64"
                />
              </div>
              <div className="text-center">
                <p className="font-mono text-[13px] text-[#3b4a68]">{url}</p>
                <p className="mt-1 text-[12.5px] text-[#8a97b1]">
                  Aponta para a mesma página da aproximação NFC.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <ButtonLink
                  href={`/api/p/${board.slug}/qrcode?size=1024&download=1`}
                  variant="secondary"
                >
                  <Download className="size-4" />
                  PNG 1024px
                </ButtonLink>
                <ButtonLink
                  href={`/api/p/${board.slug}/qrcode?format=svg&download=1`}
                  variant="secondary"
                >
                  <Download className="size-4" />
                  SVG (impressão)
                </ButtonLink>
                <CopyButton value={url} label="Copiar URL" />
              </div>

              <div className="flex max-w-md items-start gap-2.5 rounded-xl bg-brand-50 p-3.5 text-[12.5px] leading-relaxed text-brand-800">
                <QrCode className="mt-px size-4 shrink-0" />
                <p>
                  Para gravar o chip NFC use exatamente{" "}
                  <span className="font-mono font-bold">{url}</span>. Opcionalmente
                  acrescente <span className="font-mono">?s=nfc</span> para separar
                  nas estatísticas os acessos por aproximação dos acessos por QR
                  Code.
                </p>
              </div>
            </CardBody>
          ) : null}
        </Card>

        {/* Preview */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <PhonePreview url={displayUrl(board.slug)}>
            <PublicPage
              templateKey={board.template.key}
              custom={board.customization}
              links={activeLinks.map((l) => ({
                id: l.id,
                type: l.type,
                label: l.label,
                url: l.url,
                asSocial: l.asSocial,
              }))}
              preview
            />
          </PhonePreview>
        </div>
      </div>

      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        onConfirm={confirmDelete}
        loading={removing}
        title="Excluir placa"
        confirmLabel="Excluir definitivamente"
        message={
          <>
            Isso apaga a personalização, os links e todo o histórico de acessos de{" "}
            <strong className="text-[#10233f]">{board.name}</strong>. A URL{" "}
            <span className="font-mono text-[12px]">/p/{board.slug}</span> deixará
            de funcionar e a placa física ficará sem destino.
            <br />
            <br />
            Para apenas tirar do ar, use <strong>Desativar</strong>.
          </>
        }
      />
    </>
  );
}

function Info2({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-line p-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#9aa7bf]">
          {label}
        </p>
        <div className="mt-0.5 truncate text-[13px] text-[#3b4a68]">{value}</div>
      </div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border border-line p-3">
      <Icon className="size-4 text-brand-500" />
      <p className="mt-2 text-[19px] font-bold leading-none text-[#10233f]">
        {typeof value === "number" ? formatNumber(value) : value}
      </p>
      <p className="mt-1 text-[11px] font-semibold text-[#8a97b1]">{label}</p>
    </div>
  );
}

function Breakdown({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: { label: string; value: number }[];
  empty: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="rounded-2xl border border-line p-4">
      <p className="mb-3 text-[13px] font-bold text-[#10233f]">{title}</p>
      {rows.length === 0 ? (
        <p className="py-3 text-[12.5px] text-[#9aa7bf]">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {rows.map((row) => (
            <li key={row.label}>
              <div className="flex items-center justify-between gap-2 text-[12.5px]">
                <span className="truncate font-medium text-[#3b4a68]">
                  {row.label}
                </span>
                <span className="shrink-0 font-bold text-[#10233f]">
                  {formatNumber(row.value)}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#eef1f6]">
                <div
                  className="h-full rounded-full bg-brand-500"
                  style={{ width: `${(row.value / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
