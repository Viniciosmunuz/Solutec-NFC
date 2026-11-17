import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { publicUrl } from "@/lib/urls";

export const runtime = "nodejs";

/**
 * QR Code da placa. Aponta para a MESMA URL gravada no chip NFC,
 * com ?s=qr só para separar a origem nas estatísticas.
 *
 * ?format=svg|png (padrão png) · ?size=<px> · ?download=1
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const board = await db.board.findUnique({
    where: { slug },
    select: { slug: true, code: true },
  });

  if (!board) {
    return NextResponse.json({ error: "Placa não encontrada." }, { status: 404 });
  }

  const url = new URL(request.url);
  const format = url.searchParams.get("format") === "svg" ? "svg" : "png";
  const size = Math.min(
    2000,
    Math.max(120, Number(url.searchParams.get("size") ?? 512) || 512),
  );
  const download = url.searchParams.get("download") === "1";

  const target = `${publicUrl(board.slug)}?s=qr`;
  const options = {
    width: size,
    margin: 2,
    errorCorrectionLevel: "M" as const,
    color: { dark: "#0E2143", light: "#FFFFFF" },
  };

  const disposition = download
    ? `attachment; filename="qrcode-${board.code}.${format}"`
    : "inline";

  if (format === "svg") {
    const svg = await QRCode.toString(target, { ...options, type: "svg" });
    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": disposition,
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  const buffer = await QRCode.toBuffer(target, { ...options, type: "png" });
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": disposition,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
