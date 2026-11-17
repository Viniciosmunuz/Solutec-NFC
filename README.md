# Solutec — Sistema de placas NFC

Plataforma interna da Solutec para **cadastrar clientes, criar placas NFC,
personalizar as páginas digitais, gerenciar links e acompanhar os acessos**.

Cada placa tem uma URL própria e permanente (`/p/nome-da-empresa`). É essa URL
que vai gravada no chip. Alterar design, links ou status no painel **não muda o
endereço** — o chip gravado continua válido para sempre.

---

## Como rodar localmente

```bash
npm install
cp .env.example .env
npm run setup
npm run dev
```

Acesse <http://localhost:3000> e entre com as credenciais definidas em
`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` no `.env`.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Estilo | Tailwind CSS v4 com tokens da marca |
| Banco | Prisma ORM — SQLite em dev, PostgreSQL em produção |
| Autenticação | JWT em cookie `httpOnly` (`jose`) + middleware |
| Gráficos | Recharts · Ícones: Lucide · Arrastar: dnd-kit |

### Organização

```
app/
  login/              entrada do painel
  painel/             painel administrativo (protegido pelo middleware)
    placas/nova/      wizard de criação em 5 etapas
  p/[slug]/           página pública da placa
  api/
    upload/           recebe imagens do painel
    uploads/[file]/   serve as imagens enviadas
    track/click/      registra cliques nos botões
    p/[slug]/qrcode/  QR Code (PNG e SVG)
    p/[slug]/vcard/   cartão de contato .vcf
components/
  public/PublicPage   renderizador das páginas públicas (7 layouts)
  admin/              wizard, editores, preview de celular, gráficos
  ui/                 biblioteca de componentes
lib/
  actions/            server actions (clientes, placas, configurações)
  templates.ts        catálogo de templates
  links.ts            tipos de link e normalização de URL
  stats.ts            consultas de estatísticas
  storage.ts          gravação e leitura das imagens
prisma/schema.prisma  modelo de dados
```

### Adicionar um template novo

1. Acrescente um objeto em `TEMPLATES`, no arquivo `lib/templates.ts`.
2. Rode `npm run db:seed`.

Ele aparece na galeria e no wizard automaticamente, com miniatura gerada pelo
próprio renderizador. Para um visual inédito, crie um `layout` novo e trate-o
em `components/public/PublicPage.tsx`.

---

## Colocar no ar

A aplicação precisa de **PostgreSQL** e de um **lugar persistente para as
imagens** — a pasta do build é descartável em qualquer plataforma.

### Opção A — Vercel + Neon (em uso)

Gratuito e sem servidor para administrar. O Postgres fica no Neon e as imagens
no Vercel Blob.

**1. Banco no Neon**

Em <https://console.neon.tech>, crie um projeto (ex.: `solutec`) e copie a
connection string no formato Prisma. Use um banco **só deste sistema**: apontar
para um banco compartilhado faria o `prisma db push` mexer nas tabelas do outro
projeto.

**2. Criar as tabelas e o administrador**

Da sua máquina, com a `DATABASE_URL` do Neon no `.env`:

```bash
npm run db:use-postgres   # se ainda estiver em SQLite
npx prisma generate
npx prisma db push
npm run db:seed
```

**3. Deploy**

Suba o projeto para o GitHub e importe em <https://vercel.com/new>.

Em **Storage → Create → Blob**, crie um Blob store e conecte ao projeto. Isso
preenche `BLOB_READ_WRITE_TOKEN` sozinho — e é essa variável que faz o sistema
usar o Blob em vez do disco.

Em **Settings → Environment Variables**:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | a mesma connection string do Neon |
| `AUTH_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `NEXT_PUBLIC_APP_URL` | a URL final, ex.: `https://solutec.vercel.app` |

Faça o redeploy depois de preencher. `NEXT_PUBLIC_APP_URL` é embutida no build,
então só vale a partir do deploy seguinte.

> **Atenção ao domínio.** A URL das placas é gravada no chip e não pode mudar.
> Enquanto for `*.vercel.app`, use o sistema para testes e demonstrações. Antes
> de gravar a primeira placa de cliente, aponte o domínio definitivo e atualize
> `NEXT_PUBLIC_APP_URL`.

> **Licença.** O plano Hobby da Vercel é para uso não-comercial pelos termos
> deles. Operação comercial pede o plano Pro.

### Opção B — VPS própria com Docker

Mais barato no longo prazo e sem cláusula de uso comercial. Já vêm prontos o
`Dockerfile` e o `docker-compose.yml` com aplicação e Postgres:

```bash
git clone <seu-repo> && cd solutec
cp .env.example .env            # defina POSTGRES_PASSWORD, AUTH_SECRET, etc.
docker compose build
docker compose run --rm migrate # cria as tabelas e o administrador
docker compose up -d
```

As imagens ficam no volume montado em `/data/uploads` (sem Blob, sem token).
Coloque um Nginx ou Caddy na frente para o HTTPS — ou use o **Coolify**, que lê
esse mesmo `docker-compose.yml`.

### Opção C — Railway / Render

Mesmo princípio: Postgres gerenciado, disco montado em `/data` e
`UPLOAD_DIR=/data/uploads`. No comando de pré-deploy use `npm run db:deploy`.
Evite o plano gratuito do Render: ele hiberna, e uma placa NFC que demora 30
segundos para abrir passa a impressão de produto quebrado.

### Voltando para SQLite

Para trabalhar offline, sem Postgres:

```bash
npm run db:use-sqlite
# DATABASE_URL="file:./dev.db" no .env
npm run setup
```


## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | desenvolvimento em <http://localhost:3000> |
| `npm run build` / `npm start` | build e execução em produção |
| `npm run setup` | gera o client, cria as tabelas e popula o banco |
| `npm run db:seed` | administrador, templates e configurações padrão |
| `npm run db:deploy` | aplica o schema e popula — usar no deploy |
| `npm run db:reset` | **apaga tudo** e recria do zero |
| `npm run db:studio` | navegador visual do banco |
| `npm run db:use-postgres` / `db:use-sqlite` | troca o banco do Prisma |
| `npm run lint` | ESLint |

---

## Identidade visual

| Cor | Hex | Uso |
|---|---|---|
| Azul Solutec | `#1B54B0` | destaque, botões, gráficos |
| Azul-marinho | `#0E2143` | sidebar, fundos escuros |
| Cinza claro | `#F6F8FC` | fundo do painel |
| Branco | `#FFFFFF` | cartões |

Tokens em `app/globals.css`; marca em `components/brand/logo.tsx`.
