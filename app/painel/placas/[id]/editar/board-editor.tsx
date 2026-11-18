"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Save, Settings2 } from "lucide-react";
import TemplateGallery from "@/components/admin/template-gallery";
import DesignEditor from "@/components/admin/design-editor";
import LinksEditor, { type EditorLink } from "@/components/admin/links-editor";
import PhonePreview from "@/components/admin/phone-preview";
import PublicPage, {
  type PublicCustomization,
} from "@/components/public/PublicPage";
import { Card, CardBody } from "@/components/ui/card";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/field";
import { Tabs } from "@/components/ui/misc";
import BlocksEditor, {
  type EditorFact,
  type EditorGalleryItem,
  type EditorProject,
} from "@/components/admin/blocks-editor";
import { useToast } from "@/components/ui/toast";
import { updateBoard } from "@/lib/actions/boards";
import { buildLinkUrl } from "@/lib/links";
import { getTemplate } from "@/lib/templates";
import { displayUrl } from "@/lib/urls";

type LinkRow = {
  id: string;
  type: string;
  label: string;
  value: string;
  asSocial: boolean;
  active: boolean;
  highlight: boolean;
  color: string | null;
  stat: string | null;
};

type FactRow = { id: string; icon: string; text: string };
type ProjectRow = {
  id: string;
  title: string;
  subtitle: string | null;
  url: string | null;
  color: string;
  icon: string | null;
  featured: boolean;
};
type GalleryRow = {
  id: string;
  imageUrl: string;
  caption: string | null;
  url: string | null;
};

