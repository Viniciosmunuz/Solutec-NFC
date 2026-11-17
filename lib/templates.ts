/**
 * Registry de templates.
 *
 * Adicionar um template novo = acrescentar um objeto nesta lista e rodar
 * `npm run db:seed`. O renderizador (components/public/PublicPage.tsx) lê
 * `layout` daqui, então nenhum outro arquivo precisa ser tocado.
 */

export type TemplateLayout =
  | "spotlight" // avatar grande, fundo gradiente, botões empilhados
  | "cover" // capa no topo + avatar sobreposto + cartão branco
  | "card" // cartão flutuante centralizado
  | "banner" // logo em destaque no topo, fundo claro
  | "editorial" // tipografia serifada, assimétrico
  | "neon" // fundo escuro com brilho, botões de vidro
  | "split"; // faixa colorida em cima, conteúdo claro embaixo

export type TemplateCategory =
  | "empresas"
  | "restaurantes"
  | "profissionais"
  | "academias"
  | "barbearias"
  | "saloes"
  | "imobiliarias"
  | "lojas"
  | "clinicas"
  | "outros";

export type TemplateDefaults = {
  accent: string;
  background: string;
  textColor: string;
  buttonStyle: "solid" | "outline" | "soft" | "glass";
  buttonRadius: "rounded" | "pill" | "square";
  fontFamily: "inter" | "poppins" | "playfair" | "mono";
  backgroundMode: "solid" | "gradient" | "image";
};

export type TemplateDefinition = {
  key: string;
  name: string;
  description: string;
  category: TemplateCategory;
  layout: TemplateLayout;
  featured: boolean;
  order: number;
  defaults: TemplateDefaults;
};

export const TEMPLATE_CATEGORIES: {
  value: TemplateCategory;
  label: string;
}[] = [
  { value: "empresas", label: "Empresas" },
  { value: "restaurantes", label: "Restaurantes" },
  { value: "profissionais", label: "Profissionais" },
  { value: "academias", label: "Academias" },
  { value: "barbearias", label: "Barbearias" },
  { value: "saloes", label: "Salões de beleza" },
  { value: "imobiliarias", label: "Imobiliárias" },
  { value: "lojas", label: "Lojas" },
  { value: "clinicas", label: "Clínicas" },
  { value: "outros", label: "Outros" },
];

export const categoryLabel = (value: string) =>
  TEMPLATE_CATEGORIES.find((c) => c.value === value)?.label ?? "Outros";

