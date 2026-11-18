import { PrismaClient } from "../lib/generated/prisma";
import { TEMPLATES } from "../lib/templates";

/**
 * Sincroniza só o catálogo de templates com o banco.
 *
 * O `seed` completo também mexe no administrador e nas configurações — o que
 * em produção criaria um usuário a mais. Este script toca apenas a tabela
 * `Template`, então é seguro rodar com o sistema já em uso: acrescenta os
 * modelos novos e atualiza nome, descrição e cores dos existentes.
 *
 * Nenhuma placa é afetada: a ligação é pelo `key`, que nunca muda.
 *
 *     npm run db:sync-templates
 */
const db = new PrismaClient();

async function main() {
  const antes = await db.template.count();

  for (const t of TEMPLATES) {
    await db.template.upsert({
      where: { key: t.key },
      update: {
        name: t.name,
        description: t.description,
        category: t.category,
        accent: t.defaults.accent,
        background: t.defaults.background,
        featured: t.featured,
        order: t.order,
        active: true,
      },
      create: {
        key: t.key,
        name: t.name,
        description: t.description,
        category: t.category,
        accent: t.defaults.accent,
        background: t.defaults.background,
        featured: t.featured,
        order: t.order,
      },
    });
  }

  const depois = await db.template.count();
  console.log(
    `✓ ${TEMPLATES.length} templates sincronizados (${antes} → ${depois} no banco)`,
  );

  // Modelos que sumiram do código mas continuam no banco: desativa em vez de
  // apagar, porque pode haver placa apontando para eles.
  const chaves = TEMPLATES.map((t) => t.key);
  const orfaos = await db.template.updateMany({
    where: { key: { notIn: chaves }, active: true },
    data: { active: false },
  });
  if (orfaos.count > 0) {
    console.log(`• ${orfaos.count} template(s) fora do código foram desativados`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
