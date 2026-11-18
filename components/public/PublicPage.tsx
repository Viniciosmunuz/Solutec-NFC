"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, ChevronRight, Download, Share2 } from "lucide-react";
import { getLinkType } from "@/lib/links";
import { fontStack, getTemplate, type OrnamentKey } from "@/lib/templates";
import { hexToRgba, initials, readableText, shadeColor } from "@/lib/utils";

export type PublicLink = {
  id: string;
  type: string;
  label: string;
  url: string;
  asSocial: boolean;
  /** botão maior, com a cor cheia da marca */
  highlight?: boolean;
  /** cor própria deste botão */
  color?: string | null;
};

export type PublicCustomization = {
  displayName: string;
  headline: string | null;
  bio: string | null;
  avatarUrl: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  /** zoom aplicado à foto (1 = ajustada ao recorte) */
  avatarZoom: number;
  /** ponto da foto que fica no centro do recorte, em % */
  avatarX: number;
  avatarY: number;
  coverZoom: number;
  coverX: number;
  coverY: number;
  accent: string;
  background: string;
  textColor: string;
  buttonStyle: "row" | "solid" | "outline" | "soft" | "glass";
  buttonRadius: "rounded" | "pill" | "square";
  fontFamily:
    | "inter"
    | "poppins"
    | "montserrat"
    | "nunito"
    | "oswald"
    | "bebas"
    | "playfair"
    | "lora"
    | "dancing"
    | "mono";
  backgroundMode: "solid" | "gradient" | "image";
  showAvatar: boolean;
  /** anel colorido em volta da foto de perfil */
  avatarRing: boolean;
  /** forma da foto de perfil */
  avatarShape: "circulo" | "quadrado";
  /** respiro entre os blocos */
  spacing: "compacto" | "normal" | "arejado";
  /** multiplicador do tamanho dos textos */
  fontScale: number;
  /** opacidade da capa como fundo, em % */
  coverOpacity: number;
  /** linha de sociais acima ou abaixo dos botões */
  socialPosition: "acima" | "abaixo";
  showLogo: boolean;
  showBio: boolean;
  showSocial: boolean;
  showShare: boolean;
  showContactCard: boolean;
};

type Props = {
  templateKey: string;
  custom: PublicCustomization;
  links: PublicLink[];
  /** slug da placa — usado para registrar cliques. Ausente no preview. */
  slug?: string;
  /** true quando renderizado dentro do editor (sem tracking) */
  preview?: boolean;
};

/** Espaço entre os botões, por nível de respiro escolhido. */
const GAPS: Record<string, number> = {
  compacto: 8,
  normal: 12,
  arejado: 18,
};

const RADIUS: Record<PublicCustomization["buttonRadius"], string> = {
  rounded: "14px",
  pill: "999px",
  square: "4px",
};

/** Tudo que os blocos internos precisam, montado uma vez por render. */
type Ctx = {
  custom: PublicCustomization;
  slug?: string;
  preview: boolean;
  /** o conteúdo está sobre uma superfície escura? */
  onDark: boolean;
  /** cor de texto principal sobre o fundo da página */
  pageText: string;
  radius: string;
  /** multiplicador de tamanho dos textos */
  scale: number;
  /** espaço entre os botões, em px */
  gap: number;
  onLinkClick: (link: PublicLink) => void;
};

// ---------------------------------------------------------------------------
// Blocos (definidos no módulo, nunca dentro do render)
// ---------------------------------------------------------------------------

/**
 * Enquadramento de uma foto dentro do recorte.
 *
 * `object-position` escolhe que ponto da imagem fica visível e `scale`
 * aproxima. A ordem importa: com `object-fit: cover` o navegador primeiro
 * ajusta a imagem ao recorte e só depois aplica a escala, que é exatamente
 * o comportamento que o operador espera ao arrastar e dar zoom.
 *
 * Valores padrão (zoom 1, 50/50) não produzem estilo nenhum — fotos antigas
 * continuam renderizando como antes.
 */
function frame(zoom = 1, x = 50, y = 50): React.CSSProperties {
  const z = Number.isFinite(zoom) ? Math.min(3, Math.max(1, zoom)) : 1;
  const px = Number.isFinite(x) ? Math.min(100, Math.max(0, x)) : 50;
  const py = Number.isFinite(y) ? Math.min(100, Math.max(0, y)) : 50;
  return {
    objectPosition: `${px}% ${py}%`,
    transform: z === 1 ? undefined : `scale(${z})`,
    transformOrigin: `${px}% ${py}%`,
  };
}

function Avatar({
  ctx,
  size = 112,
  square = false,
  ring,
}: {
  ctx: Ctx;
  size?: number;
  square?: boolean;
  ring?: string;
}) {
  const { custom } = ctx;
  if (!custom.showAvatar) return null;

  // A escolha do operador manda; o `square` do layout é só o padrão de quem
  // não escolheu nada.
  const quadrado =
    custom.avatarShape === "quadrado"
      ? true
      : custom.avatarShape === "circulo"
        ? false
        : square;

  // Sem o anel a foto continua com a sombra — é ela que descola o avatar do
  // fundo. Tirar as duas deixaria a foto parecendo colada na página.
  const anel = custom.avatarRing
    ? `0 0 0 4px ${ring ?? hexToRgba(custom.accent, 0.35)}, `
    : "";

  return (
    <div
      className="relative overflow-hidden bg-black/10"
      style={{
        width: size,
        height: size,
        borderRadius: quadrado ? Math.round(size * 0.2) : 999,
        boxShadow: `${anel}0 12px 30px rgba(0,0,0,0.25)`,
      }}
    >
      {custom.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={custom.avatarUrl}
          alt={custom.displayName}
          className="size-full object-cover"
          style={frame(custom.avatarZoom, custom.avatarX, custom.avatarY)}
        />
      ) : (
        <div
          className="grid size-full place-items-center font-bold"
          style={{
            backgroundColor: shadeColor(custom.accent, -0.1),
            color: readableText(custom.accent),
            fontSize: size / 3,
          }}
        >
          {initials(custom.displayName || "SL")}
        </div>
      )}
    </div>
  );
}

