
import { describe, it, expect } from "vitest";
import { loadDataDir, registerFromData, createCalendar } from "../src";

describe("Dataset loader", () => {
  it("importa JSON/CSV e registra no calendário", async () => {
    const data = loadDataDir(__dirname + "/../dataset");
    registerFromData(data);
    const cal = createCalendar({ state: "SP", city: "São Paulo" });
    const hols = await cal.listHolidays(2026);
    const names = hols.map(h => h.id);
    expect(names).toContain("aniversario_sp");
    expect(names).toContain("revolucao_constitucionalista");
  });
});
