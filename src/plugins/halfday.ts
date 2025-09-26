
import { BRHoliday } from "../types";
import { at00 } from "../utils";
import { registerStateHolidays, registerMunicipalHolidays } from "../holidays";

/** Registra datas de meio-expediente (contam 0.5 dia útil no relatório) */
export function registerHalfDays(uf: string, year: number, datesISO: string[], city?: string) {
  const items: BRHoliday[] = datesISO.map((iso, idx) => ({
    id: `halfday_${iso.replace(/-/g,'')}_${idx}`,
    name: "Meio Expediente",
    scope: city ? "municipal" : "state",
    state: uf.toUpperCase(),
    city,
    date: at00(new Date(iso)),
    movable: false,
    halfDay: true
  }));

  if (city) registerMunicipalHolidays(uf, city, year, items);
  else registerStateHolidays(uf, year, items);
}


/** Registra meio-expediente por HORAS específicas (ex.: 4 horas) */
export function registerHalfDayRanges(uf: string, year: number, entries: { dateISO: string; hours: number; city?: string }[]) {
  const items: BRHoliday[] = entries.map((e, idx) => ({
    id: `halfday_hours_${e.dateISO.replace(/-/g,'')}_${idx}`,
    name: "Meio Expediente (horas)",
    scope: e.city ? "municipal" : "state",
    state: uf.toUpperCase(),
    city: e.city,
    date: at00(new Date(e.dateISO)),
    movable: false,
    halfDay: e.hours > 0,
    workHours: e.hours
  }));
  for (const it of items) {
    if (it.city) registerMunicipalHolidays(it.state!, it.city, year, [it]);
    else registerStateHolidays(it.state!, year, [it]);
  }
}