function Logo({ ctx, height = 40 }: { ctx: Ctx; height?: number }) {
  if (!ctx.custom.showLogo || !ctx.custom.logoUrl) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={ctx.custom.logoUrl}
      alt=""
      style={{ height }}
      className="w-auto max-w-[70%] object-contain"
    />
  );
}

function Heading({
  ctx,
  align = "center",
  color,
  nameSize = 26,
}: {
  ctx: Ctx;
  align?: "center" | "left";
  color: string;
  nameSize?: number;
}) {
  const { custom } = ctx;
  return (
    <div
      className={align === "center" ? "text-center" : "text-left"}
      style={{ color }}
    >
      <h1
        className="font-bold leading-tight tracking-tight"
        style={{ fontSize: Math.round(nameSize * ctx.scale) }}
      >
        {custom.displayName || "Nome da empresa"}
      </h1>
      {custom.headline ? (
        <p
          className="mt-1 font-semibold uppercase tracking-[0.14em]"
          style={{
            color: custom.accent,
            opacity: 0.95,
            fontSize: Math.round(13 * ctx.scale),
          }}
        >
          {custom.headline}
        </p>
      ) : null}
      {custom.showBio && custom.bio ? (
        <p
          className={`mt-3 max-w-[34ch] leading-relaxed opacity-80 ${
            align === "center" ? "mx-auto" : ""
          }`}
          style={{ color, fontSize: Math.round(14 * ctx.scale) }}
        >
          {custom.bio}
        </p>
      ) : null}
    </div>
  );
}

function buttonStyles(
  ctx: Ctx,
  onDarkSurface: boolean,
  corDoLink?: string,
): React.CSSProperties {
  const accent = corDoLink ?? ctx.custom.accent;
  const radius = ctx.radius;

  switch (ctx.custom.buttonStyle) {
    // Linha neutra com a cor da marca concentrada no ícone. É o estilo das
    // referências: o botão não grita, quem carrega a identidade é o chip.
    case "row":
      return {
        backgroundColor: onDarkSurface
          ? "rgba(255,255,255,0.055)"
          : "#ffffff",
        border: `1px solid ${
          onDarkSurface ? "rgba(255,255,255,0.10)" : hexToRgba(accent, 0.14)
        }`,
        color: onDarkSurface ? "#ffffff" : "#15233c",
        borderRadius: radius,
      };
    case "outline":
      return {
        backgroundColor: "transparent",
        border: `1.5px solid ${onDarkSurface ? hexToRgba(accent, 0.75) : accent}`,
        color: onDarkSurface ? "#fff" : accent,
        borderRadius: radius,
      };
    case "soft":
      return {
        backgroundColor: hexToRgba(accent, onDarkSurface ? 0.22 : 0.12),
        border: `1px solid ${hexToRgba(accent, 0.22)}`,
        color: onDarkSurface ? "#fff" : shadeColor(accent, -0.25),
        borderRadius: radius,
      };
    case "glass":
      return {
        backgroundColor: onDarkSurface
          ? "rgba(255,255,255,0.08)"
          : "rgba(255,255,255,0.65)",
        border: `1px solid ${
          onDarkSurface ? "rgba(255,255,255,0.16)" : hexToRgba(accent, 0.2)
        }`,
        backdropFilter: "blur(12px)",
        color: onDarkSurface ? "#fff" : "#10233f",
        borderRadius: radius,
      };
    default:
      return {
        backgroundColor: accent,
        border: `1px solid ${accent}`,
        color: readableText(accent),
        borderRadius: radius,
      };
  }
}

