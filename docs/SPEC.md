# PROJETO: Plataforma de Venda de Planos de Saúde com Contrato, Assinatura Digital e Link de Pagamento

## 1. Seu papel

Você é o arquiteto-chefe e orquestrador deste projeto. Sua missão é planejar, dividir em tarefas, distribuir entre os agentes especializados e entregar um sistema funcional, bem estruturado, testado e pronto para produção (MVP).

Antes de escrever código:

1. Leia este documento inteiro.
2. Produza um **plano de execução** com as fases, as tarefas de cada fase, as dependências entre elas e o agente responsável por cada uma.
3. Liste qualquer ambiguidade que encontrar. Para cada uma, tome a decisão mais sensata, registre-a no arquivo `DECISIONS.md` e siga em frente. Não fique parado esperando resposta.

As decisões técnicas deste documento já estão tomadas. Respeite-as. Só desvie se houver um impedimento técnico real, e nesse caso registre o motivo em `DECISIONS.md`.

---

## 2. Contexto do negócio

O cliente é um **gestor e corretor de planos de saúde**. Hoje ele vende planos de forma manual. Ele quer um sistema que permita:

1. **Cadastrar** operadoras, planos de saúde, tabelas de preço e modelos de contrato.
2. **Cadastrar clientes**, com seus dependentes.
3. **Gerar uma ordem de venda** (proposta/contrato) para um cliente, com o plano escolhido e o valor calculado automaticamente.
4. **Enviar ao cliente, via WhatsApp, um link único.** Nele o cliente:
   - vê todas as informações do plano (operadora, coberturas, beneficiários e valor);
   - lê o contrato já preenchido com os dados dele;
   - **assina digitalmente**, desenhando com o dedo ou o mouse na tela e confirmando com um código enviado por WhatsApp;
   - **só depois de assinar**, tem o pagamento liberado, por **Pix, cartão de crédito ou boleto**.
5. **Receber o pagamento na conta do gestor**, por integração com o gateway, com confirmação automática.
6. **Acompanhar** no painel o status de cada ordem: enviada, visualizada, assinada, paga.

Regra de ouro: **o pagamento nunca pode ser liberado antes da assinatura concluída.** Essa regra precisa ser garantida no backend, não apenas escondida na interface.

---

## 3. Stack definida

| Camada                    | Tecnologia                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------ |
| Linguagem                 | **TypeScript** (strict) em todo o projeto                                                  |
| Framework                 | **Next.js 15 (App Router)**, com painel admin e página pública do cliente no mesmo projeto |
| UI                        | **Tailwind CSS** + **shadcn/ui** + **lucide-react**                                        |
| Formulários e validação   | **React Hook Form** + **Zod** (schemas compartilhados entre front e back)                  |
| Banco de dados            | **PostgreSQL via Supabase**                                                                |
| ORM e migrations          | **Drizzle ORM** + drizzle-kit                                                              |
| Autenticação do admin     | **Supabase Auth** (e-mail e senha)                                                         |
| Armazenamento de arquivos | **Supabase Storage** (bucket privado, com URLs assinadas)                                  |
| Captura da assinatura     | **signature_pad** (canvas, com suporte a toque)                                            |
| Geração de PDF            | **pdf-lib** (preencher o contrato, carimbar a assinatura e gerar a página de evidências)   |
| Gateway de pagamento      | **Asaas** (API v3), para Pix, boleto e cartão                                              |
| WhatsApp                  | **WhatsApp Business Cloud API (Meta)**, oficial, com mensagens por template                |
| E-mail (reserva)          | **Resend**                                                                                 |
| Hospedagem                | **Vercel** (app) + **Supabase** (banco e storage)                                          |
| Testes                    | **Vitest** (unitários) + **Playwright** (fluxo completo)                                   |
| Qualidade                 | ESLint, Prettier e Husky com lint-staged                                                   |

### Princípio de arquitetura: provedores substituíveis

Toda integração externa fica atrás de uma interface, para que o provedor possa ser trocado sem reescrever o sistema:

- `PaymentProvider`: implementação inicial `AsaasProvider`. No futuro, permite `AbacatePayProvider`.
- `MessagingProvider`: implementação inicial `MetaWhatsAppProvider`. No futuro, permite Z-API ou Twilio.
- `SignatureProvider`: implementação inicial `InHouseSignatureProvider` (assinatura própria com evidências). No futuro, permite ZapSign ou Clicksign.

