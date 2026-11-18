import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/shell";
import { getCurrentUser } from "@/lib/auth";

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Cookie assinado mas sem dono — usuário apagado ou desativado depois de
  // entrar. Mandar para /login daqui causaria loop: o middleware veria o
  // cookie ainda válido e devolveria para cá. Quem limpa o cookie é a rota.
  if (!user || !user.active) redirect("/api/sessao/encerrar");

  return (
    <AdminShell
      user={{
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      }}
    >
      {children}
    </AdminShell>
  );
}
