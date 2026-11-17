import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { publicUrl } from "@/lib/urls";

export const runtime = "nodejs";

const escape = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

/** Cartão de contato (.vcf) montado a partir dos links da placa. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const board = await db.board.findUnique({
    where: { slug },
    select: {
      status: true,
      code: true,
      customization: true,
      client: { select: { company: true } },
      links: { where: { active: true }, orderBy: { position: "asc" } },
    },
  });

  if (!board || !board.customization || board.status !== "ativa") {
    return NextResponse.json({ error: "Indisponível." }, { status: 404 });
  }

  const c = board.customization;
  const name = c.displayName;

  const phone = board.links.find((l) => l.type === "phone")?.value;
  const whatsapp = board.links.find((l) => l.type === "whatsapp")?.value;
  const email = board.links.find((l) => l.type === "email")?.value;
  const site = board.links.find((l) => l.type === "site")?.url;
  const maps = board.links.find((l) => l.type === "maps")?.value;

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escape(name)}`,
    `N:${escape(name)};;;;`,
    board.client.company ? `ORG:${escape(board.client.company)}` : null,
    c.headline ? `TITLE:${escape(c.headline)}` : null,
    phone ? `TEL;TYPE=WORK,VOICE:${escape(phone)}` : null,
    whatsapp ? `TEL;TYPE=CELL:${escape(whatsapp)}` : null,
    email ? `EMAIL;TYPE=INTERNET:${escape(email)}` : null,
    site ? `URL:${escape(site)}` : null,
    maps && !/^https?:/i.test(maps)
      ? `ADR;TYPE=WORK:;;${escape(maps)};;;;`
      : null,
    c.bio ? `NOTE:${escape(c.bio)}` : null,
    `URL;TYPE=Solutec:${publicUrl(slug)}`,
    "END:VCARD",
  ].filter(Boolean);

  return new NextResponse(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${board.code}.vcf"`,
    },
  });
}
