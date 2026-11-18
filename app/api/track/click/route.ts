import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ehAcessoDeRobo } from "@/lib/robots";

export const runtime = "nodejs";

/**
 * Registra o clique em um botão da página pública.
 * Chamado via sendBeacon — precisa responder rápido e nunca bloquear.
 */
export async function POST(request: Request) {
  try {
    // Mesmo critério das visitas: clique de script não vira estatística.
    if (ehAcessoDeRobo(request.headers.get("user-agent"))) {
      return NextResponse.json({ ok: true });
    }

    const body = (await request.json()) as { slug?: string; linkId?: string };
    if (!body.slug || !body.linkId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const link = await db.link.findUnique({
      where: { id: body.linkId },
      select: {
        id: true,
        label: true,
        type: true,
        boardId: true,
        board: { select: { slug: true } },
      },
    });

    // O link precisa pertencer de fato à placa informada.
    if (!link || link.board.slug !== body.slug) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    await db.click.create({
      data: {
        boardId: link.boardId,
        linkId: link.id,
        linkLabel: link.label,
        linkType: link.type,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
