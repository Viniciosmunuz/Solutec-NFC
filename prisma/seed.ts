import bcrypt from "bcryptjs";
import { PrismaClient } from "../lib/generated/prisma";
import { TEMPLATES } from "../lib/templates";

const db = new PrismaClient();

async function main() {
  // ---- Administrador --------------------------------------------------
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@solutec.com.br")
    .trim()
    .toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "solutec123";
  const name = process.env.SEED_ADMIN_NAME ?? "Administrador Solutec";

  const admin = await db.user.upsert({
    where: { email },
    update: { name },
    create: {
      email,
      name,
      password: await bcrypt.hash(password, 10),
      role: "admin",
    },
  });
  console.log(`✓ Administrador pronto: ${admin.email}`);

  // ---- Templates ------------------------------------------------------
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
  console.log(`✓ ${TEMPLATES.length} templates sincronizados`);

  // ---- Configurações padrão -------------------------------------------
  const defaults: Record<string, string> = {
    company_name: "Solutec",
    company_email: "contato@solutec.com.br",
    company_phone: "",
    public_footer: "Feito com Solutec",
    brand_accent: "#1B54B0",
    board_code_prefix: "SLT",
  };
  for (const [key, value] of Object.entries(defaults)) {
    await db.setting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }
  console.log("✓ Configurações padrão criadas");

  console.log("\nAcesse /login com:");
  console.log(`   e-mail: ${email}`);
  console.log(`   senha:  ${password}\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
