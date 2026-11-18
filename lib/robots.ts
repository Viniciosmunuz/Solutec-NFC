/**
 * Reconhece acessos que não são de gente.
 *
 * O painel vende "quantas pessoas encostaram o celular na placa". Robô de
 * busca, monitor de disponibilidade, pré-visualização de link no WhatsApp e
 * verificação feita por linha de comando inflam esse número e tiram a
 * confiança do dado — foi assim que uma placa apareceu com dezenas de
 * acessos sem ninguém ter encostado nela.
 *
 * O critério é propositalmente conservador: na dúvida, conta como pessoa.
 * Perder uma visita real é pior do que deixar passar um robô, porque o
 * cliente percebe a falta, não o excesso.
 */
const ASSINATURAS = [
  "bot",
  "crawler",
  "spider",
  "slurp",
  "curl",
  "wget",
  "python-requests",
  "httpie",
  "postman",
  "insomnia",
  "headless",
  "phantomjs",
  "puppeteer",
  "playwright",
  "selenium",
  "lighthouse",
  "pagespeed",
  "uptime",
  "pingdom",
  "monitor",
  "preview",
  "facebookexternalhit",
  "whatsapp",
  "telegram",
  "twitterbot",
  "linkedinbot",
  "slackbot",
  "discordbot",
  "embedly",
  "vercel",
  "node-fetch",
  "axios",
  "go-http-client",
  "java/",
  "okhttp",
];

/**
 * `true` quando o acesso deve ficar de fora das estatísticas.
 *
 * Sem user-agent também não conta: todo navegador manda um, então a ausência
 * é sinal de script.
 */
export function ehAcessoDeRobo(userAgent: string | null | undefined): boolean {
  const ua = (userAgent ?? "").trim().toLowerCase();
  if (!ua) return true;
  return ASSINATURAS.some((assinatura) => ua.includes(assinatura));
}
