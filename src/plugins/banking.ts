
import { BRHoliday } from "../types";
import { at00 } from "../utils";
import { registerStateHolidays, registerMunicipalHolidays } from "../holidays";

/**
 * Plugin de regras bancárias: permite registrar datas adicionais de não funcionamento
 * (ex.: vésperas específicas) via dataset ou código. Mantemos genérico por UF/cidade.
 */

export function registerBankingClosures(uf: string, year: number, datesISO: string[], city?: string) {
  const closures: BRHoliday[] = datesISO.map((iso, idx) => ({
    id: `bancario_${iso.replace(/-/g,'')}_${idx}`,
    name: "Fechamento Bancário",
    scope: city ? "municipal" : "state",
    state: uf.toUpperCase(),
    city,
    date: at00(new Date(iso)),
    movable: false
  }));

  if (city) {
    registerMunicipalHolidays(uf, city, year, closures);
  } else {
    registerStateHolidays(uf, year, closures);
  }
}
