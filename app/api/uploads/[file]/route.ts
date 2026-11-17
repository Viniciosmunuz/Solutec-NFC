import { NextResponse } from "next/server";
import { readImage } from "@/lib/storage";

export const runtime = "nodejs";

/**
 * Serve as imagens enviadas pelo painel. Público de propósito: elas aparecem
 * nas páginas das placas. O nome do arquivo é validado em `readImage`.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  const image = await readImage(file);

  if (!image) {
    return NextResponse.json(
      { error: "Imagem não encontrada." },
      { status: 404 },
    );
  }

  return new NextResponse(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.contentType,
      // O nome do arquivo é único por upload, então pode cachear para sempre.
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
