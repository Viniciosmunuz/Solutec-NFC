"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const clientSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do cliente."),
  company: z.string().trim().optional().or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("E-mail inválido.")
    .optional()
    .or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  document: z.string().trim().optional().or(z.literal("")),
  zip: z.string().trim().optional().or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
  number: z.string().trim().optional().or(z.literal("")),
  district: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().optional().or(z.literal("")),
  state: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
});

export type ClientInput = z.infer<typeof clientSchema>;

function normalize(input: ClientInput) {
  const blankToNull = (v?: string) => (v && v.length > 0 ? v : null);
  return {
    name: input.name,
    company: blankToNull(input.company),
    email: blankToNull(input.email),
    phone: blankToNull(input.phone),
    document: blankToNull(input.document),
    zip: blankToNull(input.zip),
    address: blankToNull(input.address),
    number: blankToNull(input.number),
    district: blankToNull(input.district),
    city: blankToNull(input.city),
    state: blankToNull(input.state),
    notes: blankToNull(input.notes),
  };
}

function parse(input: unknown): ActionResult<ClientInput> {
  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
      fieldErrors,
    };
  }
  return { ok: true, data: parsed.data };
}

export async function createClient(
  input: ClientInput,
): Promise<ActionResult<{ id: string; name: string }>> {
  const session = await requireSession();
  const parsed = parse(input);
  if (!parsed.ok) return parsed;

  const client = await db.client.create({ data: normalize(parsed.data!) });

  await logActivity({
    userId: session.sub,
    action: "client.created",
    description: `Cliente ${client.name} cadastrado`,
    entityType: "client",
    entityId: client.id,
  });

  revalidatePath("/painel/clientes");
  revalidatePath("/painel");
  return { ok: true, data: { id: client.id, name: client.name } };
}

export async function updateClient(
  id: string,
  input: ClientInput,
): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = parse(input);
  if (!parsed.ok) return parsed;

  const client = await db.client.update({
    where: { id },
    data: normalize(parsed.data!),
  });

  await logActivity({
    userId: session.sub,
    action: "client.updated",
    description: `Cliente ${client.name} atualizado`,
    entityType: "client",
    entityId: client.id,
  });

  revalidatePath("/painel/clientes");
  revalidatePath(`/painel/clientes/${id}`);
  return { ok: true };
}

export async function deleteClient(id: string): Promise<ActionResult> {
  const session = await requireSession();

  const client = await db.client.findUnique({
    where: { id },
    select: { name: true, _count: { select: { boards: true } } },
  });
  if (!client) return { ok: false, error: "Cliente não encontrado." };

  if (client._count.boards > 0) {
    return {
      ok: false,
      error: `Este cliente possui ${client._count.boards} placa(s) vinculada(s). Exclua ou transfira as placas antes de remover o cliente.`,
    };
  }

  await db.client.delete({ where: { id } });

  await logActivity({
    userId: session.sub,
    action: "client.deleted",
    description: `Cliente ${client.name} excluído`,
    entityType: "client",
    entityId: id,
  });

  revalidatePath("/painel/clientes");
  revalidatePath("/painel");
  return { ok: true };
}
