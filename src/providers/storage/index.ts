import { LocalStorage } from "./local";
import { SupabaseStorage } from "./supabase";
import type { StorageAdapter } from "./types";

let local: LocalStorage | undefined;
export function getStorageAdapter(): StorageAdapter {
  const selected = process.env.STORAGE_DRIVER ?? "local";
  if (selected === "local") return (local ??= new LocalStorage());
  if (selected === "supabase") {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios");
    return new SupabaseStorage(url, key);
  }
  throw new Error(`StorageAdapter desconhecido: ${selected}`);
}
export type * from "./types";
