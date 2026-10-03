# Better Auth: regras de integração (docs oficiais, 2026-10)

Resumo das docs oficiais entregues pelo dono do projeto. Seguir à risca.

1. **Pacotes:** `better-auth` + adapter separado `@better-auth/drizzle-adapter`
   (`import { drizzleAdapter } from "@better-auth/drizzle-adapter"`). Com adapter, preferir
   `import { betterAuth } from "better-auth/minimal"` (bundle menor).
2. **Env:** `BETTER_AUTH_SECRET` (>= 32 chars, alta entropia; rotação futura via `BETTER_AUTH_SECRETS`)
   e `BETTER_AUTH_URL` (ex: `http://localhost:3000`).
3. **Instância:** `src/lib/auth.ts` exportando `auth`:
   `drizzleAdapter(db, { provider: "pg", schema })`, `emailAndPassword: { enabled: true }`,
   `advanced: { database: { joins: true } }` (exige relations no schema Drizzle),
   `plugins: [nextCookies()]` (de `better-auth/next-js`, SEMPRE o último plugin).
4. **Schema das tabelas de auth:** gerar com `npx auth@latest generate` (gera schema Drizzle com
   relations e `relationName`), depois `npx drizzle-kit generate` + `npx drizzle-kit migrate`.
   Não escrever as tabelas user/session/account/verification à mão.
5. **Handler:** `src/app/api/auth/[...all]/route.ts`:
   `export const { GET, POST } = toNextJsHandler(auth)` (de `better-auth/next-js`).
6. **Client:** `src/lib/auth-client.ts` com `createAuthClient()` de `better-auth/react`
   (mesmo domínio, sem baseURL).
7. **Proteção de rotas (Next 16):** arquivo `src/proxy.ts` com função `proxy` (não existe mais
   `middleware.ts`). No proxy, só checagem otimista com `getSessionCookie(request)` de
   `better-auth/cookies` para redirecionar a `/login`. **A checagem de verdade é em cada página/
   layout/server action do admin** com `auth.api.getSession({ headers: await headers() })` e
   `redirect("/login")`. Cookie sozinho não é segurança.
8. **Server actions** que fazem login/cadastro dependem do plugin `nextCookies()` para gravar cookie.
