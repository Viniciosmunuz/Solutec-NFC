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

/**
 * Formas decorativas do fundo. São desenhadas em SVG no renderizador
 * (`components/public/PublicPage.tsx`) e pintadas com a cor de destaque do
 * template, então a mesma forma serve para qualquer paleta.
 */
export type OrnamentKey =
  | "waves" // ondas no topo e no rodapé
  | "shards" // lascas diagonais, energia
  | "leaves" // folhas nos cantos, natural
  | "blobs" // manchas difusas, suave
  | "streaks" // riscos finos nos cantos, luxo
  | "diagonal" // fita diagonal atravessando o topo
  | "sidewave" // onda vertical na lateral
  | "angles"; // barras anguladas, automotivo

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
  | "automotivo"
  | "outros";

export type TemplateDefaults = {
  accent: string;
  background: string;
  textColor: string;
  buttonStyle: "row" | "solid" | "outline" | "soft" | "glass";
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
  /** forma decorativa do fundo; sem ela o fundo fica liso */
  ornament?: OrnamentKey;
  featured: boolean;
  order: number;
  defaults: TemplateDefaults;
  /**
   * Existe arte pronta em `public/templates/<key>.png`?
   *
   * Com `art: true` a vitrine mostra essa imagem no lugar da miniatura
   * renderizada ao vivo. Marque só depois de colocar o arquivo na pasta — o
   * preview em tamanho cheio continua sendo a página de verdade, sempre.
   */
  art?: boolean;
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
  { value: "automotivo", label: "Automotivo" },
  { value: "outros", label: "Outros" },
];

export const categoryLabel = (value: string) =>
  TEMPLATE_CATEGORIES.find((c) => c.value === value)?.label ?? "Outros";

