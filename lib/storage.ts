import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Armazenamento das imagens enviadas pelo painel.
 *
 * Dois modos, escolhidos automaticamente:
 *
 * - **Vercel Blob** quando `BLOB_READ_WRITE_TOKEN` existe (produção na
 *   Vercel). Obrigatório lá: as funções não têm disco, então qualquer
 *   arquivo gravado localmente sumiria no próximo deploy.
 * - **Disco** caso contrário (desenvolvimento, Docker, VPS), em `UPLOAD_DIR`.
 *
 * Em ambos os casos o resto do sistema só conhece a URL devolvida por
 * `saveImage`. Para trocar por S3/R2 basta acrescentar um ramo aqui.
 */

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/gif": "gif",
};

const EXTENSION_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  svg: "image/svg+xml",
  gif: "image/gif",
};

const usingBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export function uploadDir() {
  const configured = process.env.UPLOAD_DIR?.trim();
  if (configured) return path.resolve(configured);
  return path.join(process.cwd(), "public", "uploads");
}

/** Grava a imagem e devolve a URL pública dela. */
export async function saveImage(buffer: Buffer, extension: string) {
  const filename = `${randomUUID()}.${extension}`;

  if (usingBlob()) {
    const { put } = await import("@vercel/blob");
    const { url } = await put(`placas/${filename}`, buffer, {
      access: "public",
      contentType: EXTENSION_TYPES[extension],
      // O nome já é único; não precisa do sufixo aleatório do Blob.
      addRandomSuffix: false,
      cacheControlMaxAge: 31536000,
    });
    return url;
  }

  const dir = uploadDir();
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return `/api/uploads/${filename}`;
}

/**
 * Lê uma imagem gravada em disco. Só aceita nomes no formato que nós geramos
 * (uuid.extensão) — assim não há como escapar do diretório.
 *
 * No modo Blob esta função não é usada: as URLs apontam direto para a CDN.
 */
export async function readImage(filename: string) {
  if (!/^[a-f0-9-]{36}\.(jpg|png|webp|svg|gif)$/i.test(filename)) return null;

  const extension = filename.split(".").pop()!.toLowerCase();
  try {
    const data = await readFile(path.join(uploadDir(), filename));
    return {
      data,
      contentType: EXTENSION_TYPES[extension] ?? "application/octet-stream",
    };
  } catch {
    return null;
  }
}

/** Remove uma imagem que não é mais usada. Falha em silêncio de propósito. */
export async function deleteImage(url: string) {
  try {
    if (usingBlob() && url.startsWith("http")) {
      const { del } = await import("@vercel/blob");
      await del(url);
    }
  } catch {
    // Uma imagem órfã é um problema menor do que derrubar a operação.
  }
}
