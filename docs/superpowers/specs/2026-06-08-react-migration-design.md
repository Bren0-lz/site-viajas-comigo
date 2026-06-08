# Design: Migração para React — Viajas Comigo

**Data:** 2026-06-08  
**Status:** Aprovado pelo usuário

---

## 1. Objetivo

Converter o site Viajas Comigo de HTML/CSS/JS puro para React, mantendo a identidade visual dark + gold e aproveitando a migração para refinamentos de layout e UX. Nenhuma mudança de funcionalidade — paridade completa com o site atual.

---

## 2. Stack e Decisões

| Decisão | Escolha | Motivo |
|---|---|---|
| Framework | **Vite + React (SPA)** | Projeto 100% client-side; SSR desnecessário agora |
| Linguagem | **JavaScript** | Menos configuração; projeto de escopo definido |
| CSS | **Global + CSS Modules** | Variáveis/reset global, isolamento por componente |
| Roteamento | **React Router v6** | 3 rotas simples; padrão para SPAs |
| Estado | **Hook `useViagens` + localStorage** | Sem Redux/Zustand; suficiente para o tamanho do projeto |
| Admin | **Integrado na mesma app** | Rota `/admin` dentro do React |

---

## 3. Rotas

```
/              → HomePage
/viagem/:slug  → TripDetailPage
/admin         → AdminPage
```

---

## 4. Estrutura de Arquivos

```
site-viajas-comigo/
├── index.html              (ponto de entrada Vite)
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx             (router + layout raiz)
    ├── styles/
    │   └── global.css      (variáveis CSS, reset, tipografia, utilitários)
    ├── data/
    │   └── viagens.js      (SEED_DESTINOS — dados iniciais das viagens)
    ├── hooks/
    │   └── useViagens.js   (CRUD + localStorage, fallback para seed)
    ├── utils/
    │   ├── slug.js         (título → URL slug)
    │   └── waLink.js       (gerador de links WhatsApp)
    ├── components/
    │   ├── Header/
    │   │   ├── Header.jsx
    │   │   └── Header.module.css
    │   ├── Footer/
    │   │   ├── Footer.jsx
    │   │   └── Footer.module.css
    │   ├── TripCard/
    │   │   ├── TripCard.jsx
    │   │   └── TripCard.module.css
    │   ├── Lightbox/
    │   │   ├── Lightbox.jsx
    │   │   └── Lightbox.module.css
    │   └── WhatsAppButton/
    │       ├── WhatsAppButton.jsx
    │       └── WhatsAppButton.module.css
    └── pages/
        ├── Home/
        │   ├── HomePage.jsx
        │   ├── HomePage.module.css
        │   ├── HeroSection.jsx
        │   ├── HowItWorks.jsx
        │   ├── TripsGrid.jsx
        │   ├── WhyGroup.jsx
        │   ├── Testimonials.jsx
        │   └── CTASection.jsx
        ├── TripDetail/
        │   ├── TripDetailPage.jsx
        │   ├── TripDetailPage.module.css
        │   ├── TripHero.jsx
        │   ├── TripInfo.jsx
        │   ├── TripItinerary.jsx
        │   ├── TripGallery.jsx
        │   └── TripMap.jsx
        └── Admin/
            ├── AdminPage.jsx
            ├── AdminPage.module.css
            ├── TripForm.jsx
            └── TripList.jsx
```

---

## 5. Componentes — Responsabilidades

### Compartilhados

- **Header** — navegação fixa com blur, links, menu hamburger mobile. Recebe prop `transparent` para versão sobre hero.
- **Footer** — links, contato, copyright.
- **TripCard** — card de viagem (imagem, título, data, preço, botão). Recebe objeto `viagem` como prop.
- **Lightbox** — visualizador de imagens com navegação por teclado/setas. Props: `images[]`, `initialIndex`, `onClose`.
- **WhatsAppButton** — botão flutuante fixo no canto inferior direito.

### Página Home

- **HeroSection** — seção full-viewport com headline e CTAs.
- **HowItWorks** — grid de 3 passos.
- **TripsGrid** — recebe `viagens[]` do hook, renderiza `TripCard` em grid responsivo.
- **WhyGroup** — lista de benefícios + foto.
- **Testimonials** — grid de depoimentos.
- **CTASection** — call-to-action final com botão WhatsApp e Instagram.

### Página TripDetail

- **TripDetailPage** — lê `:slug` da URL, busca viagem via `useViagens`. Renderiza 404 se não encontrar.
- **TripHero** — hero com imagem de capa e badge de status.
- **TripInfo** — detalhes, descrição, inclusos.
- **TripItinerary** — roteiro dia a dia.
- **TripGallery** — galeria com abertura do Lightbox.
- **TripMap** — embed do Google Maps.

### Página Admin

- **AdminPage** — controla estado local de edição (`viagemEditando`).
- **TripForm** — formulário de criação/edição. Recebe `viagem` (para edição) ou null (para criação).
- **TripList** — lista de viagens com botões editar/excluir.

---

## 6. Hook `useViagens`

```js
// Assinatura
const { viagens, addViagem, updateViagem, deleteViagem } = useViagens()
```

- Lê de `localStorage.getItem('viajascomigo_destinos')` no mount.
- Fallback para `SEED_DESTINOS` se localStorage vazio.
- Persiste no localStorage a cada mutação.
- `deleteViagem(slug)` — remove por slug.
- `updateViagem(slug, data)` — substitui viagem pelo slug.
- `addViagem(data)` — gera slug, adiciona no topo.

---

## 7. CSS

- `global.css` importado em `main.jsx` — contém:
  - Variáveis CSS (--black, --gold, --cream, etc.)
  - Reset / base
  - Classe `.wrap` (container max-1140px)
  - Tipografia global (Cormorant Garamond + Jost via Google Fonts)
  - Classes utilitárias compartilhadas (`.btn`, `.btn-ghost`)
- Cada componente tem seu `.module.css` para estilos específicos.
- Responsividade mantida com os mesmos breakpoints atuais (900px, 680px).

---

## 8. Paridade Funcional

Toda funcionalidade atual deve ser preservada:

- [x] Listagem de viagens na home com cards
- [x] Navegação para página de detalhe por slug
- [x] Galeria com lightbox (teclado + clique)
- [x] Embed de Google Maps
- [x] Links WhatsApp com mensagem pré-formatada
- [x] Painel admin: criar, editar, excluir viagens
- [x] Exportar `dados-viagens.js` e JSON backup
- [x] Persistência em localStorage com fallback para seed
- [x] Menu hamburger mobile
- [x] Efeito de scroll no header

---

## 9. O que NÃO muda

- Design e identidade visual (dark + gold)
- Dados de exemplo das 3 viagens
- Comportamento de localStorage
- Ausência de backend

---

## 10. Dependências a instalar

```
react, react-dom
react-router-dom
vite, @vitejs/plugin-react
```
