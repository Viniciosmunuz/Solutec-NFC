"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { generateBoardCode, generateUniqueSlug, isSlugAvailable } from "@/lib/codes";
import { buildLinkUrl } from "@/lib/links";
import { getTemplate } from "@/lib/templates";
import type { ActionResult } from "@/lib/actions/clients";

/** Campo de texto opcional que aceita "", null ou ausente. */
const optionalText = z.string().trim().optional().nullable();

const linkSchema = z.object({
  id: z.string().optional(),
  type: z.string().min(1),
  label: z.string().trim().min(1, "Todo link precisa de um nome."),
  value: z.string().trim().min(1, "Preencha o destino do link."),
  asSocial: z.boolean().default(false),
  active: z.boolean().default(true),
  highlight: z.boolean().default(false),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .nullable()
    .optional(),
  stat: optionalText,
});

const factSchema = z.object({
  icon: z.string().trim().max(8).default("✨"),
  text: z.string().trim().min(1, "Escreva o texto do fato."),
});

const projectSchema = z.object({
  title: z.string().trim().min(1, "Todo projeto precisa de um nome."),
  subtitle: optionalText,
  url: optionalText,
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .catch("#1B54B0"),
  icon: optionalText,
  featured: z.boolean().default(false),
});

const gallerySchema = z.object({
  imageUrl: z.string().trim().min(1),
  caption: optionalText,
  url: optionalText,
});

const customizationSchema = z.object({
  displayName: z.string().trim().min(1, "Informe o nome exibido na página."),
  headline: optionalText,
  bio: optionalText,
  avatarUrl: optionalText,
  logoUrl: optionalText,
  coverUrl: optionalText,
  // Enquadramento das fotos. Vem do painel, mas chega como número cru pela
  // server action — limitado aqui para nunca gravar algo absurdo.
  avatarZoom: z.number().min(1).max(3).catch(1),
  avatarX: z.number().min(0).max(100).catch(50),
  avatarY: z.number().min(0).max(100).catch(50),
  coverZoom: z.number().min(1).max(3).catch(1),
  coverX: z.number().min(0).max(100).catch(50),
  coverY: z.number().min(0).max(100).catch(50),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida."),
  background: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida."),
  textColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida."),
  buttonStyle: z.enum(["row", "solid", "outline", "soft", "glass"]),
  buttonRadius: z.enum(["rounded", "pill", "square"]),
  fontFamily: z.enum(["inter", "poppins", "montserrat", "nunito", "oswald", "bebas", "playfair", "lora", "dancing", "mono"]),
  backgroundMode: z.enum(["solid", "gradient", "image"]),
  showAvatar: z.boolean(),
  avatarRing: z.boolean().catch(true),
  avatarShape: z.enum(["circulo", "quadrado"]).catch("circulo"),
  spacing: z.enum(["compacto", "normal", "arejado"]).catch("normal"),
  fontScale: z.number().min(0.85).max(1.25).catch(1),
  coverOpacity: z.number().min(10).max(100).catch(100),
  socialPosition: z.enum(["acima", "abaixo"]).catch("abaixo"),
  ornament: z
    .enum([
      "nenhum",
      "waves",
      "shards",
      "leaves",
      "blobs",
      "streaks",
      "diagonal",
      "sidewave",
      "angles",
    ])
    .nullable()
    .optional(),
  ornamentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .nullable()
    .optional(),
  ornamentOpacity: z.number().min(5).max(100).catch(100),
  contentAlign: z.enum(["esquerda", "centro"]).catch("centro"),
  contentPosition: z.enum(["topo", "centro", "rodape"]).catch("topo"),
  cardStyle: z.enum(["nenhum", "vidro", "solido"]).catch("nenhum"),
  avatarSize: z.number().min(0.6).max(1.6).catch(1),
  handle: optionalText,
  metaLeft: optionalText,
  metaRight: optionalText,
  ctaTitle: optionalText,
  ctaText: optionalText,
  ctaLabel: optionalText,
  ctaUrl: optionalText,
  showLogo: z.boolean(),
  showBio: z.boolean(),
  showSocial: z.boolean(),
  showShare: z.boolean(),
  showContactCard: z.boolean(),
});

const createSchema = z.object({
  clientId: z.string().min(1, "Selecione um cliente."),
  templateKey: z.string().min(1, "Selecione um template."),
  name: z.string().trim().min(2, "Dê um nome de identificação à placa."),
  slug: z.string().trim().optional().or(z.literal("")),
  status: z.enum(["ativa", "inativa", "producao"]).default("producao"),
  notes: z.string().trim().optional().or(z.literal("")),
  customization: customizationSchema,
  links: z.array(linkSchema).default([]),
});

export type CreateBoardInput = z.input<typeof createSchema>;
export type CustomizationInput = z.infer<typeof customizationSchema>;
export type BoardLinkInput = z.input<typeof linkSchema>;

const blank = (v?: string | null) => (v && v.length > 0 ? v : null);

