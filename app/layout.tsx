import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Playfair_Display, Poppins } from "next/font/google";
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
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} ${poppins.variable} ${playfair.variable} ${mono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
