# Plano: recorrência de pagamento, link estável e WhatsApp oficial (06/11/2026)

Pedido do Vinicios: (1) recorrência de pagamento com data; (2) o link de pagamento não pode ser invalidado sem querer; (3) trazer do CRM (ancorahub) o sistema de WhatsApp oficial da Meta, só envio pela API oficial (sem chat), para os links de pagamento irem sozinhos ao cliente, com templates.

## Diagnóstico

- **Link invalidado:** "Copiar link", "Enviar/Reenviar proposta" e os lembretes geravam um token novo a cada uso. O banco só guardava o hash, então o link já enviado ao cliente parava de funcionar. Depois da assinatura, "Copiar link" nem funcionava.
- **WhatsApp hoje:** `providers/messaging/meta.ts` manda 4 templates fixos com token e número em variáveis de ambiente (`META_ACCESS_TOKEN`, `META_PHONE_NUMBER_ID`), sem tela, sem fila, sem nova tentativa, sem sincronizar templates. Webhook só atualiza status.
- **Recorrência:** não existe. A ordem gera uma cobrança (adesão e/ou 1ª mensalidade) no Asaas. `ordens.dia_vencimento` (1 a 28) e `vigencia_inicio` já existem e servem de base.
- **Cron:** a Vercel roda `/api/cron/lembretes` uma vez por dia (12h UTC). No plano Hobby o cron é diário; envios imediatos precisam sair na própria ação (ou `after()`), e o cron diário cuida de agenda e novas tentativas.

## Fase 1: link estável (FEITA, commit `e503bab`)

- O token passa a ser guardado também cifrado (`ordens.token_cifrado`, AES-256-GCM; chave derivada do `BETTER_AUTH_SECRET` ou `LINK_TOKEN_SECRET`).
- Copiar link, Enviar/Reenviar e lembretes reutilizam o mesmo link. Prazo vencendo é estendido em 7 dias sem trocar o link.
- Botão separado **Gerar novo link** (com confirmação) é o único que invalida o anterior. Vale até a ordem ser paga.
- Ordens antigas (sem token guardado) ganham um link novo uma única vez; depois ficam estáveis.
- Link já vencido antes da assinatura não é reaberto ao copiar: aparece "Este link venceu" e só "Gerar novo link" reabre. Assinada aguardando pagamento usa o mesmo link até 30 dias depois do prazo (mesma tolerância da página do cliente).
- Decisão de segurança: o token passa a ser reversível para o app (antes só hash). Quem tem a chave do app e o banco consegue abrir links ativos. Recomendado definir `LINK_TOKEN_SECRET` próprio na Vercel; sem ele a chave vem do `BETTER_AUTH_SECRET`, e trocar esse segredo faz cada ordem ganhar link novo no próximo "Copiar link" (avisado na tela).
- SQL: `src/db/migrations/0007_link_estavel.sql` (rodar ANTES do deploy).

## Fase 2: WhatsApp oficial, base (copiar do CRM, adaptado a uma empresa só)

Origem no CRM (`ancorahub/src/features/communication-channels`): `meta-cloud-client.ts` (envio de template e texto), `meta-graph-templates-client.ts` (listar, criar e apagar templates), `template-sync-service.ts` (sincronizar, teste com exemplos aprovados), `secret-crypto.ts` (token cifrado), `template-parameters.ts` e `template-preview.ts`, `meta-delivery-failure.ts` (erros da Meta em português) e o assistente de criação de template (`template-builder-wizard.tsx`).

Entregas:
- Tabela `whatsapp_canal` (uma linha): WABA, phone number id, número exibido, token cifrado, status, verificado em. Tela **Configurações › WhatsApp oficial**: colar token e IDs, "Testar conexão" (consulta o número na Graph), dados do webhook (URL e verify token) para colar na Meta.
- Tabela `whatsapp_templates` sincronizada da Meta (nome, idioma, categoria, status, componentes, variáveis, botões, motivo de rejeição). Tela **Mensagens › Templates**: lista com status, Sincronizar, Criar (assistente com modelos prontos do MedLink), Enviar teste com os exemplos aprovados, Apagar.
- Modelos prontos (categoria UTILITY): `proposta_enviada` (nome, plano, link), `lembrete_proposta` (nome, plano, prazo, link), `pagamento_confirmado` (nome, plano), `cobranca_mensalidade` (nome, competência, valor, vencimento, link), `cobranca_lembrete` (nome, valor, vencimento, link), `cobranca_vencida` (nome, valor, dias, link). Botão de URL dinâmica para o link quando a Meta aceitar o domínio.
- Webhook: além dos status (enviada, entregue, lida, falhou), grava a resposta do cliente só como registro e trata "SAIR"/"PARAR" como pedido para não receber mais mensagens automáticas. Sem tela de conversa.
- O provedor `meta.ts` passa a ler o canal do banco (variáveis de ambiente ficam como reserva).

