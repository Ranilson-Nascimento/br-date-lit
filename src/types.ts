
export type BRHoliday = {
  date: Date;
  id: string;
  name: string;
  scope: "national" | "state" | "municipal";
  state?: string;
  city?: string;
  movable?: boolean;
  rawSource?: string; // opcional: info do provider
  halfDay?: boolean; // marca meio-expediente
  workHours?: number; // horas de trabalho específicas para o dia

  /** cache de resultados remotos (por ano) */
  cache?: import("./cache").CacheProvider<any>;
};


export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type CalendarProfile = "comercial" | "bancario" | "fiscal" | "custom";

export type CalendarOptions = {
  profile?: CalendarProfile;
  workingDays?: Weekday[];
  includeCarnaval?: boolean;
  includeCorpusChristi?: boolean;
  includeGoodFriday?: boolean;
  includeNational?: boolean;
  includeState?: boolean;
  includeMunicipal?: boolean;
  tz?: "America/Sao_Paulo";
  state?: string;
  city?: string;
  /** provedores remotos opcionais (executados por ano) */
  providers?: HolidayProvider[];
  /** horas padrão de expedientes (default 8) */
  workdayHours?: number;

  /** cache de resultados remotos (por ano) */
  cache?: import("./cache").CacheProvider<any>;
};


export type HolidayRegistry = {
  national: Record<number, BRHoliday[]>;
  state: Record<string, Record<number, BRHoliday[]>>;
  municipal: Record<string, Record<number, BRHoliday[]>>;

  /** cache de resultados remotos (por ano) */
  cache?: import("./cache").CacheProvider<any>;
};


export type HolidayProvider = {
  name: string;
  fetchYear: (year: number, abort: AbortSignal) => Promise<BRHoliday[]>;
  timeoutMs?: number;
  retries?: number;

  /** cache de resultados remotos (por ano) */
  cache?: import("./cache").CacheProvider<any>;
};

