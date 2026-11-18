"use client";

import { useState } from "react";
import {
  BadgeCheck,
  ChevronDown,
  Image as ImageIcon,
  LayoutPanelTop,
  Palette,
  Shapes,
  SlidersHorizontal,
  Type,
  UserRound,
} from "lucide-react";
import ColorPicker from "@/components/admin/color-picker";
import ImageUpload from "@/components/admin/image-upload";
import { Input, Select, Switch, Textarea } from "@/components/ui/field";
import { BUTTON_RADIUS, BUTTON_STYLES, FONT_OPTIONS } from "@/lib/templates";
import type { PublicCustomization } from "@/components/public/PublicPage";
import { cn } from "@/lib/utils";

/** Formas disponíveis, com nome em português para quem edita. */
const FORMAS = [
  { v: "nenhum", label: "Nenhuma" },
  { v: "waves", label: "Ondas" },
  { v: "shards", label: "Lascas" },
  { v: "leaves", label: "Folhas" },
  { v: "blobs", label: "Manchas" },
  { v: "streaks", label: "Riscos" },
  { v: "diagonal", label: "Fita" },
  { v: "sidewave", label: "Onda lateral" },
  { v: "angles", label: "Ângulos" },
] as const;

export type DesignState = PublicCustomization;

/**
 * Editor de design.
 *
 * As seções seguem a ordem em que a pessoa trabalha: primeiro o que ela
 * digita, depois o que ela envia, depois o que ela escolhe. Cada uma abre e
 * fecha, porque com tudo aberto a lista fica longa demais para achar qualquer
 * coisa — principalmente no celular.
 *
 * Só a primeira nasce aberta: é a única que todo mundo preenche sempre.
 */
/**
 * Qual layout a placa está usando agora.
 *
 * Controle que não faz nada na página que a pessoa está vendo é pior do que
 * controle que não existe: ela mexe, nada muda, e passa a desconfiar do
 * resto do painel. Então as seções presas a um template só aparecem quando
 * aquele template está em uso.
 */
