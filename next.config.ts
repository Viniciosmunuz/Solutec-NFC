import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera um servidor autocontido em .next/standalone — é o que o Dockerfile
  // copia. Sem isso a imagem precisaria carregar todo o node_modules.
  output: "standalone",

  // As imagens enviadas pelo painel são servidas por /api/uploads e já têm
  // cache imutável; não passam pelo otimizador.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },

  async headers() {
    return [
      {
        // O painel nunca deve ser indexado nem aparecer em iframe de terceiros.
        source: "/painel/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