Estrutura sugerida:

```
src/
  app/
    (admin)/            painel do gestor (protegido)
    c/[token]/          página pública do cliente
    api/webhooks/       asaas, whatsapp
  modules/
    planos/  clientes/  ordens/  contratos/  assinatura/  pagamentos/  mensagens/
  providers/
    payment/  messaging/  signature/
  db/
    schema.ts  migrations/
  lib/
    pricing.ts  tokens.ts  pdf.ts  audit.ts
```

---

## 4. Escopo do MVP

### 4.1 Painel do gestor (área autenticada)

**Operadoras**

- CRUD com nome, CNPJ, registro ANS e logo.

**Planos**

- CRUD com os campos: operadora, nome, código, segmentação (ambulatorial, hospitalar, com ou sem obstetrícia, referência), acomodação (enfermaria ou apartamento), abrangência (municipal, estadual, nacional), tipo de contratação (individual, familiar, PME), coparticipação (sim ou não), carências (texto), coberturas e diferenciais (texto rico), rede credenciada (texto ou link) e status ativo.
- **Tabela de preços por faixa etária**, seguindo o padrão ANS de 10 faixas: 0–18, 19–23, 24–28, 29–33, 34–38, 39–43, 44–48, 49–53, 54–58 e 59+. Cada faixa tem um valor mensal.
- Taxa de adesão opcional.

**Modelos de contrato**

- Cadastro de um modelo de contrato por plano, ou um modelo genérico, com variáveis de substituição. Exemplos: `{{cliente.nome}}`, `{{cliente.cpf}}`, `{{plano.nome}}`, `{{valor.total}}`, `{{beneficiarios.tabela}}`, `{{data.hoje}}`.
- Opção de enviar um PDF anexo fixo, como as condições gerais da operadora.

**Clientes**

- CRUD com: nome, CPF (validado), data de nascimento, e-mail, WhatsApp (formato E.164), endereço com busca por CEP via ViaCEP, e dependentes (nome, CPF, data de nascimento, parentesco).

**Ordens de venda**

- Criar ordem: escolher cliente, plano e beneficiários (titular e dependentes).
- **Cálculo automático do valor**: soma das faixas etárias de cada beneficiário, mais a taxa de adesão.
- O gestor pode aplicar um desconto ou ajuste manual, com campo de observação.
- Definir o valor a cobrar no link: por padrão, a **1ª mensalidade + adesão**. Também deve ser configurável qual valor é cobrado.
- Definir as formas de pagamento permitidas (Pix, boleto, cartão; todas por padrão) e o número máximo de parcelas no cartão.
- Definir a validade do link (padrão: 7 dias).
- Botões: **Enviar por WhatsApp**, **Copiar link**, **Reenviar**, **Cancelar**.
- Linha do tempo da ordem, com todos os eventos registrados (enviado, visualizado, assinado, pagamento criado, pago, vencido).
- Download do **contrato assinado (PDF)** e da **página de evidências**.

**Dashboard**

- Contadores por status, valor vendido no período e lista das ordens recentes.

### 4.2 Página do cliente (pública, acessada pelo link)

- Rota `/c/[token]`, onde o token é aleatório, com pelo menos 32 bytes, impossível de adivinhar e com validade.
- **Mobile-first.** A maioria dos clientes vai abrir pelo celular a partir do WhatsApp.
- Fluxo em etapas, com indicador de progresso:
  1. **Resumo do plano**: operadora, plano, coberturas, beneficiários com valor individual, e valor total.
  2. **Contrato**: visualização do contrato preenchido, checkbox "Li e concordo" e aceite do tratamento de dados (LGPD).
  3. **Assinatura**: confirmação de nome e CPF, desenho da assinatura no canvas (com botão de limpar), envio de um **código de 6 dígitos por WhatsApp** e validação desse código.
  4. **Pagamento**: só aparece depois da assinatura. O cliente escolhe Pix (QR code e copia-e-cola), boleto (linha digitável e PDF) ou cartão (checkout do Asaas ou cobrança transparente).
  5. **Confirmação**: tela de sucesso, com o contrato assinado disponível para baixar.
