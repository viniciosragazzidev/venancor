import type { StorageAdapter } from "./types";

export class SupabaseStorage implements StorageAdapter {
  readonly bucket = "documentos";
  constructor(
    private readonly url: string,
    private readonly serviceRoleKey: string,
  ) {}

  private objectUrl(path: string): string {
    if (!path || path.split("/").some((segment) => segment === ".." || segment === "")) {
      throw new Error("Caminho de Storage inválido");
    }
    return `${this.url.replace(/\/$/, "")}/storage/v1/object/${this.bucket}/${path.split("/").map(encodeURIComponent).join("/")}`;
  }

  private headers(extra?: HeadersInit): Headers {
    return new Headers({
      authorization: `Bearer ${this.serviceRoleKey}`,
      apikey: this.serviceRoleKey,
      ...extra,
    });
  }

  async put(path: string, bytes: Uint8Array, contentType: string): Promise<void> {
    const response = await fetch(this.objectUrl(path), {
      method: "POST",
      headers: this.headers({ "content-type": contentType, "x-upsert": "true" }),
      body: new Uint8Array(bytes),
    });
    if (!response.ok) throw new Error(`Falha no Storage: ${response.status}`);
  }

  async getSignedUrl(path: string): Promise<string> {
    const signedUrl = this.objectUrl(path).replace(
      "/storage/v1/object/",
      "/storage/v1/object/sign/",
    );
    const response = await fetch(signedUrl, {
      method: "POST",
      headers: this.headers({ "content-type": "application/json" }),
      body: JSON.stringify({ expiresIn: 300 }),
    });
    if (!response.ok) throw new Error(`Falha ao criar URL assinada: ${response.status}`);
    const data = (await response.json()) as { signedURL?: string; signedUrl?: string };
    const signed = data.signedURL ?? data.signedUrl;
    if (!signed) throw new Error("Storage não retornou URL assinada");
    return new URL(signed, this.url).toString();
  }

  async delete(path: string): Promise<void> {
    const response = await fetch(this.objectUrl(path), {
      method: "DELETE",
      headers: this.headers(),
    });
    if (!response.ok && response.status !== 404)
      throw new Error(`Falha ao excluir arquivo: ${response.status}`);
  }
}
