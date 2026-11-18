import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { db } from "@/lib/db";

/**
 * Encerra uma sessão órfã.
 *
 * O cookie guarda um JWT assinado; o middleware confia nele sem ir ao banco,
 * de propósito (é rápido e roda na borda). Só que o usuário pode ter sido
 * apagado ou desativado depois — e aí o middleware libera o painel, o layout
 * não encontra o usuário e manda de volta para o login, que o middleware
 * devolve ao painel. Loop infinito.
 *
 * Esta rota quebra o ciclo: apaga o cookie e manda para o login.
 *
 * Ela confere no banco antes de apagar. Se o usuário existe e está ativo,
 * não faz nada além de devolver ao painel — assim um site de terceiros não
 * consegue deslogar quem está legitimamente logado só mandando o navegador
 * carregar esta URL.
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (session) {
    const user = await db.user.findUnique({
      where: { id: session.sub },
      select: { active: true },
    });
    if (user?.active) {
      return NextResponse.redirect(new URL("/painel", request.url));
    }
  }

  const response = NextResponse.redirect(
    new URL("/login?sessao=expirada", request.url),
  );
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
