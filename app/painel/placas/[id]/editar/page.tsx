import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/page-header";
import BoardEditor from "./board-editor";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { toCustomization } from "@/lib/customization";

export const metadata = { title: "Editar placa" };

export default async function EditarPlacaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;

  const [board, clients] = await Promise.all([
    db.board.findUnique({
      where: { id },
      include: {
        customization: true,
        links: { orderBy: { position: "asc" } },
        template: { select: { key: true } },
      },
    }),
    db.client.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, company: true },
    }),
  ]);

  if (!board || !board.customization) notFound();

  return (
    <>
      <PageHeader
        backHref={`/painel/placas/${board.id}`}
        eyebrow={`Placa ${board.code}`}
        title="Editar placa"
        description="A URL pública não muda — pode alterar tudo o resto à vontade."
      />
      <BoardEditor
        board={{
          id: board.id,
          code: board.code,
          slug: board.slug,
          name: board.name,
          status: board.status,
          notes: board.notes ?? "",
          clientId: board.clientId,
          templateKey: board.template.key,
          customization: toCustomization(board.customization),
          links: board.links,
        }}
        clients={clients}
      />
    </>
  );
}
