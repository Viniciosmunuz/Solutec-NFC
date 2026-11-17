import type { Metadata } from "next";
import { ShieldCheck, Smartphone, Zap } from "lucide-react";
import { SolutecLogo, SolutecMark } from "@/components/brand/logo";
import LoginForm from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

const highlights = [
  {
    icon: Smartphone,
    title: "Páginas dinâmicas",
    text: "Altere o conteúdo no painel e a placa atualiza na hora, sem regravar o chip.",
  },
  {
    icon: Zap,
    title: "Produção em escala",
    text: "Da venda à entrega: cliente, template, personalização e URL em poucos cliques.",
  },
  {
    icon: ShieldCheck,
    title: "Controle total",
    text: "Ative, desative e acompanhe os acessos de cada placa em tempo real.",
  },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <div className="flex min-h-screen bg-white">
      {/* Painel da marca */}
      <div className="relative hidden w-[46%] shrink-0 overflow-hidden bg-nav lg:block">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(900px 500px at 15% 10%, rgba(27,84,176,0.55), transparent 60%), radial-gradient(700px 500px at 90% 90%, rgba(53,112,214,0.35), transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <SolutecMark
          size={620}
          className="absolute -bottom-40 -right-48 text-white/[0.04]"
        />

        <div className="relative flex h-full flex-col justify-between p-12">
          <SolutecLogo size={34} tagline="Placas NFC" className="text-white" />

          <div className="max-w-md">
            <h1 className="text-[40px] font-bold leading-[1.1] tracking-tight text-white">
              Sua operação de
              <br />
              placas NFC,
              <span className="text-brand-300"> organizada.</span>
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-white/65">
              Cadastre clientes, monte a página, grave a URL e acompanhe cada
              acesso — tudo em um só lugar.
            </p>

            <div className="mt-10 flex flex-col gap-5">
              {highlights.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex gap-3.5">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-brand-200 ring-1 ring-white/10">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="mt-0.5 text-[13px] leading-snug text-white/55">
                      {text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-white/35">
            © {new Date().getFullYear()} Solutec. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Formulário */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[380px]">
          <div className="lg:hidden">
            <SolutecLogo size={32} className="mb-10 text-brand-600" />
          </div>
          <h2 className="text-[26px] font-bold tracking-tight text-[#10233f]">
            Bem-vindo de volta
          </h2>
          <p className="mt-1.5 text-sm text-[#6b7a99]">
            Entre com suas credenciais para acessar o painel.
          </p>

          <div className="mt-8">
            <LoginForm redirectTo={redirect} />
          </div>

          <p className="mt-8 text-center text-xs text-[#9aa7bf]">
            Acesso restrito à equipe Solutec.
          </p>
        </div>
      </div>
    </div>
  );
}
