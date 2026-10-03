import { expect, it } from "vitest";
import { LocalStorage } from "./local";

it("bloqueia traversal fora da pasta local", async () => {
  const storage = new LocalStorage();
  await expect(storage.put("../fora.pdf", new Uint8Array())).rejects.toThrow(
    "Caminho de Storage inválido",
  );
  await expect(storage.delete("../fora.pdf")).rejects.toThrow("Caminho de Storage inválido");
});
