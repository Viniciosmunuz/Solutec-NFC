"use client";

import { useActionState } from "react";
import { AlertCircle, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { authenticate, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, pending] = useActionState(
    authenticate,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="redirect" value={redirectTo ?? ""} />

      <Input
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="voce@solutec.com.br"
        icon={<Mail className="size-4" />}
        defaultValue={state.email}
      />

      <Input
        label="Senha"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        placeholder="••••••••"
        icon={<Lock className="size-4" />}
      />

      {state.error ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl bg-danger-soft px-3.5 py-3 text-[13px] font-medium text-danger"
        >
          <AlertCircle className="mt-px size-4 shrink-0" />
          {state.error}
        </div>
      ) : null}

      <Button type="submit" size="lg" loading={pending} className="mt-2 w-full">
        Entrar no painel
      </Button>
    </form>
  );
}
