import { afterEach, describe, expect, it, vi } from "vitest";

import { SupabaseStorage } from "./supabase";

afterEach(() => vi.unstubAllGlobals());

describe("SupabaseStorage.getSignedUrl", () => {
  it("põe /storage/v1 no caminho relativo que o Storage devolve", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({ signedURL: "/object/sign/documentos/ordens/a/b.pdf?token=x" }),
          ),
      ),
    );
    const url = await new SupabaseStorage("https://ref.supabase.co/", "k").getSignedUrl(
      "ordens/a/b.pdf",
    );
    expect(url).toBe(
      "https://ref.supabase.co/storage/v1/object/sign/documentos/ordens/a/b.pdf?token=x",
    );
  });

  it("não duplica o prefixo quando ele já vem", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({ signedURL: "/storage/v1/object/sign/documentos/x.pdf?token=y" }),
          ),
      ),
    );
    const url = await new SupabaseStorage("https://ref.supabase.co", "k").getSignedUrl("x.pdf");
    expect(url).toBe("https://ref.supabase.co/storage/v1/object/sign/documentos/x.pdf?token=y");
  });
});
