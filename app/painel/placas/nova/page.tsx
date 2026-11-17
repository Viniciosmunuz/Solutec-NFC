import PageHeader from "@/components/admin/page-header";
import BoardWizard from "./board-wizard";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export const metadata = { title: "Nova placa" };

export default async function NovaPlacaPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string; template?: string }>;
}) {
  await requireSession();
  const { cliente, template } = await searchParams;

  const clients = await db.client.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      company: true,
      email: true,
      phone: true,
      city: true,
      _count: { select: { boards: true } },
    },
  });

  return (
    <>
      <PageHeader
        backHref="/painel/placas"
        eyebrow="Produção"
        title="Criar nova placa"
        description="Cinco etapas: cliente, template, design, links e publicação."
      />
      <BoardWizard
        clients={clients}
        preselectedClientId={cliente}
        preselectedTemplate={template}
      />
    </>
  );
}
