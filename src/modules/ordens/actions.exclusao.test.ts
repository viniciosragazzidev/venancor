import { beforeEach, describe, expect, it, vi } from "vitest";
import { auditoria, assinaturas, consentimentos, leads, mensagens, ordens, pagamentos } from "@/db/schema";
import { ErroNegocio } from "@/lib/resultado-acao";
import { criarCliente } from "@/modules/clientes/actions";
import { gerarOrdemAPartirDoLead } from "@/modules/leads/actions";
import { criarOrdemComo } from "./criar";
import { excluirOrdensEmMassa } from "./actions";

const mocks = vi.hoisted(() => ({
  state: {
    tx: null as Record<string, unknown> | null,
    rowsByTable: new Map<unknown, unknown[]>(),
    deletedTables: [] as unknown[],
    updated: [] as Array<{ table: unknown; values: unknown }>,
    inserted: [] as Array<{ table: unknown; values: unknown }>,
    returningRows: [] as unknown[],
  },
}));

vi.mock("@/db/client", () => ({
  db: {
    transaction: vi.fn((callback: (tx: Record<string, unknown>) => unknown) => callback(mocks.state.tx!)),
  },
}));
vi.mock("@/lib/require-admin", () => ({ requireAdmin: vi.fn(async () => ({ id: "admin-1" })) }));
vi.mock("@/modules/clientes/actions", () => ({ criarCliente: vi.fn() }));
vi.mock("./criar", () => ({ criarOrdemComo: vi.fn() }));

function criarTransacaoFake() {
  return {
    execute: vi.fn(async () => undefined),
    select: vi.fn(() => {
      let tabela: unknown;
      const builder = {
        from(valor: unknown) {
          tabela = valor;
          return builder;
        },
        where() {
          return builder;
        },
        limit() {
          return builder;
        },
        for() {
          return Promise.resolve(mocks.state.rowsByTable.get(tabela) ?? []);
        },
        then(resolve: (value: unknown[]) => unknown, reject: (reason: unknown) => unknown) {
          return Promise.resolve(mocks.state.rowsByTable.get(tabela) ?? []).then(resolve, reject);
        },
      };
      return builder;
    }),
    delete: vi.fn((tabela: unknown) => ({
      where: vi.fn(async () => {
        mocks.state.deletedTables.push(tabela);
      }),
    })),
    update: vi.fn((tabela: unknown) => ({
      set: vi.fn((values: unknown) => {
        mocks.state.updated.push({ table: tabela, values });
        return {
          where: vi.fn(() => ({ returning: vi.fn(async () => mocks.state.returningRows) })),
        };
      }),
    })),
    insert: vi.fn((tabela: unknown) => ({
      values: vi.fn(async (values: unknown) => {
        mocks.state.inserted.push({ table: tabela, values });
      }),
    })),
  };
}

