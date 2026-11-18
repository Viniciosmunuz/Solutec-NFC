import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { after, connection } from "next/server";
import { headers } from "next/headers";
import { PauseCircle } from "lucide-react";
import PublicPage from "@/components/public/PublicPage";
import { SolutecLogo } from "@/components/brand/logo";
import { db } from "@/lib/db";
import { toCustomization } from "@/lib/customization";
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
      links: {
        where: { active: true },
        orderBy: { position: "asc" },
        select: {
          id: true,
          type: true,
          label: true,
          url: true,
          asSocial: true,
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

  after(async () => {
    try {
      await db.visit.create({
        data: { boardId, source, device, referer: referer ?? null },
      });
    } catch {
      /* uma visita perdida não pode quebrar a página */
    }
  });

  return (
    <div className="flex min-h-dvh flex-col">
      <PublicPage
        templateKey={board.template.key}
        custom={toCustomization(board.customization)}
        links={board.links}
        slug={board.slug}
      />
    </div>
  );
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
