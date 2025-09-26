
import { BRHoliday, HolidayProvider } from "./types";

function normDate(d: string | Date): Date {
  if (d instanceof Date) return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  // tenta ISO yyyy-mm-dd
  const x = new Date(d);
  if (!isNaN(x.getTime())) return new Date(x.getFullYear(), x.getMonth(), x.getDate(), 0, 0, 0, 0);
  // fallback parse manual yyyy-mm-dd
  const [Y, M, D] = d.split("-").map(Number);
  return new Date(Y, (M || 1)-1, D || 1, 0,0,0,0);
}

export const Providers = {
  /** BrasilAPI feriados: https://brasilapi.com.br/api/feriados/v1/{ano} */
  brasilApi: (base = "https://brasilapi.com.br") : HolidayProvider => ({
    name: "BrasilAPI",
    timeoutMs: 2500,
    retries: 1,
    async fetchYear(year: number, _abort: AbortSignal) {
      // Node >= 18 tem fetch global
      const url = `${base}/api/feriados/v1/${year}`;
      const res = await fetch(url, { signal: _abort });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // Formato esperado: [{date:'2025-01-01', name:'Confraternização...', type:'national'}]
      const list: BRHoliday[] = (json as any[]).map((h: any) => ({
        id: (h?.name || "").toLowerCase().replace(/\s+/g,"_").normalize("NFD").replace(/[^\w_]+/g,""),
        name: String(h?.name || "Feriado"),
        scope: "national", // BrasilAPI expõe escopo? Em geral 'national'.
        date: normDate(String(h?.date)),
        movable: false,
        rawSource: "BrasilAPI"
      }));
      return list;
    }
  }),

  /** Nager.Date: https://date.nager.at/api/v3/PublicHolidays/{year}/BR */
  nagerDate: (base = "https://date.nager.at") : HolidayProvider => ({
    name: "NagerDate",
    timeoutMs: 2500,
    retries: 1,
    async fetchYear(year: number, _abort: AbortSignal) {
      const url = `${base}/api/v3/PublicHolidays/${year}/BR`;
      const res = await fetch(url, { signal: _abort });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // Formato: [{date:'2025-11-15', localName:'Proclamação da República', ...}]
      const list: BRHoliday[] = (json as any[]).map((h: any) => ({
        id: (h?.localName || h?.name || "feriado").toLowerCase().replace(/\s+/g,"_").normalize("NFD").replace(/[^\w_]+/g,""),
        name: String(h?.localName || h?.name || "Feriado"),
        scope: "national",
        date: normDate(String(h?.date)),
        movable: false,
        rawSource: "NagerDate"
      }));
      return list;
    }
  }),
  /** Calendarific: https://calendarific.com/api/v2/holidays (requer API key) */
  calendarific: (apiKey: string, base = "https://calendarific.com/api/v2") : HolidayProvider => ({
    name: "Calendarific",
    timeoutMs: 2500,
    retries: 1,
    async fetchYear(year: number, _abort: AbortSignal) {
      const url = `${base}/holidays?api_key=${apiKey}&country=BR&year=${year}`;
      const res = await fetch(url, { signal: _abort });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // Formato esperado: {response: {holidays: [{date:{iso:'2025-01-01'}, name:'Confraternização...', ...}]}}
      const holidays = json?.response?.holidays || [];
      const list: BRHoliday[] = holidays.map((h: any) => ({
        id: (h?.name || "").toLowerCase().replace(/\s+/g,"_").normalize("NFD").replace(/[^\w_]+/g,""),
        name: String(h?.name || "Feriado"),
        scope: "national",
        date: normDate(h?.date?.iso || h?.date),
        movable: false,
        rawSource: "Calendarific"
      }));
      return list;
    }
  })
};