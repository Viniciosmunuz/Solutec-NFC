/** Base pública usada nas URLs das placas e no QR Code. */
export function appUrl() {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw) return raw.replace(/\/+$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3000";
}

/** URL pública definitiva de uma placa — é esta que vai gravada no chip. */
export function publicUrl(slug: string) {
  return `${appUrl()}/p/${slug}`;
}

/** Versão curta para exibir em tabelas, sem o protocolo. */
export function displayUrl(slug: string) {
  return publicUrl(slug).replace(/^https?:\/\//, "");
}
