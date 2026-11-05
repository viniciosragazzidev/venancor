import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  auditoria,
  assinaturas,
  clientes,
  consentimentos,
  leads,
  mensagens,
  ordens,
  pagamentos,
} from "@/db/schema";
import { ErroNegocio } from "@/lib/resultado-acao";
import { gerarOrdemAPartirDoLead } from "@/modules/leads/actions";
import { criarOrdemComo } from "./criar";
import { excluirOrdensEmMassa } from "./actions";

type Escrita = { table: unknown; values: unknown };

const mocks = vi.hoisted(() => ({
  state: {
    tx: null as Record<string, unknown> | null,
    rowsByTable: new Map<unknown, unknown[]>(),
    deletedTables: [] as unknown[],
    updated: [] as Escrita[],
    inserted: [] as Escrita[],
    returningRows: [] as unknown[],
    committedWrites: [] as Escrita[],
    rolledBackWrites: [] as Escrita[],
    runTransaction: null as
      | ((callback: (tx: Record<string, unknown>) => unknown) => Promise<unknown>)
      | null,
  },
}));

vi.mock("@/db/client", () => ({
  db: {
    transaction: vi.fn((callback: (tx: Record<string, unknown>) => unknown) =>
      mocks.state.runTransaction!(callback),
    ),
  },
}));
vi.mock("@/lib/require-admin", () => ({ requireAdmin: vi.fn(async () => ({ id: "admin-1" })) }));
vi.mock("./criar", () => ({ criarOrdemComo: vi.fn() }));

function criarTransacaoFake(pendingWrites: Escrita[] = []) {
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
      values: vi.fn((values: unknown) => {
        const write = { table: tabela, values };
        mocks.state.inserted.push(write);
        pendingWrites.push(write);
        return {
          returning: vi.fn(async () =>
            tabela === clientes ? [{ id: "4aa4eb85-4f97-45c0-9251-558e62ba20f2" }] : [],
          ),
        };
      }),
    })),
  };
}

function prepararTransacaoPadrao() {
  mocks.state.tx = criarTransacaoFake();
  mocks.state.runTransaction = async (callback) => callback(mocks.state.tx!);
}

function limparEstado() {
  mocks.state.rowsByTable = new Map();
  mocks.state.deletedTables = [];
  mocks.state.updated = [];
  mocks.state.inserted = [];
  mocks.state.returningRows = [];
  mocks.state.committedWrites = [];
  mocks.state.rolledBackWrites = [];
  prepararTransacaoPadrao();
}

describe("excluir ordens em massa com preservacao de historico", () => {
  beforeEach(limparEstado);

  it("pula uma ordem que ja tem consentimento e nao apaga seus registros", async () => {
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

  it("mantem auditoria e logs de mensagem, desvinculando o log antes de excluir a ordem", async () => {
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

describe("conversao de lead em ordem", () => {
  beforeEach(() => {
    limparEstado();
    vi.mocked(criarOrdemComo).mockReset();
  });

  it("faz rollback do cliente e da auditoria se a criacao da ordem falhar depois", async () => {
    const leadId = "0fbf84d1-6631-4c86-9f47-c877ea30572b";
    mocks.state.rowsByTable.set(leads, [
      { id: leadId, ordemId: null, clienteId: null, nome: "Ana", whatsapp: "21999990000" },
    ]);
    const pendingWrites: Escrita[] = [];
    const tx = criarTransacaoFake(pendingWrites);
    mocks.state.tx = tx;
    mocks.state.runTransaction = async (callback) => {
      try {
        const result = await callback(tx);
        mocks.state.committedWrites.push(...pendingWrites);
        return result;
      } catch (erro) {
        mocks.state.rolledBackWrites.push(...pendingWrites);
        throw erro;
      }
    };
    vi.mocked(criarOrdemComo).mockRejectedValue(new ErroNegocio("Plano indisponivel."));

    const resultado = await gerarOrdemAPartirDoLead({
      leadId,
      planoId: "d06d1d33-c3dd-4483-9092-2b6cac0380a1",
      origemCliente: "novo",
      cliente: { cpf: "52998224725", nascimento: "1990-01-01", email: "ana@example.com" },
    });

    expect(resultado).toEqual({ ok: false, erro: "Plano indisponivel." });
    expect(mocks.state.rolledBackWrites).toContainEqual({
      table: clientes,
      values: expect.objectContaining({ cpf: "52998224725", criadoPor: "admin-1" }),
    });
    expect(mocks.state.rolledBackWrites).toContainEqual({
      table: auditoria,
      values: expect.objectContaining({ entidade: "clientes", acao: "criar" }),
    });
    expect(mocks.state.committedWrites).toEqual([]);
  });

  it("passa a transacao externa para criarOrdemComo", async () => {
    const leadId = "0fbf84d1-6631-4c86-9f47-c877ea30572b";
    mocks.state.rowsByTable.set(leads, [
      {
        id: leadId,
        ordemId: null,
        clienteId: "0ba6e5c6-6d07-4514-8d06-7d6cf44a7812",
        nome: "Ana",
        whatsapp: "21999990000",
      },
    ]);
    vi.mocked(criarOrdemComo).mockRejectedValue(new ErroNegocio("Plano indisponivel."));

    const resultado = await gerarOrdemAPartirDoLead({
      leadId,
      planoId: "d06d1d33-c3dd-4483-9092-2b6cac0380a1",
      origemCliente: "existente",
      clienteId: "0ba6e5c6-6d07-4514-8d06-7d6cf44a7812",
    });

    expect(resultado).toEqual({ ok: false, erro: "Plano indisponivel." });
    expect(criarOrdemComo).toHaveBeenCalledWith(
      expect.objectContaining({ clienteId: "0ba6e5c6-6d07-4514-8d06-7d6cf44a7812" }),
      "admin-1",
      mocks.state.tx,
    );
  });
});