## Fase 3: fila de envio e mensagens automáticas

- `mensagens` vira fila: chave de idempotência (ex.: `proposta:<ordem>:<versão>`), agendado para, tentativas, próxima tentativa, status, código e texto do erro, template e variáveis usadas.
- Envio imediato na ação (proposta criada, pagamento confirmado) e nova tentativa no cron diário. Horário de envio 08h às 20h (São Paulo), como os lembretes.
- Tela **Mensagens automáticas**: para cada evento, liga/desliga e escolhe o template (proposta criada, lembrete sem assinatura, lembrete sem pagamento, pagamento confirmado, cobrança gerada, lembrete de vencimento, cobrança vencida).
- Opção "Enviar automaticamente ao criar a ordem" no formulário (padrão ligado quando o canal estiver ativo).
- Histórico de mensagens na ordem e no cliente, com status de entrega.

## Fase 4: recorrência de pagamento com data

Recomendação: motor próprio gerando cobranças avulsas no Asaas, em vez da assinatura nativa do Asaas. Motivo: link e boleto com a marca da Venacor, mensagem pelo nosso WhatsApp oficial, controle de reajuste, pausa e troca de data. (A assinatura do Asaas manda as próprias notificações e dá menos controle; fica como alternativa.)

Dados:
- `recorrencias`: ordem, cliente, valor mensal, dia de vencimento (1 a 28), início, fim (opcional), formas de pagamento, status (ativa, pausada, encerrada), próxima competência, criada por.
- `pagamentos` ganha `recorrencia_id`, `competencia` (AAAA-MM) e `token_hash`/`token_cifrado` do link de pagamento; único por (recorrência, competência).

Regras:
- A recorrência nasce quando a ordem é paga, com o dia de vencimento e a vigência da ordem; pode ser criada ou editada à mão (data, valor a partir do próximo mês, pausar, encerrar).
- Cron diário: gera a cobrança da competência N dias antes do vencimento (padrão 10, configurável), cria o pagamento no Asaas (Pix e boleto; cartão opcional), cria o link `/p/<token>` e enfileira `cobranca_mensalidade`. Lembrete no dia anterior; `cobranca_vencida` em D+1 e D+5. Webhook do Asaas dá baixa e manda `pagamento_confirmado`.
- Página do cliente `/p/<token>`: mensalidade, Pix copia e cola com QR, boleto da Venacor, cartão. Link estável (mesma regra da Fase 1).
- Painel: aba **Mensalidades** na ordem e no cliente; lista geral **Cobranças** (a vencer, vencidas, pagas) com filtro por período; no dashboard, receita recorrente do mês e inadimplência.

## Fase 5: inadimplência e ajustes

- Alerta de cobrança vencida há X dias, ação "Reenviar cobrança", relatório mensal.
- Reajuste anual e mudança de faixa etária (tabela ANS de 10 faixas já existe nos planos).

## Ordem e dependências

1. Fase 1 (feita) → SQL 0007 → deploy.
2. Fase 2 precisa da conta Meta da Venacor: WABA, número e token permanente (usuário de sistema). Sem isso, tudo fica pronto e testado com o provedor fake.
3. Fase 3 depois da 2. Fase 4 pode começar em paralelo à 2 (motor e telas com o provedor fake) e liga as mensagens quando a 3 entrar.

## Decisões pendentes (com recomendação)

- Motor de recorrência: próprio sobre cobranças avulsas do Asaas (recomendado) ou assinatura nativa do Asaas.
- Antecedência da cobrança: 10 dias antes do vencimento (recomendado, por causa do boleto).
- Número do WhatsApp oficial da Venacor (separado dos números da Âncora).
- Plano da Vercel: no Hobby o cron é diário (suficiente com envio imediato na ação); no Pro dá para rodar a fila a cada poucos minutos.