export default function BoardEditor({
  board,
  clients,
}: {
  board: {
    id: string;
    code: string;
    slug: string;
    name: string;
    status: string;
    notes: string;
    clientId: string;
    templateKey: string;
    customization: PublicCustomization;
    links: LinkRow[];
    facts: FactRow[];
    projects: ProjectRow[];
    gallery: GalleryRow[];
  };
  clients: { id: string; name: string; company: string | null }[];
}) {
  const router = useRouter();
  const { success, error } = useToast();

  const [tab, setTab] = useState("design");
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(board.name);
  const [clientId, setClientId] = useState(board.clientId);
  const [status, setStatus] = useState(board.status);
  const [notes, setNotes] = useState(board.notes);
  const [templateKey, setTemplateKey] = useState(board.templateKey);
  const [design, setDesign] = useState<PublicCustomization>(board.customization);
  const [links, setLinks] = useState<EditorLink[]>(() =>
    board.links.map((l) => ({
      key: l.id,
      id: l.id,
      type: l.type,
      label: l.label,
      value: l.value,
      asSocial: l.asSocial,
      active: l.active,
      highlight: l.highlight,
      color: l.color,
      stat: l.stat,
    })),
  );

  const [facts, setFacts] = useState<EditorFact[]>(() =>
    board.facts.map((f) => ({ key: f.id, icon: f.icon, text: f.text })),
  );
  const [projects, setProjects] = useState<EditorProject[]>(() =>
    board.projects.map((p) => ({
      key: p.id,
      title: p.title,
      subtitle: p.subtitle ?? "",
      url: p.url ?? "",
      color: p.color,
      icon: p.icon ?? "",
      featured: p.featured,
    })),
  );
  const [gallery, setGallery] = useState<EditorGalleryItem[]>(() =>
    board.gallery.map((g) => ({
      key: g.id,
      imageUrl: g.imageUrl,
      caption: g.caption ?? "",
      url: g.url ?? "",
    })),
  );

  // O preview usa as mesmas listas do formulário, com as chaves no lugar do
  // id: assim o que está na tela é o que vai ser gravado.
  const previewFacts = useMemo(
    () =>
      facts
        .filter((f) => f.text.trim())
        .map((f) => ({ id: f.key, icon: f.icon, text: f.text })),
    [facts],
  );
  const previewProjects = useMemo(
    () =>
      projects
        .filter((p) => p.title.trim())
        .map((p) => ({
          id: p.key,
          title: p.title,
          subtitle: p.subtitle || null,
          url: p.url || null,
          color: p.color,
          icon: p.icon || null,
          featured: p.featured,
        })),
    [projects],
  );
  const previewGallery = useMemo(
    () =>
      gallery
        .filter((g) => g.imageUrl)
        .map((g) => ({
          id: g.key,
          imageUrl: g.imageUrl,
          caption: g.caption || null,
          url: g.url || null,
        })),
    [gallery],
  );

  const previewLinks = useMemo(
    () =>
      links
        .filter((l) => l.active)
        .map((l) => ({
          id: l.key,
          type: l.type,
          label: l.label,
          url: buildLinkUrl(l.type, l.value) || "#",
          asSocial: l.asSocial,
          highlight: l.highlight,
          color: l.color,
          stat: l.stat,
        })),
    [links],
  );

  function pickTemplate(key: string) {
    const prev = getTemplate(templateKey).defaults;
    const next = getTemplate(key).defaults;
    setTemplateKey(key);
    setDesign((d) => ({
      ...d,
      accent: d.accent === prev.accent ? next.accent : d.accent,
      background: d.background === prev.background ? next.background : d.background,
      textColor: d.textColor === prev.textColor ? next.textColor : d.textColor,
      buttonStyle: d.buttonStyle === prev.buttonStyle ? next.buttonStyle : d.buttonStyle,
      buttonRadius:
        d.buttonRadius === prev.buttonRadius ? next.buttonRadius : d.buttonRadius,
      fontFamily: d.fontFamily === prev.fontFamily ? next.fontFamily : d.fontFamily,
      backgroundMode:
        d.backgroundMode === prev.backgroundMode
          ? next.backgroundMode
          : d.backgroundMode,
    }));
  }

  async function save() {
    if (!design.displayName.trim()) {
      error("Falta um detalhe", "Informe o nome exibido na página.");
      setTab("design");
      return;
    }

    setSaving(true);
    const result = await updateBoard(board.id, {
      name: name || design.displayName,
      clientId,
      templateKey,
      status: status as "ativa" | "inativa" | "producao",
      notes,
      customization: design,
      links: links.map((l) => ({
        id: l.id,
        type: l.type,
        label: l.label,
        value: l.value,
        asSocial: l.asSocial,
        active: l.active,
        highlight: l.highlight,
        color: l.color,
        stat: l.stat,
      })),
      facts: facts
        .filter((f) => f.text.trim())
        .map((f) => ({ icon: f.icon, text: f.text })),
      projects: projects
        .filter((p) => p.title.trim())
        .map((p) => ({
          title: p.title,
          subtitle: p.subtitle,
          url: p.url,
          color: p.color,
          icon: p.icon,
          featured: p.featured,
        })),
      gallery: gallery
        .filter((g) => g.imageUrl)
        .map((g) => ({
          imageUrl: g.imageUrl,
          caption: g.caption,
          url: g.url,
        })),
    });
    setSaving(false);

    if (!result.ok) {
      error("Não foi possível salvar", result.error);
      return;
    }

    success("Alterações salvas", "A página pública já está atualizada.");
    router.push(`/painel/placas/${board.id}`);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      {/* min-w-0: sem isso o item da grade recusa encolher abaixo do conteúdo
          mais largo que tiver dentro, e a barra de salvar vaza da tela. */}
      <div className="flex min-w-0 flex-col gap-4">
        <Card className="overflow-hidden">
          <div className="px-5 pt-1">
            <Tabs
              value={tab}
              onChange={setTab}
              tabs={[
                { value: "design", label: "Design" },
                { value: "links", label: "Links", count: links.length },
                ...(getTemplate(templateKey).layout === "showroom"
                  ? [
                      {
                        value: "blocos",
                        label: "Blocos",
                        count:
                          facts.length + projects.length + gallery.length,
                      },
                    ]
                  : []),
                { value: "template", label: "Template" },
                { value: "config", label: "Configurações" },
              ]}
            />
          </div>

          {tab === "design" ? (
            <CardBody>
              <DesignEditor
                layout={getTemplate(templateKey).layout}
                value={design}
                onChange={(patch) => setDesign((d) => ({ ...d, ...patch }))}
              />
            </CardBody>
          ) : null}

          {tab === "links" ? (
            <CardBody>
              <LinksEditor links={links} onChange={setLinks} />
            </CardBody>
          ) : null}

          {tab === "blocos" && getTemplate(templateKey).layout === "showroom" ? (
            <CardBody>
              <BlocksEditor
                facts={facts}
                projects={projects}
                gallery={gallery}
                onFacts={setFacts}
                onProjects={setProjects}
                onGallery={setGallery}
              />
            </CardBody>
          ) : null}

          {tab === "template" ? (
            <CardBody>
              <TemplateGallery
                selected={templateKey}
                onSelect={pickTemplate}
                columns={3}
              />
            </CardBody>
          ) : null}

          {tab === "config" ? (
            <CardBody className="flex flex-col gap-4">
              <Input
                label="Nome de identificação"
                value={name}
                onChange={(e) => setName(e.target.value)}
                hint="Uso interno, para localizar a placa no painel."
              />

              <Select
                label="Cliente vinculado"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company ? `${c.company} — ${c.name}` : c.name}
                  </option>
                ))}
              </Select>

              <Select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                hint={
                  status === "ativa"
                    ? "A página está acessível publicamente."
                    : "A URL continua existindo, mas exibe aviso de indisponível."
                }
              >
                <option value="ativa">Ativa — página no ar</option>
                <option value="producao">Em produção — aguardando gravação</option>
                <option value="inativa">Inativa — pausada</option>
              </Select>

              <Textarea
                label="Observações internas"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detalhes de produção, acabamento, pedido..."
                rows={3}
              />

              <div className="rounded-xl border border-line bg-[#fafbfd] p-4">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-[#9aa7bf]">
                  <Lock className="size-3" />
                  URL pública — permanente
                </p>
                <code className="mt-2 block truncate font-mono text-[12.5px] text-[#6b7a99]">
                  {displayUrl(board.slug)}
                </code>
                <p className="mt-2 text-[12px] leading-relaxed text-[#8a97b1]">
                  Não é possível alterar o endereço: ele já foi gravado no chip
                  NFC da placa <span className="font-mono">{board.code}</span>.
                  Para um endereço diferente, crie uma nova placa.
                </p>
              </div>
            </CardBody>
          ) : null}
        </Card>

        {/* Barra de salvar */}
        <div className="sticky bottom-0 z-20 flex items-center justify-between gap-3 rounded-2xl border border-line bg-white/90 p-3 shadow-pop backdrop-blur-md">
          <ButtonLink href={`/painel/placas/${board.id}`} variant="secondary">
            Cancelar
          </ButtonLink>
          <p className="hidden flex-1 truncate px-2 text-center text-[12.5px] text-[#8a97b1] sm:block">
            <Settings2 className="mr-1 inline size-3.5 align-[-2px]" />
            As alterações aparecem na página pública na hora.
          </p>
          <Button onClick={save} loading={saving}>
            <Save className="size-4" />
            Salvar alterações
          </Button>
        </div>
      </div>

      <div className="min-w-0 lg:sticky lg:top-6 lg:self-start">
        <PhonePreview url={displayUrl(board.slug)}>
          <PublicPage
            templateKey={templateKey}
            custom={design}
            links={previewLinks}
            facts={previewFacts}
            projects={previewProjects}
            gallery={previewGallery}
            preview
          />
        </PhonePreview>
      </div>
    </div>
  );
}
