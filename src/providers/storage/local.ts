import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StorageAdapter } from "./types";

export class LocalStorage implements StorageAdapter {
  constructor(private readonly root = path.resolve(process.cwd(), ".storage")) {}

  private resolve(key: string): string {
    const file = path.resolve(this.root, key);
    if (!key || file === this.root || !file.startsWith(this.root + path.sep)) {
      throw new Error("Caminho de Storage inválido");
    }
    return file;
  }

  async put(key: string, bytes: Uint8Array): Promise<void> {
    const file = this.resolve(key);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, bytes);
  }

  async getSignedUrl(key: string): Promise<string> {
    this.resolve(key);
    // A rota de download autenticada é entregue junto às ações de documentos.
    return `/api/storage?path=${encodeURIComponent(key)}`;
  }

  async delete(key: string): Promise<void> {
    await rm(this.resolve(key), { force: true });
  }
}
