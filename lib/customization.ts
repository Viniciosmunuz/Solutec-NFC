import type { PublicCustomization } from "@/components/public/PublicPage";

/**
 * Linha de `Customization` como ela vem do banco. Os campos de opção são
 * `String` no Prisma (para manter o schema portável entre SQLite e Postgres),
 * então a normalização para as uniões do renderizador acontece aqui — em um
 * único lugar.
 */
type CustomizationRow = {
  displayName: string;
  headline: string | null;
  bio: string | null;
  avatarUrl: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  avatarZoom: number;
  avatarX: number;
  avatarY: number;
  coverZoom: number;
  coverX: number;
  coverY: number;
  accent: string;
  background: string;
  textColor: string;
  buttonStyle: string;
  buttonRadius: string;
  fontFamily: string;
  backgroundMode: string;
  showAvatar: boolean;
  avatarRing: boolean;
  avatarShape: string;
  spacing: string;
  fontScale: number;
  coverOpacity: number;
  socialPosition: string;
  ornament: string | null;
  ornamentColor: string | null;
  ornamentOpacity: number;
  contentAlign: string;
  contentPosition: string;
  cardStyle: string;
  avatarSize: number;
  handle: string | null;
  metaLeft: string | null;
  metaRight: string | null;
  ctaTitle: string | null;
  ctaText: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  showLogo: boolean;
  showBio: boolean;
  showSocial: boolean;
  showShare: boolean;
  showContactCard: boolean;
};

export const ORNAMENTOS = [
  "nenhum",
  "waves",
  "shards",
  "leaves",
  "blobs",
  "streaks",
  "diagonal",
  "sidewave",
  "angles",
] as const;

const pick = <T extends string>(
  value: string,
  allowed: readonly T[],
  fallback: T,
): T => (allowed.includes(value as T) ? (value as T) : fallback);

export function toCustomization(row: CustomizationRow): PublicCustomization {
  return {
    displayName: row.displayName,
    headline: row.headline,
    bio: row.bio,
    avatarUrl: row.avatarUrl,
    logoUrl: row.logoUrl,
    coverUrl: row.coverUrl,
    avatarZoom: row.avatarZoom,
    avatarX: row.avatarX,
    avatarY: row.avatarY,
    coverZoom: row.coverZoom,
    coverX: row.coverX,
    coverY: row.coverY,
    accent: row.accent,
    background: row.background,
    textColor: row.textColor,
    buttonStyle: pick(
      row.buttonStyle,
      ["row", "solid", "outline", "soft", "glass"] as const,
      "row",
    ),
    buttonRadius: pick(
      row.buttonRadius,
      ["rounded", "pill", "square"] as const,
      "rounded",
    ),
    fontFamily: pick(
      row.fontFamily,
      ["inter", "poppins", "montserrat", "nunito", "oswald", "bebas", "playfair", "lora", "dancing", "mono"] as const,
      "inter",
    ),
    backgroundMode: pick(
      row.backgroundMode,
      ["solid", "gradient", "image"] as const,
      "gradient",
    ),
    showAvatar: row.showAvatar,
    avatarRing: row.avatarRing,
    avatarShape: pick(row.avatarShape, ["circulo", "quadrado"] as const, "circulo"),
    spacing: pick(row.spacing, ["compacto", "normal", "arejado"] as const, "normal"),
    fontScale: row.fontScale,
    coverOpacity: row.coverOpacity,
    socialPosition: pick(row.socialPosition, ["acima", "abaixo"] as const, "abaixo"),
    ornament: row.ornament
      ? pick(
          row.ornament,
          ORNAMENTOS,
          "nenhum",
        )
      : null,
    ornamentColor: row.ornamentColor,
    ornamentOpacity: row.ornamentOpacity,
    contentAlign: pick(row.contentAlign, ["esquerda", "centro"] as const, "centro"),
    contentPosition: pick(
      row.contentPosition,
      ["topo", "centro", "rodape"] as const,
      "topo",
    ),
    cardStyle: pick(row.cardStyle, ["nenhum", "vidro", "solido"] as const, "nenhum"),
    avatarSize: row.avatarSize,
    handle: row.handle,
    metaLeft: row.metaLeft,
    metaRight: row.metaRight,
    ctaTitle: row.ctaTitle,
    ctaText: row.ctaText,
    ctaLabel: row.ctaLabel,
    ctaUrl: row.ctaUrl,
    showLogo: row.showLogo,
    showBio: row.showBio,
    showSocial: row.showSocial,
    showShare: row.showShare,
    showContactCard: row.showContactCard,
  };
}
