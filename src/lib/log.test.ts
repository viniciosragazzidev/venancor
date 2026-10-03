import { expect, it } from "vitest";
import { mascararSensivel } from "./log";

it("mascara CPF e OTP em texto e objetos", () => {
  expect(mascararSensivel({ cpf: "529.982.247-25", codigo: "123456" })).toContain("###.***.***-##");
  expect(mascararSensivel("OTP: 123456")).toBe("OTP: ******");
});
