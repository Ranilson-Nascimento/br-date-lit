
import { describe, it, expect } from "vitest";
import { createCalendar, parseBR, toBR, Providers } from "../src";

describe("Business days", () => {
  const cal = createCalendar({ profile: "comercial", providers: [] });

  it("pula feriado nacional fixo", async () => {
    const d = await cal.nextBusinessDay(parseBR("25/12/2025"));
    // pode variar por dia da semana, garantimos que não seja o próprio feriado
    expect(toBR(d)).not.toBe("25/12/2025");
  });

  it("conta dias úteis entre duas datas", async () => {
    const count = await cal.businessDaysBetween(parseBR("10/02/2026"), parseBR("20/02/2026"), true);
    expect(count).toBeGreaterThan(0);
  });
});
