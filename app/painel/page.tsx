import Link from "next/link";
import {
  Activity as ActivityIcon,
  ArrowRight,
  CreditCard,
  MousePointerClick,
  Plus,
  Eye,
  Users,
  Wifi,
  WifiOff,
  Wrench,
} from "lucide-react";
import PageHeader from "@/components/admin/page-header";
import StatCard from "@/components/admin/stat-card";
import AccessChart from "@/components/admin/access-chart";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Avatar, EmptyState } from "@/components/ui/display";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { dashboardSummary, timeSeries } from "@/lib/stats";
import { formatNumber, timeAgo } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await requireSession();

  const [summary, series, recentBoards, activities] = await Promise.all([
    dashboardSummary(),
    timeSeries({ days: 30 }),
    db.board.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        createdAt: true,
        client: { select: { name: true, company: true } },
        customization: { select: { displayName: true, avatarUrl: true } },
        _count: { select: { visits: true } },
      },
    }),
    db.activity.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
  ]);

  const firstName = session.name.split(" ")[0];

  return (
    <>
      <PageHeader
        title={
          <>
            Olá, {firstName}! <span className="inline-block">👋</span>
          </>
        }
        description="Aqui está o resumo da operação de placas NFC."
        action={
          <ButtonLink href="/painel/placas/nova">
            <Plus className="size-4" />
            Nova placa
          </ButtonLink>
        }
      />

      {/* Indicadores */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Placas cadastradas"
          value={summary.totalBoards}
          icon={CreditCard}
          tone="blue"
          hint={`${summary.newBoards30} criadas nos últimos 30 dias`}
        />
        <StatCard
          label="Placas ativas"
          value={summary.activeBoards}
          icon={Wifi}
          tone="green"
          hint={`${summary.productionBoards} em produção · ${summary.inactiveBoards} inativas`}
        />
        <StatCard
          label="Clientes"
          value={summary.totalClients}
          icon={Users}
          tone="violet"
          hint={`${summary.newClients30} novos nos últimos 30 dias`}
        />
        <StatCard
          label="Acessos (30 dias)"
          value={summary.visits30}
          icon={Eye}
          tone="amber"
          trend={summary.visitsTrend}
          hint={`${formatNumber(summary.totalVisits)} acessos no total`}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Gráfico */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Acessos e cliques"
            description="Últimos 30 dias"
            action={
              <Link
                href="/painel/estatisticas"
                className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-700 hover:underline"
              >
                Ver detalhes <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          <CardBody className="pb-3 pt-4">
            <div className="mb-3 flex items-center gap-5 px-1">
              <Legend color="#1B54B0" label="Acessos" />
              <Legend color="#5B92E5" label="Cliques" dashed />
            </div>
            <AccessChart data={series} />
          </CardBody>
        </Card>

        {/* Números auxiliares */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
            <StatCard
              label="Cliques nos links"
              value={summary.totalClicks}
              icon={MousePointerClick}
              tone="violet"
              hint={`${summary.ctr}% dos acessos geram clique`}
            />
            <StatCard
              label="Placas inativas"
              value={summary.inactiveBoards}
              icon={WifiOff}
              tone="slate"
              hint="URL ativa, conteúdo pausado"
            />
          </div>
          <Card className="flex-1">
            <CardHeader title="Em produção" />
            <CardBody className="flex items-center gap-4 py-6">
              <div className="grid size-12 place-items-center rounded-2xl bg-warning-soft text-warning">
                <Wrench className="size-6" />
              </div>
              <div>
                <p className="text-[26px] font-bold leading-none text-[#10233f]">
                  {summary.productionBoards}
                </p>
                <p className="mt-1 text-[13px] text-[#6b7a99]">
                  placa(s) aguardando gravação
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Placas recentes */}
        <Card className="lg:col-span-3">
          <CardHeader
            title="Placas recentes"
            action={
              <Link
                href="/painel/placas"
                className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-700 hover:underline"
              >
                Ver todas <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          {recentBoards.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="Nenhuma placa cadastrada"
              description="Crie a primeira placa para começar a acompanhar os acessos por aqui."
              action={
                <ButtonLink href="/painel/placas/nova">
                  <Plus className="size-4" />
                  Criar primeira placa
                </ButtonLink>
              }
            />
          ) : (
            <ul className="divide-y divide-line">
              {recentBoards.map((board) => (
                <li key={board.id}>
                  <Link
                    href={`/painel/placas/${board.id}`}
                    className="flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-[#fafbfd]"
                  >
                    <Avatar
                      src={board.customization?.avatarUrl}
                      name={board.customization?.displayName ?? board.name}
                      size={40}
                      square
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#10233f]">
                        {board.name}
                      </p>
                      <p className="truncate text-[13px] text-[#8a97b1]">
                        {board.client.company ?? board.client.name} ·{" "}
                        {formatNumber(board._count.visits)} acessos
                      </p>
                    </div>
                    <StatusBadge status={board.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Atividades */}
        <Card className="lg:col-span-2">
          <CardHeader title="Atividades recentes" />
          {activities.length === 0 ? (
            <EmptyState
              icon={ActivityIcon}
              title="Sem atividades"
              description="As ações da equipe aparecem aqui."
            />
          ) : (
            <CardBody className="pt-4">
              <ol className="relative flex flex-col gap-4 pl-5">
                <span className="absolute left-[5px] top-2 bottom-2 w-px bg-line" />
                {activities.map((activity) => (
                  <li key={activity.id} className="relative">
                    <span className="absolute -left-5 top-1.5 size-2.5 rounded-full border-2 border-white bg-brand-500 ring-2 ring-brand-100" />
                    <p className="text-[13px] font-medium leading-snug text-[#3b4a68]">
                      {activity.description}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-[#9aa7bf]">
                      {activity.user?.name ?? "Sistema"} ·{" "}
                      {timeAgo(activity.createdAt)}
                    </p>
                  </li>
                ))}
              </ol>
            </CardBody>
          )}
        </Card>
      </div>
    </>
  );
}

function Legend({
  color,
  label,
  dashed,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#6b7a99]">
      <span
        className="h-0.5 w-5 rounded-full"
        style={{
          backgroundColor: dashed ? "transparent" : color,
          backgroundImage: dashed
            ? `repeating-linear-gradient(90deg, ${color} 0 5px, transparent 5px 9px)`
            : undefined,
        }}
      />
      {label}
    </span>
  );
}
