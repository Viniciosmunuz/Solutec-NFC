import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/shell";
import { getCurrentUser } from "@/lib/auth";

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

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
