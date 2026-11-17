import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Armazenamento de imagens.
 *
 * Os arquivos NÃO ficam em /public: em produção a pasta do build é
 * descartável. Ficam em UPLOAD_DIR (um volume persistente no servidor) e são
 * servidos por /api/uploads/<arquivo>.
 *
 * Para migrar para S3/R2/Blob basta reescrever `saveImage` e `readImage` —
 * o resto do sistema só conhece a URL devolvida aqui.
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

export function uploadDir() {
  const configured = process.env.UPLOAD_DIR?.trim();
  if (configured) return path.resolve(configured);
  return path.join(process.cwd(), "public", "uploads");
}

/** Grava a imagem e devolve a URL pública dela. */
export async function saveImage(buffer: Buffer, extension: string) {
  const dir = uploadDir();
  await mkdir(dir, { recursive: true });
  const filename = `${randomUUID()}.${extension}`;
  await writeFile(path.join(dir, filename), buffer);
  return `/api/uploads/${filename}`;
}

/**
 * Lê uma imagem gravada. Só aceita nomes no formato que nós geramos
 * (uuid.extensão) — assim não há como escapar do diretório.
 */
export async function readImage(filename: string) {
  if (!/^[a-f0-9-]{36}\.(jpg|png|webp|svg|gif)$/i.test(filename)) return null;

  const extension = filename.split(".").pop()!.toLowerCase();
  try {
    const data = await readFile(path.join(uploadDir(), filename));
    return { data, contentType: EXTENSION_TYPES[extension] ?? "application/octet-stream" };
  } catch {
    return null;
  }
}
