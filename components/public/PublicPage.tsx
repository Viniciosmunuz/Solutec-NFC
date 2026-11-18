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
};

export type PublicCustomization = {
  displayName: string;
  headline: string | null;
  bio: string | null;
  avatarUrl: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  accent: string;
  background: string;
  textColor: string;
  buttonStyle: "row" | "solid" | "outline" | "soft" | "glass";
  buttonRadius: "rounded" | "pill" | "square";
  fontFamily: "inter" | "poppins" | "playfair" | "mono";
  backgroundMode: "solid" | "gradient" | "image";
  showAvatar: boolean;
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
  onLinkClick: (link: PublicLink) => void;
};

// ---------------------------------------------------------------------------
// Blocos (definidos no módulo, nunca dentro do render)
// ---------------------------------------------------------------------------

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

  return (
    <div
      className="relative overflow-hidden bg-black/10"
      style={{
        width: size,
        height: size,
        borderRadius: square ? 18 : 999,
        boxShadow: `0 0 0 4px ${ring ?? hexToRgba(custom.accent, 0.35)}, 0 12px 30px rgba(0,0,0,0.25)`,
      }}
    >
      {custom.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={custom.avatarUrl}
          alt={custom.displayName}
          className="size-full object-cover"
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
  nameSize = "text-[26px]",
}: {
  ctx: Ctx;
  align?: "center" | "left";
  color: string;
  nameSize?: string;
}) {
  const { custom } = ctx;
  return (
    <div
      className={align === "center" ? "text-center" : "text-left"}
      style={{ color }}
    >
      <h1 className={`${nameSize} font-bold leading-tight tracking-tight`}>
        {custom.displayName || "Nome da empresa"}
      </h1>
      {custom.headline ? (
        <p
          className="mt-1 text-[13px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: custom.accent, opacity: 0.95 }}
        >
          {custom.headline}
        </p>
      ) : null}
      {custom.showBio && custom.bio ? (
        <p
          className={`mt-3 max-w-[34ch] text-[14px] leading-relaxed opacity-80 ${
            align === "center" ? "mx-auto" : ""
          }`}
          style={{ color }}
        >
          {custom.bio}
        </p>
      ) : null}
    </div>
  );
}

