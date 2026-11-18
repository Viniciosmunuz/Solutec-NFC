"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  LayoutTemplate,
  Link2,
  Palette,
  Plus,
  Rocket,
  Search,
  Users,
} from "lucide-react";
import Stepper from "@/components/admin/stepper";
import TemplateGallery from "@/components/admin/template-gallery";
import DesignEditor from "@/components/admin/design-editor";
import LinksEditor, {
  makeLink,
  type EditorLink,
} from "@/components/admin/links-editor";
import PhonePreview from "@/components/admin/phone-preview";
import ClientForm from "@/components/admin/client-form";
import PublicPage from "@/components/public/PublicPage";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { Avatar, EmptyState } from "@/components/ui/display";
import { useToast } from "@/components/ui/toast";
import { createBoard } from "@/lib/actions/boards";
import { getTemplate, TEMPLATES, categoryLabel } from "@/lib/templates";
import { buildLinkUrl } from "@/lib/links";
import { appUrl } from "@/lib/urls";
import { cn, slugify } from "@/lib/utils";
import type { PublicCustomization } from "@/components/public/PublicPage";

type ClientOption = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  _count: { boards: number };
};

const STEPS = ["Cliente", "Template", "Design", "Links", "Finalizar"];

function defaultsFor(key: string): PublicCustomization {
  const d = getTemplate(key).defaults;
  return {
    displayName: "",
    headline: "",
    bio: "",
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
    avatarRing: true,
    showLogo: true,
    showBio: true,
    showSocial: true,
    showShare: true,
    showContactCard: true,
  };
}

