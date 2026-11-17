"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import type { ActionResult } from "@/lib/actions/clients";

const settingsSchema = z.object({
  company_name: z.string().trim().min(1, "Informe o nome da empresa."),
  company_email: z.string().trim().email("E-mail inválido.").or(z.literal("")),
  company_phone: z.string().trim().optional().or(z.literal("")),
  public_footer: z.string().trim().optional().or(z.literal("")),
  board_code_prefix: z
    .string()
    .trim()
    .regex(/^[A-Z]{2,5}$/, "Use de 2 a 5 letras maiúsculas (ex.: SLT)."),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await db.setting.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function saveSettings(input: SettingsInput): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]!.message };
  }

  for (const [key, value] of Object.entries(parsed.data)) {
    await db.setting.upsert({
      where: { key },
      update: { value: value ?? "" },
      create: { key, value: value ?? "" },
    });
  }

  await logActivity({
    userId: session.sub,
    action: "settings.updated",
    description: "Configurações do sistema atualizadas",
  });

  revalidatePath("/painel/configuracoes");
  return { ok: true };
}

const profileSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome."),
  email: z.string().trim().email("E-mail inválido."),
  avatarUrl: z.string().trim().optional().or(z.literal("")),
});

export async function saveProfile(
  input: z.infer<typeof profileSchema>,
): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]!.message };
  }

  const email = parsed.data.email.toLowerCase();
  const taken = await db.user.findFirst({
    where: { email, NOT: { id: session.sub } },
    select: { id: true },
  });
  if (taken) return { ok: false, error: "Este e-mail já está em uso." };

  await db.user.update({
    where: { id: session.sub },
    data: {
      name: parsed.data.name,
      email,
      avatarUrl: parsed.data.avatarUrl || null,
    },
  });

  revalidatePath("/painel", "layout");
  return { ok: true };
}

const passwordSchema = z
  .object({
    current: z.string().min(1, "Informe a senha atual."),
    next: z.string().min(8, "A nova senha precisa ter ao menos 8 caracteres."),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, {
    message: "A confirmação não confere com a nova senha.",
    path: ["confirm"],
  });

export async function changePassword(
  input: z.infer<typeof passwordSchema>,
): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]!.message };
  }

  const user = await db.user.findUnique({ where: { id: session.sub } });
  if (!user) return { ok: false, error: "Usuário não encontrado." };

  if (!(await verifyPassword(parsed.data.current, user.password))) {
    return { ok: false, error: "A senha atual está incorreta." };
  }

  await db.user.update({
    where: { id: user.id },
    data: { password: await hashPassword(parsed.data.next) },
  });

  return { ok: true };
}
