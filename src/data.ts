
import { BRHoliday } from "./types";
import { at00 } from "./utils";
import { registerStateHolidays, registerMunicipalHolidays } from "./holidays";
import * as fs from "node:fs";
import * as path from "node:path";

export type DataHolidayRecord = {
  year: number;
  scope: "state" | "municipal";
  uf: string;
  city?: string;
  id: string;
  name: string;
  date: string; // yyyy-mm-dd
  movable?: boolean;
};

export type DataFile = {
  version: 1;
  source?: string;
  holidays: DataHolidayRecord[];
};

export function parseIsoDate(d: string): Date {
  const x = new Date(d);
  if (isNaN(x.getTime())) {
    const [Y,M,D] = d.split("-").map(Number);
    return at00(new Date(Y, (M||1)-1, D||1));
  }
  return at00(new Date(x.getFullYear(), x.getMonth(), x.getDate()));
}

export function registerFromData(data: DataFile) {
  if (!data?.holidays?.length) return;
  const byUFYear: Record<string, Record<number, BRHoliday[]>> = {};
  const byCityYear: Record<string, Record<number, BRHoliday[]>> = {};

  for (const r of data.holidays) {
    const h: BRHoliday = {
      id: r.id,
      name: r.name,
      scope: r.scope,
      state: r.uf.toUpperCase(),
      city: r.city,
      date: parseIsoDate(r.date),
      movable: !!r.movable
    };
    if (r.scope === "state") {
      byUFYear[h.state!] ||= {};
      byUFYear[h.state!] [r.year] ||= [];
      byUFYear[h.state!] [r.year].push(h);
    } else if (r.scope === "municipal" && h.city) {
      const key = `${h.state}|${h.city}`;
      byCityYear[key] ||= {};
      byCityYear[key][r.year] ||= [];
      byCityYear[key][r.year].push(h);
    }
  }

  for (const uf of Object.keys(byUFYear)) {
    for (const yearStr of Object.keys(byUFYear[uf])) {
      registerStateHolidays(uf, Number(yearStr), byUFYear[uf][Number(yearStr)]);
    }
  }
  for (const key of Object.keys(byCityYear)) {
    const [uf, city] = key.split("|");
    for (const yearStr of Object.keys(byCityYear[key])) {
      registerMunicipalHolidays(uf, city, Number(yearStr), byCityYear[key][Number(yearStr)]);
    }
  }
}

export function loadJsonFile(filePath: string): DataFile {
  const raw = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(raw);
  if (data.version !== 1) throw new Error("Versão de data não suportada");
  return data as DataFile;
}

export function loadCsvFile(filePath: string): DataFile {
  const raw = fs.readFileSync(filePath, "utf8");
  const holidays: DataHolidayRecord[] = [];
  // CSV header: year,scope,uf,city,id,name,date,movable
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const header = lines.shift();
  if (!header) throw new Error("CSV vazio");
  for (const line of lines) {
    const parts = line.split(","); // simples; se precisar de aspas, trocar por parser
    const [year, scope, uf, city, id, name, date, movable] = parts;
    holidays.push({
      year: Number(year),
      scope: scope as any,
      uf,
      city: city || undefined,
      id,
      name,
      date,
      movable: movable === "true"
    });
  }
  return { version: 1, holidays };
}

export function loadDataDir(dir: string): DataFile {
  const holidays: DataHolidayRecord[] = [];
  const walk = (p: string) => {
    for (const entry of fs.readdirSync(p, { withFileTypes: true })) {
      const full = path.join(p, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) {
        if (entry.name.endsWith(".json")) {
          const data = loadJsonFile(full);
          holidays.push(...data.holidays);
        } else if (entry.name.endsWith(".csv")) {
          const data = loadCsvFile(full);
          holidays.push(...data.holidays);
        }
      }
    }
  };
  walk(dir);
  return { version: 1, holidays };
}
