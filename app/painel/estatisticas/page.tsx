import Link from "next/link";
import {
  BarChart3,
  Eye,
  MonitorSmartphone,
  MousePointerClick,
  Nfc,
  TrendingUp,
} from "lucide-react";
import PageHeader from "@/components/admin/page-header";
import AccessChart from "@/components/admin/access-chart";
import RangePicker from "./range-picker";
import StatCard from "@/components/admin/stat-card";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Avatar, EmptyState } from "@/components/ui/display";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import {
  deviceBreakdown,
  sourceBreakdown,
  timeSeries,
  topBoards,
  topLinks,
} from "@/lib/stats";
import { RANGES, rangeDays } from "@/lib/ranges";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Estatísticas" };

export default async function EstatisticasPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  await requireSession();
  const { range } = await searchParams;

  const selected = RANGES.find((r) => r.value === range)?.value ?? "30d";
  const days = rangeDays(selected);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [series, boards, links, devices, sources, visits, clicks, activeBoards] =
    await Promise.all([
      timeSeries({ days }),
      topBoards(days, 10),
      topLinks(days, undefined, 10),
      deviceBreakdown(days),
      sourceBreakdown(days),
      db.visit.count({ where: { createdAt: { gte: since } } }),
      db.click.count({ where: { createdAt: { gte: since } } }),
      db.board.count({ where: { status: "ativa" } }),
    ]);

  const label = RANGES.find((r) => r.value === selected)!.label.toLowerCase();
  const ctr = visits === 0 ? 0 : Math.round((clicks / visits) * 100);

  return (
    <>
      <PageHeader
        title="Estatísticas"
        description={`Desempenho das páginas públicas nos ${label.replace("últimos ", "últimos ")}.`}
        action={<RangePicker />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Acessos no período" value={visits} icon={Eye} tone="blue" />
        <StatCard
          label="Cliques no período"
          value={clicks}
          icon={MousePointerClick}
          tone="violet"
        />
        <StatCard
          label="Taxa de conversão"
          value={`${ctr}%`}
          icon={TrendingUp}
          tone="green"
          hint="Cliques por acesso"
        />
        <StatCard
          label="Placas ativas"
          value={activeBoards}
          icon={Nfc}
          tone="amber"
        />
      </div>

      <Card className="mt-4">
        <CardHeader
          title="Evolução dos acessos"
          description={RANGES.find((r) => r.value === selected)!.label}
        />
        <CardBody>
          <AccessChart data={series} height={320} />
        </CardBody>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader
            title="Acessos por placa"
            description="Ranking no período selecionado"
          />
          {boards.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="Sem acessos no período"
              description="Quando as páginas começarem a receber visitas, o ranking aparece aqui."
            />
          ) : (
            <ul className="divide-y divide-line">
              {boards.map((board, index) => {
                const max = boards[0].visits || 1;
                return (
                  <li key={board.id}>
                    <Link
                      href={`/painel/placas/${board.id}?tab=estatisticas`}
                      className="flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-[#fafbfd]"
                    >
                      <span className="w-5 shrink-0 text-center text-[13px] font-bold text-[#c2cde0]">
                        {index + 1}
                      </span>
                      <Avatar
                        src={board.customization?.avatarUrl}
                        name={board.customization?.displayName ?? board.name}
                        size={36}
                        square
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-[13.5px] font-semibold text-[#10233f]">
                            {board.name}
                          </p>
                          <StatusBadge status={board.status} />
                        </div>
                        <p className="truncate text-[11.5px] text-[#8a97b1]">
                          {board.client.name}
                        </p>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#eef1f6]">
                          <div
                            className="h-full rounded-full bg-brand-500"
                            style={{ width: `${(board.visits / max) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="shrink-0 text-right">
                        <span className="block text-[14px] font-bold text-[#10233f]">
                          {formatNumber(board.visits)}
                        </span>
                        <span className="block text-[10.5px] text-[#9aa7bf]">
                          acessos
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader title="Links mais acessados" />
            <CardBody>
              <Bars
                rows={links.map((l) => ({ label: l.label, value: l.clicks }))}
                empty="Nenhum clique no período."
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Dispositivos" />
            <CardBody>
              <Bars
                rows={devices.map((d) => ({ label: d.device, value: d.count }))}
                empty="Sem acessos no período."
                icon={MonitorSmartphone}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Origem do acesso"
              description="NFC, QR Code ou link direto"
            />
            <CardBody>
              <Bars
                rows={sources.map((s) => ({ label: s.source, value: s.count }))}
                empty="Sem acessos no período."
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}

function Bars({
  rows,
  empty,
}: {
  rows: { label: string; value: number }[];
  empty: string;
  icon?: React.ElementType;
}) {
  if (rows.length === 0) {
    return <p className="py-4 text-center text-[12.5px] text-[#9aa7bf]">{empty}</p>;
  }
  const total = rows.reduce((s, r) => s + r.value, 0) || 1;
  const max = Math.max(...rows.map((r) => r.value)) || 1;

  return (
    <ul className="flex flex-col gap-3">
      {rows.map((row) => (
        <li key={row.label}>
          <div className="flex items-baseline justify-between gap-2 text-[12.5px]">
            <span className="truncate font-medium text-[#3b4a68]">{row.label}</span>
            <span className="shrink-0 text-[#8a97b1]">
              <strong className="text-[#10233f]">{formatNumber(row.value)}</strong>{" "}
              · {Math.round((row.value / total) * 100)}%
            </span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#eef1f6]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
              style={{ width: `${(row.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
