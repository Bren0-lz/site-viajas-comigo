# Viajas Comigo

![React](https://img.shields.io/badge/React%2018-20232A?logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel%20Serverless-000?logo=vercel&logoColor=white)
![Redis](https://img.shields.io/badge/Upstash%20Redis-DC382D?logo=redis&logoColor=white)
![Testes](https://img.shields.io/badge/Vitest-99%20testes%20passando-6E9F18?logo=vitest&logoColor=white)
![Licença](https://img.shields.io/badge/Licen%C3%A7a-Todos%20os%20direitos%20reservados-red)

Site de viagens em grupo: página inicial, páginas de detalhes de cada viagem e um
painel de administração (`/admin`) para cadastrar e editar as viagens — tudo sem
precisar mexer em código.

Aplicação **React + Vite** no front-end, com **funções serverless da Vercel** no
back-end. As viagens ficam guardadas no **Upstash Redis** e as fotos no
**Cloudinary**. O painel é protegido por senha.

## Comprovação de experiência

| | |
|---|---|
| **Autor** | Breno Luiz Silva do Carmo — único autor dos 50 commits deste repositório |
| **Tipo** | Item de portfólio de autoria própria — site completo (front-end + API + painel administrativo) com deploy na Vercel |
| **Período de desenvolvimento** | 20/06/2026 a 26/07/2026 |
| **Verificação** | `npm install && npm test` → **16 arquivos, 99 testes passando** (Vitest + Testing Library) |

### Competências técnicas evidenciadas

| Competência | Onde verificar neste repositório |
|---|---|
| **React** | [`src/`](src/) — React 18 com React Router, componentes reutilizáveis, hooks próprios (`useViagens`, `useCidades`, `useReveal`, `useSeamlessLoop`), `ErrorBoundary` e carregamento sob demanda com nova tentativa ([`lazyWithRetry.js`](src/utils/lazyWithRetry.js)) |
| **Testes automatizados** | 99 testes com Vitest, `@testing-library/react` e `jsdom` — componentes, hooks, utilitários e a autenticação do back-end ([`api/_lib/auth.test.js`](api/_lib/auth.test.js)) |
| **Banco de dados** | [`api/_lib/store.js`](api/_lib/store.js) — persistência das viagens e da senha do painel no Upstash Redis |
| **Back-end / APIs** | [`api/`](api/) — funções serverless da Vercel: login/logout com cookie de sessão assinado, CRUD de viagens, troca de senha e assinatura de upload para o Cloudinary |
| **Outros frameworks de desenvolvimento web** | Vite (build, otimização de imagens com `vite-plugin-image-optimizer`), CSS Modules |
| **Segurança web** | [`vercel.json`](vercel.json) — Content-Security-Policy, HSTS, `X-Frame-Options`, `Permissions-Policy`; segredos só no servidor |
| **Design e prototipagem de interfaces** | Painel `/admin` com edição inline para usuário não técnico; layout responsivo com otimização para celular; identidade visual em [`docs/brand/`](docs/brand/) e especificações em [`docs/superpowers/specs/`](docs/superpowers/specs/) |
| **GitHub / versionamento** | 50 commits; deploy contínuo da Vercel a partir deste repositório |

---

## Estrutura do projeto

```
src/                    Aplicação React (o site em si)
  components/           Componentes reutilizáveis (Header, Footer, Lightbox, ImageUpload…)
  pages/
    Home/               Página inicial
    TripDetail/         Página de detalhes de uma viagem (capa, galeria, mapa)
    MontarViagem/       Formulário para o cliente montar uma viagem sob medida
    Admin/              Painel de administração (/admin)
  hooks/                Hooks (ex.: useViagens — busca/salva as viagens via API)
  utils/                Funções auxiliares (upload de imagem, link de WhatsApp…)
  data/                 Dados de apoio do front
  styles/               Estilos globais

api/                    Back-end (Vercel Serverless Functions — cada arquivo = uma rota /api/*)
  login.js              POST /api/login     — valida a senha do painel
  logout.js             POST /api/logout    — encerra a sessão
  me.js                 GET  /api/me        — diz se a sessão está autenticada
  viagens.js            GET/PUT /api/viagens — lê e grava as viagens no Redis
  senha.js              POST /api/senha     — troca a senha do painel (salva no Redis)
  upload-sign.js        Assina o upload das fotos para o Cloudinary
  _lib/                 Código compartilhado (auth, store/Redis)

index.html              Entrada do Vite (monta a aplicação React)
vite.config.js          Configuração do Vite
vercel.json             Headers de segurança + fallback de SPA da Vercel
public/                 Arquivos estáticos (logos etc.)
```

> As pastas `node_modules/` e `dist/` são geradas automaticamente e não vão para o
> Git.

## Rodando localmente

Pré-requisitos: [Node.js](https://nodejs.org) e a [Vercel CLI](https://vercel.com/docs/cli)
(`npm i -g vercel`).

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie `.env.example` para `.env` e preencha as variáveis (veja abaixo).
3. Suba o site **com as funções** (assim o `/admin` e a API funcionam):
   ```bash
   vercel dev
   ```
   Para rodar só o front (sem API), use `npm run dev`.

## Variáveis de ambiente

Definidas na Vercel em **Project Settings → Environment Variables** (e em `.env`
para rodar local). Não usam o prefixo `VITE_`, então nunca vão para o navegador.

| Variável | Para que serve |
| --- | --- |
| `ADMIN_PASSWORD` | Senha **inicial** do painel `/admin`. Pode ser trocada pelo próprio painel depois (a nova fica salva no Redis); só vale enquanto você não trocar. |
| `SESSION_SECRET` | Segredo que assina o cookie de sessão. Gere um valor longo e aleatório. |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Banco onde as viagens são salvas. Conta grátis em [upstash.com](https://upstash.com) → database → aba "REST API". |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Onde ficam as fotos enviadas pelo painel. Conta grátis em [cloudinary.com](https://cloudinary.com) → Dashboard. |

Para gerar um `SESSION_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Como gerenciar as viagens (sem código)

1. Acesse `/admin` e entre com a senha (`ADMIN_PASSWORD` na primeira vez; depois, a
   senha que você definiu pelo botão **Alterar senha** no topo do painel).
2. Clique em **+ Nova viagem** ou em uma viagem existente para editar.
3. Edite cada campo direto na página (lápis ✎). Quanto mais completo (datas, local,
   roteiro, o que está incluso, fotos), melhor a página de detalhes.
   - **Foto de capa** e **galeria**: clique em enviar foto e escolha as imagens do
     computador ou celular — elas vão para o Cloudinary automaticamente, sem
     precisar colar link nem redimensionar antes.
   - **O que está incluso** e **Roteiro**: um item por linha.
   - **Local**: cidade e estado bastam (é o que vai no mapa).
4. Clique em **Salvar alterações** para publicar. As mudanças vão para o ar na hora
   — não é mais preciso baixar nem trocar arquivos.

## Deploy

O deploy é feito pela Vercel a partir deste repositório:

- **Build:** `npm run build` (preset Vite detectado automaticamente)
- **Output:** `dist/`
- **Funções:** cada arquivo em `api/` vira uma rota `/api/*` (Vercel Serverless
  Functions — detectadas sem configuração).
- `vercel.json`: aplica os cabeçalhos de segurança (CSP etc.) e o fallback de SPA
  — qualquer rota fora de `/api` cai no `index.html` (o React Router cuida do resto).

Lembre de cadastrar as variáveis de ambiente acima no painel da Vercel antes do
primeiro deploy.

## Mapa

A página de detalhes embute o Google Maps pela busca de texto do campo **Local** —
não precisa de chave de API nem de faturamento.

## Testes

```bash
npm test          # roda a suíte uma vez
npm run test:watch
```

## Autor

**Breno Luiz Silva do Carmo**
[LinkedIn](https://www.linkedin.com/in/breno-luiz-silva-do-carmo-19451a243/) ·
[GitHub](https://github.com/Bren0-lz)

## Licença

Copyright (c) 2026 Breno Luiz Silva do Carmo. Todos os direitos reservados.
Nenhuma parte deste código pode ser utilizada, reproduzida, distribuída ou modificada sem
autorização prévia por escrito do autor. Veja [LICENSE](LICENSE).
