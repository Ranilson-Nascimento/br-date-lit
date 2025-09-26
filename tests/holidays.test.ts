
import { describe, it, expect } from "vitest";
import { easterDate } from "../src/holidays";
import { toBR } from "../src/utils";

describe("Holidays", () => {
  it("calcula Páscoa corretamente para 2025", () => {
    const pascoa = easterDate(2025);
    expect(toBR(pascoa)).toBe("20/04/2025");
  });
});
