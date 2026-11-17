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

A aplicação precisa de **um servidor Node rodando continuamente**, um
**PostgreSQL** e um **disco persistente** para as imagens. Qualquer uma das
opções abaixo atende.

### Antes de qualquer deploy

```bash
npm run db:use-postgres   # troca o provider do Prisma para PostgreSQL
```

E defina estas variáveis no painel do provedor:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | string de conexão do PostgreSQL |
| `AUTH_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `NEXT_PUBLIC_APP_URL` | o domínio final, ex.: `https://solutec.com.br` |
| `UPLOAD_DIR` | `/data/uploads` (caminho do disco persistente) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | primeiro administrador |

> **Defina `NEXT_PUBLIC_APP_URL` com o domínio definitivo antes de gravar a
> primeira placa.** Ele é a base das URLs dos chips, e chip gravado não volta
> atrás.

### Opção A — Railway (recomendada)

Mais simples: Postgres e disco persistente em poucos cliques, sem servidor
para administrar.

1. Suba o projeto para um repositório no GitHub.
2. Em <https://railway.app>: **New Project → Deploy from GitHub repo**.
3. **New → Database → PostgreSQL**. Copie a `DATABASE_URL` gerada.
4. No serviço da aplicação, aba **Variables**, preencha a tabela acima.
5. Aba **Settings → Volumes**: crie um volume montado em `/data`.
6. Em **Settings → Deploy**, defina o *pre-deploy command*:
   `npm run db:deploy`
7. Aba **Networking**: gere o domínio ou aponte o seu.

Custo: a partir de ~US$ 5/mês.

### Opção B — Render

Fluxo parecido. Use **Web Service** (Node), **PostgreSQL** gerenciado e um
**Disk** montado em `/data`. No campo *Pre-Deploy Command*: `npm run db:deploy`.

> Evite o plano gratuito: ele hiberna por inatividade, e uma placa NFC que
> demora 30 segundos para abrir passa a impressão de produto quebrado.

### Opção C — VPS própria com Docker (Hostinger, Contabo, DigitalOcean…)

Mais barato no longo prazo e sem travas de plataforma. O projeto já traz
`Dockerfile` e `docker-compose.yml` com a aplicação e o Postgres:

```bash
git clone <seu-repo> && cd solutec
cp .env.example .env            # defina POSTGRES_PASSWORD, AUTH_SECRET, etc.
npm run db:use-postgres
docker compose build
docker compose run --rm migrate # cria as tabelas e o administrador
docker compose up -d
```

Depois coloque um Nginx ou Caddy na frente para o HTTPS. Se preferir painel,
o **Coolify** instalado na VPS lê esse mesmo `docker-compose.yml`.

### Opção D — Fly.io

`fly launch` reconhece o `Dockerfile`. Crie um volume (`fly volumes create data`)
montado em `/data` e um Postgres com `fly postgres create`.

### Por que não a Vercel

A Vercel roda funções sem disco: o SQLite não persiste e as imagens enviadas
somem a cada deploy. Daria para usar lá com **Postgres gerenciado + storage de
objetos (S3/R2/Blob)** — nesse caso basta reescrever `saveImage` e `readImage`
em `lib/storage.ts`. Enquanto o storage for em disco, as opções acima são as
indicadas.

---

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
