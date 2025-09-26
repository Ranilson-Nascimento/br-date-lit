
import { BRHoliday, CalendarOptions, Weekday, HolidayProvider } from "./types";
import { at00, isWeekend, addDays, rangeDays, sameYMD } from "./utils";
import {
  ensureNational,
  getStateHolidays,
  getMunicipalHolidays,
  fetchFromProviders
} from "./holidays";


export type Calendar = {

  options: Required<CalendarOptions>;
  listHolidays: (year: number, scope?: "national" | "all") => Promise<BRHoliday[]>;
  isHoliday: (date: Date) => Promise<BRHoliday | null>;
  isBusinessDay: (date: Date) => Promise<boolean>;
  nextBusinessDay: (date: Date, n?: number) => Promise<Date>;
  previousBusinessDay: (date: Date, n?: number) => Promise<Date>;
  addBusinessDays: (date: Date, n: number) => Promise<Date>;
  businessDaysBetween: (start: Date, end: Date, inclusive?: boolean) => Promise<number>;
  businessMeasureBetween: (start: Date, end: Date, inclusive?: boolean) => Promise<number>;
  listBusinessDays: (start: Date, end: Date, inclusive?: boolean) => Promise<Date[]>;
  adjustDueDateFiscal: (date: Date) => Promise<Date>;
  isHalfDay: (date: Date) => Promise<boolean>;
  monthlyReport: (year: number) => Promise<{month:number,totalBusiness:number,full:number,half:number}[]>;
};

const DEFAULTS: Required<CalendarOptions> = {
  profile: "comercial",
  workingDays: [1,2,3,4,5],
  includeCarnaval: true,
  includeCorpusChristi: true,
  includeGoodFriday: true,
  includeNational: true,
  includeState: true,
  includeMunicipal: true,
  tz: "America/Sao_Paulo",
  state: undefined as any,
  city: undefined as any,
  providers: [],
  workdayHours: 8,
  cache: undefined as any
};

