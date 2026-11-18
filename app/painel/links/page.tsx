import Link from "next/link";
import { Link2, MousePointerClick, Plus } from "lucide-react";
import PageHeader from "@/components/admin/page-header";
import LinkTypeCard from "./link-type-card";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/display";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { LINK_TYPES } from "@/lib/links";
import { formatNumber } from "@/lib/utils";

export const metadata = { title: "Links" };

export default async function LinksPage() {
  await requireSession();

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [byType, clicksByType, topLinks, totalLinks] = await Promise.all([
    db.link.groupBy({ by: ["type"], _count: { _all: true } }),
    db.click.groupBy({
      by: ["linkType"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
    db.link.findMany({
      take: 12,
      orderBy: { clicks: { _count: "desc" } },
      include: {
        board: {
          select: {
            id: true,
            name: true,
            slug: true,
            client: { select: { name: true, company: true } },
          },
        },
        _count: { select: { clicks: true } },
      },
    }),
    db.link.count(),
  ]);

  const usage = Object.fromEntries(byType.map((r) => [r.type, r._count._all]));
  const clicks = Object.fromEntries(
    clicksByType.map((r) => [r.linkType, r._count._all]),
  );

  const totalClicks30 = clicksByType.reduce((s, r) => s + r._count._all, 0);

  return (
    <>
      <PageHeader
        title="Links"
        description="Tipos de link disponíveis e desempenho de cada um nas páginas publicadas."
        action={
          <ButtonLink href="/painel/placas/nova">
            <Plus className="size-4" />
            Nova placa
          </ButtonLink>
        }
      />

      <div className="mb-4 grid grid-cols-3 gap-2.5 sm:gap-4">
        <Card>
          <CardBody className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl sm:size-11 bg-brand-50 text-brand-600">
              <Link2 className="size-5" />
            </span>
            <div>
              <p className="text-[19px] font-bold leading-none text-[#10233f] sm:text-[22px]">
                {LINK_TYPES.length}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-[#6b7a99] sm:text-[12.5px]">tipos disponíveis</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl sm:size-11 bg-[#efeafd] text-[#6b4fd8]">
              <Link2 className="size-5" />
            </span>
            <div>
              <p className="text-[19px] font-bold leading-none text-[#10233f] sm:text-[22px]">
                {formatNumber(totalLinks)}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-[#6b7a99] sm:text-[12.5px]">
                links cadastrados nas placas
              </p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3.5">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl sm:size-11 bg-success-soft text-success">
              <MousePointerClick className="size-5" />
            </span>
            <div>
              <p className="text-[19px] font-bold leading-none text-[#10233f] sm:text-[22px]">
                {formatNumber(totalClicks30)}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-[#6b7a99] sm:text-[12.5px]">
                cliques nos últimos 30 dias
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader
            title="Tipos de link"
            description="Formatos aceitos e como o sistema monta o endereço final."
          />
          <CardBody className="grid gap-3 sm:grid-cols-2">
            {LINK_TYPES.map((def) => (
              <LinkTypeCard
                key={def.type}
                type={def.type}
                used={usage[def.type] ?? 0}
                clicks={clicks[def.type] ?? 0}
              />
            ))}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Links mais clicados"
            description="Entre todas as placas, desde o início."
          />
          {topLinks.length === 0 || topLinks.every((l) => l._count.clicks === 0) ? (
            <EmptyState
              icon={MousePointerClick}
              title="Nenhum clique registrado"
              description="Assim que as páginas receberem acessos, o ranking aparece aqui."
            />
          ) : (
            <ul className="divide-y divide-line">
              {topLinks
                .filter((l) => l._count.clicks > 0)
                .map((link) => (
                  <li key={link.id}>
                    <Link
                      href={`/painel/placas/${link.board.id}?tab=estatisticas`}
                      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[#fafbfd]"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-[#10233f]">
                          {link.label}
                        </p>
                        <p className="truncate text-[11.5px] text-[#8a97b1]">
                          {link.board.client.company ?? link.board.client.name} ·{" "}
                          {link.board.name}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-[12px] font-bold text-brand-700">
                        {formatNumber(link._count.clicks)}
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
