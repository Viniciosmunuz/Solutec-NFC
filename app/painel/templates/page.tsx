import { LayoutTemplate, Plus, Sparkles } from "lucide-react";
import PageHeader from "@/components/admin/page-header";
import TemplatesView from "./templates-view";
import { Card, CardBody } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "@/lib/templates";

export const metadata = { title: "Templates" };

export default async function TemplatesPage() {
  await requireSession();

  // Quantas placas usam cada template — ajuda a equipe a saber o que vende.
  const usage = await db.board.groupBy({
    by: ["templateId"],
    _count: { _all: true },
  });

  const templates = await db.template.findMany({
    select: { id: true, key: true },
  });
  const keyById = new Map(templates.map((t) => [t.id, t.key]));

  const usageByKey: Record<string, number> = {};
  for (const row of usage) {
    const key = keyById.get(row.templateId);
    if (key) usageByKey[key] = row._count._all;
  }

  const categoriesUsed = new Set(TEMPLATES.map((t) => t.category));

  return (
    <>
      <PageHeader
        title="Templates"
        description={`${TEMPLATES.length} modelos prontos, organizados por segmento.`}
        action={
          <ButtonLink href="/painel/placas/nova">
            <Plus className="size-4" />
            Criar placa
          </ButtonLink>
        }
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardBody className="flex items-center gap-3.5">
            <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <LayoutTemplate className="size-5" />
            </span>
            <div>
              <p className="text-[22px] font-bold leading-none text-[#10233f]">
                {TEMPLATES.length}
              </p>
              <p className="mt-1 text-[12.5px] text-[#6b7a99]">
                modelos disponíveis
              </p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-3.5">
            <span className="grid size-11 place-items-center rounded-xl bg-[#efeafd] text-[#6b4fd8]">
              <Sparkles className="size-5" />
            </span>
            <div>
              <p className="text-[22px] font-bold leading-none text-[#10233f]">
                {
                  TEMPLATE_CATEGORIES.filter((c) => categoriesUsed.has(c.value))
                    .length
                }
              </p>
              <p className="mt-1 text-[12.5px] text-[#6b7a99]">
                segmentos cobertos
              </p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-3.5">
            <span className="grid size-11 place-items-center rounded-xl bg-success-soft text-success">
              <LayoutTemplate className="size-5" />
            </span>
            <div>
              <p className="text-[22px] font-bold leading-none text-[#10233f]">
                {Object.values(usageByKey).reduce((s, n) => s + n, 0)}
              </p>
              <p className="mt-1 text-[12.5px] text-[#6b7a99]">
                placas usando templates
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          <TemplatesView usage={usageByKey} />
        </CardBody>
      </Card>

      <p className="mt-4 rounded-xl border border-dashed border-[#d2dae8] bg-white px-4 py-3 text-[12.5px] leading-relaxed text-[#8a97b1]">
        <strong className="text-[#3b4a68]">Para adicionar um template novo:</strong>{" "}
        acrescente a definição em{" "}
        <code className="rounded bg-[#f1f4f9] px-1.5 py-0.5 font-mono text-[11.5px]">
          lib/templates.ts
        </code>{" "}
        e rode{" "}
        <code className="rounded bg-[#f1f4f9] px-1.5 py-0.5 font-mono text-[11.5px]">
          npm run db:seed
        </code>
        . Ele aparece aqui e no wizard automaticamente.
      </p>
    </>
  );
}
