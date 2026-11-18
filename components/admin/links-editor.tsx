"use client";

import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, GripVertical, Link2, Plus, Trash2 } from "lucide-react";
import { Input, Switch } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/display";
import { LINK_TYPES, buildLinkUrl, getLinkType } from "@/lib/links";
import { COLOR_PRESETS } from "@/lib/templates";
import { cn, hexToRgba } from "@/lib/utils";

export type EditorLink = {
  key: string;
  id?: string;
  type: string;
  label: string;
  value: string;
  asSocial: boolean;
  active: boolean;
  /** botão maior, com a cor cheia — a ação principal da placa */
  highlight: boolean;
  /** cor própria deste botão; null usa a do template */
  color: string | null;
};

let seq = 0;
export const newLinkKey = () => `tmp-${Date.now()}-${++seq}`;

export function makeLink(type: string): EditorLink {
  const def = getLinkType(type);
  return {
    key: newLinkKey(),
    type: def.type,
    label: def.label,
    value: "",
    asSocial: def.socialByDefault,
    active: true,
    highlight: false,
    color: null,
  };
}

export default function LinksEditor({
  links,
  onChange,
}: {
  links: EditorLink[];
  onChange: (links: EditorLink[]) => void;
}) {
  const [picker, setPicker] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = links.findIndex((l) => l.key === active.id);
    const to = links.findIndex((l) => l.key === over.id);
    if (from < 0 || to < 0) return;
    onChange(arrayMove(links, from, to));
  }

  const update = (key: string, patch: Partial<EditorLink>) =>
    onChange(links.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const remove = (key: string) => onChange(links.filter((l) => l.key !== key));

  const add = (type: string) => {
    const link = makeLink(type);
    onChange([...links, link]);
    setExpanded(link.key);
    setPicker(false);
  };

  return (
    <div className="flex flex-col gap-3">
      {links.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d2dae8] bg-[#fafbfd]">
          <EmptyState
            icon={Link2}
            title="Nenhum link adicionado"
            description="Adicione WhatsApp, Instagram, site e o que mais o cliente precisar na página."
          />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
          <SortableContext
            items={links.map((l) => l.key)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="flex flex-col gap-2.5">
              {links.map((link) => (
                <SortableRow
                  key={link.key}
                  link={link}
                  expanded={expanded === link.key}
                  onToggleExpand={() =>
                    setExpanded((cur) => (cur === link.key ? null : link.key))
                  }
                  onUpdate={(patch) => update(link.key, patch)}
                  onRemove={() => remove(link.key)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      <button
        type="button"
        onClick={() => setPicker(true)}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#d2dae8] text-[13.5px] font-semibold text-[#6b7a99] transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
      >
        <Plus className="size-4" />
        Adicionar link
      </button>

      <Modal
        open={picker}
        onClose={() => setPicker(false)}
        title="Escolha o tipo de link"
        description="Montamos o endereço final automaticamente a partir do que você digitar."
      >
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {LINK_TYPES.map((def) => {
            const Icon = def.icon;
            return (
              <button
                key={def.type}
                type="button"
                onClick={() => add(def.type)}
                className="flex flex-col items-center gap-2 rounded-xl border border-line bg-white px-3 py-4 text-center transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card"
              >
                <span
                  className="grid size-10 place-items-center rounded-xl"
                  style={{
                    backgroundColor: hexToRgba(def.color, 0.12),
                    color: def.color,
                  }}
                >
                  <Icon className="size-5" />
                </span>
                <span className="text-[12.5px] font-semibold leading-tight text-[#3b4a68]">
                  {def.label}
                </span>
              </button>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}

function SortableRow({
  link,
  expanded,
  onToggleExpand,
  onUpdate,
  onRemove,
}: {
  link: EditorLink;
  expanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (patch: Partial<EditorLink>) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: link.key });

  const def = getLinkType(link.type);
  const Icon = def.icon;
  const preview = buildLinkUrl(link.type, link.value);

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "overflow-hidden rounded-xl border border-line bg-white transition-shadow",
        isDragging ? "z-10 shadow-pop" : "shadow-card",
        !link.active && "opacity-60",
      )}
    >
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <button
          type="button"
          aria-label="Reordenar link"
          className="cursor-grab touch-none text-[#c2cde0] transition-colors hover:text-[#6b7a99] active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4.5" />
        </button>

        <span
          className="grid size-9 shrink-0 place-items-center rounded-lg"
          style={{
            backgroundColor: hexToRgba(def.color, 0.12),
            color: def.color,
          }}
        >
          <Icon className="size-[18px]" />
        </span>

        <button
          type="button"
          onClick={onToggleExpand}
          className="min-w-0 flex-1 text-left"
        >
          <p className="truncate text-[13.5px] font-semibold text-[#10233f]">
            {link.label || def.label}
          </p>
          <p className="truncate font-mono text-[11.5px] text-[#9aa7bf]">
            {preview || def.placeholder}
          </p>
        </button>

        <Switch
          checked={link.active}
          onChange={(active) => onUpdate({ active })}
        />

        <button
          type="button"
          onClick={onToggleExpand}
          aria-label="Editar link"
          className="grid size-8 place-items-center rounded-lg text-[#8a97b1] transition-colors hover:bg-[#f1f4f9] hover:text-[#10233f]"
        >
          <ChevronDown
            className={cn("size-4 transition-transform", expanded && "rotate-180")}
          />
        </button>

        <button
          type="button"
          onClick={onRemove}
          aria-label="Remover link"
          className="grid size-8 place-items-center rounded-lg text-[#c2cde0] transition-colors hover:bg-danger-soft hover:text-danger"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {expanded ? (
        <div className="grid gap-3 border-t border-line bg-[#fafbfd] px-4 py-4 sm:grid-cols-2">
          <Input
            label="Texto do botão"
            value={link.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder={def.label}
          />
          <Input
            label="Destino"
            value={link.value}
            onChange={(e) => onUpdate({ value: e.target.value })}
            placeholder={def.placeholder}
            hint={def.hint}
          />
          <div className="sm:col-span-2">
            <Switch
              checked={link.asSocial}
              onChange={(asSocial) => onUpdate({ asSocial })}
              label="Mostrar como ícone de rede social"
              description="Em vez de um botão largo, aparece como ícone redondo na linha de sociais."
            />
          </div>
          <div className="sm:col-span-2">
            <Switch
              checked={link.highlight}
              onChange={(highlight) => onUpdate({ highlight })}
              label="Botão de destaque"
              description="Fica maior e com a cor cheia. Use em um só: se tudo é destaque, nada é."
            />
          </div>
          <div className="sm:col-span-2 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-[#fafbfd] px-3 py-2.5">
            <span className="text-[12.5px] font-semibold text-[#3b4a68]">
              Cor deste botão
            </span>
            <button
              type="button"
              onClick={() => onUpdate({ color: null })}
              className={cn(
                "rounded-md px-2 py-1 text-[11.5px] font-semibold transition-colors",
                link.color
                  ? "text-[#6b7a99] hover:bg-white hover:text-brand-700"
                  : "bg-white text-brand-700 shadow-card",
              )}
            >
              Do template
            </button>
            {COLOR_PRESETS.map((hex) => (
              <button
                key={hex}
                type="button"
                aria-label={`Usar a cor ${hex}`}
                onClick={() => onUpdate({ color: hex })}
                className={cn(
                  "size-6 rounded-full border transition-transform hover:scale-110",
                  link.color === hex
                    ? "border-[#10233f] ring-2 ring-brand-300"
                    : "border-black/10",
                )}
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
        </div>
      ) : null}
    </li>
  );
}
