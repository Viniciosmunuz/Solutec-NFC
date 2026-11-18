"use client";

import { useState } from "react";
import { ChevronDown, GripVertical, Plus, Trash2 } from "lucide-react";
import ColorPicker from "@/components/admin/color-picker";
import ImageUpload from "@/components/admin/image-upload";
import { Input, Switch } from "@/components/ui/field";
import { cn } from "@/lib/utils";

/**
 * Editor dos blocos extras do template Portfólio: fatos, projetos e galeria.
 *
 * Os três são listas simples: acrescentar, editar, reordenar e remover. Não
 * usam arrastar como os links porque, ao contrário deles, não há histórico de
 * cliques preso a cada item — subir e descer com botão resolve, funciona no
 * celular e não traz uma biblioteca inteira junto.
 */

export type EditorFact = { key: string; icon: string; text: string };
export type EditorProject = {
  key: string;
  title: string;
  subtitle: string;
  url: string;
  color: string;
  icon: string;
  featured: boolean;
};
export type EditorGalleryItem = {
  key: string;
  imageUrl: string;
  caption: string;
  url: string;
};

let seq = 0;
const novaChave = () => `blk-${Date.now()}-${++seq}`;

export const novoFato = (): EditorFact => ({
  key: novaChave(),
  icon: "✨",
  text: "",
});

export const novoProjeto = (): EditorProject => ({
  key: novaChave(),
  title: "",
  subtitle: "",
  url: "",
  color: "#1B54B0",
  icon: "",
  featured: false,
});

export const novaImagem = (): EditorGalleryItem => ({
  key: novaChave(),
  imageUrl: "",
  caption: "",
  url: "",
});

