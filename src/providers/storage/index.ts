import { LocalStorage } from "./local";
import { SupabaseStorage } from "./supabase";
import type { StorageAdapter } from "./types";

let local: LocalStorage | undefined;
export const storageDriver = () =>
  process.env.STORAGE_DRIVER ?? (process.env.NODE_ENV === "production" ? "supabase" : "local");

export function getStorageAdapter(): StorageAdapter {
  const selected = storageDriver();
  if (selected === "local") {
    if (process.env.NODE_ENV === "production")
      throw new Error("Storage local indisponível em produção");
    return (local ??= new LocalStorage());
  }
  if (selected === "supabase") {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios");
    return new SupabaseStorage(url, key);
  }
  throw new Error(`StorageAdapter desconhecido: ${selected}`);
}
export type * from "./types";
