import PageHeader from "@/components/admin/page-header";
import SettingsView from "./settings-view";
import { requireSession, getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/actions/settings";
import { db } from "@/lib/db";

export const metadata = { title: "Configurações" };

export default async function ConfiguracoesPage() {
  await requireSession();

  const [user, settings, counts] = await Promise.all([
    getCurrentUser(),
    getSettings(),
    Promise.all([
      db.board.count(),
      db.client.count(),
      db.visit.count(),
      db.click.count(),
      db.user.count(),
    ]),
  ]);

  if (!user) return null;
  const [boards, clients, visits, clicks, users] = counts;

  return (
    <>
      <PageHeader
        title="Configurações"
        description="Dados da empresa, seu perfil e preferências do sistema."
      />
      <SettingsView
        user={{
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
        }}
        settings={{
          company_name: settings.company_name ?? "Solutec",
          company_email: settings.company_email ?? "",
          company_phone: settings.company_phone ?? "",
          public_footer: settings.public_footer ?? "Feito com Solutec",
          board_code_prefix: settings.board_code_prefix ?? "SLT",
        }}
        stats={{ boards, clients, visits, clicks, users }}
      />
    </>
  );
}