export default function DesignEditor({
  value,
  onChange,
  layout,
}: {
  value: DesignState;
  onChange: (patch: Partial<DesignState>) => void;
  layout?: string;
}) {
  const set = <K extends keyof DesignState>(key: K, v: DesignState[K]) =>
    onChange({ [key]: v } as Partial<DesignState>);

  return (
    <div className="flex flex-col gap-3">
      <Secao
        icon={UserRound}
        titulo="Textos"
        resumo="Nome, subtítulo e descrição"
        aberta
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Nome exibido"
            required
            value={value.displayName}
            onChange={(e) => set("displayName", e.target.value)}
            placeholder="Nome da empresa ou do profissional"
          />
          <Input
            label="Subtítulo"
            value={value.headline ?? ""}
            onChange={(e) => set("headline", e.target.value)}
            placeholder="Cargo, slogan ou especialidade"
            hint="Linha curta em destaque abaixo do nome."
          />
          <Textarea
            label="Descrição"
            value={value.bio ?? ""}
            onChange={(e) => set("bio", e.target.value)}
            placeholder="Conte em uma ou duas frases o que o cliente faz."
            rows={3}
            maxLength={280}
          />
        </div>
      </Secao>

      <Secao icon={ImageIcon} titulo="Fotos" resumo="Perfil, logotipo e capa">
        <div className="flex flex-col gap-4">
          <ImageUpload
            label="Foto de perfil"
            value={value.avatarUrl}
            onChange={(url) => set("avatarUrl", url)}
            hint="Quadrada, a partir de 400×400."
            height={96}
            frame={{
              zoom: value.avatarZoom,
              x: value.avatarX,
              y: value.avatarY,
            }}
            onFrame={(f) =>
              onChange({ avatarZoom: f.zoom, avatarX: f.x, avatarY: f.y })
            }
          />

          {/* Formato e tamanho ficam junto da foto, e não espalhados em outra
              seção: quem acabou de enviar a imagem é quem quer ajustá-la. */}
          <Campo titulo="Formato da foto">
            <div className="grid max-w-[260px] grid-cols-2 gap-2">
              {[
                { v: "circulo", label: "Redonda" },
                { v: "quadrado", label: "Quadrada" },
              ].map((o) => (
                <OptionChip
                  key={o.v}
                  active={value.avatarShape === o.v}
                  onClick={() =>
                    set("avatarShape", o.v as DesignState["avatarShape"])
                  }
                >
                  <span
                    className="mr-1.5 inline-block size-3 border-2 border-current align-[-1px]"
                    style={{ borderRadius: o.v === "circulo" ? 999 : 3 }}
                  />
                  {o.label}
                </OptionChip>
              ))}
            </div>
          </Campo>

          <Campo titulo="Tamanho da foto">
            <Faixa
              min={0.6}
              max={1.6}
              step={0.05}
              valor={value.avatarSize}
              rotulo="Tamanho da foto de perfil"
              onChange={(n) => set("avatarSize", n)}
              formatar={(n) => `${n.toFixed(2)}×`}
            />
          </Campo>

          <Divisor />

          <ImageUpload
            label="Logotipo"
            value={value.logoUrl}
            onChange={(url) => set("logoUrl", url)}
            shape="square"
            hint="PNG com fundo transparente fica melhor."
            height={96}
          />

          <Divisor />

          <ImageUpload
            label="Imagem de capa"
            value={value.coverUrl}
            onChange={(url) => set("coverUrl", url)}
            shape="tall"
            hint="Fica em pé porque é assim que ela aparece no celular: ocupando a tela inteira. Nos templates com faixa de capa, só a parte de cima aparece."
            frame={{ zoom: value.coverZoom, x: value.coverX, y: value.coverY }}
            onFrame={(f) =>
              onChange({ coverZoom: f.zoom, coverX: f.x, coverY: f.y })
            }
          />
        </div>
      </Secao>

      <Secao icon={Palette} titulo="Cores" resumo="Destaque, fundo e texto">
        <div className="flex flex-col gap-5">
          <ColorPicker
            label="Cor de destaque"
            value={value.accent}
            onChange={(hex) => set("accent", hex)}
          />
          <ColorPicker
            label="Cor de fundo"
            value={value.background}
            onChange={(hex) => set("background", hex)}
          />
          <ColorPicker
            label="Cor do texto"
            value={value.textColor}
            onChange={(hex) => set("textColor", hex)}
          />

          <Select
            label="Estilo do fundo"
            value={value.backgroundMode}
            onChange={(e) =>
              set(
                "backgroundMode",
                e.target.value as DesignState["backgroundMode"],
              )
            }
            hint={
              value.backgroundMode === "image"
                ? "Usa a imagem de capa como fundo, com um véu da cor escolhida."
                : undefined
            }
          >
            <option value="gradient">Degradê</option>
            <option value="solid">Cor sólida</option>
            <option value="image">Imagem de capa</option>
          </Select>

          {/* Só aparece com imagem de fundo: controle que não faz nada é pior
              do que controle que não existe. */}
          {value.backgroundMode === "image" ? (
            <Campo titulo="Força da imagem">
              <Faixa
                min={10}
                max={100}
                step={5}
                valor={value.coverOpacity}
                rotulo="Opacidade da imagem de fundo"
                onChange={(n) => set("coverOpacity", n)}
                formatar={(n) => `${Math.round(n)}%`}
              />
            </Campo>
          ) : null}
        </div>
      </Secao>

      <Secao
        icon={Shapes}
        titulo="Forma do fundo"
        resumo="A geometria por trás do conteúdo"
      >
        <div className="flex flex-col gap-5">
          <Campo ajuda="Sem escolher, vale a forma que vem com o template.">
            <div className="grid grid-cols-3 gap-2">
              {FORMAS.map((f) => (
                <OptionChip
                  key={f.v}
                  active={(value.ornament ?? "") === f.v}
                  onClick={() => set("ornament", f.v as DesignState["ornament"])}
                >
                  {f.label}
                </OptionChip>
              ))}
            </div>
          </Campo>

          <ColorPicker
            label="Cor da forma"
            value={value.ornamentColor ?? value.accent}
            onChange={(hex) => set("ornamentColor", hex)}
          />

          <Campo titulo="Força da forma">
            <Faixa
              min={5}
              max={100}
              step={5}
              valor={value.ornamentOpacity}
              rotulo="Opacidade da forma do fundo"
              onChange={(n) => set("ornamentOpacity", n)}
              formatar={(n) => `${Math.round(n)}%`}
            />
          </Campo>
        </div>
      </Secao>

      <Secao icon={Type} titulo="Tipografia" resumo="Fonte e tamanho dos textos">
        <div className="flex flex-col gap-5">
          <Select
            label="Fonte"
            value={value.fontFamily}
            onChange={(e) =>
              set("fontFamily", e.target.value as DesignState["fontFamily"])
            }
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </Select>

          <Campo titulo="Tamanho dos textos">
            <div className="grid grid-cols-3 gap-2">
              {[
                { v: 0.9, label: "Menor" },
                { v: 1, label: "Padrão" },
                { v: 1.15, label: "Maior" },
              ].map((o) => (
                <OptionChip
                  key={o.v}
                  active={Math.abs(value.fontScale - o.v) < 0.03}
                  onClick={() => set("fontScale", o.v)}
                >
                  {o.label}
                </OptionChip>
              ))}
            </div>
          </Campo>
        </div>
      </Secao>

      <Secao
        icon={LayoutPanelTop}
        titulo="Botões"
        resumo="Estilo, cantos e respiro"
      >
        <div className="flex flex-col gap-5">
          <Campo titulo="Estilo dos botões">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {BUTTON_STYLES.map((style) => (
                <OptionChip
                  key={style.value}
                  active={value.buttonStyle === style.value}
                  onClick={() => set("buttonStyle", style.value)}
                >
                  {style.label}
                </OptionChip>
              ))}
            </div>
          </Campo>

          <Campo titulo="Cantos">
            <div className="grid grid-cols-3 gap-2">
              {BUTTON_RADIUS.map((radius) => (
                <OptionChip
                  key={radius.value}
                  active={value.buttonRadius === radius.value}
                  onClick={() => set("buttonRadius", radius.value)}
                >
                  <span
                    className="mr-1.5 inline-block size-3 border-2 border-current align-[-1px]"
                    style={{
                      borderRadius:
                        radius.value === "pill"
                          ? 999
                          : radius.value === "rounded"
                            ? 4
                            : 0,
                    }}
                  />
                  {radius.label}
                </OptionChip>
              ))}
            </div>
          </Campo>

          <Campo titulo="Respiro entre os botões">
            <div className="grid grid-cols-3 gap-2">
              {[
                { v: "compacto", label: "Compacto" },
                { v: "normal", label: "Normal" },
                { v: "arejado", label: "Arejado" },
              ].map((o) => (
                <OptionChip
                  key={o.v}
                  active={value.spacing === o.v}
                  onClick={() => set("spacing", o.v as DesignState["spacing"])}
                >
                  {o.label}
                </OptionChip>
              ))}
            </div>
          </Campo>
        </div>
      </Secao>

      {layout === "livre" ? (
      <Secao
        icon={SlidersHorizontal}
        titulo="Layout"
        resumo="Posição do conteúdo na tela"
      >
        <div className="flex flex-col gap-5">
          <Campo titulo="Alinhamento">
            <div className="grid grid-cols-2 gap-2">
              {[
                { v: "centro", label: "Centro" },
                { v: "esquerda", label: "Esquerda" },
              ].map((o) => (
                <OptionChip
                  key={o.v}
                  active={value.contentAlign === o.v}
                  onClick={() =>
                    set("contentAlign", o.v as DesignState["contentAlign"])
                  }
                >
                  {o.label}
                </OptionChip>
              ))}
            </div>
          </Campo>

          <Campo titulo="Posição na tela">
            <div className="grid grid-cols-3 gap-2">
              {[
                { v: "topo", label: "Topo" },
                { v: "centro", label: "Meio" },
                { v: "rodape", label: "Rodapé" },
              ].map((o) => (
                <OptionChip
                  key={o.v}
                  active={value.contentPosition === o.v}
                  onClick={() =>
                    set(
                      "contentPosition",
                      o.v as DesignState["contentPosition"],
                    )
                  }
                >
                  {o.label}
                </OptionChip>
              ))}
            </div>
          </Campo>

          <Campo titulo="Cartão atrás do conteúdo">
            <div className="grid grid-cols-3 gap-2">
              {[
                { v: "nenhum", label: "Nenhum" },
                { v: "vidro", label: "Vidro" },
                { v: "solido", label: "Sólido" },
              ].map((o) => (
                <OptionChip
                  key={o.v}
                  active={value.cardStyle === o.v}
                  onClick={() =>
                    set("cardStyle", o.v as DesignState["cardStyle"])
                  }
                >
                  {o.label}
                </OptionChip>
              ))}
            </div>
          </Campo>
        </div>
      </Secao>
      ) : null}

      {layout === "showroom" ? (
      <Secao
        icon={BadgeCheck}
        titulo="Concessionária"
        resumo="Textos extras e chamada final"
      >
        <div className="flex flex-col gap-4">
          <p className="rounded-xl border border-dashed border-[#d2dae8] bg-[#fafbfd] p-3 text-[11.5px] leading-snug text-[#8a97b1]">
            Horário, modelos e fotos da loja ficam na aba <strong>Blocos</strong>.
          </p>

          <Input
            label="Arroba"
            value={value.handle ?? ""}
            onChange={(e) => set("handle", e.target.value)}
            placeholder="@suaempresa"
            hint="Linha discreta logo abaixo do nome."
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Rodapé do cartão, à esquerda"
              value={value.metaLeft ?? ""}
              onChange={(e) => set("metaLeft", e.target.value)}
              placeholder="Manaus, AM"
            />
            <Input
              label="À direita"
              value={value.metaRight ?? ""}
              onChange={(e) => set("metaRight", e.target.value)}
              placeholder="Desde 2023"
            />
          </div>

          <Divisor />

          <Input
            label="Chamada final — título"
            value={value.ctaTitle ?? ""}
            onChange={(e) => set("ctaTitle", e.target.value)}
            placeholder="Seu negócio na internet com mais clientes"
          />
          <Input
            label="Chamada final — texto"
            value={value.ctaText ?? ""}
            onChange={(e) => set("ctaText", e.target.value)}
            placeholder="Sites sob medida para o seu estabelecimento."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Texto do botão"
              value={value.ctaLabel ?? ""}
              onChange={(e) => set("ctaLabel", e.target.value)}
              placeholder="Pedir orçamento"
            />
            <Input
              label="Link do botão"
              value={value.ctaUrl ?? ""}
              onChange={(e) => set("ctaUrl", e.target.value)}
              placeholder="https://wa.me/..."
            />
          </div>
        </div>
      </Secao>
      ) : null}

      <Secao
        icon={SlidersHorizontal}
        titulo="O que aparece"
        resumo="Ligue e desligue blocos da página"
      >
        <div className="divide-y divide-line rounded-xl border border-line bg-white px-4">
          <Switch
            checked={value.showAvatar}
            onChange={(v) => set("showAvatar", v)}
            label="Foto de perfil"
          />
          <Switch
            checked={value.avatarRing}
            onChange={(v) => set("avatarRing", v)}
            label="Borda na foto de perfil"
            description="O anel colorido em volta da foto."
          />
          <Switch
            checked={value.showLogo}
            onChange={(v) => set("showLogo", v)}
            label="Logotipo"
          />
          <Switch
            checked={value.showBio}
            onChange={(v) => set("showBio", v)}
            label="Descrição"
          />
          <Switch
            checked={value.showSocial}
            onChange={(v) => set("showSocial", v)}
            label="Linha de redes sociais"
            description="Ícones redondos para os links marcados como sociais."
          />
          <div className="flex flex-wrap items-center justify-between gap-3 py-3">
            <span className="text-[13.5px] font-medium text-[#3b4a68]">
              Posição das redes sociais
            </span>
            <div className="grid w-[180px] grid-cols-2 gap-2">
              {[
                { v: "acima", label: "Acima" },
                { v: "abaixo", label: "Abaixo" },
              ].map((o) => (
                <OptionChip
                  key={o.v}
                  active={value.socialPosition === o.v}
                  onClick={() =>
                    set("socialPosition", o.v as DesignState["socialPosition"])
                  }
                >
                  {o.label}
                </OptionChip>
              ))}
            </div>
          </div>
          <Switch
            checked={value.showShare}
            onChange={(v) => set("showShare", v)}
            label="Botão compartilhar"
          />
          <Switch
            checked={value.showContactCard}
            onChange={(v) => set("showContactCard", v)}
            label="Salvar contato (.vcf)"
            description="Gera um cartão de contato com telefone, e-mail e site."
          />
        </div>
      </Secao>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Peças da interface
// ---------------------------------------------------------------------------

function Secao({
  icon: Icon,
  titulo,
  resumo,
  aberta = false,
  children,
}: {
  icon: React.ElementType;
  titulo: string;
  resumo: string;
  aberta?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(aberta);

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#fafbfd]"
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
          <Icon className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] font-bold text-[#10233f]">
            {titulo}
          </span>
          <span className="block truncate text-[11.5px] text-[#8a97b1]">
            {resumo}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-[#8a97b1] transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div className="border-t border-line px-4 pb-5 pt-4">{children}</div>
      ) : null}
    </section>
  );
}

function Campo({
  titulo,
  ajuda,
  children,
}: {
  titulo?: string;
  ajuda?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      {titulo ? (
        <span className="text-[13px] font-semibold text-[#3b4a68]">
          {titulo}
        </span>
      ) : null}
      {children}
      {ajuda ? (
        <p className="text-[11.5px] leading-snug text-[#9aa7bf]">{ajuda}</p>
      ) : null}
    </div>
  );
}

/** Controle deslizante com o valor sempre à vista. */
function Faixa({
  min,
  max,
  step,
  valor,
  rotulo,
  onChange,
  formatar,
}: {
  min: number;
  max: number;
  step: number;
  valor: number;
  rotulo: string;
  onChange: (n: number) => void;
  formatar: (n: number) => string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-line bg-[#fafbfd] px-3 py-2">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valor}
        aria-label={rotulo}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-[#dde4f0] accent-brand-600"
      />
      <span className="w-12 shrink-0 text-right font-mono text-[11px] text-[#6b7a99]">
        {formatar(valor)}
      </span>
    </div>
  );
}

function Divisor() {
  return <div className="h-px bg-line" />;
}

function OptionChip({
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
        "flex h-10 items-center justify-center rounded-xl border px-2 text-[12.5px] font-semibold transition-all",
        active
          ? "border-brand-500 bg-brand-50 text-brand-700 shadow-[0_0_0_3px_rgba(27,84,176,0.1)]"
          : "border-line bg-white text-[#6b7a99] hover:border-brand-200 hover:text-brand-700",
      )}
    >
      {children}
    </button>
  );
}
