#!/usr/bin/env node
/**
 * Troca o banco do Prisma entre SQLite (desenvolvimento) e PostgreSQL
 * (produção).
 *
 *   node scripts/db-provider.mjs postgresql
 *   node scripts/db-provider.mjs sqlite
 *
 * O Prisma não aceita variável de ambiente no campo `provider`, então a troca
 * é feita reescrevendo essa linha do schema. Nenhum model precisa mudar — os
 * tipos usados são compatíveis com os dois bancos.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const VALID = ["sqlite", "postgresql"];
const target = process.argv[2];

if (!VALID.includes(target)) {
  console.error(`Uso: node scripts/db-provider.mjs <${VALID.join("|")}>`);
  process.exit(1);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const schemaPath = path.join(root, "prisma", "schema.prisma");

const schema = readFileSync(schemaPath, "utf8");
const current = schema.match(/provider\s*=\s*"(sqlite|postgresql)"/)?.[1];

if (current === target) {
  console.log(`O schema já está em "${target}". Nada a fazer.`);
  process.exit(0);
}

const updated = schema.replace(
  /(datasource db \{[^}]*?provider\s*=\s*)"(?:sqlite|postgresql)"/s,
  `$1"${target}"`,
);

if (updated === schema) {
  console.error("Não encontrei o bloco `datasource db` no schema.");
  process.exit(1);
}

writeFileSync(schemaPath, updated);

console.log(`✓ Provider alterado de "${current}" para "${target}".`);
console.log("\nPróximos passos:");
console.log("  1. Ajuste DATABASE_URL no .env");
if (target === "postgresql") {
  console.log('     DATABASE_URL="postgresql://usuario:senha@host:5432/banco"');
} else {
  console.log('     DATABASE_URL="file:./dev.db"');
}
console.log("  2. npx prisma generate");
console.log("  3. npx prisma db push");
console.log("  4. npm run db:seed");
