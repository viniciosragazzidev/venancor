# Plano: MedLink substitui o projeto dentro do repo Venancor

Repo alvo: `github.com/viniciosragazzidev/venancor` (público, deploy Vercel `venancor.vercel.app`).
Objetivo: o código do MedLink passa a ser o projeto do repo, **mantendo a marca e o visual da Venancor**.

## 1. O que existe hoje no Venancor (análise de 2026-10-03)

- Next 16.2.9, React 19.2, Tailwind 4, shadcn (`@base-ui/react`), Better Auth 1.6, Drizzle + `pg`,
  Neon (Postgres), Vercel. Mesma família de stack do MedLink: migração barata.
- Rotas: `/` (landing de vendas: hero, planos, diferenciais, simulador, cotação, FAQ, CTA),
  `/amep` (landing do plano Amep), `/api/auth/[...all]`, `/api/webhooks/leads` (recebe leads da
  cotação), SEO completo (`llms.txt`, `sitemap`, `robots`, `opengraph-image`, `manifest`, JSON-LD).
- O CRM antigo já foi separado (commit "API First: decouple CRM from Landing Page").
- Schema: `user/session/account/verification` (Better Auth), `leads`, `operadoras`, `planos`,
  `precos`, `dev_tasks`.
- **Marca** (`DESIGN-SYSTEM.md`): primária `#3b2dff` (dark `#1F6FE5`), secundária/muted `#f4f3f0`,
  texto `#09090b`, bordas `#e4e4e7`, sucesso `#10b981`, aviso `#f59e0b`; fonte **Plus Jakarta Sans**;
  logo com fonte **Amil Typeface** (`public/fonts`), `logo.svg`, `logo.webp`, `icon-logo.png`, `favicon.png`;
  logos de operadoras em `public/` (Amep, Amil, Assim, Cemeru, Leve, NotreDame, Porto).
- Branches: `main`, `redesign`, `feat/drizzle-orm` (local com 1 commit à frente).

## 2. Decisões do plano

1. **O MedLink é a base** (estrutura `src/`, módulos, providers, testes). Do Venancor entram:
   marca, assets, landing `/` e `/amep`, SEO e o webhook de leads.
2. **Marca vence as referências**: cores, fonte e logo da Venancor. Das referências (`docs/design-refs.md`)
   ficam os **padrões de layout** (cards, pílulas, bottom sheets, tela de sucesso), pintados com o
   `#3b2dff` no lugar do preto/azul genérico.
3. **Rotas sem conflito:** landing pública em `/` e `/amep`; painel do gestor em **`/painel/*`**
   (hoje o `(admin)` do MedLink ocupa `/`); link do cliente em `/c/[token]`; login em `/login`.
4. **Banco:** um só (ver pergunta em aberto no fim). Tabelas `operadoras/planos/precos` do Venancor são
   substituídas pelas do MedLink (mais completas: faixas ANS, contratos); `leads` é migrada.
5. **Deploy:** continua o projeto Vercel `venancor`, só trocam as env vars.

## 3. Fases

| Fase | O que                                                                                                                                                                                                                                                                                                                | Dono                                   | Pronto quando                                     |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------- |
| V0   | **Segurança (urgente):** `split-guidelines.md` publicou no GitHub (branch `feat/drizzle-orm`) a URL do Neon com senha, o `BETTER_AUTH_SECRET` e o token do webhook. Trocar os 3 segredos e remover o arquivo                                                                                                         | Vinicios (rotação) + Maestro (remoção) | segredos antigos inválidos                        |
| V1   | **Marca no MedLink já:** tokens de cor da Venancor no `globals.css` (light/dark), Plus Jakarta Sans + Amil (logo), `logo.svg`/ícones/favicon copiados, componente `<Logo/>`                                                                                                                                          | Mutirão                                | painel e página do cliente com a cara da Venancor |
| V2   | Mover o painel de `(admin)` em `/` para `/painel` (layout, sidebar, proxy, redirects pós-login)                                                                                                                                                                                                                      | Mutirão + Cofre (proxy/auth)           | `/` livre para a landing                          |
| V3   | **Portar a landing:** `app/page.tsx`, `app/amep`, `components/lp`, `components/amep`, `navbar`, `footer`, `animate-ui`, assets de `public/`, SEO (`llms.txt`, `sitemap`, `robots`, `opengraph-image`, `manifest`, JSON-LD) para o MedLink, com deps (gsap, @gsap/react, recharts se usado, hugeicons, framer-motion) | Mutirão                                | `/` e `/amep` idênticas às de produção            |
| V4   | Simulador/planos da landing passam a ler **planos e preços do MedLink** (fonte única) em vez de dados fixos; botão de cotação segue gerando lead                                                                                                                                                                     | Cofre                                  | preço da landing = preço do painel                |
| V5   | **Leads:** tabela `leads` + `/api/webhooks/leads` portados para um módulo `src/modules/leads`; tela simples de leads no painel; botão "Gerar ordem" a partir do lead                                                                                                                                                 | Cofre (back) + Mutirão (tela)          | lead da cotação vira ordem em 1 clique            |
| V6   | Dados: script de migração Neon → banco final (leads; planos se houver dados reais)                                                                                                                                                                                                                                   | Cofre                                  | contagem de linhas confere                        |
| V7   | **Troca no repo:** no `venancor`, branch `medlink` a partir de `main`; conteúdo substituído pelo MedLink (histórico do MedLink preservado via `git subtree`/merge de histórias não relacionadas), README e `.env.example` novos; PR para `main`                                                                      | Maestro                                | build verde na Vercel preview                     |
| V8   | Go-live: env vars na Vercel (banco, Better Auth, Asaas, Meta, Resend, Storage), domínio, smoke test (landing, login, ordem, link, assinatura, Pix sandbox), merge                                                                                                                                                    | Vinicios + Maestro                     | produção servindo o MedLink com a marca Venancor  |

Ordem: V0 já; V1 e V2 em paralelo com a fase 2 do MVP; V3 a V6 depois do fluxo principal do MVP
(ordem → link → assinatura → pagamento) funcionar; V7 e V8 no fim.

## 4. Riscos

- Segredos expostos (V0) até serem trocados.
- SEO: manter URLs `/` e `/amep`, metadata e JSON-LD idênticos para não perder indexação.
- Landing usa `gsap` e `framer-motion` além de `motion`: avaliar consolidar depois, não na migração.
- Branch `feat/drizzle-orm` local tem 1 commit não publicado: decidir se entra antes da troca.

## 5. Decidido

- **Banco final: Supabase, começando do zero** (decisão do dono, 2026-10-03). Nada é migrado do Neon:
  a fase V6 sai do plano; a tabela `leads` nasce vazia no módulo novo. O Neon do Venancor pode ser
  desligado depois do go-live.
