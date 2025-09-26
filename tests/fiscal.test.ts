
import { describe, it, expect } from "vitest";
import { createCalendar } from "../src";

describe("Fiscal rules", () => {
  it("ajusta vencimento caindo em feriado para próximo dia útil", async () => {
    const cal = createCalendar({ profile: "fiscal" });
    const out = await cal.adjustDueDateFiscal(new Date(2025, 11, 25)); // 25/12/2025
    expect(out.getTime()).not.toBe(new Date(2025, 11, 25).setHours(0,0,0,0));
  });
});
