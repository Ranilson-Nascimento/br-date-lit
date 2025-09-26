#!/usr/bin/env node
import { createCalendar, Providers } from "../src/index.js";

function parseArgs(argv: string[]) {
  const args = { _: [] as string[], state: undefined as string|undefined, city: undefined as string|undefined };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--state") { args.state = argv[++i]; continue; }
    if (a === "--city")  { args.city = argv[++i]; continue; }
    args._.push(a);
  }
  return args;
}

function toDateISO(s: string): Date {
  const d = new Date(s);
  if (isNaN(d.getTime())) throw new Error("Data inválida. Use yyyy-mm-dd.");
  d.setHours(0,0,0,0);
  return d;
}

async function main() {
  const args = parseArgs(process.argv);
  const [cmd, dateStr] = args._;
  if (!cmd) {
    console.log('Uso: br-date-lit <ish|next|prev|add|between> <data> [--state SP] [--city "São Paulo"]');
    process.exit(0);
  }

  const cal = createCalendar({
    state: args.state,
    city: args.city,
    providers: [Providers.brasilApi(), Providers.nagerDate()]
  });

  if (cmd === "ish") {
    const d = toDateISO(dateStr);
    const fer = await cal.isHoliday(d);
    console.log(fer ? `FERIADO: ${fer.name}` : "Não é feriado.");
    return;
  }

  if (cmd === "next") {
    const d = toDateISO(dateStr);
    const n = await cal.nextBusinessDay(d, 1);
    console.log(n.toISOString().slice(0,10));
    return;
  }

  if (cmd === "prev") {
    const d = toDateISO(dateStr);
    const p = await cal.previousBusinessDay(d, 1);
    console.log(p.toISOString().slice(0,10));
    return;
  }

  if (cmd === "add") {
    const [_, dd, nStr] = args._;
    const d = toDateISO(dd);
    const n = parseInt(nStr ?? "0", 10);
    const out = await cal.addBusinessDays(d, n);
    console.log(out.toISOString().slice(0,10));
    return;
  }

  if (cmd === "between") {
    const [_, d1, d2] = args._;
    const c = await cal.businessDaysBetween(toDateISO(d1), toDateISO(d2), true);
    console.log(c);
    return;
  }



if (cmd === "list") {
  const year = parseInt(dateStr, 10);
  if (isNaN(year)) throw new Error("Informe um ano válido, ex: 2027");
  const hols = await cal.listHolidays(year);
  for (const h of hols) console.log(`${h.date.toISOString().slice(0,10)} - ${h.name}`);
  return;
}

if (cmd === "fiscal") {
  const d = toDateISO(dateStr);
  const out = await cal.adjustDueDateFiscal(d);
  console.log(out.toISOString().slice(0,10));
  return;
}


if (cmd === "import") {
  const file = dateStr;
  if (!file) throw new Error("Informe o caminho do arquivo .json ou .csv");
  const { loadJsonFile, loadCsvFile, registerFromData } = await import("../src/data.js");
  const data = file.endsWith(".json") ? loadJsonFile(file) : loadCsvFile(file);
  registerFromData(data);
  console.log(`Importado ${data.holidays.length} feriados de ${file}`);
  return;
}

if (cmd === "import-dir") {
  const dir = dateStr;
  if (!dir) throw new Error("Informe o caminho do diretório");
  const { loadDataDir, registerFromData } = await import("../src/data.js");
  const data = loadDataDir(dir);
  registerFromData(data);
  console.log(`Importados ${data.holidays.length} feriados de ${dir}`);
  return;
}

if (cmd === "verify") {
  const year = parseInt(dateStr, 10);
  if (isNaN(year)) throw new Error("Informe um ano válido");
  const hols = await cal.listHolidays(year);
  const countMunicipal = hols.filter(h => h.scope === "municipal").length;
  const countState = hols.filter(h => h.scope === "state").length;
  const countNational = hols.filter(h => h.scope === "national").length;
  console.log(JSON.stringify({ year, total: hols.length, national: countNational, state: countState, municipal: countMunicipal }, null, 2));
  return;
}


if (cmd === "bank") {
  const d = toDateISO(dateStr);
  // usa as mesmas regras de calendário; closures bancárias devem ser registradas via dataset/plugin
  const n = await cal.nextBusinessDay(d, 1);
  console.log(n.toISOString().slice(0,10));
  return;
}


if (cmd === "report") {
  const year = parseInt(dateStr, 10);
  if (isNaN(year)) throw new Error("Informe um ano válido");
  const rep = await cal.monthlyReport(year);
  console.log(JSON.stringify({ year, report: rep }, null, 2));
  return;
}
  console.log("Comando desconhecido.");
}

main().catch(err => {
  console.error(err?.message || err);
  process.exit(1);
});