export default function BlocksEditor({
  facts,
  projects,
  gallery,
  onFacts,
  onProjects,
  onGallery,
}: {
  facts: EditorFact[];
  projects: EditorProject[];
  gallery: EditorGalleryItem[];
  onFacts: (v: EditorFact[]) => void;
  onProjects: (v: EditorProject[]) => void;
  onGallery: (v: EditorGalleryItem[]) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Lista
        titulo="Fatos"
        descricao="As linhas com emoji no cartão de perfil. Uma informação curta em cada."
        vazio="Nenhum fato ainda. Ex.: 📍 Manaus, AM"
        itens={facts}
        onAdd={() => onFacts([...facts, novoFato()])}
        onRemove={(i) => onFacts(facts.filter((_, n) => n !== i))}
        onMove={(i, dir) => onFacts(mover(facts, i, dir))}
        resumo={(f) => `${f.icon} ${f.text || "sem texto"}`}
        renderizar={(f, i) => (
          <div className="grid gap-3 sm:grid-cols-[90px_minmax(0,1fr)]">
            <Input
              label="Emoji"
              value={f.icon}
              onChange={(e) =>
                onFacts(trocar(facts, i, { icon: e.target.value }))
              }
              placeholder="📍"
            />
            <Input
              label="Texto"
              value={f.text}
              onChange={(e) =>
                onFacts(trocar(facts, i, { text: e.target.value }))
              }
              placeholder="Manaus, AM"
            />
          </div>
        )}
      />

      <Lista
        titulo="Projetos"
        descricao="Cartões coloridos. O marcado como destaque ocupa a linha inteira, no topo."
        vazio="Nenhum projeto ainda."
        itens={projects}
        onAdd={() => onProjects([...projects, novoProjeto()])}
        onRemove={(i) => onProjects(projects.filter((_, n) => n !== i))}
        onMove={(i, dir) => onProjects(mover(projects, i, dir))}
        resumo={(p) => p.title || "sem nome"}
        cor={(p) => p.color}
        renderizar={(p, i) => (
          <div className="flex flex-col gap-3">
            <Input
              label="Nome"
              required
              value={p.title}
              onChange={(e) =>
                onProjects(trocar(projects, i, { title: e.target.value }))
              }
              placeholder="MenuFácil"
            />
            <Input
              label="Descrição curta"
              value={p.subtitle}
              onChange={(e) =>
                onProjects(trocar(projects, i, { subtitle: e.target.value }))
              }
              placeholder="Seu cardápio, mais perto do cliente"
            />
            <Input
              label="Link"
              value={p.url}
              onChange={(e) =>
                onProjects(trocar(projects, i, { url: e.target.value }))
              }
              placeholder="https://..."
              hint="Sem link, o cartão só mostra a informação."
            />
            <Input
              label="Ícone"
              value={p.icon}
              onChange={(e) =>
                onProjects(trocar(projects, i, { icon: e.target.value }))
              }
              placeholder="🍽️"
              hint="Um emoji, ou o endereço de uma imagem."
            />
            <ColorPicker
              label="Cor do cartão"
              value={p.color}
              onChange={(hex) => onProjects(trocar(projects, i, { color: hex }))}
            />
            <Switch
              checked={p.featured}
              onChange={(featured) =>
                onProjects(
                  // Só um projeto pode ser o destaque: dois cartões grandes
                  // viram duas faixas e a seção perde a hierarquia.
                  projects.map((outro, n) => ({
                    ...outro,
                    featured: n === i ? featured : featured ? false : outro.featured,
                  })),
                )
              }
              label="Projeto em destaque"
              description="Ocupa a largura inteira, no topo da seção."
            />
          </div>
        )}
      />

      <Lista
        titulo="Galeria"
        descricao="Imagens em faixa rolável, abaixo dos projetos."
        vazio="Nenhuma imagem ainda."
        itens={gallery}
        onAdd={() => onGallery([...gallery, novaImagem()])}
        onRemove={(i) => onGallery(gallery.filter((_, n) => n !== i))}
        onMove={(i, dir) => onGallery(mover(gallery, i, dir))}
        resumo={(g) => g.caption || (g.imageUrl ? "imagem" : "sem imagem")}
        renderizar={(g, i) => (
          <div className="flex flex-col gap-3">
            <ImageUpload
              label="Imagem"
              value={g.imageUrl || null}
              onChange={(url) =>
                onGallery(trocar(gallery, i, { imageUrl: url ?? "" }))
              }
              shape="square"
              height={110}
            />
            <Input
              label="Legenda"
              value={g.caption}
              onChange={(e) =>
                onGallery(trocar(gallery, i, { caption: e.target.value }))
              }
              placeholder="BarberFlow"
            />
            <Input
              label="Link"
              value={g.url}
              onChange={(e) =>
                onGallery(trocar(gallery, i, { url: e.target.value }))
              }
              placeholder="https://..."
            />
          </div>
        )}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------

function mover<T>(lista: T[], i: number, dir: -1 | 1): T[] {
  const destino = i + dir;
  if (destino < 0 || destino >= lista.length) return lista;
  const copia = [...lista];
  [copia[i], copia[destino]] = [copia[destino], copia[i]];
  return copia;
}

function trocar<T>(lista: T[], i: number, patch: Partial<T>): T[] {
  return lista.map((item, n) => (n === i ? { ...item, ...patch } : item));
}

function Lista<T extends { key: string }>({
  titulo,
  descricao,
  vazio,
  itens,
  onAdd,
  onRemove,
  onMove,
  resumo,
  cor,
  renderizar,
}: {
  titulo: string;
  descricao: string;
  vazio: string;
  itens: T[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  onMove: (i: number, dir: -1 | 1) => void;
  resumo: (item: T) => string;
  cor?: (item: T) => string;
  renderizar: (item: T, i: number) => React.ReactNode;
}) {
  const [aberto, setAberto] = useState<string | null>(null);

  return (
    <section>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[14px] font-bold text-[#10233f]">{titulo}</h3>
          <p className="mt-0.5 text-[12px] leading-snug text-[#8a97b1]">
            {descricao}
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-[13px] font-semibold text-[#3b4a68] transition-colors hover:bg-brand-50 hover:text-brand-700"
        >
          <Plus className="size-3.5" />
          Adicionar
        </button>
      </div>

      {itens.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#d2dae8] bg-[#fafbfd] px-4 py-6 text-center text-[12.5px] text-[#8a97b1]">
          {vazio}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {itens.map((item, i) => {
            const expandido = aberto === item.key;
            return (
              <li
                key={item.key}
                className="overflow-hidden rounded-xl border border-line bg-white"
              >
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <div className="flex shrink-0 flex-col">
                    <button
                      type="button"
                      aria-label="Subir"
                      disabled={i === 0}
                      onClick={() => onMove(i, -1)}
                      className="text-[#c2cde0] transition-colors hover:text-[#6b7a99] disabled:opacity-30"
                    >
                      <ChevronDown className="size-3.5 rotate-180" />
                    </button>
                    <button
                      type="button"
                      aria-label="Descer"
                      disabled={i === itens.length - 1}
                      onClick={() => onMove(i, 1)}
                      className="text-[#c2cde0] transition-colors hover:text-[#6b7a99] disabled:opacity-30"
                    >
                      <ChevronDown className="size-3.5" />
                    </button>
                  </div>

                  {cor ? (
                    <span
                      className="size-5 shrink-0 rounded-md border border-black/10"
                      style={{ backgroundColor: cor(item) }}
                    />
                  ) : (
                    <GripVertical className="size-4 shrink-0 text-[#dde4f0]" />
                  )}

                  <button
                    type="button"
                    onClick={() => setAberto(expandido ? null : item.key)}
                    className="min-w-0 flex-1 truncate text-left text-[13px] font-semibold text-[#10233f]"
                  >
                    {resumo(item)}
                  </button>

                  <button
                    type="button"
                    aria-label="Remover"
                    onClick={() => onRemove(i)}
                    className="shrink-0 rounded-lg p-1.5 text-[#c2cde0] transition-colors hover:bg-danger-soft hover:text-danger"
                  >
                    <Trash2 className="size-4" />
                  </button>

                  <button
                    type="button"
                    aria-label={expandido ? "Fechar" : "Editar"}
                    onClick={() => setAberto(expandido ? null : item.key)}
                    className="shrink-0 rounded-lg p-1.5 text-[#8a97b1] transition-colors hover:bg-[#f1f4f9]"
                  >
                    <ChevronDown
                      className={cn(
                        "size-4 transition-transform",
                        expandido && "rotate-180",
                      )}
                    />
                  </button>
                </div>

                {expandido ? (
                  <div className="border-t border-line px-3 pb-4 pt-3">
                    {renderizar(item, i)}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
