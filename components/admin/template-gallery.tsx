"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Check, Eye, Search } from "lucide-react";
import PublicPage, {
  type PublicCustomization,
  type PublicLink,
} from "@/components/public/PublicPage";
import PhonePreview from "@/components/admin/phone-preview";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/display";
import {
  TEMPLATE_CATEGORIES,
  TEMPLATES,
  categoryLabel,
  type TemplateDefinition,
} from "@/lib/templates";
import { cn } from "@/lib/utils";

/** Conteúdo fictício usado só para a vitrine de templates. */
function demoData(template: TemplateDefinition): {
  custom: PublicCustomization;
  links: PublicLink[];
} {
  const samples: Record<string, { name: string; headline: string; bio: string }> = {
    empresas: {
      name: "Nova Tecnologia",
      headline: "Soluções corporativas",
      bio: "Atendimento consultivo para empresas que querem crescer com tecnologia.",
    },
    restaurantes: {
      name: "Cantina do Porto",
      headline: "Cozinha artesanal",
      bio: "Massas frescas todos os dias. Reserve sua mesa ou peça delivery.",
    },
    profissionais: {
      name: "Dra. Helena Cruz",
      headline: "Advocacia empresarial",
      bio: "Atendimento personalizado em direito societário e contratos.",
    },
    academias: {
      name: "Top Fit",
      headline: "Treino sem desculpa",
      bio: "Musculação, funcional e avaliação física inclusa no plano.",
    },
    barbearias: {
      name: "Barbearia Nove",
      headline: "Corte & barba",
      bio: "Agende seu horário e evite fila. Aberto de terça a sábado.",
    },
    saloes: {
      name: "Studio Lumi",
      headline: "Beleza e bem-estar",
      bio: "Coloração, tratamentos e maquiagem com hora marcada.",
    },
    imobiliarias: {
      name: "Prime Imóveis",
      headline: "Compra, venda e locação",
      bio: "Mais de 400 imóveis disponíveis na região.",
    },
    lojas: {
      name: "Casa & Cor",
      headline: "Decoração e presentes",
      bio: "Novidades toda semana. Entregamos em toda a cidade.",
    },
    clinicas: {
      name: "Clínica Vida Mais",
      headline: "Saúde integrada",
      bio: "Consultas e exames com agendamento online.",
    },
    outros: {
      name: "Sua Marca",
      headline: "Conecte-se comigo",
      bio: "Todos os seus contatos em um só lugar.",
    },
  };

  const sample = samples[template.category] ?? samples.outros;
  const d = template.defaults;

  return {
    custom: {
      displayName: sample.name,
      headline: sample.headline,
      bio: sample.bio,
      avatarUrl: null,
      logoUrl: null,
      coverUrl: null,
      avatarZoom: 1,
      avatarX: 50,
      avatarY: 50,
      coverZoom: 1,
      coverX: 50,
      coverY: 50,
      accent: d.accent,
      background: d.background,
      textColor: d.textColor,
      buttonStyle: d.buttonStyle,
      buttonRadius: d.buttonRadius,
      fontFamily: d.fontFamily,
      backgroundMode: d.backgroundMode,
      showAvatar: true,
      showLogo: false,
      showBio: true,
      showSocial: true,
      showShare: false,
      showContactCard: false,
    },
    links: [
      { id: "d1", type: "whatsapp", label: "Falar no WhatsApp", url: "#", asSocial: false },
      { id: "d2", type: "site", label: "Nosso site", url: "#", asSocial: false },
      { id: "d3", type: "maps", label: "Como chegar", url: "#", asSocial: false },
      { id: "d4", type: "instagram", label: "Instagram", url: "#", asSocial: true },
      { id: "d5", type: "facebook", label: "Facebook", url: "#", asSocial: true },
    ],
  };
}

/**
 * Miniatura do template.
 *
 * Por baixo fica sempre a página de verdade, renderizada em escala — é o que
 * garante que a vitrine nunca fica desatualizada em relação ao template.
 *
 * Por cima entra a arte do template (`public/templates/<key>.png`) quando ele
 * está marcado com `art: true` em lib/templates.ts. A arte cobre a miniatura
 * viva só depois de carregar, então não existe piscada nem buraco branco.
 */
export function TemplateThumb({ template }: { template: TemplateDefinition }) {
  const { custom, links } = useMemo(() => demoData(template), [template]);
  const [artReady, setArtReady] = useState(false);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="flex origin-top-left flex-col"
        style={{ width: 390, height: 780, transform: "scale(0.56)" }}
      >
        <PublicPage
          templateKey={template.key}
          custom={custom}
          links={links}
          preview
        />
      </div>

      {template.art ? (
        <Image
          src={`/templates/${template.key}.png`}
          alt=""
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className={cn(
            "object-cover transition-opacity duration-200",
            artReady ? "opacity-100" : "opacity-0",
          )}
          onLoad={() => setArtReady(true)}
          onError={() => setArtReady(false)}
        />
      ) : null}
    </div>
  );
}