export default function BoardWizard({
  clients: initialClients,
  preselectedClientId,
  preselectedTemplate,
}: {
  clients: ClientOption[];
  preselectedClientId?: string;
  preselectedTemplate?: string;
}) {
  const startTemplate =
    preselectedTemplate && TEMPLATES.some((t) => t.key === preselectedTemplate)
      ? preselectedTemplate
      : TEMPLATES[0].key;
  const router = useRouter();
  const { success, error } = useToast();

  const [clients, setClients] = useState(initialClients);
  const [step, setStep] = useState(preselectedClientId ? 1 : 0);
  const [saving, setSaving] = useState(false);

  const [clientId, setClientId] = useState(preselectedClientId ?? "");
  const [templateKey, setTemplateKey] = useState(startTemplate);
  const [design, setDesign] = useState<PublicCustomization>(() =>
    defaultsFor(startTemplate),
  );
  const [links, setLinks] = useState<EditorLink[]>(() => [
    makeLink("whatsapp"),
    makeLink("instagram"),
  ]);

  const [boardName, setBoardName] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [status, setStatus] = useState<"ativa" | "producao" | "inativa">("ativa");

  const [query, setQuery] = useState("");
  const [newClientOpen, setNewClientOpen] = useState(false);

  const client = clients.find((c) => c.id === clientId);
  const template = getTemplate(templateKey);

  // O nome da placa e o slug seguem o nome exibido até o operador mexer.
  const effectiveName =
    boardName || design.displayName || client?.company || client?.name || "";
  const effectiveSlug = slugTouched
    ? slugify(customSlug)
    : slugify(design.displayName || client?.company || client?.name || "");

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
        })),
    [links],
  );

  const filteredClients = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) =>
      [c.name, c.company, c.email, c.phone, c.city]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [clients, query]);

  /** Trocar de template redefine só o que o operador ainda não personalizou. */
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

  const stepBlocked = (() => {
    if (step === 0 && !clientId) return "Selecione um cliente para continuar.";
    if (step === 2 && !design.displayName.trim())
      return "Informe o nome que aparecerá na página.";
    if (step === 4 && !effectiveName.trim())
      return "Dê um nome de identificação à placa.";
    if (step === 4 && !effectiveSlug)
      return "Defina a URL pública da placa.";
    return null;
  })();

  async function handleCreate() {
    if (stepBlocked) {
      error("Falta um detalhe", stepBlocked);
      return;
    }

    setSaving(true);
    const result = await createBoard({
      clientId,
      templateKey,
      name: effectiveName,
      slug: effectiveSlug,
      status,
      customization: design,
      links: links.map((l) => ({
        type: l.type,
        label: l.label,
        value: l.value,
        asSocial: l.asSocial,
        active: l.active,
      })),
    });
    setSaving(false);

    if (!result.ok) {
      error("Não foi possível criar a placa", result.error);
      return;
    }

    success("Placa criada com sucesso", `URL: /p/${result.data!.slug}`);
    router.push(`/painel/placas/${result.data!.id}?novo=1`);
  }

  const preview = (
    <PhonePreview url={`${appUrl()}/p/${effectiveSlug || "..."}`}>
      <PublicPage
        templateKey={templateKey}
        custom={design}
        links={previewLinks}
        preview
      />
    </PhonePreview>
  );

  return (
    <>
      <Card className="mb-4">
        <CardBody className="py-5">
          <Stepper steps={STEPS} current={step} onGoTo={setStep} />
        </CardBody>
      </Card>

      {/* ---------------- Etapa 1: cliente ---------------- */}
      {step === 0 ? (
        <Card>
          <CardHeader
            title="Selecione o cliente"
            description="A placa ficará vinculada a este cliente."
            action={
              <Button variant="secondary" onClick={() => setNewClientOpen(true)}>
                <Plus className="size-4" />
                Novo cliente
              </Button>
            }
          />
          <CardBody>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar cliente por nome, empresa, e-mail ou telefone..."
              icon={<Search className="size-4" />}
            />

            {filteredClients.length === 0 ? (
              <EmptyState
                icon={Users}
                title={
                  clients.length === 0
                    ? "Nenhum cliente cadastrado"
                    : "Nenhum cliente encontrado"
                }
                description={
                  clients.length === 0
                    ? "Cadastre o cliente que comprou a placa para continuar."
                    : "Tente outro termo de busca."
                }
                action={
                  <Button onClick={() => setNewClientOpen(true)}>
                    <Plus className="size-4" />
                    Cadastrar cliente
                  </Button>
                }
              />
            ) : (
              <div className="mt-4 grid max-h-[460px] gap-2.5 overflow-y-auto pr-1 sm:grid-cols-2">
                {filteredClients.map((c) => {
                  const active = c.id === clientId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setClientId(c.id)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                        active
                          ? "border-brand-500 bg-brand-50 shadow-[0_0_0_3px_rgba(27,84,176,0.12)]"
                          : "border-line bg-white hover:border-brand-200 hover:bg-[#fafbfd]",
                      )}
                    >
                      <Avatar name={c.name} size={42} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-semibold text-[#10233f]">
                          {c.name}
                        </p>
                        <p className="flex items-center gap-1 truncate text-[12px] text-[#8a97b1]">
                          {c.company ? (
                            <>
                              <Building2 className="size-3" />
                              {c.company}
                            </>
                          ) : (
                            (c.phone ?? c.email ?? "—")
                          )}
                        </p>
                        <p className="mt-0.5 text-[11px] font-semibold text-brand-600">
                          {c._count.boards} placa(s)
                        </p>
                      </div>
                      {active ? (
                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
                          <Check className="size-3.5" strokeWidth={3} />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      ) : null}

      {/* ---------------- Etapa 2: template ---------------- */}
      {step === 1 ? (
        <Card>
          <CardHeader
            title="Escolha o template"
            description="Passe o mouse e clique em Visualizar para ver a página inteira."
          />
          <CardBody>
            <TemplateGallery selected={templateKey} onSelect={pickTemplate} />
          </CardBody>
        </Card>
      ) : null}

      {/* ---------------- Etapa 3: design ---------------- */}
      {step === 2 ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Card>
            <CardHeader
              title="Personalize o design"
              description={`Template: ${template.name} · ${categoryLabel(template.category)}`}
            />
            <CardBody>
              <DesignEditor
                value={design}
                onChange={(patch) => setDesign((d) => ({ ...d, ...patch }))}
              />
            </CardBody>
          </Card>
          <div className="lg:sticky lg:top-6 lg:self-start">{preview}</div>
        </div>
      ) : null}

      {/* ---------------- Etapa 4: links ---------------- */}
      {step === 3 ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Card>
            <CardHeader
              title="Adicione os links"
              description="Arraste pela alça à esquerda para mudar a ordem dos botões."
            />
            <CardBody>
              <LinksEditor links={links} onChange={setLinks} />
            </CardBody>
          </Card>
          <div className="lg:sticky lg:top-6 lg:self-start">{preview}</div>
        </div>
      ) : null}

      {/* ---------------- Etapa 5: finalizar ---------------- */}
      {step === 4 ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader
                title="Identificação e publicação"
                description="A URL é definida agora e nunca mais muda — é ela que vai gravada no chip."
              />
              <CardBody className="flex flex-col gap-4">
                <Input
                  label="Nome de identificação da placa"
                  required
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  placeholder={effectiveName || "Ex.: Placa recepção — Loja Centro"}
                  hint="Uso interno, para a equipe localizar a placa no painel."
                />

                <div>
                  <label
                    htmlFor="slug"
                    className="text-[13px] font-semibold text-[#3b4a68]"
                  >
                    URL pública
                  </label>
                  <div className="mt-1.5 flex items-stretch overflow-hidden rounded-xl border border-line bg-white focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-500/12">
                    <span className="flex shrink-0 items-center bg-[#f6f8fc] px-3 font-mono text-[12.5px] text-[#8a97b1]">
                      {appUrl().replace(/^https?:\/\//, "")}/p/
                    </span>
                    <input
                      id="slug"
                      value={slugTouched ? customSlug : effectiveSlug}
                      onChange={(e) => {
                        setSlugTouched(true);
                        setCustomSlug(e.target.value);
                      }}
                      placeholder="nome-da-empresa"
                      className="h-11 min-w-0 flex-1 px-3 font-mono text-[13px] text-[#10233f] outline-none"
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-[#8a97b1]">
                    Permanente. Se já existir, adicionamos um sufixo automático.
                  </p>
                </div>

                <Select
                  label="Status inicial"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "ativa" | "producao" | "inativa")
                  }
                  hint={
                    status === "ativa"
                      ? "A página fica no ar imediatamente."
                      : "A URL existe, mas mostra aviso de indisponível até ser ativada."
                  }
                >
                  <option value="ativa">Ativa — página no ar</option>
                  <option value="producao">Em produção — aguardando gravação</option>
                  <option value="inativa">Inativa — pausada</option>
                </Select>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Resumo" />
              <CardBody className="grid gap-3 sm:grid-cols-2">
                <Summary icon={Users} label="Cliente" value={client?.name ?? "—"} />
                <Summary
                  icon={LayoutTemplate}
                  label="Template"
                  value={`${template.name} · ${categoryLabel(template.category)}`}
                />
                <Summary
                  icon={Palette}
                  label="Personalização"
                  value={`${design.displayName || "—"} · ${design.accent}`}
                />
                <Summary
                  icon={Link2}
                  label="Links"
                  value={`${links.filter((l) => l.active && l.value).length} link(s) ativo(s)`}
                />
              </CardBody>
            </Card>
          </div>
          <div className="lg:sticky lg:top-6 lg:self-start">{preview}</div>
        </div>
      ) : null}

      {/* ---------------- Navegação ---------------- */}
      <div className="sticky bottom-0 z-20 mt-4 flex items-center justify-between gap-3 rounded-2xl border border-line bg-white/90 p-3 shadow-pop backdrop-blur-md">
        <Button
          variant="secondary"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          <ArrowLeft className="size-4" />
          Voltar
        </Button>

        <p className="hidden min-w-0 flex-1 truncate px-2 text-center text-[12.5px] text-[#8a97b1] sm:block">
          {stepBlocked ?? `Etapa ${step + 1} de ${STEPS.length} · ${STEPS[step]}`}
        </p>

        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => {
              if (stepBlocked) {
                error("Falta um detalhe", stepBlocked);
                return;
              }
              setStep((s) => s + 1);
            }}
          >
            Próximo
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button onClick={handleCreate} loading={saving}>
            <Rocket className="size-4" />
            Criar placa
          </Button>
        )}
      </div>

      <ClientForm
        open={newClientOpen}
        onClose={() => setNewClientOpen(false)}
        onSaved={(created) => {
          setClients((list) => [
            {
              id: created.id,
              name: created.name,
              company: null,
              email: null,
              phone: null,
              city: null,
              _count: { boards: 0 },
            },
            ...list,
          ]);
          setClientId(created.id);
          router.refresh();
        }}
      />
    </>
  );
}

function Summary({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-[#fafbfd] p-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-brand-600 ring-1 ring-line">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#9aa7bf]">
          {label}
        </p>
        <p className="mt-0.5 truncate text-[13px] font-semibold text-[#3b4a68]">
          {value}
        </p>
      </div>
    </div>
  );
}
