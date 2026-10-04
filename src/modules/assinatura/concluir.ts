import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { assinaturas, auditoria, consentimentos, ordemBeneficiarios, ordens } from "@/db/schema";
import { resolverToken } from "@/modules/ordens/cliente";
import { getSignatureProvider } from "@/providers/signature";
import { getStorageAdapter } from "@/providers/storage";
import { fakePermitido } from "@/lib/modo-teste";
import { otpValidado } from "./otp";
import { assinaturaExigeOtp, obterOtpParaAssinatura } from "./otp-policy";
import { concluirAssinaturaSchema, type ConcluirAssinaturaInput } from "./schema";

export async function concluirAssinatura(
  token: string,
  input: ConcluirAssinaturaInput,
  contexto: { ip: string; userAgent: string },
) {
  const ordem = await resolverToken(token);
  if (ordem.tipo !== "ativa" || ordem.dados.status !== "visualizada")
    throw new Error("Ordem indisponível para assinatura");
  const dados = concluirAssinaturaSchema.parse(input);
  const [titular] = await db
    .select({ cpf: ordemBeneficiarios.cpf, nome: ordemBeneficiarios.nome })
    .from(ordemBeneficiarios)
    .where(
      and(eq(ordemBeneficiarios.ordemId, ordem.dados.id), eq(ordemBeneficiarios.titular, true)),
    )
    .limit(1);
  if (!titular) throw new Error("Titular ausente do snapshot");
  if (
    dados.nome.trim().toLocaleLowerCase("pt-BR") !==
      titular.nome.trim().toLocaleLowerCase("pt-BR") ||
    dados.cpf !== titular.cpf
  )
    throw new Error("Nome ou CPF não conferem com o titular");
  const otp = await obterOtpParaAssinatura(() => otpValidado(ordem.dados.id));
  const aceites = await db
    .select({ tipo: consentimentos.tipo })
    .from(consentimentos)
    .where(
      and(
        eq(consentimentos.ordemId, ordem.dados.id),
        inArray(consentimentos.tipo, ["contrato", "lgpd"]),
      ),
    );
  if (
    !aceites.some((item) => item.tipo === "contrato") ||
    !aceites.some((item) => item.tipo === "lgpd")
  )
    throw new Error("Consentimentos de contrato e LGPD são obrigatórios");
  const imagem = Uint8Array.from(
    Buffer.from(dados.imagemBase64.replace(/^data:image\/png;base64,/, ""), "base64"),
  );
  if (
    imagem.byteLength > 2_000_000 ||
    Buffer.from(imagem.slice(0, 8)).toString("hex") !== "89504e470d0a1a0a"
  )
    throw new Error("Assinatura PNG inválida ou muito grande");
  const assinada = await getSignatureProvider().assinar({
    ordemId: ordem.dados.id,
    nome: dados.nome,
    cpf: dados.cpf,
    telefoneOtp: otp?.telefone,
    otpValidadoEm: otp?.validadoEm,
    imagemPng: imagem,
    ip: contexto.ip,
    userAgent: contexto.userAgent,
    geo: dados.geo,
    contratoHtmlOuTexto: ordem.dados.contrato_corpo,
    modoTeste:
      assinaturaExigeOtp() &&
      fakePermitido() &&
      (process.env.MESSAGING_PROVIDER ?? "fake") === "fake",
  });
  const storage = getStorageAdapter();
  const prefixo = `ordens/${ordem.dados.id}/${crypto.randomUUID()}`;
  const imagemPath = `${prefixo}/assinatura.png`;
  const pdfPath = `${prefixo}/contrato-assinado.pdf`;
  const evidenciasPdfPath = `${prefixo}/evidencias.pdf`;
  const paths = [imagemPath, pdfPath, evidenciasPdfPath];
  try {
    await storage.put(imagemPath, imagem, "image/png");
    await storage.put(pdfPath, assinada.pdfAssinado, "application/pdf");
    await storage.put(evidenciasPdfPath, assinada.paginaEvidencias, "application/pdf");
    await db.transaction(async (tx) => {
      const [alterada] = await tx
        .update(ordens)
        .set({ status: "assinada", assinadaEm: assinada.assinadoEm, atualizadoEm: new Date() })
        .where(and(eq(ordens.id, ordem.dados.id), eq(ordens.status, "visualizada")))
        .returning({ id: ordens.id });
      if (!alterada) throw new Error("Ordem já assinada ou alterada");
      await tx.insert(assinaturas).values({
        ordemId: ordem.dados.id,
        imagemPath,
        pdfPath,
        evidenciasPdfPath,
        hashSha256: assinada.hashSha256,
        nome: dados.nome,
        cpf: dados.cpf,
        ip: contexto.ip,
        userAgent: contexto.userAgent,
        geo: dados.geo,
        telefoneOtp: otp?.telefone ?? null,
        otpValidadoEm: otp?.validadoEm ?? null,
        assinadoEm: assinada.assinadoEm,
        provider: getSignatureProvider().nome,
      });
      await tx.insert(auditoria).values({
        entidade: "ordens",
        entidadeId: ordem.dados.id,
        acao: "assinar",
        ator: "cliente",
        metadados: {
          hashSha256: assinada.hashSha256,
          verificacaoOtp: assinaturaExigeOtp() ? "validada" : "nao_utilizada",
          modoTeste:
            assinaturaExigeOtp() &&
            fakePermitido() &&
            (process.env.MESSAGING_PROVIDER ?? "fake") === "fake",
        },
      });
    });
  } catch (error) {
    await Promise.allSettled(paths.map((path) => storage.delete(path)));
    throw error;
  }
  return { ordemId: ordem.dados.id, hashSha256: assinada.hashSha256 };
}
