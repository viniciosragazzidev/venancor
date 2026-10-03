# MedLink

Sistema de venda de planos de saúde online: o gestor cadastra operadoras, planos e clientes no painel admin, cria uma **ordem** e envia o link da proposta por WhatsApp. O cliente abre o link no celular, lê o contrato, **assina com OTP**, **paga** (Pix/boleto/cartão) e baixa o contrato assinado — tudo auditado e com linha do tempo no painel.

## Stack

- **Next.js 16** (App Router, RSC) + TypeScript + Tailwind CSS 4 + shadcn/ui (base-ui)
- **Postgres** (Supabase) + **Drizzle ORM** (migrations e RLS)
- **Better Auth** (sessão do admin) · React Hook Form + Zod
- Provedores trocáveis por variável de ambiente:
  - Pagamento: **Asaas** (sandbox/produção) ou fake
  - WhatsApp: **Meta Cloud API** ou fake
  - Armazenamento: **Supabase Storage** (bucket privado, URLs assinadas) ou local
  - Assinatura: provedor in-house (pdf-lib + OTP)
- Deploy: **Vercel**

## Rodar local (do zero)

Pré-requisitos: **Node 20+**, npm e um projeto **Supabase** (ou Postgres qualquer).

```bash
git clone <repositorio> medlink
cd medlink
npm install
```

1. **Variáveis de ambiente**: copie o exemplo e preencha.

   ```powershell
   Copy-Item .env.example .env
   ```

   Mínimo para dev: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `OTP_SECRET` (32+ caracteres cada),
   `APP_URL=http://localhost:3000`, `BETTER_AUTH_URL=http://localhost:3000`,
   `ADMIN_EMAIL` e `ADMIN_PASSWORD` (mínimo 12 caracteres). Com os provedores `fake`/`local`
   padrão o fluxo inteiro roda **sem** Asaas, sem Meta e sem bucket.

2. **Banco**:

   ```bash
   npm run db:migrate      # aplica as migrations
   npm run db:seed-admin   # cria o admin (ADMIN_EMAIL / ADMIN_PASSWORD)
   npm run db:seed         # dados de exemplo: operadora, planos, cliente, contrato
   ```

3. **Servidor**:

   ```bash
   npm run dev
   ```

   - Admin: [http://localhost:3000/login](http://localhost:3000/login) → painel em `/painel`
   - Cliente: link `/c/<token>` gerado ao criar e enviar uma ordem no painel

## Comandos

| Comando                 | O que faz                                                |
| ----------------------- | -------------------------------------------------------- |
| `npm run dev`           | Servidor de desenvolvimento                              |
| `npm run build`         | Build de produção                                        |
| `npm run lint`          | ESLint                                                   |
| `npm run typecheck`     | TypeScript (`tsc --noEmit`)                              |
| `npm test`              | Testes unitários (Vitest)                                |
| `npm run test:e2e`      | Fluxo E2E (Playwright) — antes: `npx playwright install` |
| `npm run db:generate`   | Gera migrations a partir do schema                       |
| `npm run db:migrate`    | Aplica migrations                                        |
| `npm run db:studio`     | Drizzle Studio (inspeção do banco)                       |
| `npm run db:seed-admin` | Cria o usuário admin                                     |
| `npm run db:seed`       | Dados de demonstração                                    |

## Provedores

Tudo é escolhido por variável (`.env`), sem troca de código:

- **`PAYMENT_PROVIDER=fake|asaas`** — em sandbox: `ASAAS_API_KEY` + `ASAAS_ENV=sandbox`.
  Webhook: `POST /api/webhooks/asaas` valida os pagamentos em produção; em dev dá para
  simular com `POST /api/dev/simular-pagamento`.
- **`MESSAGING_PROVIDER=fake|meta`** — Meta Cloud API: `META_ACCESS_TOKEN`,
  `META_PHONE_NUMBER_ID`, `META_APP_SECRET`, `META_VERIFY_TOKEN`. Os 4 templates
  (`proposta_enviada`, `codigo_assinatura`, `pagamento_confirmado`, `lembrete_proposta`)
  estão em [`docs/whatsapp-templates.md`](docs/whatsapp-templates.md).
- **`STORAGE_DRIVER=local|supabase`** — supabase: `SUPABASE_URL` +
  `SUPABASE_SERVICE_ROLE_KEY` e bucket privado (contratos assinados e evidências só por
  URL assinada).

## Testes

```bash
npm test           # unit: pricing, máquina de estados, guards, webhooks
npx playwright install
npm run test:e2e   # fluxo feliz: criar ordem → assinar → pagar → paga
```

## Estrutura

```
src/
  app/
    painel/          # painel do admin (dashboard, ordens, clientes, planos...)
    c/[token]/       # página do cliente (proposta, assinatura, pagamento)
    api/             # auth, webhooks (asaas, whatsapp), storage, simular-pagamento
  components/        # ui (shadcn), admin, cliente
  modules/           # domínio: ordens, planos, clientes, assinatura, pagamentos...
  db/                # schema Drizzle, migrations, seeds
  providers/         # pagamento, mensagens, storage, assinatura (iniciáveis)
  lib/               # env, validators, audit, pricing, require-admin
docs/                # SPEC, PLAN, CONTRACTS, design-refs, go-live, templates
```

## Documentação

- [`docs/SPEC.md`](docs/SPEC.md) · [`docs/PLAN.md`](docs/PLAN.md) · [`docs/CONTRACTS.md`](docs/CONTRACTS.md) — requisitos, tarefas e contratos entre módulos
- [`docs/SPEC-OVERRIDES.md`](docs/SPEC-OVERRIDES.md) — decisions que sobrepõem a SPEC
- [`docs/design-refs.md`](docs/design-refs.md) — linguagem visual (Venancor)
- [`docs/go-live.md`](docs/go-live.md) — **checklist de produção** (Asaas, Meta, domínio, Supabase, Vercel)

## Deploy (produção)

1. Projeto na **Vercel** conectado ao repositório.
2. Configure **todas** as variáveis do `.env.example` no ambiente da Vercel
   (troque `PAYMENT_PROVIDER=asaas`, `MESSAGING_PROVIDER=meta`, `STORAGE_DRIVER=supabase`,
   `ASAAS_ENV=production` e os segredos).
3. Rode `db:migrate` + seeds no banco de produção.
4. Siga a checklist completa em [`docs/go-live.md`](docs/go-live.md) antes de aceitar
   tráfego real.

Segredos **nunca** entram no repositório: só em variáveis de ambiente.
