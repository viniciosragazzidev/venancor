# Referências visuais do MedLink

Imagens em `docs/refs/` (escolhidas pelo dono do projeto). Esta é a linguagem visual do produto,
principalmente da página do cliente (`/c/[token]`, mobile) e dos formulários do painel.
Combinar com as skills em `.agents/skills/` (better-ui, better-colors, better-typography,
better-layout, better-interface).

| Arquivo                         | O que mostra                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------- |
| `ref-1-form-agenda-perfil.webp` | formulário em cards, calendário, perfil com listas de configuração, tab bar flutuante |
| `ref-2-form-sucesso.webp`       | formulário longo, CTA preto fixo, bottom sheet de sucesso                             |
| `ref-3-sheets-data-hora.webp`   | formulário com ícones à esquerda, bottom sheets de data e hora                        |

## Linguagem visual (aplicar)

- **Superfícies:** fundo da página cinza muito claro; conteúdo em **cards brancos com raio grande**
  (~20-24px), quase sem sombra. Agrupar campos relacionados num mesmo card.
- **Campos e botões em pílula** (totalmente arredondados), borda fina cinza clara, altura ~48-52px,
  texto do valor em cinza bem escuro, placeholder cinza médio. Rótulo **acima** do campo, sem bold.
- **Títulos de tela** grandes (28-32px) com peso regular/medium, não bold. Header com botões de ícone
  **circulares com borda** à direita (ex: compartilhar, +, buscar) e voltar circular à esquerda.
- **CTA principal:** pílula **preta** (quase #111), largura total, texto branco, fixa no rodapé em
  telas longas. Secundário: pílula branca com borda.
- **Escolha única** (ex: forma de pagamento, Pix/Boleto/Cartão): segmentos em pílula lado a lado;
  o selecionado ganha fundo azul bem claro + borda e texto azuis.
- **Cor de destaque azul** usada com parcimônia (seleção, foco, data ativa). Verde só para sucesso.
  Status do painel podem usar a paleta de barras (verde, azul, rosa, roxo) em pontos e barras finas.
- **Listas** (ex: configurações, itens de ordem): card com cabeçalho em CAIXA ALTA pequeno e cinza,
  linhas com ícone de traço à esquerda, texto, chevron à direita.
- **Bottom sheets** para seleções e confirmações no celular: cantos de cima arredondados, título à
  esquerda, botão fechar circular, fundo escurecido atrás.
- **Tela de sucesso:** check verde grande em círculo, título forte, subtítulo cinza, dois botões
  (secundário com borda em cima, primário preto embaixo). Usar na confirmação de assinatura e
  de pagamento.
- **Upload/área vazia:** borda tracejada suave com ícone de traço e texto de limite.
- **Ícones:** lucide, traço fino, nunca preenchidos.
- **Tipografia:** sans neutra (Inter ou Geist), hierarquia por tamanho e cor, não por negrito.

## Onde aplicar primeiro

1. Página do cliente: stepper, resumo do plano, contrato, assinatura (canvas no card branco),
   pagamento (segmentos Pix/Boleto/Cartão), confirmação (tela de sucesso).
2. Formulários do painel (ordem, plano, cliente): cards agrupando campos, pílulas, CTA preto.
