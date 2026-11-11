# Decisões do produto e da operação

Registro curto de decisões. Cada entrada tem data, o que foi decidido e o porquê.

## 2026-11-11 — CPF na assinatura: confirmação, não digitação

- **Decisão:** a ficha de assinatura mostra o CPF do titular já preenchido, mascarado, e o cliente marca "Confirmo que este é o meu CPF". O servidor usa o CPF da ordem (que nunca vai para a tela) e o grava na evidência da assinatura, como antes.
- **Por quê:** o cliente já informou o CPF no cadastro da ordem; digitar de novo era atrito sem ganho. A prova de identidade continua sendo o OTP validado por SMS (exigido antes de assinar) e o link secreto da proposta.
- **Antes:** o cliente digitava o CPF e o servidor conferia com o da ordem (Cofre, F5.3). A conferência digitada continua valendo para quem não envia a confirmação.
- **Evidência:** o CPF completo continua no contrato assinado e na evidência; a tela pública continua com o CPF mascarado.

## 2026-11-11 — Desconto sobre o total cobrado

- **Decisão:** o desconto abate o total que a cobrança representa: mensalidade + adesão (adesão + mensalidade), só a mensalidade, só a adesão ou o valor personalizado. Desconto acima desse total, ou que zera a cobrança, é recusado com mensagem clara.
- **Por quê:** antes o desconto só abatia a mensalidade e a adesão era somada por fora, o que deixava o total errado quando o desconto era grande. O Asaas não cobra valor zero.
- **Efeito:** com desconto até a mensalidade, o valor final não muda. Na cobrança só adesão e no personalizado, o desconto agora também abate (antes era ignorado).
