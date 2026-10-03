import postgres from "postgres";
import { getServerEnv } from "./env";

export interface EventoAuditoria {
  entidade: string;
  entidadeId: string;
  acao: string;
  ator: string;
  metadados?: object;
}

let connection: ReturnType<typeof postgres> | undefined;

export async function registrarAuditoria(evento: EventoAuditoria): Promise<void> {
  connection ??= postgres(getServerEnv().DATABASE_URL, { max: 1 });
  await connection`
    insert into auditoria (entidade, entidade_id, acao, ator, metadados)
    values (${evento.entidade}, ${evento.entidadeId}, ${evento.acao}, ${evento.ator}, ${JSON.stringify(evento.metadados ?? {})}::jsonb)
  `;
}
