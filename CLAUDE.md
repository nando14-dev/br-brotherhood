@AGENTS.md

# BR Brotherhood — Documentação do Projeto

App exclusivo do clã **BR Brotherhood** (#P9P2RRG) de Clash of Clans. PWA mobile-first para membros do clã acompanharem guerras, streaks, fórum e notícias.

---

## Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16.2.6 (App Router, Turbopack) |
| UI | React 19, TypeScript 5 |
| Estilos | CSS inline (`style={{}}`) — Tailwind instalado mas **não usado** |
| Backend / Auth | Supabase (`@supabase/ssr` + `@supabase/supabase-js`) |
| API CoC | Proxy externo via `NEXT_PUBLIC_PROXY_URL` |
| PWA | `public/manifest.json` + `public/sw.js` |
| Deploy | Vercel (inferido pelo `next.config.ts` padrão) |

---

## Estrutura de Arquivos

```
app/
  page.tsx                  # Raiz: redirect auth-aware (Server Component)
  layout.tsx                # Root layout: metadata PWA, ServiceWorker
  login/page.tsx            # Login / Cadastro / Recuperar senha
  clan/
    layout.tsx              # Shell: Header + bottom nav + EmberBackground (import pendente)
    page.tsx                # Aba Clã: stats + lista de membros
    streak/page.tsx         # Aba Streak: check-in diário + ranking + conquistas
    guerra/page.tsx         # Aba Guerra: guerra regular e CWL
    comunidade/page.tsx     # Aba Comunidade: Recrutar / Fórum / News
    perfil/page.tsx         # Perfil: avatar, nome, jogadores vinculados, logout
    onboarding/page.tsx     # Vincular jogador CoC ao usuário (tela pós-cadastro)

components/
  Header.tsx                # Barra superior: streak, avatar, easter egg bandeira
  PullToRefresh.tsx         # Wrapper de pull-to-refresh via touch events
  LoadingScreen.tsx         # Loading animado (spinner dourado)
  ReleaseNotes.tsx          # Modal de novidades (auto no login + easter egg 10 taps)
  EmberBackground.tsx       # Canvas com partículas de fogo (importado no layout, não renderizado)
  ServiceWorker.tsx         # Registra /sw.js

lib/
  supabase.ts               # createClient() com createBrowserClient do @supabase/ssr

public/
  manifest.json             # PWA manifest
  sw.js                     # Service Worker (network-first, fallback cache)
  icon-192.png / icon-512.png
```

---

## Tabelas do Supabase

### `profiles`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid (PK, FK auth.users) | ID do usuário |
| avatar_emoji | text | Emoji escolhido como avatar |
| display_name | text | Nome de exibição |
| clan_role | text | `member` / `admin` / `coLeader` / `leader` |
| onboarded | boolean | Se completou o onboarding |
| last_seen_version | text | Última versão do release notes vista |

### `streaks`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| user_id | uuid (FK profiles) | Dono do streak |
| current_streak | int | Dias consecutivos de check-in |
| last_checkin | date | Data do último check-in (`en-CA` format: YYYY-MM-DD) |

### `forum_posts`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid (PK) | |
| title | text | Título do tópico |
| content | text | Conteúdo |
| user_id | uuid (FK profiles) | Autor |
| created_at | timestamptz | |

### `clan_news`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid (PK) | |
| tag | text | Categoria (ex: `📢 Aviso do Líder`) |
| title | text | |
| body | text | |
| user_id | uuid (FK profiles) | Autor (só leader/coLeader podem criar) |
| created_at | timestamptz | |

### `player_links`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid (PK) | |
| user_id | uuid (FK profiles) | Usuário do app |
| player_tag | text | Tag do jogador no CoC (ex: `#ABC123`) |
| player_name | text | Nome no jogo |
| player_role | text | Cargo no clã (`member` / `admin` / `coLeader` / `leader`) |

### `release_notes`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| version | text | Ex: `1.2.0` |
| title | text | Título da release |
| items | jsonb | Array de `{ icon: string, text: string }` |
| created_at | timestamptz | |

---

## Endpoints do Proxy CoC

Todos os endpoints partem de `NEXT_PUBLIC_PROXY_URL`. O proxy é externo (não é route handler do Next.js) e encaminha chamadas à API oficial do Clash of Clans.

| Método | Endpoint | Usado em |
|--------|----------|----------|
| GET | `/clan` | `clan/page.tsx` — stats gerais do clã |
| GET | `/clan/members` | `clan/page.tsx`, `onboarding/page.tsx` — lista de membros |
| GET | `/clan/currentwar` | `clan/guerra/page.tsx` — guerra regular atual |
| GET | `/clan/cwl` | `clan/guerra/page.tsx` — grupo da Liga de Guerra |
| GET | `/clan/cwl/war/:warTag` | `clan/guerra/page.tsx` — guerra específica da CWL (tag URL-encoded, `#` → `%23`) |

---

## Decisões de Design

**Estilos 100% inline.** Sem classes CSS, sem Tailwind em uso. Toda estilização via `style={{}}` em JSX. Tailwind está instalado mas não é utilizado — não adicionar classes Tailwind.

**Visual "CoC Medieval".** Paleta principal: marrom madeira (`#3a1000`, `#4a2a0a`), dourado (`#c8960c`, `#FFDF00`), bege pergaminho (`#f5ead8`, `#e8d8b8`). Sombras douradas com `box-shadow: 0 Npx 0 #805800` simulam relevo de botão.

**Layout mobile-first, `maxWidth: 430px`**, centralizado horizontalmente. Não é responsivo para desktop — isso é intencional.

**Server Component apenas na raiz** (`app/page.tsx`) para o check de auth redirecionar server-side. Todas as outras páginas são `'use client'`.

**Pull-to-refresh custom** via `PullToRefresh.tsx` (touch events nativos). Substituiu o `overflowY: 'auto'` que ficava no div raiz de cada página — o PullToRefresh gerencia o scroll internamente.

**Auth Supabase email/password** com confirmação por email. Após login, redireciona para `/` que redireciona para `/clan`. Após cadastro, exibe tela de verificação.

**Onboarding obrigatório**: usuário novo é encaminhado para `/clan/onboarding` para vincular seu jogador CoC. Enquanto não vinculado, aparece aviso em `/clan/perfil`.

**Permissões no fórum/news**: qualquer membro pode criar posts no fórum, mas apenas `leader` e `coLeader` podem criar e excluir news. Qualquer um pode deletar seus próprios posts.

**Easter egg**: 10 taps rápidos na bandeira (Header ou comunidade) abre o modal de Release Notes.

**`EmberBackground`** está importado em `clan/layout.tsx` mas não está no JSX — o componente existe mas não está renderizado.

---

## Pendências / Em Breve

- **Season Pass (prêmio do mês):** card exibido em `/clan` com badge "Em breve". Lógica de ranking e distribuição não implementada.
- **Notificações de guerra:** badge `3` hardcoded no ícone da aba Guerra no bottom nav — notificações reais não implementadas.
- **Cutucar (nudge):** botão "Cutucar" na tela de guerra muda de estado localmente mas não envia notificação/mensagem real ao jogador.
- **EmberBackground não renderizado:** o import existe em `clan/layout.tsx` mas o componente não aparece no JSX.
- **Avatar do jogador CoC:** tela de membros mostra emoji ⚔️ genérico — não busca o ícone real de TH/avatar da API do CoC.
- **`player_links.player_role` desatualizado:** cargo vinculado no onboarding não é atualizado se o cargo do jogador mudar no CoC.