function LinkButton({
  ctx,
  link,
  onDarkSurface,
}: {
  ctx: Ctx;
  link: PublicLink;
  onDarkSurface: boolean;
}) {
  const Icon = getLinkType(link.type).icon;
  const { buttonStyle } = ctx.custom;
  const isRow = buttonStyle === "row";

  // Cor própria do link, quando houver, no lugar da cor do template.
  const accent =
    link.color && /^#[0-9a-fA-F]{6}$/.test(link.color)
      ? link.color
      : ctx.custom.accent;

  /**
   * Botão de destaque: a cor preenche a linha inteira em vez de ficar só no
   * chip. É o que diferencia "peça pelo WhatsApp" de mais um link na lista.
   */
  const destaque = Boolean(link.highlight);

  /**
   * No estilo "row" o ícone ganha um chip com a cor da marca; nos outros ele
   * segue a cor do próprio botão, como antes.
   */
  const chipStyle: React.CSSProperties = isRow
    ? destaque
      ? {
          backgroundColor: "rgba(255,255,255,0.22)",
          color: readableText(accent),
          borderRadius: ctx.custom.buttonRadius === "square" ? 6 : 11,
        }
      : {
          backgroundColor: accent,
          color: readableText(accent),
          borderRadius: ctx.custom.buttonRadius === "square" ? 6 : 11,
        }
    : {};

  const estiloBase = buttonStyles(ctx, onDarkSurface, accent);
  const estiloDestaque: React.CSSProperties = destaque
    ? {
        backgroundColor: accent,
        border: `1px solid ${accent}`,
        color: readableText(accent),
        borderRadius: ctx.radius,
      }
    : {};

  return (
    <a
      href={link.url}
      target={link.url.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      onClick={() => ctx.onLinkClick(link)}
      className={`group flex w-full items-center font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] ${
        isRow
          ? destaque
            ? "gap-3 py-3 pl-3 pr-4"
            : "gap-3 py-2 pl-2 pr-3.5"
          : "gap-3 px-4 py-3.5"
      }`}
      style={{
        ...estiloBase,
        ...estiloDestaque,
        fontSize: Math.round((destaque ? 16 : 15) * ctx.scale),
        boxShadow:
          destaque || buttonStyle === "solid"
            ? `0 8px 22px ${hexToRgba(accent, 0.35)}`
            : isRow
              ? onDarkSurface
                ? "0 2px 10px rgba(0,0,0,0.35)"
                : "0 4px 14px rgba(16,35,63,0.08)"
              : undefined,
      }}
    >
      <span
        className={
          isRow
            ? "grid size-10 shrink-0 place-items-center"
            : "grid size-7 shrink-0 place-items-center"
        }
        style={chipStyle}
      >
        <Icon className={isRow ? "size-5" : "size-[19px]"} strokeWidth={2.2} />
      </span>
      <span className="flex-1 text-left leading-tight">{link.label}</span>
      <ChevronRight
        className={`size-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${
          isRow ? "opacity-45" : "opacity-0 group-hover:opacity-60"
        }`}
        strokeWidth={2.5}
      />
    </a>
  );
}

/**
 * Azulejo da grade: ícone grande em cima, rótulo embaixo.
 *
 * Em duas colunas não cabe o formato de linha — o rótulo quebraria. Aqui o
 * ícone é o que identifica, e o texto vira legenda.
 */
function GridTile({
  ctx,
  link,
  onDarkSurface,
}: {
  ctx: Ctx;
  link: PublicLink;
  onDarkSurface: boolean;
}) {
  const Icon = getLinkType(link.type).icon;
  const accent =
    link.color && /^#[0-9a-fA-F]{6}$/.test(link.color)
      ? link.color
      : ctx.custom.accent;
  const destaque = Boolean(link.highlight);

  return (
    <a
      href={link.url}
      target={link.url.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      onClick={() => ctx.onLinkClick(link)}
      className={`flex h-full flex-col items-center justify-center gap-2.5 px-3 text-center font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
        destaque ? "py-4" : "py-5"
      }`}
      style={{
        ...buttonStyles(ctx, onDarkSurface, accent),
        ...(destaque
          ? {
              backgroundColor: accent,
              border: `1px solid ${accent}`,
              color: readableText(accent),
            }
          : {}),
        fontSize: Math.round(13.5 * ctx.scale),
        boxShadow: destaque
          ? `0 8px 22px ${hexToRgba(accent, 0.35)}`
          : onDarkSurface
            ? "0 2px 10px rgba(0,0,0,0.35)"
            : "0 4px 14px rgba(16,35,63,0.08)",
      }}
    >
      <span
        className="grid size-11 place-items-center"
        style={{
          backgroundColor: destaque ? "rgba(255,255,255,0.22)" : accent,
          color: readableText(accent),
          borderRadius: ctx.custom.buttonRadius === "square" ? 8 : 999,
        }}
      >
        <Icon className="size-[22px]" strokeWidth={2.2} />
      </span>
      <span className="leading-tight">{link.label}</span>
    </a>
  );
}

/**
 * Cartão de destaque do layout `showcase`: o primeiro link ganha a capa de
 * fundo e o tamanho de um banner. É onde entra "peça pelo cardápio" ou
 * "agende sua visita" — a ação que paga a placa.
 */
function ShowcaseCard({
  ctx,
  link,
}: {
  ctx: Ctx;
  link: PublicLink;
}) {
  const { custom } = ctx;
  const Icon = getLinkType(link.type).icon;
  const accent =
    link.color && /^#[0-9a-fA-F]{6}$/.test(link.color)
      ? link.color
      : custom.accent;

  return (
    <a
      href={link.url}
      target={link.url.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      onClick={() => ctx.onLinkClick(link)}
      className="relative flex h-36 w-full items-end overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
      style={{
        borderRadius: ctx.custom.buttonRadius === "square" ? 6 : 20,
        boxShadow: `0 10px 28px ${hexToRgba(accent, 0.3)}`,
      }}
    >
      {custom.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={custom.coverUrl}
          alt=""
          className="absolute inset-0 size-full object-cover"
          style={frame(custom.coverZoom, custom.coverX, custom.coverY)}
        />
      ) : null}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: custom.coverUrl
            ? `linear-gradient(180deg, ${hexToRgba(accent, 0.25)}, ${hexToRgba(accent, 0.92)})`
            : `linear-gradient(135deg, ${accent}, ${shadeColor(accent, -0.4)})`,
        }}
      />
      <div
        className="relative flex w-full items-center gap-3 p-4"
        style={{ color: readableText(accent) }}
      >
        <span
          className="grid size-11 shrink-0 place-items-center rounded-xl"
          style={{ backgroundColor: "rgba(255,255,255,0.22)" }}
        >
          <Icon className="size-[22px]" strokeWidth={2.2} />
        </span>
        <span
          className="flex-1 font-bold leading-tight"
          style={{ fontSize: Math.round(17 * ctx.scale) }}
        >
          {link.label}
        </span>
        <ChevronRight className="size-5 shrink-0 opacity-80" strokeWidth={2.5} />
      </div>
    </a>
  );
}

