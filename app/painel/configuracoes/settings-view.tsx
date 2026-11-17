"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Database,
  KeyRound,
  Palette,
  Save,
  UserRound,
} from "lucide-react";
import ImageUpload from "@/components/admin/image-upload";
import { SolutecLogo, SolutecMark } from "@/components/brand/logo";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Tabs } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import {
  changePassword,
  saveProfile,
  saveSettings,
  type SettingsInput,
} from "@/lib/actions/settings";
import { formatNumber } from "@/lib/utils";
import { appUrl } from "@/lib/urls";

export default function SettingsView({
  user,
  settings: initialSettings,
  stats,
}: {
  user: { name: string; email: string; role: string; avatarUrl: string | null };
  settings: SettingsInput;
  stats: {
    boards: number;
    clients: number;
    visits: number;
    clicks: number;
    users: number;
  };
}) {
  const router = useRouter();
  const { success, error } = useToast();
  const [tab, setTab] = useState("empresa");

  const [settings, setSettings] = useState(initialSettings);
  const [savingSettings, setSavingSettings] = useState(false);

  const [profile, setProfile] = useState({
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl ?? "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);

  async function submitSettings() {
    setSavingSettings(true);
    const result = await saveSettings(settings);
    setSavingSettings(false);
    if (!result.ok) {
      error("Não foi possível salvar", result.error);
      return;
    }
    success("Configurações salvas");
    router.refresh();
  }

  async function submitProfile() {
    setSavingProfile(true);
    const result = await saveProfile(profile);
    setSavingProfile(false);
    if (!result.ok) {
      error("Não foi possível salvar", result.error);
      return;
    }
    success("Perfil atualizado");
    router.refresh();
  }

  async function submitPassword() {
    setSavingPassword(true);
    const result = await changePassword(passwords);
    setSavingPassword(false);
    if (!result.ok) {
      error("Não foi possível alterar a senha", result.error);
      return;
    }
    success("Senha alterada com sucesso");
    setPasswords({ current: "", next: "", confirm: "" });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="overflow-hidden lg:col-span-2">
        <div className="px-5 pt-1">
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={[
              { value: "empresa", label: "Empresa" },
              { value: "perfil", label: "Meu perfil" },
              { value: "seguranca", label: "Segurança" },
            ]}
          />
        </div>

        {/* ---- Empresa ---- */}
        {tab === "empresa" ? (
          <CardBody className="flex flex-col gap-4">
            <Section icon={Building2} title="Dados da empresa" />
            <Input
              label="Nome da empresa"
              value={settings.company_name}
              onChange={(e) =>
                setSettings((s) => ({ ...s, company_name: e.target.value }))
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="E-mail de contato"
                type="email"
                value={settings.company_email}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, company_email: e.target.value }))
                }
                placeholder="contato@solutec.com.br"
              />
              <Input
                label="Telefone"
                value={settings.company_phone ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, company_phone: e.target.value }))
                }
                placeholder="(11) 3333-3333"
              />
            </div>

            <div className="my-2 h-px bg-line" />
            <Section icon={Palette} title="Páginas públicas" />
            <Input
              label="Rodapé das páginas públicas"
              value={settings.public_footer ?? ""}
              onChange={(e) =>
                setSettings((s) => ({ ...s, public_footer: e.target.value }))
              }
              hint="Texto discreto exibido no fim de cada página de placa."
            />
            <Input
              label="Prefixo do código das placas"
              value={settings.board_code_prefix}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  board_code_prefix: e.target.value.toUpperCase().slice(0, 5),
                }))
              }
              hint="Usado nas placas criadas a partir de agora. Ex.: SLT-7F3K2A."
              className="font-mono uppercase"
              maxLength={5}
            />

            <div className="rounded-xl border border-line bg-[#fafbfd] p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#9aa7bf]">
                Domínio das páginas públicas
              </p>
              <code className="mt-1.5 block font-mono text-[12.5px] text-[#3b4a68]">
                {appUrl()}/p/&lt;slug&gt;
              </code>
              <p className="mt-2 text-[12px] leading-relaxed text-[#8a97b1]">
                Definido pela variável de ambiente{" "}
                <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px]">
                  NEXT_PUBLIC_APP_URL
                </code>
                . Em produção aponte para o domínio real antes de gravar
                qualquer chip — as URLs já gravadas não mudam depois.
              </p>
            </div>

            <div className="flex justify-end">
              <Button onClick={submitSettings} loading={savingSettings}>
                <Save className="size-4" />
                Salvar configurações
              </Button>
            </div>
          </CardBody>
        ) : null}

        {/* ---- Perfil ---- */}
        {tab === "perfil" ? (
          <CardBody className="flex flex-col gap-4">
            <Section icon={UserRound} title="Seus dados" />
            <ImageUpload
              label="Foto do perfil"
              value={profile.avatarUrl}
              onChange={(url) =>
                setProfile((p) => ({ ...p, avatarUrl: url ?? "" }))
              }
              height={88}
            />
            <Input
              label="Nome"
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            />
            <Input
              label="E-mail de acesso"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              hint="É com este e-mail que você entra no painel."
            />
            <Input
              label="Perfil de acesso"
              value={user.role === "admin" ? "Administrador" : "Operador"}
              disabled
            />
            <div className="flex justify-end">
              <Button onClick={submitProfile} loading={savingProfile}>
                <Save className="size-4" />
                Salvar perfil
              </Button>
            </div>
          </CardBody>
        ) : null}

        {/* ---- Segurança ---- */}
        {tab === "seguranca" ? (
          <CardBody className="flex flex-col gap-4">
            <Section icon={KeyRound} title="Alterar senha" />
            <Input
              label="Senha atual"
              type="password"
              autoComplete="current-password"
              value={passwords.current}
              onChange={(e) =>
                setPasswords((p) => ({ ...p, current: e.target.value }))
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nova senha"
                type="password"
                autoComplete="new-password"
                value={passwords.next}
                onChange={(e) =>
                  setPasswords((p) => ({ ...p, next: e.target.value }))
                }
                hint="Mínimo de 8 caracteres."
              />
              <Input
                label="Confirmar nova senha"
                type="password"
                autoComplete="new-password"
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords((p) => ({ ...p, confirm: e.target.value }))
                }
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={submitPassword} loading={savingPassword}>
                <KeyRound className="size-4" />
                Alterar senha
              </Button>
            </div>
          </CardBody>
        ) : null}
      </Card>

      {/* Lateral */}
      <div className="flex flex-col gap-4">
        <Card className="overflow-hidden">
          <div className="relative bg-nav px-5 py-7">
            <SolutecMark
              size={180}
              className="absolute -bottom-12 -right-10 text-white/[0.06]"
            />
            <div className="relative">
              <SolutecLogo size={28} tagline="Placas NFC" className="text-white" />
              <p className="mt-4 text-[12.5px] leading-relaxed text-white/55">
                Identidade visual do sistema: azul institucional{" "}
                <span className="font-mono text-white/80">#1B54B0</span> sobre
                branco, com sidebar azul-marinho.
              </p>
            </div>
          </div>
          <CardBody className="flex flex-wrap gap-2">
            {[
              ["#1B54B0", "Destaque"],
              ["#0E2143", "Sidebar"],
              ["#F6F8FC", "Fundo"],
              ["#FFFFFF", "Cartões"],
            ].map(([hex, name]) => (
              <div key={hex} className="flex items-center gap-2">
                <span
                  className="size-6 rounded-lg ring-1 ring-black/10"
                  style={{ backgroundColor: hex }}
                />
                <div className="leading-tight">
                  <p className="text-[11.5px] font-semibold text-[#3b4a68]">
                    {name}
                  </p>
                  <p className="font-mono text-[10px] text-[#9aa7bf]">{hex}</p>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Números do sistema" />
          <CardBody className="flex flex-col gap-2.5">
            <Row icon={Database} label="Placas" value={stats.boards} />
            <Row icon={Database} label="Clientes" value={stats.clients} />
            <Row icon={Database} label="Acessos registrados" value={stats.visits} />
            <Row icon={Database} label="Cliques registrados" value={stats.clicks} />
            <Row icon={UserRound} label="Usuários do painel" value={stats.users} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-7 place-items-center rounded-lg bg-brand-50 text-brand-600">
        <Icon className="size-4" />
      </span>
      <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-[#8a97b1]">
        {title}
      </h3>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="size-3.5 text-[#c2cde0]" />
      <span className="flex-1 text-[13px] text-[#6b7a99]">{label}</span>
      <span className="text-[13px] font-bold text-[#10233f]">
        {formatNumber(value)}
      </span>
    </div>
  );
}
