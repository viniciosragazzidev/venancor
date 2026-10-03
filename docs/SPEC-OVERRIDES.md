# Overrides da SPEC (valem por cima de docs/SPEC.md)

Decididos pelo dono do projeto em 2026-10-03:

1. **Auth: Better Auth** (e-mail e senha, sessão em cookie, adapter Drizzle) no lugar do Supabase Auth.
   Supabase fica só como **Postgres + Storage privado**. Como não há Supabase Auth, o acesso aos dados
   passa sempre pelo servidor (Drizzle com a connection string); RLS fica ligado e sem policies públicas
   (a anon key não lê nada).
2. **Stack igual à do projeto irmão (ancorahub):** Next.js 16 (App Router) + React 19, TypeScript strict,
   Tailwind CSS 4, shadcn/ui (style "base-nova", baseColor "neutral"), Zod 4, React Hook Form,
   Drizzle ORM + drizzle-kit + postgres.js, Better Auth, motion, sonner, TanStack Query, nuqs, date-fns,
   lucide-react, Vitest, Playwright, ESLint 9 + Prettier, npm.
3. Hospedagem: Vercel como na SPEC (pode mudar para Coolify depois; não acoplar nada à Vercel).
4. Interface 100% pt-BR, moeda BRL, fuso America/Sao_Paulo.
