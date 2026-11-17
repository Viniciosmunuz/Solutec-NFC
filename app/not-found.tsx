import Link from "next/link";
import { SolutecLogo } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-nav px-6 text-center">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(700px 400px at 50% 0%, rgba(27,84,176,0.45), transparent 65%)",
        }}
      />
      <div className="relative">
        <p className="text-[72px] font-black leading-none tracking-tight text-white/15">
          404
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">
          Esta página não existe
        </h1>
        <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-white/55">
          O endereço que você acessou não corresponde a nenhuma placa cadastrada.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
        >
          Voltar ao início
        </Link>
        <div className="mt-12 flex justify-center text-white/35">
          <SolutecLogo size={22} />
        </div>
      </div>
    </div>
  );
}