function Buttons({
  ctx,
  links,
  hasSocial,
  onDarkSurface,
}: {
  ctx: Ctx;
  links: PublicLink[];
  hasSocial: boolean;
  onDarkSurface: boolean;
}) {
  if (links.length === 0 && !hasSocial) {
    return (
      <p
        className="rounded-xl border border-dashed px-4 py-8 text-center text-sm opacity-60"
        style={{ color: onDarkSurface ? "#fff" : ctx.custom.textColor }}
      >
        Nenhum link cadastrado ainda.
      </p>
    );
  }

  return (
    <div className="flex flex-col" style={{ gap: ctx.gap }}>
      {links.map((link, i) => (
        <div
          key={link.id}
          className="animate-in-up"
          style={{ animationDelay: `${i * 55}ms` }}
        >
          <LinkButton ctx={ctx} link={link} onDarkSurface={onDarkSurface} />
        </div>
      ))}
    </div>
  );
}

function SocialRow({
  ctx,
  links,
  onDarkSurface,
}: {
  ctx: Ctx;
  links: PublicLink[];
  onDarkSurface: boolean;
}) {
  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5 pt-3">
      {links.map((link) => {
        const Icon = getLinkType(link.type).icon;
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            onClick={() => ctx.onLinkClick(link)}
            className="grid size-11 place-items-center rounded-full transition-all duration-200 hover:-translate-y-1"
            style={{
              backgroundColor: onDarkSurface
                ? "rgba(255,255,255,0.1)"
                : hexToRgba(ctx.custom.accent, 0.1),
              color: onDarkSurface ? "#fff" : ctx.custom.accent,
              border: `1px solid ${
                onDarkSurface
                  ? "rgba(255,255,255,0.14)"
                  : hexToRgba(ctx.custom.accent, 0.16)
              }`,
            }}
          >
            <Icon className="size-5" strokeWidth={2.2} />
          </a>
        );
      })}
    </div>
  );
}

function ShareBar({ ctx }: { ctx: Ctx }) {
  const [copied, setCopied] = useState(false);
  const { custom, slug, preview, onDark } = ctx;

  if (!custom.showShare) return null;

  const chip: React.CSSProperties = {
    backgroundColor: onDark
      ? "rgba(255,255,255,0.1)"
      : hexToRgba(custom.accent, 0.08),
    color: onDark ? "#fff" : custom.textColor,
  };

  const share = async () => {
    if (preview) return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: custom.displayName, url });
        return;
      } catch {
        /* o usuário cancelou */
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-center gap-2 pt-3">
      <button
        type="button"
        onClick={share}
        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-opacity hover:opacity-80"
        style={chip}
      >
        {copied ? <Check className="size-3.5" /> : <Share2 className="size-3.5" />}
        {copied ? "Link copiado" : "Compartilhar"}
      </button>
      {custom.showContactCard && slug && !preview ? (
        <a
          href={`/api/p/${slug}/vcard`}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-opacity hover:opacity-80"
          style={chip}
        >
          <Download className="size-3.5" />
          Salvar contato
        </a>
      ) : null}
    </div>
  );
}

function Footer({ color }: { color: string }) {
  return (
    <p
      className="pb-6 pt-8 text-center text-[11px] tracking-wide opacity-45"
      style={{ color }}
    >
      Feito com Solutec
    </p>
  );
}

/** Botões + sociais + compartilhar, na ordem padrão. */
function Body({
  ctx,
  buttonLinks,
  socialLinks,
  onDarkSurface,
  share = true,
}: {
  ctx: Ctx;
  buttonLinks: PublicLink[];
  socialLinks: PublicLink[];
  onDarkSurface: boolean;
  /**
   * false quando o compartilhar foi para o rodapé da tela, em vez de ficar
   * logo abaixo dos botões. Nos layouts com cartão branco ele continua
   * dentro do cartão — solto no fim da página pareceria perdido.
   */
  share?: boolean;
}) {
  return (
    <>
      {ctx.custom.socialPosition === "acima" ? (
        <SocialRow ctx={ctx} links={socialLinks} onDarkSurface={onDarkSurface} />
      ) : null}
      <Buttons
        ctx={ctx}
        links={buttonLinks}
        hasSocial={socialLinks.length > 0}
        onDarkSurface={onDarkSurface}
      />
      {ctx.custom.socialPosition === "abaixo" ? (
        <SocialRow ctx={ctx} links={socialLinks} onDarkSurface={onDarkSurface} />
      ) : null}
      {share ? <ShareBar ctx={ctx} /> : null}
    </>
  );
}

/**
 * Compartilhar e assinatura, encostados no fim da tela.
 *
 * `mt-auto` empurra o bloco para baixo quando a página tem pouco conteúdo —
 * é o que dá o respiro entre os botões e o rodapé. Com a página cheia, ele
 * simplesmente fica depois do último link, como antes.
 */