describe("excluir ordens em massa com preservação de histórico", () => {
  beforeEach(() => {
    mocks.state.tx = criarTransacaoFake();
    mocks.state.rowsByTable = new Map();
    mocks.state.deletedTables = [];
    mocks.state.updated = [];
    mocks.state.inserted = [];
    mocks.state.returningRows = [];
  });

  it("pula uma ordem que já tem consentimento e não apaga seus registros", async () => {
    const ordemId = "0fbf84d1-6631-4c86-9f47-c877ea30572b";
    mocks.state.rowsByTable.set(ordens, [{ id: ordemId, numero: 41, status: "rascunho" }]);
    mocks.state.rowsByTable.set(assinaturas, []);
    mocks.state.rowsByTable.set(pagamentos, []);
    mocks.state.rowsByTable.set(consentimentos, [{ id: "consentimento-1" }]);

    const resultado = await excluirOrdensEmMassa([ordemId]);

    expect(resultado).toEqual({
      ok: true,
      valor: {
        excluidas: [],
        puladas: [{ ordemId, numero: 41, motivo: "cliente já abriu e aceitou os termos" }],
      },
    });
    expect(mocks.state.deletedTables).toEqual([]);
    expect(mocks.state.updated).toEqual([]);
    expect(mocks.state.inserted).toEqual([]);
  });

  it("mantém auditoria e logs de mensagem, desvinculando o log antes de excluir a ordem", async () => {
    const ordemId = "0fbf84d1-6631-4c86-9f47-c877ea30572b";
    mocks.state.rowsByTable.set(ordens, [{ id: ordemId, numero: 41, status: "rascunho" }]);
    mocks.state.rowsByTable.set(assinaturas, []);
    mocks.state.rowsByTable.set(pagamentos, []);
    mocks.state.rowsByTable.set(consentimentos, []);

    const resultado = await excluirOrdensEmMassa([ordemId]);

    expect(resultado).toMatchObject({ ok: true, valor: { excluidas: [{ ordemId, numero: 41 }] } });
    expect(mocks.state.deletedTables).not.toContain(consentimentos);
    expect(mocks.state.deletedTables).not.toContain(mensagens);
    expect(mocks.state.deletedTables).not.toContain(auditoria);
    expect(mocks.state.updated).toContainEqual({
      table: mensagens,
      values: expect.objectContaining({ ordemId: null }),
    });
    expect(mocks.state.inserted).toContainEqual({
      table: auditoria,
      values: expect.objectContaining({ entidade: "ordens", acao: "excluir_em_massa" }),
    });
    expect(mocks.state.deletedTables).toContain(ordens);
  });
});

describe("conversão de lead em ordem", () => {
  beforeEach(() => {
    mocks.state.tx = criarTransacaoFake();
    mocks.state.rowsByTable = new Map();
    mocks.state.deletedTables = [];
    mocks.state.updated = [];
    mocks.state.inserted = [];
    mocks.state.returningRows = [];
    vi.mocked(criarCliente).mockReset();
    vi.mocked(criarOrdemComo).mockReset();
  });

  it("devolve o erro de criarCliente como resultado de ação", async () => {
    const leadId = "0fbf84d1-6631-4c86-9f47-c877ea30572b";
    mocks.state.rowsByTable.set(leads, [
      { id: leadId, ordemId: null, clienteId: null, nome: "Ana", whatsapp: "21999990000" },
    ]);
    vi.mocked(criarCliente).mockResolvedValue({ ok: false, erro: "CPF já cadastrado." });

    const resultado = await gerarOrdemAPartirDoLead({
      leadId,
      planoId: "d06d1d33-c3dd-4483-9092-2b6cac0380a1",
      origemCliente: "novo",
      cliente: { cpf: "52998224725", nascimento: "1990-01-01", email: "ana@example.com" },
    });

    expect(resultado).toEqual({ ok: false, erro: "CPF já cadastrado." });
    expect(criarOrdemComo).not.toHaveBeenCalled();
  });

  it("passa a transação externa à criação da ordem e devolve ErroNegocio com mensagem clara", async () => {
    const leadId = "0fbf84d1-6631-4c86-9f47-c877ea30572b";
    mocks.state.rowsByTable.set(leads, [
      { id: leadId, ordemId: null, clienteId: "0ba6e5c6-6d07-4514-8d06-7d6cf44a7812", nome: "Ana", whatsapp: "21999990000" },
    ]);
    vi.mocked(criarOrdemComo).mockRejectedValue(new ErroNegocio("Plano indisponível."));

    const resultado = await gerarOrdemAPartirDoLead({
      leadId,
      planoId: "d06d1d33-c3dd-4483-9092-2b6cac0380a1",
      origemCliente: "existente",
      clienteId: "0ba6e5c6-6d07-4514-8d06-7d6cf44a7812",
    });

    expect(resultado).toEqual({ ok: false, erro: "Plano indisponível." });
    expect(criarOrdemComo).toHaveBeenCalledWith(
      expect.objectContaining({ clienteId: "0ba6e5c6-6d07-4514-8d06-7d6cf44a7812" }),
      "admin-1",
      mocks.state.tx,
    );
  });
});
