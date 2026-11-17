import "server-only";

import { db } from "@/lib/db";

export type ActivityAction =
  | "board.created"
  | "board.updated"
  | "board.status"
  | "board.deleted"
  | "client.created"
  | "client.updated"
  | "client.deleted"
  | "link.created"
  | "link.updated"
  | "link.deleted"
  | "settings.updated";

export async function logActivity(input: {
  userId?: string | null;
  action: ActivityAction;
  description: string;
  entityType?: string;
  entityId?: string;
}) {
  try {
    await db.activity.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        description: input.description,
        entityType: input.entityType,
        entityId: input.entityId,
      },
    });
  } catch {
    // A trilha de atividades nunca pode derrubar a operação principal.
  }
}
