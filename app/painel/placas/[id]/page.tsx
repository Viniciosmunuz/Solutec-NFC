import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/page-header";
import BoardDetail from "./board-detail";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { boardStats } from "@/lib/stats";
import { toCustomization } from "@/lib/customization";

export default async function PlacaDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; novo?: string }>;
}) {
  await requireSession();
  const { id } = await params;
  const { tab, novo } = await searchParams;

  const board = await db.board.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, company: true, phone: true, email: true } },
      template: { select: { key: true, name: true, category: true } },
      customization: true,
      links: { orderBy: { position: "asc" } },
      createdBy: { select: { name: true } },
    },
  });

  if (!board || !board.customization) notFound();

  const stats = await boardStats(board.id, 30);

  return (
    <>
      <PageHeader
        backHref="/painel/placas"
        eyebrow={`Placa ${board.code}`}
        title={board.name}
        description={board.client.company ?? board.client.name}
      />
      <BoardDetail
        board={{
          id: board.id,
          code: board.code,
          slug: board.slug,
          name: board.name,
          status: board.status,
          notes: board.notes,
          createdAt: board.createdAt,
          client: board.client,
          template: board.template,
          customization: toCustomization(board.customization),
          links: board.links,
          createdBy: board.createdBy?.name ?? null,
        }}
        stats={stats}
        initialTab={tab ?? "informacoes"}
        justCreated={novo === "1"}
      />
    </>
  );
}
