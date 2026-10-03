# Templates de WhatsApp (Meta Cloud API)

Templates para submissão e aprovação da Meta, conforme a SPEC (seção 4.5). Todos em **pt_BR**.

Regras gerais de submissão:

- Variáveis são numeradas (`{{1}}`, `{{2}}`, …) e preenchidas pelo sistema no envio.
- Variáveis de URL devem ficar no **final** do texto e o exemplo precisa ser uma URL válida.
- Submeter primeiro `codigo_assinatura` (AUTHENTICATION) e `proposta_enviada` (UTILITY); os demais podem ir juntos.
- O envio real usa a API: `POST /{PHONE_NUMBER_ID}/messages` com `template.name` + `lang(pt_BR)`.
- Depois de aprovados, os nomes não podem ser alterados (só criar um novo template).

---

## 1. proposta_enviada

| Campo     | Valor              |
| --------- | ------------------ |
| Nome      | `proposta_enviada` |
| Categoria | UTILITY            |
| Idioma    | pt_BR              |

**Corpo:**

> Olá {{1}}, sua proposta do plano {{2}} está pronta. Acesse para ver, assinar e pagar: {{3}}

**Exemplo (valores das variáveis):**

> Olá Maria, sua proposta do plano Amil 400 E Nacional está pronta. Acesse para ver, assinar e pagar: https://app.seudominio.com.br/c/3f9a2c7e8b1d4f6a

**Mapeamento das variáveis:**

- `{{1}}` → nome do cliente
- `{{2}}` → nome do plano
- `{{3}}` → link único da ordem (`/c/[token]`)

**Botões:** nenhum (o link vai no corpo).

---

## 2. codigo_assinatura

| Campo     | Valor               |
| --------- | ------------------- |
| Nome      | `codigo_assinatura` |
| Categoria | AUTHENTICATION      |
| Idioma    | pt_BR               |

**Corpo:**

> {{1}} é o seu código de verificação para assinar o contrato. Ele expira em 10 minutos. Para sua segurança, não compartilhe este código com ninguém.

**Exemplo (valor da variável):**

> 841297 é o seu código de verificação para assinar o contrato. Ele expira em 10 minutos. Para sua segurança, não compartilhe este código com ninguém.

**Mapeamento das variáveis:**

- `{{1}}` → código OTP de 6 dígitos

**Botão (obrigatório neste formato):**

- Tipo: OTP / Copiar código (`COPY_CODE`)
- Texto: `Copiar código de verificação`

**Observação:** a categoria AUTHENTICATION exige o código no corpo (`{{1}}`) e o botão de copiar código. O tempo de expiração citado no texto deve refletir o TTL do OTP configurado no sistema.

---

## 3. pagamento_confirmado

| Campo     | Valor                  |
| --------- | ---------------------- |
| Nome      | `pagamento_confirmado` |
| Categoria | UTILITY                |
| Idioma    | pt_BR                  |

**Corpo:**

> Boa notícia, {{1}}! Recebemos o pagamento da sua mensalidade do plano {{2}}. Seu contrato assinado está disponível em: {{3}}

**Exemplo (valores das variáveis):**

> Boa notícia, Maria! Recebemos o pagamento da sua mensalidade do plano Amil 400 E Nacional. Seu contrato assinado está disponível em: https://app.seudominio.com.br/c/3f9a2c7e8b1d4f6a

**Mapeamento das variáveis:**

- `{{1}}` → nome do cliente
- `{{2}}` → nome do plano
- `{{3}}` → link da ordem (tela de confirmação/contrato)

**Botões:** nenhum.

---

## 4. lembrete_proposta

| Campo     | Valor               |
| --------- | ------------------- |
| Nome      | `lembrete_proposta` |
| Categoria | UTILITY             |
| Idioma    | pt_BR               |

**Corpo:**

> Olá {{1}}, sua proposta do plano {{2}} ainda aguarda sua assinatura e expira em {{3}}. Acesse para ver, assinar e pagar: {{4}}

**Exemplo (valores das variáveis):**

> Olá Maria, sua proposta do plano Amil 400 E Nacional ainda aguarda sua assinatura e expira em 05/10/2026. Acesse para ver, assinar e pagar: https://app.seudominio.com.br/c/3f9a2c7e8b1d4f6a

**Mapeamento das variáveis:**

- `{{1}}` → nome do cliente
- `{{2}}` → nome do plano
- `{{3}}` → data de expiração do link (dd/mm/aaaa)
- `{{4}}` → link único da ordem (`/c/[token]`)

**Botões:** nenhum.

**Observação:** lembrete opcional, disparado manualmente pelo gestor no MVP, apenas para propostas ainda não assinadas.

---

## Uso pelo sistema

| Evento                               | Template               | Gatilho                                                |
| ------------------------------------ | ---------------------- | ------------------------------------------------------ |
| Ordem enviada por WhatsApp           | `proposta_enviada`     | Ação "Enviar por WhatsApp" no painel                   |
| Cliente chegou à etapa de assinatura | `codigo_assinatura`    | Solicitação de OTP na página do cliente                |
| Webhook confirma pagamento           | `pagamento_confirmado` | Evento `PAYMENT_CONFIRMED`/`PAYMENT_RECEIVED` do Asaas |
| Proposta sem assinatura              | `lembrete_proposta`    | Disparo manual do gestor                               |

Todo envio é registrado na tabela `mensagens`, com status de entrega atualizado pelo webhook da Meta. Se o WhatsApp falhar, o e-mail via Resend é o canal de reserva.
