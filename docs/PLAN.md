# PLAN MedLink

Donos: **C** = Cofre (núcleo/lógica/integrações), **M** = Mutirão (telas/CRUD/docs/E2E). `∥` = pode rodar em paralelo com a tarefa/grupo indicado. Contratos em `docs/CONTRACTS.md`, decisões em `DECISIONS.md`. Tarefa = PR/commit pequeno; "pronto" inclui `tsc --noEmit` e lint limpos.

## F1 Fundação (ordem 1)

| ID   | Dono      | Tarefa                                                                                                                    | Dep  | Pronto quando                                               |
| ---- | --------- | ------------------------------------------------------------------------------------------------------------------------- | ---- | ----------------------------------------------------------- |
| F1.1 | C         | Scaffold Next 16, TS strict, Tailwind 4, shadcn base-nova, ESLint/Prettier/Husky, Vitest, Playwright, estrutura de pastas | -    | `npm run dev/lint/test` rodam; pastas da SPEC §3 existem    |
| F1.2 | C         | `db/schema.ts` Drizzle conforme CONTRACTS §1-2 + migration + RLS on                                                       | F1.1 | `drizzle-kit generate` ok, migra em Postgres local/Supabase |
| F1.3 | C         | Better Auth (e-mail/senha, adapter Drizzle), middleware protegendo `(admin)`, seed do admin                               | F1.2 | rota admin redireciona sem sessão; login funciona           |
| F1.4 | C         | Interfaces dos providers + factories + Fakes (payment/messaging) + StorageAdapter local/Supabase                          | F1.1 | tipos = CONTRACTS §4; fakes selecionáveis por env           |
| F1.5 | C         | `lib/` : tokens, audit, log (máscara CPF), validators (CPF/E.164/CEP), env tipado (zod)                                   | F1.1 | testes unitários de tokens e máscara                        |
| F1.6 | M ∥F1.2-5 | Layout admin (sidebar, header), login UI, tema, componentes base, `.env.example` rascunho                                 | F1.1 | telas navegáveis com pt-BR                                  |

## F2 Cadastros (ordem 2) — F2.x C e M em paralelo por entidade

| ID   | Dono    | Tarefa                                                                                                 | Dep                 | Pronto quando                             |
| ---- | ------- | ------------------------------------------------------------------------------------------------------ | ------------------- | ----------------------------------------- |
| F2.1 | C       | Server actions + Zod: operadoras (logo no Storage), planos, plano_precos (10 faixas), contrato_modelos | F1.2,F1.4           | CRUD via action com validação e auditoria |
| F2.2 | C ∥F2.1 | Actions clientes + dependentes; busca ViaCEP (server)                                                  | F1.5                | CPF validado, único                       |
| F2.3 | M       | Telas operadoras, planos (form + tabela de preços), modelos de contrato (editor + lista de variáveis)  | F1.6, contrato F2.1 | CRUD completo na UI                       |
| F2.4 | M ∥F2.3 | Telas clientes + dependentes, CEP autopreenche                                                         | F1.6, contrato F2.2 | CRUD completo na UI                       |
| F2.5 | C       | Seed (1 operadora, 2 planos com preços, 1 modelo, 1 cliente)                                           | F2.1,F2.2           | `npm run db:seed` idempotente             |

## F3 Ordens (ordem 3)

| ID   | Dono    | Tarefa                                                                                                                    | Dep            | Pronto quando                                              |
| ---- | ------- | ------------------------------------------------------------------------------------------------------------------------- | -------------- | ---------------------------------------------------------- |
| F3.1 | C       | `lib/pricing.ts` + testes (faixas, adesão, desconto, tipos de valor_cobrado)                                              | F1.5           | testes cobrem bordas de idade 18/19, 58/59                 |
| F3.2 | C ∥F3.1 | `state-machine.ts` + `transicionar` com update otimista + auditoria + testes                                              | F1.2           | todas as transições inválidas rejeitadas                   |
| F3.3 | C       | Criar ordem: snapshots (benef., plano, contrato), token, expira_em; ações enviar/reenviar/cancelar/copiar link            | F3.1,F3.2,F2.1 | ordem criada com snapshot imutável; token só hash no banco |
| F3.4 | M       | Tela criar ordem (cliente, plano, beneficiários, preview de valor, desconto, formas, parcelas, validade), lista e detalhe | F3.3 contrato  | cria ordem e mostra link                                   |
| F3.5 | M ∥F3.4 | Linha do tempo + botões (Enviar, Copiar, Reenviar, Cancelar)                                                              | F3.3           | eventos de `auditoria` listados                            |

## F4 Página do cliente: resumo e contrato (ordem 4)

| ID   | Dono | Tarefa                                                                                                                                                                  | Dep  | Pronto quando                                                   |
| ---- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | --------------------------------------------------------------- |
| F4.1 | C    | Resolver token (hash, expirado/cancelado/pago), marca `visualizada`, dados da ordem p/ UI, renderizador de contrato (whitelist de variáveis), registro de consentimento | F3.3 | estados inválidos retornam tipo de erro; testes do renderizador |
| F4.2 | M    | `/c/[token]` mobile-first: stepper, resumo, contrato, checkboxes contrato+LGPD, política de privacidade, telas expirado/cancelado/pago, retomar etapa                   | F4.1 | funciona a 360px, volta ao ponto onde parou                     |

## F5 Assinatura (ordem 5)

