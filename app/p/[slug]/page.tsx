import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { after, connection } from "next/server";
import { headers } from "next/headers";
import { PauseCircle } from "lucide-react";
import PublicPage from "@/components/public/PublicPage";
import { SolutecLogo } from "@/components/brand/logo";
import { db } from "@/lib/db";
import { toCustomization } from "@/lib/customization";
import { ehAcessoDeRobo } from "@/lib/robots";
import { getTemplate } from "@/lib/templates";
import { shadeColor } from "@/lib/utils";
import { publicUrl } from "@/lib/urls";

type Params = { params: Promise<{ slug: string }> };
type Search = { searchParams: Promise<Record<string, string | string[] | undefined>> };

async function loadBoard(slug: string) {
  return db.board.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      status: true,
      customization: true,
      template: { select: { key: true } },
      facts: { orderBy: { position: "asc" } },
      projects: { orderBy: { position: "asc" } },
      gallery: { orderBy: { position: "asc" } },
      links: {
        where: { active: true },
        orderBy: { position: "asc" },
        select: {
          id: true,
          type: true,
          label: true,
          url: true,
          asSocial: true,
          highlight: true,
          color: true,
          stat: true,
        },
      },
    },
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const board = await loadBoard(slug);

  if (!board?.customization) {
    return { title: "Página não encontrada" };
  }

  const c = board.customization;
  const title = c.displayName;
  const description =
    c.bio ?? c.headline ?? `Acesse os contatos de ${c.displayName}.`;
  const image = c.coverUrl ?? c.avatarUrl ?? c.logoUrl ?? undefined;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: publicUrl(board.slug) },
    openGraph: {
      title,
      description,
      url: publicUrl(board.slug),
      type: "profile",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
    },
    robots: board.status === "ativa" ? undefined : { index: false },
  };
}

export default async function PublicBoardPage({ params, searchParams }: Params & Search) {
  const { slug } = await params;
  const search = await searchParams;

  const board = await loadBoard(slug);
  if (!board || !board.customization) notFound();

  // Página desativada: a URL continua existindo (o chip já foi gravado),
  // mas o conteúdo some.
  if (board.status !== "ativa") {
    return <UnavailablePage name={board.customization.displayName} />;
  }

  // Registra o acesso depois de responder — não atrasa o carregamento.
  await connection();
  const headerList = await headers();
  const sourceParam = typeof search.s === "string" ? search.s : undefined;
  const source =
    sourceParam === "qr" ? "qr" : sourceParam === "nfc" ? "nfc" : "direct";
  const ua = headerList.get("user-agent") ?? "";
  const device = /iPad|Tablet/i.test(ua)
    ? "tablet"
    : /Mobi|Android|iPhone/i.test(ua)
      ? "mobile"
      : "desktop";
  const referer = headerList.get("referer");
  const boardId = board.id;

  // Robô, monitor e verificação por linha de comando não entram na conta:
  // o número do painel precisa significar "pessoas que encostaram o celular".
  const contar = !ehAcessoDeRobo(ua);

  after(async () => {
    if (!contar) return;
    try {
      await db.visit.create({
        data: { boardId, source, device, referer: referer ?? null },
      });
    } catch {
      /* uma visita perdida não pode quebrar a página */
    }
  });

  const custom = toCustomization(board.customization);

  /**
   * Pinta o `html` e o `body` com a cor do template.
   *
   * No celular a barra do navegador recolhe ao rolar e o sistema descobre uma
   * faixa a mais embaixo. Essa faixa não pertence ao conteúdo da página: é o
   * fundo do documento. Sem isto ela aparece branca, como se a página tivesse
   * acabado no meio.
   *
   * `overscroll-behavior: none` corta o efeito elástico que mostraria a mesma
   * faixa ao puxar a página para cima.
   */
  const corDeFundo = corDoRodape(board.template.key, custom);

  return (
    <>
      <style>{`html,body{background-color:${corDeFundo};overscroll-behavior:none}`}</style>
      <div className="flex min-h-dvh flex-col">
        <PublicPage
          templateKey={board.template.key}
          custom={custom}
          links={board.links}
          facts={board.facts}
          projects={board.projects}
          gallery={board.gallery}
          slug={board.slug}
        />
      </div>
    </>
  );
}

/**
 * Cor que o pé da página tem de verdade, para o documento combinar com ela.
 *
 * Não é sempre `background`: o layout `split` termina em cinza claro, e no
 * modo degradê o fundo escurece até o rodapé. Errar aqui deixa uma emenda
 * visível justamente na faixa que queremos esconder.
 */
function corDoRodape(
  templateKey: string,
  custom: { background: string; backgroundMode: string },
) {
  if (getTemplate(templateKey).layout === "split") return "#f6f8fc";

  const hex = /^#[0-9a-fA-F]{6}$/.test(custom.background)
    ? custom.background
    : "#0e2143";

  return custom.backgroundMode === "gradient" ? shadeColor(hex, -0.25) : hex;
}

function UnavailablePage({ name }: { name: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-nav px-6 text-center">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(700px 400px at 50% 0%, rgba(27,84,176,0.4), transparent 65%)",
        }}
      />
      <div className="relative flex flex-col items-center">
        <div className="grid size-16 place-items-center rounded-2xl bg-white/10 text-white/70 ring-1 ring-white/15">
          <PauseCircle className="size-8" />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-white">
          Página temporariamente indisponível
        </h1>
        <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-white/55">
          A página de <strong className="text-white/80">{name}</strong> está
          pausada no momento. Tente novamente mais tarde.
        </p>
        <div className="mt-10 text-white/35">
          <SolutecLogo size={22} />
        </div>
      </div>
    </div>
  );
}