function Bottom({ ctx, color }: { ctx: Ctx; color: string }) {
  return (
    <div className="mt-auto w-full pt-10">
      <ShareBar ctx={ctx} />
      <Footer color={color} />
    </div>
  );
}

/**
 * Camada decorativa do fundo.
 *
 * São formas puramente visuais — ondas, faixas, folhas — desenhadas em SVG e
 * pintadas com a cor de destaque do template. Ficam atrás de tudo e não
 * recebem clique. O `viewBox` é esticado de propósito (`preserveAspectRatio
 * none`): a forma acompanha a altura da página em vez de repetir.
 */
function Ornament({
  name,
  accent,
  onDark,
}: {
  name?: OrnamentKey;
  accent: string;
  onDark: boolean;
}) {
  if (!name) return null;

  const a = (o: number) => hexToRgba(accent, o);
  const veil = onDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.55)";
  const cls = "pointer-events-none absolute inset-0 size-full";

  switch (name) {
    // Ondas suaves no topo e no rodapé.
    case "waves":
      return (
        <svg className={cls} viewBox="0 0 390 780" preserveAspectRatio="none" aria-hidden>
          <path d="M0 0h390v96c-78 54-152 2-244 42S54 214 0 176Z" fill={a(0.85)} />
          <path d="M0 0h390v58c-86 46-150 0-238 40S48 160 0 126Z" fill={veil} />
          <path d="M0 780h390V648c-84-44-166 16-258 42S56 712 0 678Z" fill={a(0.85)} />
        </svg>
      );

    // Lascas diagonais no canto superior, para templates de energia.
    case "shards":
      return (
        <svg className={cls} viewBox="0 0 390 780" preserveAspectRatio="none" aria-hidden>
          <path d="M300 0h34L262 108h-34Z" fill={a(0.45)} />
          <path d="M348 0h42L316 116h-42Z" fill={a(0.8)} />
          <path d="M330 34h60v26L330 140Z" fill={a(0.22)} />
          <path d="M0 780h56l74-98H62Z" fill={a(0.3)} />
        </svg>
      );

    // Folhas nos cantos — clínicas, bem-estar, natural.
    case "leaves":
      return (
        <svg className={cls} viewBox="0 0 390 780" preserveAspectRatio="none" aria-hidden>
          <path
            d="M390 0c-60 10-108 46-128 96-18 46 2 86 36 96 40 12 82-22 96-74 10-38 6-80-4-118Z"
            fill={a(0.5)}
          />
          <path
            d="M352 24c-36 36-54 82-48 124 4 28 24 44 44 38 24-6 38-40 36-80-2-30-14-60-32-82Z"
            fill={a(0.8)}
          />
          <path
            d="M0 780c54-14 96-52 112-100 14-44-6-80-38-88-38-10-76 24-88 74-8 36-4 76 6 114Z"
            fill={a(0.45)}
          />
        </svg>
      );

    // Manchas difusas, bem suaves.
    case "blobs":
      return (
        <svg className={cls} viewBox="0 0 390 780" preserveAspectRatio="none" aria-hidden>
          <defs>
            <radialGradient id="orn-blob-a">
              <stop offset="0%" stopColor={a(0.55)} />
              <stop offset="100%" stopColor={a(0)} />
            </radialGradient>
          </defs>
          <ellipse cx="60" cy="70" rx="210" ry="170" fill="url(#orn-blob-a)" />
          <ellipse cx="350" cy="700" rx="190" ry="160" fill="url(#orn-blob-a)" />
        </svg>
      );

    // Riscos finos nos cantos — luxo, barbearia.
    case "streaks":
      return (
        <svg className={cls} viewBox="0 0 390 780" preserveAspectRatio="none" aria-hidden>
          <path d="M0 0h130L0 150Z" fill={a(0.5)} />
          <path d="M0 24h74L0 104Z" fill={a(0.9)} />
          <path d="M390 780H270L390 640Z" fill={a(0.5)} />
          <path d="M390 756h-66L390 684Z" fill={a(0.9)} />
        </svg>
      );

    // Fita diagonal atravessando o topo.
    case "diagonal":
      return (
        <svg className={cls} viewBox="0 0 390 780" preserveAspectRatio="none" aria-hidden>
          <path d="M0 0h150L0 210Z" fill={a(0.85)} />
          <path d="M60 0h80L0 128V48Z" fill={veil} />
          <path d="M390 780h-140L390 560Z" fill={a(0.5)} />
        </svg>
      );

    // Onda vertical na lateral direita.
    case "sidewave":
      return (
        <svg className={cls} viewBox="0 0 390 780" preserveAspectRatio="none" aria-hidden>
          <path d="M390 0v780H250c52-150-40-230-4-380S300 90 286 0Z" fill={a(0.12)} />
          <path d="M390 0v780h-54c38-150-28-230 2-380s46-310 34-400Z" fill={a(0.28)} />
          <path d="M390 0v780h-14c12-160-10-240 2-390S378 80 374 0Z" fill={a(0.8)} />
        </svg>
      );

    // Barras anguladas — concessionárias, automotivo.
    case "angles":
      return (
        <svg className={cls} viewBox="0 0 390 780" preserveAspectRatio="none" aria-hidden>
          <path d="M0 0h96L0 128Z" fill={a(0.9)} />
          <path d="M110 0h52L0 182v-44Z" fill={a(0.45)} />
          <path d="M390 780h-110L390 640Z" fill={a(0.9)} />
          <path d="M390 600v34L256 780h-60Z" fill={a(0.4)} />
        </svg>
      );

    default:
      return null;
  }
}

