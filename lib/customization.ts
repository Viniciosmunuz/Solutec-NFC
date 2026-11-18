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
  showLogo: boolean;
  showBio: boolean;
  showSocial: boolean;
  showShare: boolean;
  showContactCard: boolean;
};

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
      ["inter", "poppins", "playfair", "mono"] as const,
      "inter",
    ),
    backgroundMode: pick(
      row.backgroundMode,
      ["solid", "gradient", "image"] as const,
      "gradient",
    ),
    showAvatar: row.showAvatar,
    showLogo: row.showLogo,
    showBio: row.showBio,
    showSocial: row.showSocial,
    showShare: row.showShare,
    showContactCard: row.showContactCard,
  };
}