| ID   | Dono    | Tarefa                                                                                                                                       | Dep                      | Pronto quando                           |
| ---- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | --------------------------------------- |
| F5.1 | C       | OTP: gerar/hash/enviar via MessagingProvider, validar, 5 tentativas, rate limit + testes                                                     | F1.4,F3.2                | bloqueio na 6ª tentativa; hash no banco |
| F5.2 | C ∥F5.1 | `InHouseSignatureProvider` (pdf-lib: contrato + carimbo + página de evidências + SHA-256)                                                    | F4.1                     | PDF abre; hash confere com `verificar`  |
| F5.3 | C       | `concluirAssinatura`: exige OTP validado + consentimentos, salva imagem e PDFs no Storage, `assinaturas`, `assinada`, auditoria, envia cópia | F5.1,F5.2                | sem OTP validado a ação falha           |
| F5.4 | M       | Etapa de assinatura: confirmar nome/CPF, signature_pad (toque, limpar), pedir e digitar OTP, geolocalização opcional                         | F4.2, contrato F5.1/F5.3 | assina em mobile, erros de OTP em pt-BR |
| F5.5 | M ∥F5.4 | Admin: download do contrato assinado e das evidências (URL assinada)                                                                         | F5.3                     | baixa os PDFs                           |

## F6 Pagamento (ordem 6)

| ID   | Dono    | Tarefa                                                                                                                                              | Dep                 | Pronto quando                                   |
| ---- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ----------------------------------------------- |
| F6.1 | C       | `iniciarPagamento` com guarda da regra de ouro (assinatura existe + status) + teste "pagar sem assinar falha"                                       | F5.3,F1.4           | teste bloqueante verde                          |
| F6.2 | C ∥F6.1 | `AsaasProvider` (customer por CPF reutilizado, `/payments` com externalReference, Pix QR, boleto, cartão via checkout)                              | F1.4                | funciona no sandbox com chave                   |
| F6.3 | C       | Webhook `/api/webhooks/asaas`: token, idempotência, eventos CONFIRMED/RECEIVED/OVERDUE/REFUNDED, transição `paga`, notifica gestor/cliente + testes | F6.1                | evento duplicado não reprocessa                 |
| F6.4 | C ∥F6.3 | Rota dev `simular-pagamento` (fake)                                                                                                                 | F6.1                | 404 em produção                                 |
| F6.5 | M       | Etapa Pagamento (Pix QR + copia-e-cola, boleto linha/PDF, cartão redirect), polling de status, confirmação com download                             | F4.2, contrato F6.1 | só aparece após assinar; vira "paga" ao webhook |

## F7 WhatsApp (ordem 7)

| ID   | Dono    | Tarefa                                                                                    | Dep  | Pronto quando                 |
| ---- | ------- | ----------------------------------------------------------------------------------------- | ---- | ----------------------------- |
| F7.1 | C       | `MetaWhatsAppProvider` (Cloud API, templates) + registro em `mensagens` + fallback Resend | F1.4 | envia no número de teste Meta |
| F7.2 | C ∥F7.1 | Webhook `/api/webhooks/whatsapp`: GET hub.challenge, assinatura HMAC, status de entrega   | F7.1 | status atualiza `mensagens`   |
| F7.3 | M ∥F7.1 | `docs/whatsapp-templates.md` com os 4 templates (textos e variáveis)                      | -    | pronto p/ submeter            |

## F8 Dashboard e timeline (ordem 8)

| ID   | Dono | Tarefa                                                             | Dep  | Pronto quando              |
| ---- | ---- | ------------------------------------------------------------------ | ---- | -------------------------- |
| F8.1 | C    | Queries: contadores por status, valor vendido no período, recentes | F3.3 | retorna agregados corretos |
| F8.2 | M    | Dashboard UI (cards, filtro de período via nuqs, recentes)         | F8.1 | exibe dados reais          |

## F9 Testes, revisão e docs (ordem 9)

| ID   | Dono      | Tarefa                                                                                                                               | Dep       | Pronto quando                      |
| ---- | --------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------- | ---------------------------------- |
| F9.1 | M         | E2E Playwright fluxo feliz (fakes): criar ordem → abrir link → assinar (OTP do console/DB fake) → pagar via simular-pagamento → paga | F6.5,F8.2 | verde em CI local                  |
| F9.2 | C         | Testes unitários faltantes (webhooks, state machine, regra de ouro)                                                                  | F6.3      | cobertura dos 3 itens da SPEC §6   |
| F9.3 | M ∥F9.1   | README (rodar local, Supabase, Asaas sandbox, Meta, deploy), `.env.example` final, checklist de go-live                              | F7.3      | alguém roda do zero só pelo README |
| F9.4 | Arquiteto | Revisão de segurança final (regra de ouro, OTP, webhooks, LGPD, bucket)                                                              | tudo      | relatório aprovado                 |

## Paralelismo resumido

- F1: C faz F1.1→(F1.2∥F1.4∥F1.5)→F1.3; M faz F1.6 após F1.1.
- F2: F2.1∥F2.2 (C) e F2.3∥F2.4 (M) contra o contrato.
- F3: F3.1∥F3.2; M começa F3.4 contra CONTRACTS enquanto F3.3 sai.
- F5.1∥F5.2; F6.1∥F6.2; F7 inteiro roda ∥F6 (C) se houver folga.
- Mutirão nunca bloqueia em C: usa stub do contrato e troca depois.

## Revisão (Arquiteto)

Diff de cada tarefa C ou M entra em revisão ao fechar a fase; bloqueantes: F5.3, F6.1, F6.3, F5.1.
