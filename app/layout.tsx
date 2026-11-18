import type { Metadata, Viewport } from "next";
import {
  Bebas_Neue,
  Dancing_Script,
  Inter,
  JetBrains_Mono,
  Lora,
  Montserrat,
  Nunito,
  Oswald,
  Playfair_Display,
  Poppins,
} from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Fontes extras à escolha do operador.
 *
 * `preload: false` de propósito: só a fonte que o template usa é baixada, e
 * apenas quando o texto dela aparece. Pré-carregar dez famílias em toda
 * página custaria o tempo de abertura da placa — que é exatamente o que o
 * cliente sente ao encostar o celular.
 */
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  preload: false,
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const dancing = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "Solutec — Gestão de placas NFC",
    template: "%s · Solutec",
  },
  description:
    "Plataforma Solutec para criar, personalizar e gerenciar placas NFC e suas páginas digitais.",
  icons: { icon: "/brand/solutec-mark.svg" },
};

export const viewport: Viewport = {
  themeColor: "#1B54B0",
  width: "device-width",
  initialScale: 1,
  /**
   * `viewportFit: cover` deixa o fundo ir até as bordas em aparelho com
   * entalhe, em vez de parar numa faixa.
   *
   * Não bloqueamos o zoom por pinça: além de ser recurso de acessibilidade,
   * o iOS ignora `user-scalable=no` desde o iOS 10 — a promessa seria falsa
   * no aparelho que mais importa aqui. O que realmente causa a sensação de
   * página solta é rolagem lateral acidental e zoom por toque duplo, e
   * esses dois são tratados no CSS.
   */
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} ${poppins.variable} ${playfair.variable} ${mono.variable} ${montserrat.variable} ${oswald.variable} ${bebas.variable} ${lora.variable} ${dancing.variable} ${nunito.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