export function createCalendar(opts?: CalendarOptions): Calendar {
  const options = { ...DEFAULTS, ...(opts ?? {}) };
  const workingSet = new Set<Weekday>(options.workingDays);

  async function resolveYear(year: number): Promise<BRHoliday[]> {
    const locals: BRHoliday[] = [];
    if (options.includeNational) {
      locals.push(...ensureNational(year, {
        includeCarnaval: options.includeCarnaval,
        includeCorpusChristi: options.includeCorpusChristi,
        includeGoodFriday: options.includeGoodFriday
      }));
    }
    if (options.includeState && options.state) {
      locals.push(...getStateHolidays(options.state, year));
    }
    if (options.includeMunicipal && options.state && options.city) {
      locals.push(...getMunicipalHolidays(options.state, options.city, year));
    }

    // tenta providers remotos (merge por data/nome)
    let remotes: BRHoliday[] = [];
    if (options.providers && options.providers.length) {
      try {
        remotes = await fetchFromProviders(year, options.providers as HolidayProvider[], options.cache as any);
      } catch {}
    }

    // Merge simples: preferir remotos (podem conter feriados extras), evitar duplicatas por YMD+name
    const dedup = new Map<string, BRHoliday>();
    for (const h of [...locals, ...remotes]) {
      const key = `${h.date.getFullYear()}-${h.date.getMonth()}-${h.date.getDate()}-${h.name}`;
      if (!dedup.has(key)) dedup.set(key, h);
    }
    return [...dedup.values()].sort((a,b) => a.date.getTime() - b.date.getTime());
  }

  async function listHolidays(year: number, _scope: "national" | "all" = "all"): Promise<BRHoliday[]> {
    return resolveYear(year);
  }

  async function isHoliday(date: Date): Promise<BRHoliday | null> {
    const d = at00(date);
    const y = d.getFullYear();
    const hols = await resolveYear(y);
    for (const h of hols) {
      if (sameYMD(h.date, d)) return h;
    }
    return null;
  }

  async function getWorkHoursForDate(date: Date): Promise<number | null> {
    const h = await isHoliday(date);
    if (!h) return null;
    if (h.halfDay && !h.workHours) return Math.max(1, Math.floor(options.workdayHours / 2)); // default half = 50%
    if (typeof h.workHours === 'number') return h.workHours;
    return 0; // feriado integral -> 0 horas
  }


  async function isHalfDay(date: Date): Promise<boolean> {
    const d = at00(date);
    const h = await isHoliday(d);
    if (!h) return false;
    if (h.halfDay) return true;
    if (typeof h.workHours === 'number') return h.workHours > 0 && h.workHours < options.workdayHours;
    return false;
  }

  async function isBusinessDay(date: Date): Promise<boolean> {
    const d = at00(date);
    const weekday = d.getDay() as Weekday;
    if (!workingSet.has(weekday)) return false;
    if (await isHoliday(d)) return false;
    return true;
  }

  async function step(date: Date, dir: 1 | -1): Promise<Date> {
    let cur = new Date(date);
    do {
      cur = addDays(cur, dir);
    } while (!(await isBusinessDay(cur)));
    return cur;
  }

  async function nextBusinessDay(date: Date, n = 1): Promise<Date> {
    if (n <= 0) return at00(date);
    let cur = at00(date);
    for (let i = 0; i < n; i++) cur = await step(cur, 1);
    return cur;
  }

  async function previousBusinessDay(date: Date, n = 1): Promise<Date> {
    if (n <= 0) return at00(date);
    let cur = at00(date);
    for (let i = 0; i < n; i++) cur = await step(cur, -1);
    return cur;
  }

  async function addBusinessDays(date: Date, n: number): Promise<Date> {
    if (n === 0) return at00(date);
    return n > 0 ? nextBusinessDay(date, n) : previousBusinessDay(date, -n);
  }


async function listBusinessDays(start: Date, end: Date, inclusive = false): Promise<Date[]> {
  const out: Date[] = [];
  if (at00(start) > at00(end)) return out;
  for (const d of rangeDays(start, end, inclusive)) {
    if (await isBusinessDay(d)) out.push(d);
  }
  return out;
}

async function businessDaysBetween(start: Date, end: Date, inclusive = false): Promise<number> {

    if (at00(start) > at00(end)) return -(await businessDaysBetween(end, start, inclusive));
    let count = 0;
    for (const d of rangeDays(start, end, inclusive)) {
      if (await isBusinessDay(d)) count++;
    }

  return count;
}

// Regras fiscais clássicas: se cair em fim de semana/feriado, joga para o próximo dia útil
async function adjustDueDateFiscal(date: Date): Promise<Date> {
  let d = at00(date);
  if (await isBusinessDay(d)) return d;
  return nextBusinessDay(d, 1);
}

async function businessMeasureBetween(start: Date, end: Date, inclusive = false): Promise<number> {
  if (at00(start) > at00(end)) return -(await businessMeasureBetween(end, start, inclusive));
  let measure = 0;
  for (const d of rangeDays(start, end, inclusive)) {
    if (await isBusinessDay(d)) measure += 1;
    else if (await isHalfDay(d)) measure += 0.5;
  }
  return measure;
}

async function monthlyReport(year: number): Promise<{month:number,totalBusiness:number,full:number,half:number}[]> {
  const out: {month:number,totalBusiness:number,full:number,half:number}[] = [];
  for (let m = 0; m < 12; m++) {
    const start = new Date(year, m, 1);
    const end = new Date(year, m + 1, 0);
    let full = 0;
    let half = 0;
    for (const d of rangeDays(start, end, true)) {
      if (await isBusinessDay(d)) full++;
      else if (await isHalfDay(d)) half++;
    }
    const totalBusiness = full + half * 0.5;
    out.push({ month: m + 1, totalBusiness, full, half });
  }
  return out;
}

  return {
    options,
    listHolidays,
    isHoliday,
    isBusinessDay,
    nextBusinessDay,
    previousBusinessDay,
    addBusinessDays,
    businessDaysBetween,
    businessMeasureBetween,
    listBusinessDays,
    adjustDueDateFiscal,
    isHalfDay,
    monthlyReport
  };
}
