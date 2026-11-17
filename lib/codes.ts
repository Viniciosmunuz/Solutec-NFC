import "server-only";

import { customAlphabet } from "nanoid";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

// Sem caracteres ambíguos (0/O, 1/I) — o código é lido e digitado por pessoas.
const nano = customAlphabet("23456789ABCDEFGHJKLMNPQRSTUVWXYZ", 6);

/** Código curto impresso na placa, ex.: SLT-7F3K2A */
export async function generateBoardCode(prefix = "SLT") {
  for (let i = 0; i < 12; i++) {
    const code = `${prefix}-${nano()}`;
    const exists = await db.board.findUnique({
      where: { code },
      select: { id: true },
    });
    if (!exists) return code;
  }
  throw new Error("Não foi possível gerar um código único para a placa.");
}

const RESERVED = new Set([
  "api",
  "painel",
  "login",
  "p",
  "admin",
  "static",
  "_next",
  "public",
  "assets",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
]);

/**
 * Slug definitivo da URL pública. Gerado UMA vez, na criação da placa.
 * Nunca é recalculado em edições — a URL gravada no chip precisa ser estável.
 */
export async function generateUniqueSlug(desired: string) {
  const base = slugify(desired) || "placa";
  const candidates = [base, ...Array.from({ length: 40 }, (_, i) => `${base}-${i + 2}`)];

  for (const candidate of candidates) {
    if (RESERVED.has(candidate)) continue;
    const exists = await db.board.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
  }

  return `${base}-${nano().toLowerCase()}`;
}

/** Valida um slug digitado manualmente pelo operador. */
export async function isSlugAvailable(slug: string, ignoreBoardId?: string) {
  const clean = slugify(slug);
  if (!clean || clean.length < 3 || RESERVED.has(clean)) return false;
  const existing = await db.board.findUnique({
    where: { slug: clean },
    select: { id: true },
  });
  return !existing || existing.id === ignoreBoardId;
}