function buttonStyles(ctx: Ctx, onDarkSurface: boolean): React.CSSProperties {
  const accent = ctx.custom.accent;
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
  const { accent, buttonStyle } = ctx.custom;
  const isRow = buttonStyle === "row";

  /**
   * No estilo "row" o ícone ganha um chip com a cor da marca; nos outros ele
   * segue a cor do próprio botão, como antes.
   */
  const chipStyle: React.CSSProperties = isRow
    ? {
        backgroundColor: accent,
        color: readableText(accent),
        borderRadius: ctx.custom.buttonRadius === "square" ? 6 : 11,
      }
    : {};

  return (
    <a
      href={link.url}
      target={link.url.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      onClick={() => ctx.onLinkClick(link)}
      className={`group flex w-full items-center text-[15px] font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] ${
        isRow ? "gap-3 py-2 pl-2 pr-3.5" : "gap-3 px-4 py-3.5"
      }`}
      style={{
        ...buttonStyles(ctx, onDarkSurface),
        boxShadow:
          buttonStyle === "solid"
            ? `0 6px 18px ${hexToRgba(accent, 0.28)}`
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
    <div className="flex flex-col gap-3">
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
}: {
  ctx: Ctx;
  buttonLinks: PublicLink[];
  socialLinks: PublicLink[];
  onDarkSurface: boolean;
}) {
  return (
    <>
      <Buttons
        ctx={ctx}
        links={buttonLinks}
        hasSocial={socialLinks.length > 0}
        onDarkSurface={onDarkSurface}
      />
      <SocialRow ctx={ctx} links={socialLinks} onDarkSurface={onDarkSurface} />
      <ShareBar ctx={ctx} />
    </>
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
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  ornament?: OrnamentKey;
  accent: string;
  onDark: boolean;
}) {
  return (
    <div className="relative min-h-full w-full overflow-hidden" style={style}>
      <Ornament name={ornament} accent={accent} onDark={onDark} />
      <div className="relative mx-auto w-full max-w-[460px] px-5">
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

  const backgroundStyle: React.CSSProperties =
    custom.backgroundMode === "gradient"
      ? {
          backgroundImage: `linear-gradient(165deg, ${shadeColor(bg, 0.12)} 0%, ${bg} 45%, ${shadeColor(bg, -0.25)} 100%)`,
        }
      : custom.backgroundMode === "image" && custom.coverUrl
        ? {
            backgroundImage: `linear-gradient(180deg, ${hexToRgba(bg, 0.55)}, ${hexToRgba(bg, 0.95)}), url(${custom.coverUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }
        : { backgroundColor: bg };

  const shellStyle = { ...backgroundStyle, fontFamily: font };

  const body = (
    <Body
      ctx={ctx}
      buttonLinks={buttonLinks}
      socialLinks={socialLinks}
      onDarkSurface={false}
    />
  );

  // ---- spotlight / neon ----
  if (layout === "spotlight" || layout === "neon") {
    return (
      <Shell style={shellStyle} ornament={ornament} accent={custom.accent} onDark={darkLayout}>
        <div className="relative flex flex-col items-center pt-14">
          {layout === "neon" ? (
            <div
              className="pointer-events-none absolute -top-10 left-1/2 size-72 -translate-x-1/2 rounded-full blur-3xl"
              style={{ backgroundColor: hexToRgba(custom.accent, 0.35) }}
            />
          ) : null}
          <div className="relative flex flex-col items-center gap-5">
            <Logo ctx={ctx} height={34} />
            <Avatar ctx={ctx} size={118} />
            <Heading ctx={ctx} color="#fff" nameSize="text-[27px]" />
          </div>
          <div className="mt-8 w-full">
            <Body
              ctx={ctx}
              buttonLinks={buttonLinks}
              socialLinks={socialLinks}
              onDarkSurface
            />
          </div>
          <div className="w-full">
            <Footer color={pageText} />
          </div>
        </div>
      </Shell>
    );
  }

  // ---- card ----
  if (layout === "card") {
    return (
      <Shell style={shellStyle} ornament={ornament} accent={custom.accent} onDark={darkLayout}>
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
      <Shell style={shellStyle} ornament={ornament} accent={custom.accent} onDark={darkLayout}>
        <div className="pb-2">
          <div className="-mx-5">
            <div
              className="relative h-44 w-full bg-cover bg-center"
              style={{
                backgroundImage: custom.coverUrl
                  ? `url(${custom.coverUrl})`
                  : `linear-gradient(135deg, ${custom.accent}, ${shadeColor(custom.accent, -0.4)})`,
              }}
            >
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
          <Footer color={pageText} />
        </div>
      </Shell>
    );
  }

  // ---- editorial ----
  if (layout === "editorial") {
    return (
      <Shell style={shellStyle} ornament={ornament} accent={custom.accent} onDark={darkLayout}>
        <div className="pt-12">
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
              nameSize="text-[30px]"
            />
          </div>
          <div className="mt-7">{body}</div>
          <Footer color={pageText} />
        </div>
      </Shell>
    );
  }

  // ---- split ----
  if (layout === "split") {
    return (
      <div
        className="relative min-h-full w-full overflow-hidden bg-[#f6f8fc]"
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
        <div className="relative mx-auto -mt-9 w-full max-w-[460px] px-5">
          <div className="rounded-[22px] bg-white p-5 shadow-float">{body}</div>
          <Footer color={custom.textColor} />
        </div>
      </div>
    );
  }

  // ---- banner (padrão) ----
  return (
    <Shell style={shellStyle} ornament={ornament} accent={custom.accent} onDark={darkLayout}>
      <div className="pt-14">
        <div className="flex flex-col items-center gap-5">
          {custom.showLogo && custom.logoUrl ? (
            <Logo ctx={ctx} height={56} />
          ) : (
            <Avatar ctx={ctx} size={92} square />
          )}
          <Heading ctx={ctx} color={custom.textColor} />
        </div>
        <div className="mt-8">{body}</div>
        <Footer color={pageText} />
      </div>
    </Shell>
  );
}