/**
 * Remove os links que o operador adicionou mas não preencheu. Eles não são
 * um erro de formulário — só uma linha em branco que deve ser descartada.
 */
function dropEmptyLinks<T extends { links?: { value?: string }[] }>(input: T): T {
  return {
    ...input,
    links: (input.links ?? []).filter((l) => (l?.value ?? "").trim().length > 0),
  };
}

function issuesToResult(error: z.ZodError): ActionResult<never> {
  return {
    ok: false,
    error: error.issues[0]?.message ?? "Dados inválidos.",
  };
}

/** Converte os links do formulário para linhas do banco, já com URL final. */
function toLinkRows(links: z.infer<typeof linkSchema>[], boardId: string) {
  return links
    .map((link, index) => ({
      boardId,
      type: link.type,
      label: link.label,
      value: link.value,
      url: buildLinkUrl(link.type, link.value),
      position: index,
      active: link.active,
      asSocial: link.asSocial,
      highlight: link.highlight,
      color: link.color ?? null,
    }))
    .filter((link) => link.url);
}

// ---------------------------------------------------------------------------
// Criação (wizard)
// ---------------------------------------------------------------------------

export async function createBoard(
  input: CreateBoardInput,
): Promise<ActionResult<{ id: string; slug: string; code: string }>> {
  const session = await requireSession();
  const parsed = createSchema.safeParse(dropEmptyLinks(input));
  if (!parsed.success) return issuesToResult(parsed.error);
  const data = parsed.data;

  const client = await db.client.findUnique({
    where: { id: data.clientId },
    select: { id: true, name: true, company: true },
  });
  if (!client) return { ok: false, error: "Cliente não encontrado." };

  const template = await db.template.findUnique({
    where: { key: data.templateKey },
    select: { id: true, name: true },
  });
  if (!template) return { ok: false, error: "Template não encontrado." };

  // Slug: ou o que o operador digitou (validado), ou derivado do nome exibido.
  let slug: string;
  if (data.slug) {
    if (!(await isSlugAvailable(data.slug))) {
      return {
        ok: false,
        error: "Esta URL já está em uso ou é reservada. Escolha outra.",
      };
    }
    slug = (await generateUniqueSlug(data.slug))!;
  } else {
    slug = await generateUniqueSlug(
      data.customization.displayName || client.company || client.name,
    );
  }

  const prefix =
    (await db.setting.findUnique({ where: { key: "board_code_prefix" } }))
      ?.value ?? "SLT";

  const board = await db.board.create({
    data: {
      code: await generateBoardCode(prefix),
      slug,
      name: data.name,
      status: data.status,
      notes: blank(data.notes),
      clientId: client.id,
      templateId: template.id,
      createdById: session.sub,
      customization: {
        create: {
          ...data.customization,
          headline: blank(data.customization.headline),
          bio: blank(data.customization.bio),
          avatarUrl: blank(data.customization.avatarUrl),
          logoUrl: blank(data.customization.logoUrl),
          coverUrl: blank(data.customization.coverUrl),
        },
      },
    },
  });

  const rows = toLinkRows(data.links, board.id);
  if (rows.length) await db.link.createMany({ data: rows });

  await logActivity({
    userId: session.sub,
    action: "board.created",
    description: `Placa "${board.name}" criada para ${client.name}`,
    entityType: "board",
    entityId: board.id,
  });

  revalidatePath("/painel");
  revalidatePath("/painel/placas");
  revalidatePath(`/p/${board.slug}`);

  return { ok: true, data: { id: board.id, slug: board.slug, code: board.code } };
}

// ---------------------------------------------------------------------------
// Edição
// ---------------------------------------------------------------------------

const updateSchema = z.object({
  name: z.string().trim().min(2, "Dê um nome de identificação à placa."),
  clientId: z.string().min(1),
  templateKey: z.string().min(1),
  status: z.enum(["ativa", "inativa", "producao"]),
  notes: z.string().trim().optional().or(z.literal("")),
  customization: customizationSchema,
  links: z.array(linkSchema).default([]),
  facts: z.array(factSchema).default([]),
  projects: z.array(projectSchema).default([]),
  gallery: z.array(gallerySchema).default([]),
});

export type UpdateBoardInput = z.input<typeof updateSchema>;

/**
 * Atualiza tudo de uma placa, menos `slug` e `code`.
 * A URL pública é deliberadamente imutável: o chip já foi gravado.
 */