- Se o cliente fechar e voltar pelo mesmo link, ele continua de onde parou.
- O link deve mostrar estados de expirado, cancelado e já pago.

### 4.3 Assinatura digital (implementação própria com evidências)

Ao concluir a assinatura, o sistema deve:

1. Gerar o PDF final do contrato, com a imagem da assinatura carimbada.
2. Anexar uma **página de evidências** contendo: nome, CPF, data e hora (com fuso), IP, user-agent, geolocalização (se o cliente permitir), telefone que recebeu o código, horário de validação do código, ID da ordem e **hash SHA-256 do documento**.
3. Salvar o PDF no Storage privado e registrar o hash no banco.
4. Registrar todas as evidências na tabela `assinaturas` e no log de auditoria.
5. Enviar uma cópia do contrato assinado ao cliente, por WhatsApp e/ou e-mail.

A base legal é a assinatura eletrônica prevista na Lei 14.063/2020 e na MP 2.200-2/2001. A implementação deve permitir trocar por ZapSign ou Clicksign via `SignatureProvider`.

### 4.4 Pagamentos (Asaas)

- O gestor configura a **API Key do Asaas** em variável de ambiente, e todo o dinheiro cai direto na conta Asaas dele.
- Fluxo:
  1. Depois da assinatura, criar ou reutilizar o **customer** no Asaas, usando o CPF do cliente.
  2. Quando o cliente escolhe a forma de pagamento, criar a **cobrança** (`/payments`) com `externalReference = ordem.id`.
  3. Webhook em `/api/webhooks/asaas`:
     - validar o token de autenticação enviado no header;
     - garantir **idempotência**, guardando o ID de cada evento processado;
     - tratar os eventos `PAYMENT_CONFIRMED`, `PAYMENT_RECEIVED`, `PAYMENT_OVERDUE` e `PAYMENT_REFUNDED`.
  4. Ao confirmar o pagamento, atualizar a ordem para `paga`, notificar o gestor (WhatsApp ou e-mail) e enviar a confirmação ao cliente.
- O desenvolvimento acontece todo no **sandbox do Asaas**. Produção é ativada só por variável de ambiente.
- Recorrência mensal fica **fora do MVP**, mas a modelagem deve permitir adicioná-la depois.

### 4.5 WhatsApp (Meta Cloud API)

Templates necessários. Crie os textos e documente-os, para serem submetidos à aprovação da Meta:

- `proposta_enviada`: "Olá {{nome}}, sua proposta do plano {{plano}} está pronta. Acesse para ver, assinar e pagar: {{link}}"
- `codigo_assinatura`: código de verificação de 6 dígitos.
- `pagamento_confirmado`: confirmação, com link para o contrato.
- `lembrete_proposta`: lembrete para propostas não assinadas. É opcional e pode ser disparado manualmente no MVP.

Todas as mensagens enviadas devem ser registradas, com status de entrega vindo do webhook da Meta. O e-mail via Resend é o canal de reserva se o WhatsApp falhar.

---

## 5. Modelo de dados (mínimo)

- `usuarios`: admin (via Supabase Auth) e perfil.
- `operadoras`
- `planos`
- `plano_precos`: plano_id, faixa_etaria, valor.
- `contrato_modelos`
- `clientes`
- `dependentes`
- `ordens`: cliente_id, plano_id, status, valor_mensal, valor_adesao, desconto, valor_cobrado, formas_pagamento, max_parcelas, token, expira_em, criada_por.
- `ordem_beneficiarios`: **snapshot** de nome, nascimento, faixa e valor no momento da ordem.
- `ordem_snapshot_plano`: snapshot dos dados do plano. Se o plano mudar depois, a ordem não muda.
- `assinaturas`: ordem_id, imagem_url, pdf_url, hash_sha256, ip, user_agent, geo, telefone_otp, otp_validado_em, assinado_em.
- `otp_codigos`: hash do código, expiração e tentativas.
- `pagamentos`: ordem_id, provider, provider_payment_id, metodo, valor, status, pix_payload, boleto_url, pago_em.
- `webhook_eventos`: provider, event_id (único), payload, processado_em.
- `mensagens`: ordem_id, canal, template, para, status, provider_message_id.
- `auditoria`: entidade, entidade_id, acao, ator, metadados, criado_em.

