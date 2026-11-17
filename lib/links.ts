import { Globe, Link2, Mail, MapPin, Phone } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TiktokIcon,
  WhatsappIcon,
  YoutubeIcon,
  type IconProps,
} from "@/components/icons/brands";
import { onlyDigits } from "@/lib/utils";

/** Qualquer ícone aceito pelo sistema: lucide ou um ícone de marca nosso. */
export type IconComponent = React.ComponentType<IconProps>;

export type LinkType =
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "tiktok"
  | "site"
  | "phone"
  | "email"
  | "maps"
  | "linkedin"
  | "youtube"
  | "custom";

export type LinkTypeDef = {
  type: LinkType;
  label: string;
  icon: IconComponent;
  color: string;
  placeholder: string;
  hint: string;
  /** Sugestão: entra como ícone redondo na linha de sociais */
  socialByDefault: boolean;
  /** Converte o que o operador digitou na URL final */
  build: (value: string) => string;
};

const stripAt = (v: string) => v.trim().replace(/^@/, "");

const ensureProtocol = (v: string) => {
  const trimmed = v.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, "")}`;
};

/** Se o operador colou a URL completa, respeita. Senão monta a partir do usuário. */
const profileUrl = (base: string) => (value: string) => {
  const v = value.trim();
  if (/^https?:\/\//i.test(v)) return v;
  if (v.includes(".") && v.includes("/")) return ensureProtocol(v);
  return `${base}${stripAt(v)}`;
};

export const LINK_TYPES: LinkTypeDef[] = [
  {
    type: "whatsapp",
    label: "WhatsApp",
    icon: WhatsappIcon,
    color: "#25D366",
    placeholder: "(11) 99999-9999",
    hint: "Digite o telefone com DDD. Geramos o link wa.me automaticamente.",
    socialByDefault: false,
    build: (value) => {
      const digits = onlyDigits(value);
      if (!digits) return "";
      const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
      return `https://wa.me/${withCountry}`;
    },
  },
  {
    type: "instagram",
    label: "Instagram",
    icon: InstagramIcon,
    color: "#E1306C",
    placeholder: "@suaempresa",
    hint: "Usuário sem @ ou a URL completa do perfil.",
    socialByDefault: true,
    build: profileUrl("https://instagram.com/"),
  },
  {
    type: "facebook",
    label: "Facebook",
    icon: FacebookIcon,
    color: "#1877F2",
    placeholder: "suaempresa",
    hint: "Nome da página ou a URL completa.",
    socialByDefault: true,
    build: profileUrl("https://facebook.com/"),
  },
  {
    type: "tiktok",
    label: "TikTok",
    icon: TiktokIcon,
    color: "#010101",
    placeholder: "@suaempresa",
    hint: "Usuário sem @ ou a URL completa.",
    socialByDefault: true,
    build: profileUrl("https://tiktok.com/@"),
  },
  {
    type: "site",
    label: "Site",
    icon: Globe,
    color: "#1B54B0",
    placeholder: "www.suaempresa.com.br",
    hint: "Adicionamos https:// se você não digitar.",
    socialByDefault: false,
    build: ensureProtocol,
  },
  {
    type: "phone",
    label: "Telefone",
    icon: Phone,
    color: "#0F9D58",
    placeholder: "(11) 3333-3333",
    hint: "Abre o discador do celular.",
    socialByDefault: false,
    build: (value) => {
      const digits = onlyDigits(value);
      return digits ? `tel:+55${digits.replace(/^55/, "")}` : "";
    },
  },
  {
    type: "email",
    label: "E-mail",
    icon: Mail,
    color: "#D93B3B",
    placeholder: "contato@suaempresa.com.br",
    hint: "Abre o aplicativo de e-mail.",
    socialByDefault: false,
    build: (value) => {
      const v = value.trim();
      return v ? `mailto:${v.replace(/^mailto:/i, "")}` : "";
    },
  },
  {
    type: "maps",
    label: "Google Maps",
    icon: MapPin,
    color: "#EA4335",
    placeholder: "Rua Exemplo, 123 - São Paulo",
    hint: "Endereço ou o link curto do Google Maps.",
    socialByDefault: false,
    build: (value) => {
      const v = value.trim();
      if (!v) return "";
      if (/^https?:\/\//i.test(v)) return v;
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v)}`;
    },
  },
  {
    type: "linkedin",
    label: "LinkedIn",
    icon: LinkedinIcon,
    color: "#0A66C2",
    placeholder: "company/suaempresa",
    hint: "Trecho após linkedin.com/ ou a URL completa.",
    socialByDefault: true,
    build: profileUrl("https://linkedin.com/"),
  },
  {
    type: "youtube",
    label: "YouTube",
    icon: YoutubeIcon,
    color: "#FF0000",
    placeholder: "@seucanal",
    hint: "Canal ou a URL completa.",
    socialByDefault: true,
    build: profileUrl("https://youtube.com/"),
  },
  {
    type: "custom",
    label: "Link personalizado",
    icon: Link2,
    color: "#6B7A99",
    placeholder: "https://...",
    hint: "Qualquer endereço: cardápio, catálogo, formulário...",
    socialByDefault: false,
    build: ensureProtocol,
  },
];

const BY_TYPE = new Map(LINK_TYPES.map((t) => [t.type, t]));

export function getLinkType(type: string): LinkTypeDef {
  return BY_TYPE.get(type as LinkType) ?? BY_TYPE.get("custom")!;
}

export function buildLinkUrl(type: string, value: string) {
  return getLinkType(type).build(value);
}

export function linkIcon(type: string): IconComponent {
  return getLinkType(type).icon;
}