export async function updateBoard(
  id: string,
  input: UpdateBoardInput,
): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = updateSchema.safeParse(dropEmptyLinks(input));
  if (!parsed.success) return issuesToResult(parsed.error);
  const data = parsed.data;

  const existing = await db.board.findUnique({
    where: { id },
    select: { id: true, slug: true, name: true },
  });
  if (!existing) return { ok: false, error: "Placa não encontrada." };

  const template = await db.template.findUnique({
    where: { key: data.templateKey },
    select: { id: true },
  });
  if (!template) return { ok: false, error: "Template não encontrado." };

  const customization = {
    ...data.customization,
    headline: blank(data.customization.headline),
    bio: blank(data.customization.bio),
    avatarUrl: blank(data.customization.avatarUrl),
    logoUrl: blank(data.customization.logoUrl),
    coverUrl: blank(data.customization.coverUrl),
  };

  await db.$transaction(async (tx) => {
    await tx.board.update({
      where: { id },
      data: {
        name: data.name,
        clientId: data.clientId,
        templateId: template.id,
        status: data.status,
        notes: blank(data.notes),
        customization: {
          upsert: { create: customization, update: customization },
        },
      },
    });

    // Preserva os links existentes (e o histórico de cliques) quando o id
    // veio do formulário; remove só o que o operador apagou de fato.
    const keepIds = data.links
      .map((l) => l.id)
      .filter((v): v is string => Boolean(v));

    await tx.link.deleteMany({
      where: { boardId: id, ...(keepIds.length ? { id: { notIn: keepIds } } : {}) },
    });

    for (const [index, link] of data.links.entries()) {
      const url = buildLinkUrl(link.type, link.value);
      if (!url) continue;
      const payload = {
        type: link.type,
        label: link.label,
        value: link.value,
        url,
        position: index,
        active: link.active,
        asSocial: link.asSocial,
        highlight: link.highlight,
        color: link.color ?? null,
      };
      if (link.id) {
        await tx.link.update({ where: { id: link.id }, data: payload });
      } else {
        await tx.link.create({ data: { ...payload, boardId: id } });
      }
    }

    /**
     * Fatos, projetos e galeria são recriados do zero a cada gravação.
     *
     * Diferente dos links, eles não acumulam histórico — ninguém mede clique
     * em linha de fato. Sem id para preservar, apagar e recriar é mais
     * simples e não deixa resto para trás quando o operador reordena.
     */
    await tx.fact.deleteMany({ where: { boardId: id } });
    if (data.facts.length > 0) {
      await tx.fact.createMany({
        data: data.facts.map((f, i) => ({
          boardId: id,
          icon: f.icon || "✨",
          text: f.text,
          position: i,
        })),
      });
    }

    await tx.project.deleteMany({ where: { boardId: id } });
    if (data.projects.length > 0) {
      await tx.project.createMany({
        data: data.projects.map((p, i) => ({
          boardId: id,
          title: p.title,
          subtitle: blank(p.subtitle),
          url: blank(p.url),
          color: p.color,
          icon: blank(p.icon),
          featured: p.featured,
          position: i,
        })),
      });
    }

    await tx.galleryItem.deleteMany({ where: { boardId: id } });
    if (data.gallery.length > 0) {
      await tx.galleryItem.createMany({
        data: data.gallery.map((g, i) => ({
          boardId: id,
          imageUrl: g.imageUrl,
          caption: blank(g.caption),
          url: blank(g.url),
          position: i,
        })),
      });
    }
  });

  await logActivity({
    userId: session.sub,
    action: "board.updated",
    description: `Placa "${data.name}" atualizada`,
    entityType: "board",
    entityId: id,
  });

  revalidatePath("/painel/placas");
  revalidatePath(`/painel/placas/${id}`);
  revalidatePath(`/p/${existing.slug}`);
  return { ok: true };
}

export async function setBoardStatus(
  id: string,
  status: "ativa" | "inativa" | "producao",
): Promise<ActionResult> {
  const session = await requireSession();

  const board = await db.board.update({
    where: { id },
    data: { status },
    select: { name: true, slug: true },
  });

  const labels = {
    ativa: "ativada",
    inativa: "desativada",
    producao: "marcada como em produção",
  };

  await logActivity({
    userId: session.sub,
    action: "board.status",
    description: `Placa "${board.name}" ${labels[status]}`,
    entityType: "board",
    entityId: id,
  });

  revalidatePath("/painel/placas");
  revalidatePath(`/painel/placas/${id}`);
  revalidatePath(`/p/${board.slug}`);
  return { ok: true };
}

export async function deleteBoard(id: string): Promise<ActionResult> {
  const session = await requireSession();

  const board = await db.board.findUnique({
    where: { id },
    select: { name: true, slug: true },
  });
  if (!board) return { ok: false, error: "Placa não encontrada." };

  await db.board.delete({ where: { id } });

  await logActivity({
    userId: session.sub,
    action: "board.deleted",
    description: `Placa "${board.name}" excluída`,
    entityType: "board",
    entityId: id,
  });

  revalidatePath("/painel");
  revalidatePath("/painel/placas");
  revalidatePath(`/p/${board.slug}`);
  return { ok: true };
}

/** Usado pelo wizard para avisar em tempo real se a URL está livre. */
export async function checkSlug(slug: string, boardId?: string) {
  await requireSession();
  return { available: await isSlugAvailable(slug, boardId) };
}

/** Defaults do template, para o editor pré-preencher ao trocar de modelo. */
export async function templateDefaults(key: string) {
  await requireSession();
  return getTemplate(key).defaults;
}
