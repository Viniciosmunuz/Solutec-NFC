"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { login, logout } from "@/lib/auth";

export type LoginState = {
  error?: string;
  email?: string;
};

const schema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe sua senha."),
  redirect: z.string().optional(),
});

export async function authenticate(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    redirect: formData.get("redirect"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
      email: String(formData.get("email") ?? ""),
    };
  }

  const user = await login(parsed.data.email, parsed.data.password);
  if (!user) {
    return {
      error: "E-mail ou senha incorretos.",
      email: parsed.data.email,
    };
  }

  const target = parsed.data.redirect;
  // Só aceita caminhos internos — evita open redirect.
  const safe =
    target && target.startsWith("/") && !target.startsWith("//")
      ? target
      : "/painel";

  redirect(safe);
}

export async function signOut() {
  await logout();
  redirect("/login");
}
