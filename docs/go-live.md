# Checklist de go-live (produção)

O que o gestor precisa configurar antes de ativar a produção, conforme a SPEC (seção 8, item 8). Desenvolvimento e testes acontecem 100% em sandbox; produção só liga por variável de ambiente.

## 1. Asaas

- [ ] Conta Asaas aprovada (documentação do gestor/corregra completada, conta desbloqueada para receber)
- [ ] API key de **produção** gerada (menu Integrações → Chaves de API) e configurada em `ASAAS_API_KEY`
- [ ] `ASAAS_ENV=production` (sandbox é `ASAAS_ENV=sandbox` — só troque depois da checklist completa)
- [ ] Webhook configurado no painel do Asaas: URL `https://seudominio.com.br/api/webhooks/asaas` com os eventos `PAYMENT_CONFIRMED`, `PAYMENT_RECEIVED`, `PAYMENT_OVERDUE`, `PAYMENT_REFUNDED`
- [ ] Token do webhook (`asaasToken`, enviado no header) configurado em `ASAAS_WEBHOOK_TOKEN`
- [ ] Teste de fim a fim com valor baixo: Pix gerado, pago e ordem marcada como `paga`

## 2. Meta (WhatsApp Business Cloud API)

- [ ] Conta **Meta Business verificificado** (empresa com documento e endereço validados)
- [ ] Número de WhatsApp próprio (chip da operadora) migrado/vinculado ao WABA
- [ ] Todos os 4 templates de `docs/whatsapp-templates.md` submetidos e **aprovados** em pt_BR, com os nomes exatos (`proposta_enviada`, `codigo_assinatura`, `pagamento_confirmado`, `lembrete_proposta`)
- [ ] Números de destino testados (cada cliente precisa ter conversado com o número ao menos uma vez na janela de 24h, quando aplicável)
- [ ] **Token permanente** gerado: usuário de sistema (System User) com permissão `whatsapp_business_messaging` no app → configurado em `META_ACCESS_TOKEN`
- [ ] `META_PHONE_NUMBER_ID` e `META_VERIFY_TOKEN` configurados (mais `META_APP_SECRET` para validar a assinatura do webhook)
- [ ] Webhook da Meta configurado: URL `https://seudominio.com.br/api/webhooks/whatsapp`, assinando os campos `messages` e `message_status`, com verificação pelo `META_VERIFY_TOKEN`

## 3. Domínio

- [ ] Domínio próprio comprado e DNS apontado para a Vercel (registro CNAME/A conforme instruções do dashboard)
- [ ] HTTPS ativo (certificado automático da Vercel)
- [ ] Todas as URLs de webhook (Asaas e Meta) usando o domínio final de produção

## 4. Supabase (produção)

- [ ] Projeto de produção criado (separado do projeto de desenvolvimento)
- [ ] Migrations e seed rodados no banco de produção
- [ ] Connection string configurada em `DATABASE_URL`
- [ ] Bucket **privado** `documentos` criado, sem policy pública de leitura ou listagem; contratos e evidências acessíveis apenas por URLs assinadas
- [ ] `DATABASE_URL` usa a role dona do banco somente no servidor; `SUPABASE_SERVICE_ROLE_KEY` fica somente no servidor e nunca em variável `NEXT_PUBLIC_`
- [ ] RLS ativado em todas as tabelas, sem policies públicas (a anon key não lê nada — override #1 da SPEC: o acesso passa sempre pelo servidor)

## 5. Autenticação do admin (Better Auth)

- [ ] `BETTER_AUTH_SECRET` definido com valor forte e aleatório (32+ bytes)
- [ ] `OTP_SECRET` definido com valor forte e aleatório (32+ bytes) — usado para os códigos de assinatura
- [ ] `BETTER_AUTH_URL` apontando para o domínio de produção (base das URLs de sessão)
- [ ] `APP_URL` apontando para o domínio de produção (base dos links `/c/<token>` enviados ao cliente)
- [ ] Usuário admin do gestor criado com senha forte; e-mail verificado
- [ ] Cookie de sessão testado no domínio de produção

## 6. Resend (e-mail de reserva)

- [ ] Conta Resend criada e **domínio verificado** (DNS: SPF, DKIM e DMARC)
- [ ] `RESEND_API_KEY` configurado e `RESEND_FROM_EMAIL` com o remetente do domínio verificado
- [ ] Teste de envio com fallback (canal de reserva do WhatsApp) validado

## 7. Vercel e variáveis finais

- [ ] Projeto deployado na Vercel, conectado ao repositório
- [ ] Todas as variáveis de `.env.example` preenchidas no ambiente de produção da Vercel
- [ ] `NEXT_PUBLIC_MODO_TESTE=false` no ambiente real, com provedores reais e `STORAGE_DRIVER=supabase`
- [ ] Todos os segredos apenas em variáveis de ambiente (nunca no código)
- [ ] Variável `ASAAS_ENV=production` ligada só depois dos itens acima (sai do sandbox)

## Smoke test final (com valores baixos)

1. [ ] Criar ordem de venda real no painel e enviar por WhatsApp (`proposta_enviada` entregue)
2. [ ] Abrir o link no celular, ler o contrato e assinar com OTP (`codigo_assinatura` entregue e validado)
3. [ ] Pagar por Pix com valor baixo → webhook do Asaas marca a ordem como `paga`
4. [ ] Cliente recebe `pagamento_confirmado` e baixa o contrato assinado
5. [ ] Painel mostra linha do tempo completa, contrato e evidências para download