export const TEMPLATES: TemplateDefinition[] = [
  {
    key: "corporate-blue",
    name: "Corporate Blue",
    description:
      "Cartão institucional sóbrio, com logotipo em destaque e botões sólidos.",
    category: "empresas",
    layout: "card",
    featured: true,
    order: 1,
    defaults: {
      accent: "#1B54B0",
      background: "#0E2143",
      textColor: "#10233F",
      buttonStyle: "solid",
      buttonRadius: "rounded",
      fontFamily: "inter",
      backgroundMode: "gradient",
    },
  },
  {
    key: "executive",
    name: "Executive",
    description:
      "Capa com imagem, avatar sobreposto e informações em cartão claro.",
    category: "empresas",
    layout: "cover",
    featured: true,
    order: 2,
    defaults: {
      accent: "#17478F",
      background: "#132B52",
      textColor: "#10233F",
      buttonStyle: "soft",
      buttonRadius: "rounded",
      fontFamily: "inter",
      backgroundMode: "gradient",
    },
  },
  {
    key: "gourmet-dark",
    name: "Gourmet Dark",
    description:
      "Fundo escuro elegante para restaurantes, com destaque para o cardápio.",
    category: "restaurantes",
    layout: "spotlight",
    featured: true,
    order: 3,
    defaults: {
      accent: "#C9972B",
      background: "#161310",
      textColor: "#FFFFFF",
      buttonStyle: "outline",
      buttonRadius: "rounded",
      fontFamily: "playfair",
      backgroundMode: "gradient",
    },
  },
  {
    key: "bistro",
    name: "Bistrô",
    description: "Capa apetitosa no topo e botões suaves em cartão claro.",
    category: "restaurantes",
    layout: "cover",
    featured: false,
    order: 4,
    defaults: {
      accent: "#B4472B",
      background: "#2A1711",
      textColor: "#241611",
      buttonStyle: "soft",
      buttonRadius: "pill",
      fontFamily: "playfair",
      backgroundMode: "gradient",
    },
  },
  {
    key: "professional",
    name: "Professional",
    description:
      "Foto em destaque e contatos diretos. Ideal para profissionais liberais.",
    category: "profissionais",
    layout: "spotlight",
    featured: true,
    order: 5,
    defaults: {
      accent: "#1B54B0",
      background: "#12264A",
      textColor: "#FFFFFF",
      buttonStyle: "solid",
      buttonRadius: "pill",
      fontFamily: "inter",
      backgroundMode: "gradient",
    },
  },
  {
    key: "consultant",
    name: "Consultant",
    description: "Layout editorial com tipografia serifada e ar de autoridade.",
    category: "profissionais",
    layout: "editorial",
    featured: false,
    order: 6,
    defaults: {
      accent: "#1F3A5F",
      background: "#F3EFE7",
      textColor: "#1A1A1A",
      buttonStyle: "outline",
      buttonRadius: "square",
      fontFamily: "playfair",
      backgroundMode: "solid",
    },
  },
  {
    key: "power-gym",
    name: "Power Gym",
    description:
      "Alto contraste, botões largos e energia. Feito para academias.",
    category: "academias",
    layout: "neon",
    featured: true,
    order: 7,
    defaults: {
      accent: "#38E07B",
      background: "#0A0F16",
      textColor: "#FFFFFF",
      buttonStyle: "glass",
      buttonRadius: "square",
      fontFamily: "poppins",
      backgroundMode: "gradient",
    },
  },
  {
    key: "barber-classic",
    name: "Barber Classic",
    description: "Visual masculino clássico, fundo grafite e detalhes dourados.",
    category: "barbearias",
    layout: "spotlight",
    featured: true,
    order: 8,
    defaults: {
      accent: "#C9A227",
      background: "#1A1A1A",
      textColor: "#FFFFFF",
      buttonStyle: "outline",
      buttonRadius: "square",
      fontFamily: "poppins",
      backgroundMode: "gradient",
    },
  },
  {
    key: "beauty-soft",
    name: "Beauty Soft",
    description:
      "Tons suaves e botões arredondados para salões e estética.",
    category: "saloes",
    layout: "card",
    featured: true,
    order: 9,
    defaults: {
      accent: "#C2557F",
      background: "#F6E7EE",
      textColor: "#3B2230",
      buttonStyle: "soft",
      buttonRadius: "pill",
      fontFamily: "poppins",
      backgroundMode: "gradient",
    },
  },
  {
    key: "realty",
    name: "Realty",
    description:
      "Faixa superior com a marca e contatos rápidos para imobiliárias.",
    category: "imobiliarias",
    layout: "split",
    featured: false,
    order: 10,
    defaults: {
      accent: "#16305C",
      background: "#16305C",
      textColor: "#10233F",
      buttonStyle: "solid",
      buttonRadius: "rounded",
      fontFamily: "inter",
      backgroundMode: "solid",
    },
  },
  {
    key: "shop",
    name: "Shop",
    description: "Vitrine simples com logo grande e botões de compra.",
    category: "lojas",
    layout: "banner",
    featured: true,
    order: 11,
    defaults: {
      accent: "#1B54B0",
      background: "#FFFFFF",
      textColor: "#10233F",
      buttonStyle: "solid",
      buttonRadius: "rounded",
      fontFamily: "poppins",
      backgroundMode: "solid",
    },
  },
  {
    key: "care-clinic",
    name: "Care Clinic",
    description:
      "Claro, limpo e confiável. Agendamento em primeiro lugar.",
    category: "clinicas",
    layout: "split",
    featured: true,
    order: 12,
    defaults: {
      accent: "#1596A3",
      background: "#1596A3",
      textColor: "#10233F",
      buttonStyle: "soft",
      buttonRadius: "rounded",
      fontFamily: "inter",
      backgroundMode: "solid",
    },
  },
  {
    key: "minimal",
    name: "Minimal",
    description: "O essencial: nome, descrição e links. Nada mais.",
    category: "outros",
    layout: "banner",
    featured: false,
    order: 13,
    defaults: {
      accent: "#10233F",
      background: "#FFFFFF",
      textColor: "#10233F",
      buttonStyle: "outline",
      buttonRadius: "square",
      fontFamily: "inter",
      backgroundMode: "solid",
    },
  },
  {
    key: "midnight",
    name: "Midnight",
    description: "Escuro com brilho sutil e botões de vidro. Moderno e versátil.",
    category: "outros",
    layout: "neon",
    featured: false,
    order: 14,
    defaults: {
      accent: "#5B92E5",
      background: "#0B1220",
      textColor: "#FFFFFF",
      buttonStyle: "glass",
      buttonRadius: "pill",
      fontFamily: "inter",
      backgroundMode: "gradient",
    },
  },
];

const BY_KEY = new Map(TEMPLATES.map((t) => [t.key, t]));

export function getTemplate(key: string): TemplateDefinition {
  return BY_KEY.get(key) ?? TEMPLATES[0];
}

export const FONT_OPTIONS = [
  { value: "inter", label: "Inter — moderna", stack: "var(--font-inter), sans-serif" },
  { value: "poppins", label: "Poppins — geométrica", stack: "var(--font-poppins), sans-serif" },
  { value: "playfair", label: "Playfair — serifada", stack: "var(--font-playfair), serif" },
  { value: "mono", label: "Mono — técnica", stack: "var(--font-mono), monospace" },
] as const;

export const fontStack = (value: string) =>
  FONT_OPTIONS.find((f) => f.value === value)?.stack ?? FONT_OPTIONS[0].stack;

export const BUTTON_STYLES = [
  { value: "solid", label: "Sólido" },
  { value: "soft", label: "Suave" },
  { value: "outline", label: "Contorno" },
  { value: "glass", label: "Vidro" },
] as const;

export const BUTTON_RADIUS = [
  { value: "rounded", label: "Arredondado" },
  { value: "pill", label: "Pílula" },
  { value: "square", label: "Quadrado" },
] as const;

export const COLOR_PRESETS = [
  "#1B54B0",
  "#17478F",
  "#0F9D58",
  "#C9972B",
  "#C2557F",
  "#B4472B",
  "#1596A3",
  "#6B4FD8",
  "#10233F",
  "#D93B3B",
];
