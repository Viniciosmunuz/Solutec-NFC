"use client";

import { Palette, SlidersHorizontal, Type, UserRound } from "lucide-react";
import ColorPicker from "@/components/admin/color-picker";
import ImageUpload from "@/components/admin/image-upload";
import { Input, Select, Switch, Textarea } from "@/components/ui/field";
import { SectionTitle } from "@/components/ui/card";
import {
  BUTTON_RADIUS,
  BUTTON_STYLES,
  FONT_OPTIONS,
} from "@/lib/templates";
import type { PublicCustomization } from "@/components/public/PublicPage";
import { cn } from "@/lib/utils";

export type DesignState = PublicCustomization;

export default function DesignEditor({
  value,
  onChange,
}: {
  value: DesignState;
  onChange: (patch: Partial<DesignState>) => void;
}) {
  const set = <K extends keyof DesignState>(key: K, v: DesignState[K]) =>
    onChange({ [key]: v } as Partial<DesignState>);

  return (
    <div className="flex flex-col gap-7">
      {/* Identidade */}
      <section>
        <Block icon={UserRound} title="Identidade" />
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-6">
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
            <ImageUpload
              label="Logotipo"
              value={value.logoUrl}
              onChange={(url) => set("logoUrl", url)}
              shape="square"
              hint="PNG com fundo transparente fica melhor."
              height={96}
            />
          </div>

          <ImageUpload
            label="Imagem de capa"
            value={value.coverUrl}
            onChange={(url) => set("coverUrl", url)}
            shape="wide"
            hint="Usada nos templates com capa e no fundo em modo imagem."
            frame={{ zoom: value.coverZoom, x: value.coverX, y: value.coverY }}
            onFrame={(f) =>
              onChange({ coverZoom: f.zoom, coverX: f.x, coverY: f.y })
            }
          />

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
      </section>

      {/* Cores */}
      <section>
        <Block icon={Palette} title="Cores" />
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
        </div>
      </section>

      {/* Botões e tipografia */}
      <section>
        <Block icon={Type} title="Botões e tipografia" />
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-[#3b4a68]">
              Estilo dos botões
            </span>
            <div className="grid grid-cols-4 gap-2">
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
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-[#3b4a68]">
              Cantos
            </span>
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
          </div>

          <Select
            label="Tipografia"
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
        </div>
      </section>

      {/* Elementos */}
      <section>
        <Block icon={SlidersHorizontal} title="Elementos visíveis" />
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
      </section>
    </div>
  );
}

function Block({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="grid size-7 place-items-center rounded-lg bg-brand-50 text-brand-600">
        <Icon className="size-4" />
      </span>
      <SectionTitle>{title}</SectionTitle>
    </div>
  );
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