export const TEMPLATES: TemplateDefinition[] = [
  {
    key: "corporate-blue",
    name: "Corporate Blue",
    description:
      "Claro e institucional, com ondas azuis e linhas de contato bem separadas.",
    category: "empresas",
    layout: "banner",
    ornament: "waves",
    featured: true,
    order: 1,
    defaults: {
      accent: "#1B54B0",
      background: "#EAF1FD",
      textColor: "#10233F",
      buttonStyle: "row",
      buttonRadius: "rounded",
      fontFamily: "inter",
      backgroundMode: "solid",
    },
  },
  {
    key: "executive",
    name: "Executive",
    description:
      "Branco com fita diagonal azul. Sóbrio, para quem fala com empresa.",
    category: "empresas",
    layout: "banner",
    ornament: "diagonal",
    featured: true,
    order: 2,
    defaults: {
      accent: "#1E7BE8",
      background: "#FFFFFF",
      textColor: "#10233F",
      buttonStyle: "row",
      buttonRadius: "rounded",
      fontFamily: "inter",
      backgroundMode: "solid",
    },
  },
  {
    key: "gourmet-dark",
    name: "Gourmet Dark",
    description:
      "Fundo escuro com foto de capa e dourado. O cardápio em primeiro lugar.",
    category: "restaurantes",
    layout: "spotlight",
    featured: true,
    order: 3,
    defaults: {
      accent: "#C9972B",
      background: "#141210",
      textColor: "#FFFFFF",
      buttonStyle: "row",
      buttonRadius: "rounded",
      fontFamily: "playfair",
      backgroundMode: "image",
    },
  },
  {
    key: "bistro",
    name: "Bistrô",
    description:
      "Tons de café e capa apetitosa no topo. Aconchegante sem ser pesado.",
    category: "restaurantes",
    layout: "cover",
    ornament: "waves",
    featured: false,
    order: 4,
    defaults: {
      accent: "#8B5E3C",
      background: "#F3E6D6",
      textColor: "#3A2A1E",
      buttonStyle: "row",
      buttonRadius: "rounded",
      fontFamily: "playfair",
      backgroundMode: "solid",
    },
  },
  {
    key: "professional",
    name: "Professional",
    description:
      "Degradê vivo e foto em destaque. Para profissional liberal que atende direto.",
    category: "profissionais",
    layout: "spotlight",
    ornament: "blobs",
    featured: true,
    order: 5,
    defaults: {
      accent: "#34D399",
      background: "#1E5FD6",
      textColor: "#FFFFFF",
      buttonStyle: "row",
      buttonRadius: "pill",
      fontFamily: "inter",
      backgroundMode: "gradient",
    },
  },
  {
    key: "consultant",
    name: "Consultant",
    description:
      "Preto e branco, foto de fundo e tipografia serifada. Ar de autoridade.",
    category: "profissionais",
    layout: "spotlight",
    featured: false,
    order: 6,
    defaults: {
      accent: "#D7DCE2",
      background: "#2B3238",
      textColor: "#FFFFFF",
      buttonStyle: "row",
      buttonRadius: "rounded",
      fontFamily: "playfair",
      backgroundMode: "image",
    },
  },
  {
    key: "power-gym",
    name: "Power Gym",
    description:
      "Roxo profundo com brilho e botões de vidro. Feito para academia.",
    category: "academias",
    layout: "neon",
    featured: true,
    order: 7,
    defaults: {
      accent: "#7B5BFF",
      background: "#150F2E",
      textColor: "#FFFFFF",
      buttonStyle: "row",
      buttonRadius: "rounded",
      fontFamily: "poppins",
      backgroundMode: "gradient",
    },
  },
  {
    key: "barber-classic",
    name: "Barber Classic",
    description:
      "Grafite com riscos dourados. Masculino clássico, de barbearia de bairro.",
    category: "barbearias",
    layout: "spotlight",
    ornament: "streaks",
    featured: true,
    order: 8,
    defaults: {
      accent: "#C9A227",
      background: "#121212",
      textColor: "#FFFFFF",
      buttonStyle: "row",
      buttonRadius: "rounded",
      fontFamily: "poppins",
      backgroundMode: "gradient",
    },
  },
  {
    key: "beauty-soft",
    name: "Beauty Soft",
    description:
      "Lilás suave com manchas difusas e botões em pílula. Delicado.",
    category: "saloes",
    layout: "banner",
    ornament: "blobs",
    featured: true,
    order: 9,
    defaults: {
      accent: "#B45FD1",
      background: "#F6EAF7",
      textColor: "#3B2230",
      buttonStyle: "row",
      buttonRadius: "pill",
      fontFamily: "poppins",
      backgroundMode: "gradient",
    },
  },
  {
    key: "realty",
    name: "Realty",
    description:
      "Capa de imóvel no topo e contatos rápidos logo abaixo.",
    category: "imobiliarias",
    layout: "cover",
    featured: false,
    order: 10,
    defaults: {
      accent: "#2B6CB0",
      background: "#14263F",
      textColor: "#10233F",
      buttonStyle: "row",
      buttonRadius: "rounded",
      fontFamily: "inter",
      backgroundMode: "image",
    },
  },
  {
    key: "shop",
    name: "Shop",
    description:
      "Vitrine escura e moderna, com a marca no alto e botões de compra.",
    category: "lojas",
    layout: "spotlight",
    featured: true,
    order: 11,
    defaults: {
      accent: "#4F7FFF",
      background: "#10141F",
      textColor: "#FFFFFF",
      buttonStyle: "row",
      buttonRadius: "rounded",
      fontFamily: "poppins",
      backgroundMode: "gradient",
    },
  },
  {
    key: "care-clinic",
    name: "Care Clinic",
    description:
      "Creme com folhas nos cantos. Calmo, limpo, agendamento na frente.",
    category: "clinicas",
    layout: "banner",
    ornament: "leaves",
    featured: true,
    order: 12,
    defaults: {
      accent: "#2E9E6B",
      background: "#F3F1E9",
      textColor: "#223229",
      buttonStyle: "row",
      buttonRadius: "rounded",
      fontFamily: "inter",
      backgroundMode: "solid",
    },
  },
  {
    key: "concessionaria",
    name: "Concessionária",
    description:
      "Página escura com faixas anguladas e foto do veículo. Revenda, oficina e autopeças.",
    category: "automotivo",
    layout: "spotlight",
    ornament: "angles",
    featured: true,
    order: 13,
    defaults: {
      accent: "#E11D2E",
      background: "#121418",
      textColor: "#10233F",
      buttonStyle: "row",
      buttonRadius: "rounded",
      fontFamily: "poppins",
      backgroundMode: "image",
    },
  },
  {
    key: "minimal",
    name: "Minimal",
    description:
      "Branco com uma onda verde na lateral. O essencial, bem respirado.",
    category: "outros",
    layout: "banner",
    ornament: "sidewave",
    featured: false,
    order: 14,
    defaults: {
      accent: "#22A45D",
      background: "#FFFFFF",
      textColor: "#10233F",
      buttonStyle: "row",
      buttonRadius: "rounded",
      fontFamily: "inter",
      backgroundMode: "solid",
    },
  },
  {
    key: "midnight",
    name: "Midnight",
    description:
      "Violeta escuro com lascas diagonais. Moderno e serve para qualquer ramo.",
    category: "outros",
    layout: "spotlight",
    ornament: "shards",
    featured: false,
    order: 15,
    defaults: {
      accent: "#7C5CFF",
      background: "#16122B",
      textColor: "#FFFFFF",
      buttonStyle: "row",
      buttonRadius: "rounded",
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
  { value: "row", label: "Linha" },
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