Máquina de estados da ordem:
`rascunho → enviada → visualizada → assinada → aguardando_pagamento → paga`
Estados terminais adicionais: `expirada` e `cancelada`. As transições devem ser validadas no backend.

---

## 6. Requisitos não funcionais

- **Segurança**
  - RLS ativado no Supabase.
  - Rotas do admin protegidas.
  - Tokens dos links impossíveis de adivinhar.
  - Rate limit no envio e na validação de OTP (máximo de 5 tentativas).
  - Validação de webhooks.
  - Segredos apenas em variáveis de ambiente.
  - Bucket de documentos privado.
- **LGPD**
  - Consentimento explícito registrado.
  - Dados de saúde e documentos acessíveis só ao gestor.
  - Política de privacidade simples na página do cliente.
  - Mascaramento de CPF nos logs.
- **Confiabilidade**
  - Webhooks idempotentes.
  - Reprocessamento seguro.
  - Toda ação relevante registrada em `auditoria`.
- **UX**
  - Interface em português do Brasil.
  - Moeda em BRL e datas em `America/Sao_Paulo`.
  - Página do cliente rápida e leve no celular.
  - Visual limpo e profissional, que transmita confiança.
- **Qualidade**
  - TypeScript strict.
  - Testes unitários para o cálculo de preço, a máquina de estados e o processamento de webhooks.
  - Teste E2E do fluxo feliz completo: criar ordem → abrir link → assinar → pagar (com webhook simulado) → ordem paga.

---

## 7. Fora do MVP (não implementar agora, mas não impedir)

- Múltiplos corretores, equipes e comissões.
- Cobrança recorrente mensal automática.
- Integração direta com sistemas das operadoras.
- Declaração de saúde detalhada.
- Upload de documentos pelo cliente (RG, comprovante).
- Relatórios avançados e exportações.
- App mobile nativo.

---

## 8. Entregáveis esperados

1. Repositório organizado conforme a estrutura acima.
2. `README.md` com: visão geral, como rodar localmente, como configurar o Supabase, o Asaas (sandbox) e a Meta WhatsApp, e como fazer o deploy na Vercel.
3. `.env.example` com todas as variáveis documentadas.
4. Migrations do banco e um **seed** com 1 operadora, 2 planos com tabela de preços, 1 modelo de contrato e 1 cliente de exemplo.
5. `DECISIONS.md` com as decisões tomadas durante o desenvolvimento.
6. `docs/whatsapp-templates.md` com os textos dos templates para aprovação na Meta.
7. Testes passando (unitários e E2E).
8. Checklist de go-live: o que o gestor precisa configurar para ir para produção (conta Asaas aprovada, número de WhatsApp verificado, domínio, etc.).

---

## 9. Como orquestrar

Divida o trabalho entre agentes especializados. Sugestão:

- **Arquiteto**: estrutura do projeto, schema do banco, interfaces dos provedores e máquina de estados.
- **Backend**: módulos, server actions e rotas de API, cálculo de preço, webhooks.
- **Integrações**: Asaas, Meta WhatsApp, geração de PDF e assinatura.
- **Frontend**: painel admin e página do cliente (mobile-first).
- **QA**: testes unitários e E2E, revisão de segurança e da regra "assinar antes de pagar".
- **Documentação**: README, `.env.example`, templates e checklist de go-live.

Ordem lógica:

1. Fundação: setup, banco, autenticação e interfaces dos provedores.
2. Cadastros: operadoras, planos, preços, contratos e clientes.
3. Ordens: criação, cálculo e geração do link.
4. Página do cliente: resumo e contrato.
5. Assinatura com OTP e PDF.
6. Pagamento com Asaas e webhooks.
7. WhatsApp.
8. Dashboard e linha do tempo.
9. Testes, revisão e documentação.

Paralelize o que for independente.

**Critério de pronto:** o gestor consegue cadastrar um plano, criar uma ordem para um cliente e enviar o link por WhatsApp. O cliente consegue abrir o link no celular, ver o plano, assinar com o dedo, validar o código e pagar via Pix no sandbox. O painel mostra a ordem como **paga**, com o contrato assinado e as evidências disponíveis para download.

Comece apresentando o plano de execução.
