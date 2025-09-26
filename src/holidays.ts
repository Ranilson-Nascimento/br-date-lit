
import { BRHoliday, HolidayRegistry, HolidayProvider } from "./types";
import { at00, addDays, withTimeout } from "./utils";

const REGISTRY: HolidayRegistry = {
  national: {},
  state: {},
  municipal: {},
};

// ----------------- Cálculo de Páscoa -----------------
export function easterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const L = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * L) / 451);
  const month = Math.floor((h + L - 7 * m + 114) / 31);
  const day = ((h + L - 7 * m + 114) % 31) + 1;
  return at00(new Date(year, month - 1, day));
}

function nationalFixed(year: number): BRHoliday[] {
  return [
    { id: "confraternizacao_universal", name: "Confraternização Universal", scope: "national", date: at00(new Date(year, 0, 1)), movable: false },
    { id: "tiradentes", name: "Tiradentes", scope: "national", date: at00(new Date(year, 3, 21)), movable: false },
    { id: "dia_trabalho", name: "Dia do Trabalho", scope: "national", date: at00(new Date(year, 4, 1)), movable: false },
    { id: "independencia", name: "Independência do Brasil", scope: "national", date: at00(new Date(year, 8, 7)), movable: false },
    { id: "nossa_senhora_aparecida", name: "Nossa Senhora Aparecida", scope: "national", date: at00(new Date(year, 9, 12)), movable: false },
    { id: "finados", name: "Finados", scope: "national", date: at00(new Date(year, 10, 2)), movable: false },
    { id: "proclamacao_republica", name: "Proclamação da República", scope: "national", date: at00(new Date(year, 10, 15)), movable: false },
    { id: "natal", name: "Natal", scope: "national", date: at00(new Date(year, 11, 25)), movable: false }
  ];
}

function nationalMovable(year: number, opts: {
  includeCarnaval: boolean;
  includeCorpusChristi: boolean;
  includeGoodFriday: boolean;
}): BRHoliday[] {
  const pascoa = easterDate(year);
  const sextaSanta = addDays(pascoa, -2);
  const carnavalTer = addDays(pascoa, -47);
  const carnavalSeg = addDays(pascoa, -48);
  const corpusChristi = addDays(pascoa, 60);

  const result: BRHoliday[] = [];
  if (opts.includeGoodFriday) {
    result.push({ id: "sexta_feira_santa", name: "Sexta-feira Santa", scope: "national", date: at00(sextaSanta), movable: true });
  }
  if (opts.includeCarnaval) {
    result.push({ id: "carnaval_segunda", name: "Carnaval (Segunda)", scope: "national", date: at00(carnavalSeg), movable: true });
    result.push({ id: "carnaval_terca", name: "Carnaval (Terça)", scope: "national", date: at00(carnavalTer), movable: true });
  }
  if (opts.includeCorpusChristi) {
    result.push({ id: "corpus_christi", name: "Corpus Christi", scope: "national", date: at00(corpusChristi), movable: true });
  }
  return result;
}

export function ensureNational(year: number, opts?: Partial<{ includeCarnaval: boolean; includeCorpusChristi: boolean; includeGoodFriday: boolean; }>): BRHoliday[] {
  const options = {
    includeCarnaval: opts?.includeCarnaval ?? true,
    includeCorpusChristi: opts?.includeCorpusChristi ?? true,
    includeGoodFriday: opts?.includeGoodFriday ?? true
  };
  if (!REGISTRY.national[year]) {
    REGISTRY.national[year] = [...nationalFixed(year), ...nationalMovable(year, options)];
  }
  return REGISTRY.national[year];
}

// Registro local (state/municipal)
export function registerStateHolidays(uf: string, year: number, holidays: BRHoliday[]): void {
  const UF = uf.toUpperCase();
  if (!REGISTRY.state[UF]) REGISTRY.state[UF] = {};
  REGISTRY.state[UF][year] = holidays.map(h => ({ ...h, scope: "state", state: UF }));
}

export function registerMunicipalHolidays(uf: string, city: string, year: number, holidays: BRHoliday[]): void {
  const key = `${uf.toUpperCase()}|${city}`;
  if (!REGISTRY.municipal[key]) REGISTRY.municipal[key] = {};
  REGISTRY.municipal[key][year] = holidays.map(h => ({ ...h, scope: "municipal", state: uf.toUpperCase(), city }));
}

export function getStateHolidays(uf: string, year: number): BRHoliday[] {
  const UF = uf.toUpperCase();
  return REGISTRY.state[UF]?.[year] ?? [];
}

export function getMunicipalHolidays(uf: string, city: string, year: number): BRHoliday[] {
  const key = `${uf.toUpperCase()}|${city}`;
  return REGISTRY.municipal[key]?.[year] ?? [];
}

// ----------------- Provedores Remotos -----------------
const yearRemoteCache: Record<string, BRHoliday[]> = {};

export async function fetchFromProviders(year: number, providers: HolidayProvider[], cache?: { get: (k:string)=>Promise<BRHoliday[]|undefined>|BRHoliday[]|undefined; set: (k:string,v:BRHoliday[],ttl?:number)=>any }): Promise<BRHoliday[]> {
  const key = String(year);
  if (yearRemoteCache[key]) return yearRemoteCache[key];
  if (cache) {
    const cached = await cache.get(`year:${key}`) as BRHoliday[] | undefined;
    if (cached && cached.length) {
      yearRemoteCache[key] = cached;
      return cached;
    }
  }

  for (const p of providers) {
    try {
      const controller = new AbortController();
      const timeout = p.timeoutMs ?? 2500;
      const retries = p.retries ?? 1;

      let lastErr: any;
      for (let i = 0; i <= retries; i++) {
        try {
          const data = await withTimeout(p.fetchYear(year, controller.signal), timeout, controller);
          if (Array.isArray(data) && data.length) {
            yearRemoteCache[key] = data;
            return data;
          }
        } catch (e) {
          lastErr = e;
        }
      }
      if (lastErr) throw lastErr;
    } catch {
      // ignora e tenta próximo provider
    }
  }

  return [];
}


export function __clearRemoteCache() {
  for (const k of Object.keys(yearRemoteCache)) delete yearRemoteCache[k];
}
