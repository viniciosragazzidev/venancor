import "dotenv/config";
import { and, eq } from "drizzle-orm";
import { client, db } from "./client";
import { clientes, contratoModelos, faixaEtaria, operadoras, planoPrecos, planos } from "./schema";

const precosEssencial = [24900, 27900, 31900, 35900, 39900, 45900, 52900, 61900, 74900, 99900];
const precosCompleto = [39900, 44900, 49900, 56900, 64900, 74900, 86900, 99900, 119900, 159900];

async function main() {
  await db.transaction(async (tx) => {
    const cnpj = "11222333000181";
    let [operadora] = await tx.select().from(operadoras).where(eq(operadoras.cnpj, cnpj)).limit(1);
    if (!operadora) {
      [operadora] = await tx
        .insert(operadoras)
        .values({
          nome: "Operadora Exemplo Saúde",
          cnpj,
          registroAns: "123456",
          ativa: true,
        })
        .returning();
    }

    for (const [codigo, nome, tabela, acomodacao, taxaAdesao] of [
      ["MEDLINK-SEED-ESSENCIAL", "Essencial", precosEssencial, "enfermaria", 9900],
      ["MEDLINK-SEED-COMPLETO", "Completo", precosCompleto, "apartamento", 14900],
    ] as const) {
      let [plano] = await tx
        .select()
        .from(planos)
        .where(and(eq(planos.operadoraId, operadora.id), eq(planos.codigo, codigo)))
        .limit(1);
      if (!plano) {
        [plano] = await tx
          .insert(planos)
          .values({
            operadoraId: operadora.id,
            nome,
            codigo,
            segmentacao: "ambulatorial_hospitalar_obstetricia",
            acomodacao,
            abrangencia: "estadual",
            tipoContratacao: "individual",
            coparticipacao: false,
            carencias: "Conforme contrato da operadora.",
            coberturas: "Consultas, exames e internações conforme contrato.",
            redeCredenciada: "Rede demonstrativa.",
            taxaAdesao,
          })
          .returning();
      }
      await tx
        .insert(planoPrecos)
        .values(
          faixaEtaria.enumValues.map((faixa, i) => ({
            planoId: plano.id,
            faixaEtaria: faixa,
            valor: tabela[i],
          })),
        )
        .onConflictDoNothing();
    }

    const [modelo] = await tx
      .select({ id: contratoModelos.id })
      .from(contratoModelos)
      .where(eq(contratoModelos.nome, "Contrato demonstrativo MedLink"))
      .limit(1);
    if (!modelo)
      await tx.insert(contratoModelos).values({
        nome: "Contrato demonstrativo MedLink",
        planoId: null,
        ativo: true,
        corpo:
          "Contrato de adesão: {{cliente.nome}}, CPF {{cliente.cpf}}, plano {{plano.nome}}, valor {{valor.total}}.",
      });

    await tx
      .insert(clientes)
      .values({
        nome: "Cliente Exemplo",
        cpf: "52998224725",
        nascimento: "1990-05-15",
        email: "cliente@exemplo.com",
        whatsapp: "+5511999999999",
        cep: "01310100",
        logradouro: "Avenida Paulista",
        numero: "1000",
        bairro: "Bela Vista",
        cidade: "São Paulo",
        uf: "SP",
      })
      .onConflictDoNothing({ target: clientes.cpf });
  });
  console.info("Seed de demonstração concluído.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => client.end());