export default function TemplateGallery({
  selected,
  onSelect,
  templates = TEMPLATES,
  columns = 4,
}: {
  selected?: string;
  onSelect?: (key: string) => void;
  templates?: TemplateDefinition[];
  columns?: 3 | 4;
}) {
  const [category, setCategory] = useState<string>("todos");
  const [query, setQuery] = useState("");
  const [previewing, setPreviewing] = useState<TemplateDefinition | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return templates.filter((t) => {
      if (category !== "todos" && t.category !== category) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        categoryLabel(t.category).toLowerCase().includes(q)
      );
    });
  }, [templates, category, query]);

  const categoriesInUse = useMemo(() => {
    const used = new Set(templates.map((t) => t.category));
    return TEMPLATE_CATEGORIES.filter((c) => used.has(c.value));
  }, [templates]);

  const preview = previewing ? demoData(previewing) : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-[220px] flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar template..."
            icon={<Search className="size-4" />}
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <CategoryChip
          active={category === "todos"}
          onClick={() => setCategory("todos")}
        >
          Todos
          <span className="ml-1.5 opacity-60">{templates.length}</span>
        </CategoryChip>
        {categoriesInUse.map((c) => (
          <CategoryChip
            key={c.value}
            active={category === c.value}
            onClick={() => setCategory(c.value)}
          >
            {c.label}
            <span className="ml-1.5 opacity-60">
              {templates.filter((t) => t.category === c.value).length}
            </span>
          </CategoryChip>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d2dae8] bg-white">
          <EmptyState
            icon={Search}
            title="Nenhum template encontrado"
            description="Tente outra busca ou escolha outra categoria."
          />
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
            columns === 4 && "xl:grid-cols-4",
          )}
        >
          {visible.map((template) => {
            const active = selected === template.key;
            return (
              <div
                key={template.key}
                className={cn(
                  "group overflow-hidden rounded-2xl border bg-white transition-all",
                  active
                    ? "border-brand-500 shadow-[0_0_0_3px_rgba(27,84,176,0.14)]"
                    : "border-line shadow-card hover:-translate-y-1 hover:shadow-pop",
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelect?.(template.key)}
                  className="relative block aspect-[3/4] w-full overflow-hidden bg-[#f6f8fc]"
                >
                  <TemplateThumb template={template} />
                  {active ? (
                    <span className="absolute right-3 top-3 grid size-7 place-items-center rounded-full bg-brand-600 text-white shadow-pop">
                      <Check className="size-4" strokeWidth={3} />
                    </span>
                  ) : null}
                  <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-[#0e2143]/80 to-transparent pb-3 pt-10 opacity-0 transition-opacity group-hover:opacity-100">
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewing(template);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.stopPropagation();
                          setPreviewing(template);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-[12px] font-bold text-[#10233f] hover:bg-white"
                    >
                      <Eye className="size-3.5" />
                      Visualizar
                    </span>
                  </span>
                </button>

                <div className="flex items-start justify-between gap-2 px-3.5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-bold text-[#10233f]">
                      {template.name}
                    </p>
                    <p className="truncate text-[11.5px] text-[#8a97b1]">
                      {categoryLabel(template.category)}
                    </p>
                  </div>
                  {onSelect ? (
                    <Button
                      size="sm"
                      variant={active ? "primary" : "secondary"}
                      onClick={() => onSelect(template.key)}
                      className="shrink-0"
                    >
                      {active ? "Selecionado" : "Usar"}
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={Boolean(previewing)}
        onClose={() => setPreviewing(null)}
        title={previewing?.name ?? ""}
        description={previewing?.description}
        size="sm"
        footer={
          onSelect && previewing ? (
            <>
              <Button variant="secondary" onClick={() => setPreviewing(null)}>
                Fechar
              </Button>
              <Button
                onClick={() => {
                  onSelect(previewing.key);
                  setPreviewing(null);
                }}
              >
                Usar este template
              </Button>
            </>
          ) : null
        }
      >
        {previewing && preview ? (
          <div className="flex justify-center">
            <PhonePreview>
              <PublicPage
                templateKey={previewing.key}
                custom={preview.custom}
                links={preview.links}
                preview
              />
            </PhonePreview>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition-colors",
        active
          ? "bg-brand-600 text-white shadow-[0_4px_12px_rgba(27,84,176,0.3)]"
          : "bg-white text-[#6b7a99] ring-1 ring-line hover:bg-brand-50 hover:text-brand-700",
      )}
    >
      {children}
    </button>
  );
}