function Shell({
  children,
  style,
  ornament,
  accent,
  onDark,
  cover,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  ornament?: OrnamentKey;
  accent: string;
  onDark: boolean;
  /** foto de fundo, quando o template usa o modo imagem */
  cover?: React.ReactNode;
}) {
  return (
    // `grow` é o que faz o fundo chegar até o fim da tela quando a página tem
    // pouco conteúdo — sem ele a cor para onde o conteúdo acaba e sobra uma
    // faixa branca embaixo. Os contêineres de fora são flex-col por isso.
    <div
      className="relative flex min-h-full w-full grow flex-col overflow-hidden"
      style={style}
    >
      {cover}
      <Ornament name={ornament} accent={accent} onDark={onDark} />
      {/* flex-col aqui é o que deixa o conteúdo esticar: sem isso o `grow`
          dos layouts não tem contra quem crescer, e o `mt-auto` do rodapé
          não empurra nada. */}
      <div className="relative mx-auto flex w-full max-w-[460px] grow flex-col px-5">
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function PublicPage({
  templateKey,
  custom,
  links,
  slug,
  preview = false,
}: Props) {
  const template = getTemplate(templateKey);
  const layout = template.layout;
  const ornament = template.ornament;
  const darkLayout = layout === "spotlight" || layout === "neon";
  const onDark = darkLayout || layout === "card" || layout === "cover";
  const pageText = darkLayout ? "#ffffff" : readableText(custom.background);
  /**
   * Os layouts novos não têm "versão clara" e "versão escura" separadas: o
   * tom vem da cor de fundo escolhida. Olhar o nome do layout daria um bloco
   * branco leitoso sobre fundo escuro.
   */
  const sobreEscuro = pageText.toLowerCase() === "#ffffff";

  const onLinkClick = useCallback(
    (link: PublicLink) => {
      if (preview || !slug) return;
      try {
        const payload = JSON.stringify({ slug, linkId: link.id });
        if (navigator.sendBeacon) {
          navigator.sendBeacon(
            "/api/track/click",
            new Blob([payload], { type: "application/json" }),
          );
        } else {
          void fetch("/api/track/click", {
            method: "POST",
            body: payload,
            headers: { "Content-Type": "application/json" },
            keepalive: true,
          });
        }
      } catch {
        /* o tracking nunca pode impedir a navegação */
      }
    },
    [preview, slug],
  );

  const ctx = useMemo<Ctx>(
    () => ({
      custom,
      slug,
      preview,
      onDark,
      pageText,
      radius: RADIUS[custom.buttonRadius] ?? RADIUS.rounded,
      scale: Math.min(1.25, Math.max(0.85, custom.fontScale || 1)),
      gap: GAPS[custom.spacing] ?? GAPS.normal,
      onLinkClick,
    }),
    [custom, slug, preview, onDark, pageText, onLinkClick],
  );

  const activeLinks = links.filter((l) => l.url);
  const socialLinks = custom.showSocial
    ? activeLinks.filter((l) => l.asSocial)
    : [];
  const buttonLinks = activeLinks.filter(
    (l) => !l.asSocial || !custom.showSocial,
  );

  const font = fontStack(custom.fontFamily);
  const bg = custom.background;

  // No modo imagem a capa deixou de ser `background-image` e virou uma <img>
  // de verdade: só assim o zoom e a posição escolhidos no painel valem,
  // porque `background-size: cover` não combina com escala.
  const fundoComFoto = custom.backgroundMode === "image" && !!custom.coverUrl;

  const backgroundStyle: React.CSSProperties =
    custom.backgroundMode === "gradient"
      ? {
          backgroundImage: `linear-gradient(165deg, ${shadeColor(bg, 0.12)} 0%, ${bg} 45%, ${shadeColor(bg, -0.25)} 100%)`,
        }
      : { backgroundColor: bg };

  const coverLayer = fundoComFoto ? (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={custom.coverUrl!}
        alt=""
        className="pointer-events-none absolute inset-0 size-full object-cover"
        style={{
          ...frame(custom.coverZoom, custom.coverX, custom.coverY),
          opacity: Math.min(1, Math.max(0.1, (custom.coverOpacity ?? 100) / 100)),
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(180deg, ${hexToRgba(bg, 0.55)}, ${hexToRgba(bg, 0.95)})`,
        }}
      />
    </>
  ) : null;

  const shellStyle = { ...backgroundStyle, fontFamily: font };

  // Com cartão branco o compartilhar fica dentro do cartão; sem cartão ele
  // desce para o rodapé da tela, junto da assinatura.
  const body = (
    <Body
      ctx={ctx}
      buttonLinks={buttonLinks}
      socialLinks={socialLinks}
      onDarkSurface={false}
    />
  );

  const bodySemShare = (
    <Body
      ctx={ctx}
      buttonLinks={buttonLinks}
      socialLinks={socialLinks}
      onDarkSurface={false}
      share={false}
    />
  );

  // ---- spotlight / neon ----
  if (layout === "spotlight" || layout === "neon") {
    return (
      <Shell style={shellStyle} ornament={ornament} accent={custom.accent} onDark={darkLayout} cover={coverLayer}>
        <div className="relative flex grow flex-col items-center pt-14">
          {layout === "neon" ? (
            <div
              className="pointer-events-none absolute -top-10 left-1/2 size-72 -translate-x-1/2 rounded-full blur-3xl"
              style={{ backgroundColor: hexToRgba(custom.accent, 0.35) }}
            />
          ) : null}
          <div className="relative flex flex-col items-center gap-5">
            <Logo ctx={ctx} height={34} />
            <Avatar ctx={ctx} size={118} />
            <Heading ctx={ctx} color="#fff" nameSize={27} />
          </div>
          <div className="mt-8 w-full">
            <Body
              ctx={ctx}
              buttonLinks={buttonLinks}
              socialLinks={socialLinks}
              onDarkSurface
              share={false}
            />
          </div>
          <Bottom ctx={ctx} color={pageText} />
        </div>
      </Shell>
    );
  }

  // ---- card ----
  if (layout === "card") {
    return (
      <Shell style={shellStyle} ornament={ornament} accent={custom.accent} onDark={darkLayout} cover={coverLayer}>
        <div className="flex min-h-screen flex-col justify-center py-10">
          <div
            className="w-full overflow-hidden rounded-[26px] bg-white px-6 pb-7 pt-8 shadow-float"
            style={{ color: custom.textColor }}
          >
            <div className="flex flex-col items-center gap-4">
              <Logo ctx={ctx} height={32} />
              <Avatar ctx={ctx} size={96} ring={hexToRgba(custom.accent, 0.18)} />
              <Heading ctx={ctx} color={custom.textColor} />
            </div>
            <div className="mt-7">{body}</div>
          </div>
          <Footer color={pageText} />
        </div>
      </Shell>
    );
  }

  // ---- cover ----
  if (layout === "cover") {
    return (
      <Shell style={shellStyle} ornament={ornament} accent={custom.accent} onDark={darkLayout} cover={coverLayer}>
        <div className="flex grow flex-col pb-2">
          <div className="-mx-5">
            <div
              className="relative h-44 w-full overflow-hidden"
              style={
                custom.coverUrl
                  ? undefined
                  : {
                      backgroundImage: `linear-gradient(135deg, ${custom.accent}, ${shadeColor(custom.accent, -0.4)})`,
                    }
              }
            >
              {custom.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={custom.coverUrl}
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                  style={frame(custom.coverZoom, custom.coverX, custom.coverY)}
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
              {custom.showLogo && custom.logoUrl ? (
                <div className="absolute left-5 top-5">
                  <Logo ctx={ctx} height={28} />
                </div>
              ) : null}
            </div>
          </div>
          <div className="relative -mt-14 rounded-[24px] bg-white px-6 pb-7 pt-0 shadow-float">
            <div className="flex -translate-y-10 flex-col items-center gap-3">
              <Avatar ctx={ctx} size={92} ring="#ffffff" />
              <Heading ctx={ctx} color={custom.textColor} />
            </div>
            <div className="-mt-6">{body}</div>
          </div>
          <div className="mt-auto">
            <Footer color={pageText} />
          </div>
        </div>
      </Shell>
    );
  }

  // ---- editorial ----
  if (layout === "editorial") {
    return (
      <Shell style={shellStyle} ornament={ornament} accent={custom.accent} onDark={darkLayout} cover={coverLayer}>
        <div className="flex grow flex-col pt-12">
          <div className="flex items-end gap-4">
            <Avatar
              ctx={ctx}
              size={88}
              square
              ring={hexToRgba(custom.accent, 0.2)}
            />
            <div className="pb-1">
              <Logo ctx={ctx} height={24} />
            </div>
          </div>
          <div
            className="mt-6 border-t pt-5"
            style={{ borderColor: hexToRgba(custom.accent, 0.25) }}
          >
            <Heading
              ctx={ctx}
              align="left"
              color={custom.textColor}
              nameSize={30}
            />
          </div>
          <div className="mt-7">{bodySemShare}</div>
          <Bottom ctx={ctx} color={pageText} />
        </div>
      </Shell>
    );
  }

  // ---- split ----
  if (layout === "split") {
    return (
      <div
        className="relative flex min-h-full w-full grow flex-col overflow-hidden bg-[#f6f8fc]"
        style={{ fontFamily: font }}
      >
        <Ornament name={ornament} accent={custom.accent} onDark={false} />
        <div
          className="relative w-full pb-16 pt-12"
          style={{
            backgroundImage: `linear-gradient(135deg, ${custom.accent}, ${shadeColor(custom.accent, -0.35)})`,
          }}
        >
          <div className="mx-auto flex w-full max-w-[460px] flex-col items-center gap-4 px-5">
            <Logo ctx={ctx} height={34} />
            <Avatar ctx={ctx} size={96} ring="rgba(255,255,255,0.35)" />
            <Heading ctx={ctx} color="#ffffff" />
          </div>
        </div>
        <div className="relative mx-auto flex w-full max-w-[460px] grow flex-col px-5" style={{ marginTop: -36 }}>
          <div className="rounded-[22px] bg-white p-5 shadow-float">{body}</div>
          <div className="mt-auto">
            <Footer color={custom.textColor} />
          </div>
        </div>
      </div>
    );
  }

  // ---- hero: capa ocupando metade da tela ----
  if (layout === "hero") {
    return (
      <Shell
        style={shellStyle}
        ornament={ornament}
        accent={custom.accent}
        onDark={darkLayout}
        cover={coverLayer}
      >
        <div className="-mx-5 flex grow flex-col">
          <div className="relative h-[48vh] min-h-[280px] w-full overflow-hidden">
            {custom.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={custom.coverUrl}
                alt=""
                className="absolute inset-0 size-full object-cover"
                style={frame(custom.coverZoom, custom.coverX, custom.coverY)}
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `linear-gradient(140deg, ${custom.accent}, ${shadeColor(custom.accent, -0.45)})`,
                }}
              />
            )}
            {/* A sombra na base é o que deixa o nome legível sobre qualquer
                foto, clara ou escura. */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.1) 30%, ${hexToRgba(custom.background, 0.85)} 85%, ${custom.background} 100%)`,
              }}
            />
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 px-5 pb-5">
              <Avatar ctx={ctx} size={84} />
              <Heading ctx={ctx} color={pageText} nameSize={28} />
            </div>
          </div>

          <div className="mt-6 px-5">{bodySemShare}</div>
          <div className="px-5">
            <Bottom ctx={ctx} color={pageText} />
          </div>
        </div>
      </Shell>
    );
  }

  // ---- grid: links em grade de dois ----
  if (layout === "grid") {
    return (
      <Shell
        style={shellStyle}
        ornament={ornament}
        accent={custom.accent}
        onDark={darkLayout}
        cover={coverLayer}
      >
        <div className="flex grow flex-col pt-14">
          <div className="flex flex-col items-center gap-4">
            <Logo ctx={ctx} height={34} />
            <Avatar ctx={ctx} size={96} />
            <Heading ctx={ctx} color={pageText} />
          </div>

          <div
            className="mt-8 grid grid-cols-2"
            style={{ gap: ctx.gap }}
          >
            {buttonLinks.map((link, i) => (
              <div
                key={link.id}
                className="animate-in-up"
                style={{
                  animationDelay: `${i * 55}ms`,
                  // Um link em destaque ocupa a linha inteira: é o que o
                  // operador quis dizer ao destacá-lo.
                  gridColumn: link.highlight ? "span 2" : undefined,
                }}
              >
                <GridTile ctx={ctx} link={link} onDarkSurface={sobreEscuro} />
              </div>
            ))}
          </div>

          <SocialRow ctx={ctx} links={socialLinks} onDarkSurface={sobreEscuro} />
          <Bottom ctx={ctx} color={pageText} />
        </div>
      </Shell>
    );
  }

  // ---- aside: cartão deslocado, texto à esquerda ----
  if (layout === "aside") {
    return (
      <Shell
        style={shellStyle}
        ornament={ornament}
        accent={custom.accent}
        onDark={darkLayout}
        cover={coverLayer}
      >
        <div className="flex grow flex-col pt-12">
          <div className="flex items-center gap-4">
            <Avatar ctx={ctx} size={76} />
            <div className="min-w-0 flex-1">
              <Heading
                ctx={ctx}
                align="left"
                color={pageText}
                nameSize={24}
              />
            </div>
          </div>

          <div
            className="mt-7 rounded-[22px] p-4"
            style={{
              backgroundColor: sobreEscuro
                ? "rgba(255,255,255,0.05)"
                : "rgba(255,255,255,0.7)",
              border: `1px solid ${hexToRgba(custom.accent, 0.16)}`,
            }}
          >
            {bodySemShare}
          </div>

          <Bottom ctx={ctx} color={pageText} />
        </div>
      </Shell>
    );
  }

  // ---- showcase: primeiro link vira um cartão grande ----
  if (layout === "showcase") {
    const [primeiro, ...resto] = buttonLinks;
    return (
      <Shell
        style={shellStyle}
        ornament={ornament}
        accent={custom.accent}
        onDark={darkLayout}
        cover={coverLayer}
      >
        <div className="flex grow flex-col pt-12">
          <div className="flex flex-col items-center gap-4">
            <Logo ctx={ctx} height={32} />
            <Avatar ctx={ctx} size={88} />
            <Heading ctx={ctx} color={pageText} />
          </div>

          {primeiro ? (
            <div className="mt-7">
              <ShowcaseCard ctx={ctx} link={primeiro} />
            </div>
          ) : null}

          <div className="mt-4">
            <Buttons
              ctx={ctx}
              links={resto}
              hasSocial={socialLinks.length > 0}
              onDarkSurface={sobreEscuro}
            />
            <SocialRow
              ctx={ctx}
              links={socialLinks}
              onDarkSurface={sobreEscuro}
            />
          </div>

          <Bottom ctx={ctx} color={pageText} />
        </div>
      </Shell>
    );
  }

  // ---- banner (padrão) ----
  return (
    <Shell style={shellStyle} ornament={ornament} accent={custom.accent} onDark={darkLayout} cover={coverLayer}>
      <div className="flex grow flex-col pt-14">
        <div className="flex flex-col items-center gap-5">
          {custom.showLogo && custom.logoUrl ? (
            <Logo ctx={ctx} height={56} />
          ) : (
            <Avatar ctx={ctx} size={92} square />
          )}
          <Heading ctx={ctx} color={custom.textColor} />
        </div>
        <div className="mt-8">{bodySemShare}</div>
        <Bottom ctx={ctx} color={pageText} />
      </div>
    </Shell>
  );
}
