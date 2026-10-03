# F9.4 Revisão de segurança final (HEAD d9ce10d)

Escopo: repo inteiro, leitura estática (sem rodar E2E nem pentest). Nada foi corrigido.

**Veredito: aprovado para go-live com 0 bloqueantes.** Os 6 itens "importante" devem ser resolvidos antes ou logo após a produção.

## Bloqueantes

Nenhum.

## Importante

1. **Contrato assinado ≠ contrato lido (CPF).** O cliente lê o contrato com CPF mascarado (`src/modules/ordens/cliente.ts`, `mascararCpf`), mas `src/modules/assinatura/concluir.ts:15,67` renderiza com `cpfCompleto=true` e é esse texto que entra no PDF e no hash. O que vai para o hash deve ser o texto exibido: usar a mesma regra de CPF nos dois (ou mostrar completo com aviso).
2. **Sem headers de segurança e token na URL.** `next.config.ts:3` está vazio. O token do link (`/c/[token]`) pode vazar por `Referer`. Adicionar `Referrer-Policy: no-referrer`, `X-Frame-Options: DENY`, `X-Content-Type-Options` e CSP básica em `/c/*` e `/painel/*`. Também `src/app/api/cliente/documento/route.ts:11` recebe o token em query string (só no driver local, que a produção já barra): preferir POST ou cookie.
3. **Log cru de erro nos webhooks.** `src/app/api/webhooks/asaas/route.ts:14` e `src/app/api/webhooks/whatsapp/route.ts:46` usam `console.error(error)`. Erros do driver podem trazer parâmetros (CPF, telefone). Trocar por `log.error` (`src/lib/log.ts`, com máscara) e logar só mensagem/código.
4. **Dinheiro recebido em ordem terminal sem alerta.** `src/modules/pagamentos/webhook.ts:65-69` grava só `webhook_ignorado`. Registrar também `pagamento_orfao` com `requerAtencao: true` e exibir no painel/dashboard, para o gestor devolver ou reativar.
5. **Rate limit de login.** `src/lib/auth.ts:10` não configura `rateLimit`; o padrão do Better Auth é em memória, ineficaz em serverless (Vercel). Usar `rateLimit: { storage: "database" }` (ou secondary storage) para `/sign-in/email`.
6. **Rate limit do OTP só por ordem.** `src/modules/assinatura/otp.ts:37-44` limita 3 envios/10 min e 5 tentativas por código, mas não por IP e `solicitarOtp` é público: com um token válido dá para queimar custo de WhatsApp a cada 15 min por ordem e bloquear o cliente legítimo. Aceitável no MVP; adicionar limite por IP/token se houver abuso.

## Sugestão

- `src/lib/require-admin.ts:7`: autorização = ter sessão. Como `disableSignUp: true` (`src/lib/auth.ts:12`) hoje só existe o admin do seed, mas ao criar outros usuários checar `usuarios.papel === 'admin'`.
- `src/modules/assinatura/actions.ts:10` e `src/modules/ordens/cliente-actions.ts:11`: o IP vem de `x-forwarded-for` (primeiro valor). Fora da Vercel é forjável e vai para a página de evidências. Usar o header confiável da plataforma (`x-vercel-forwarded-for`/`x-real-ip`) ou o último hop de um proxy conhecido.
- `src/providers/storage/supabase.ts:4`: a privacidade do bucket `documentos` depende de configuração manual. Reforçar no `docs/go-live.md` (bucket privado, sem policy pública) e/ou validar no boot.
- RLS: 21/21 tabelas com `ENABLE ROW LEVEL SECURITY` e nenhuma policy. Isso só protege se a anon key for a única exposta; confirmar no go-live que `DATABASE_URL` usa a role dona (que ignora RLS) e que a service-role key nunca vai ao client.

## Verificado e ok

- **Regra de ouro (pagamento só após assinatura):** guarda em 3 camadas — `src/modules/pagamentos/guard.ts:11`, `iniciar.ts:48` e, dentro da transação com `for update`, `iniciar.ts:110`; o webhook revalida a assinatura (`webhook.ts:55-69`). Assinar exige status `visualizada`, OTP validado e consentimentos (`concluir.ts:16-48`) com update condicional (`:75`). O valor cobrado vem sempre da ordem no servidor.
- **Token do link:** `src/lib/tokens.ts` usa 32 bytes aleatórios (base64url, 43 chars); só o SHA-256 vai ao banco; `resolverToken` valida o formato, o cancelamento e a expiração (regra D6).
- **OTP:** `crypto.randomInt`, HMAC-SHA256 com salt e `OTP_SECRET` (mín. 32), comparação `timingSafeEqual`, expiração de 5 min, 5 tentativas com bloqueio, uso único, `for update` e lock advisory; o telefone vem do cliente da ordem, nunca do input.
- **Webhooks:** Asaas valida o header em tempo constante e é idempotente por `unique(provider, event_id)` (eventos desconhecidos retornam 200 com auditoria). Meta valida `X-Hub-Signature-256` com `META_APP_SECRET` e o GET usa `META_VERIFY_TOKEN`.
- **Rota dev:** `src/app/api/dev/simular-pagamento/route.ts:9` devolve 404 em produção, e a UI só mostra o botão se `NODE_ENV !== "production"`. Fake e local lançam erro em produção nos três factories.
- **Segredos:** só em env, `.env*` ignorado pelo git (só `.env.example` versionado), nenhum segredo encontrado por busca no código e na documentação.
- **Storage e downloads:** `/api/storage` exige `requireAdmin`, valida caminho por regex e por linha em `assinaturas`; o Supabase usa URL assinada de 5 min; o download do cliente exige token válido e status assinado ou pago; headers `attachment`, `no-store` e `nosniff`.
- **LGPD:** `src/lib/log.ts` mascara CPF e OTP; CPF mascarado nas telas públicas e nas listas; consentimentos de contrato e LGPD gravados com IP, user-agent e versão, e exigidos antes de assinar; `auditoria` sem CPF nem OTP.
- **Sessão admin:** todas as server actions de `clientes`, `contratos`, `planos` e `ordens` chamam `requireAdmin` (reenviar e copiar link delegam a funções protegidas); `dashboard/queries.ts:23` e `ordens/queries.ts:17,45` também; `src/app/painel/layout.tsx:9` redireciona sem sessão, e `src/proxy.ts` cobre `/painel/*`. As actions públicas (`assinatura`, `otp`, `pagamentos`, `cliente-*`) só aceitam o token do link.
