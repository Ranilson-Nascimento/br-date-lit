
import { createServer } from "node:http";
import { URL } from "node:url";
import { createCalendar, Providers, MemoryCache, parseBR, toBR } from "../../src/index.ts";

const cal = createCalendar({
  profile: "comercial",
  providers: [Providers.brasilApi(), Providers.nagerDate()],
  cache: new MemoryCache()
});

const server = createServer(async (req, res) => {
  try {
    if (!req.url) { res.statusCode = 404; return res.end(); }
    const url = new URL(req.url, "http://localhost");
    res.setHeader("Content-Type", "application/json; charset=utf-8");

    if (url.pathname === "/is-holiday") {
      const date = url.searchParams.get("date"); // yyyy-mm-dd ou dd/MM/yyyy
      if (!date) throw new Error("date= obrigatório");
      const d = date.includes("/") ? parseBR(date) : new Date(date);
      const h = await cal.isHoliday(d);
      return res.end(JSON.stringify({ date: d.toISOString().slice(0,10), holiday: h?.name || null }));
    }

    
    if (url.pathname === "/table") {
      const year = Number(url.searchParams.get("year") || new Date().getFullYear());
      const state = url.searchParams.get("state") || undefined;
      const city = url.searchParams.get("city") || undefined;
      const c = state || city ? createCalendar({ state, city, providers: [Providers.brasilApi(), Providers.nagerDate()], cache: new MemoryCache() })
                              : cal;
      const hols = await c.listHolidays(year);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      const rows = hols.map(h => `<tr><td>${h.date.toISOString().slice(0,10)}</td><td>${h.name}</td><td>${h.scope}${h.state? " / "+h.state:""}${h.city? " / "+h.city:""}</td></tr>`).join("");
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Feriados ${year}</title>
      <style>body{font-family:ui-sans-serif,system-ui}table{border-collapse:collapse}td,th{border:1px solid #ddd;padding:6px 10px}</style>
      </head><body><h1>Feriados ${year}${state? " - "+state:""}${city? " - "+city:""}</h1><table><thead><tr><th>Data</th><th>Nome</th><th>Escopo</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
      return res.end(html);
    }
    
    
    if (url.pathname === "/calendar.csv") {
      const year = Number(url.searchParams.get("year") || new Date().getFullYear());
      const state = url.searchParams.get("state") || undefined;
      const city = url.searchParams.get("city") || undefined;
      const c = state || city ? createCalendar({ state, city, providers: [Providers.brasilApi(), Providers.nagerDate()], cache: new MemoryCache() })
                              : cal;
      const hols = await c.listHolidays(year);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      const rows = ["date,name,scope,state,city"].concat(
        hols.map(h => `${h.date.toISOString().slice(0,10)},"${h.name.replace(/"/g,'""')}",${h.scope||""},${h.state||""},${h.city||""}`)
      );
      return res.end(rows.join("\n"));
    }
    
    
    
    if (url.pathname === "/report.html") {
      const year = Number(url.searchParams.get("year") || new Date().getFullYear());
      const state = url.searchParams.get("state") || undefined;
      const city = url.searchParams.get("city") || undefined;
      const c = state || city ? createCalendar({ state, city, providers: [Providers.brasilApi(), Providers.nagerDate()], cache: new MemoryCache() })
                              : cal;
      const rep = await c.monthlyReport(year);
      res.setHeader("Content-Type", "text/html; charset=utf-8");

      // build simple SVG bar chart
      const maxVal = Math.max(...rep.map(r => r.totalBusiness), 1);
      const w = 700, h = 300, pad = 40, bw = (w - pad*2) / rep.length;
      const bars = rep.map((r,i) => {
        const bh = Math.round((r.totalBusiness / maxVal) * (h - pad*2));
        const x = pad + i*bw + 5;
        const y = h - pad - bh;
        return `<rect x="${x}" y="${y}" width="${bw-10}" height="${bh}" fill="currentColor" opacity="0.7"></rect>
                <text x="${x + (bw-10)/2}" y="${h - pad + 14}" font-size="10" text-anchor="middle">${r.month}</text>`;
      }).join("");

      const yTicks = Array.from({length:5}, (_,i)=> Math.round(maxVal*i/4));
      const yLabels = yTicks.map(v => {
        const y = h - pad - Math.round((v/maxVal)*(h-pad*2));
        return `<line x1="${pad-5}" y1="${y}" x2="${w-pad}" y2="${y}" stroke="#ddd" />
                <text x="${pad-10}" y="${y+3}" font-size="10" text-anchor="end">${v}</text>`;
      }).join("");

      const html = `<!doctype html><html><head><meta charset="utf-8">
      <title>Relatório ${year}${state? " - "+state:""}${city? " - "+city:""}</title>
      <style>
      :root { color-scheme: light dark; }
      body{font-family:ui-sans-serif,system-ui;margin:20px}
      .wrap{max-width:900px;margin:auto}
      .chart{color:#0ea5e9}
      table{border-collapse:collapse;margin-top:16px}
      td,th{border:1px solid #ddd;padding:6px 10px}
      </style></head><body>
      <div class="wrap">
        <h1>Relatório de Dias Úteis — ${year} ${state? " / "+state:""} ${city? " / "+city:""}</h1>
        <svg viewBox="0 0 ${w} ${h}" class="chart">
          <line x1="${pad}" y1="${h-pad}" x2="${w-pad}" y2="${h-pad}" stroke="#888" />
          <line x1="${pad}" y1="${pad}" x2="${pad}" y2="${h-pad}" stroke="#888" />
          ${yLabels}
          ${bars}
          <text x="${w/2}" y="${h-5}" font-size="12" text-anchor="middle">Mês</text>
          <text x="12" y="${h/2}" font-size="12" transform="rotate(-90 12,${h/2})" text-anchor="middle">Dias úteis (equivalentes)</text>
        </svg>
        <table>
          <thead><tr><th>Mês</th><th>Dias úteis (equivalentes)</th><th>Inteiros</th><th>Half-day</th></tr></thead>
          <tbody>
            ${rep.map(r=>`<tr><td>${r.month}</td><td>${r.totalBusiness.toFixed(2)}</td><td>${r.full}</td><td>${r.half}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
      </body></html>`;
      return res.end(html);
    }
    
    
    if (url.pathname === "/calendar.ics") {
      const year = Number(url.searchParams.get("year") || new Date().getFullYear());
      const state = url.searchParams.get("state") || undefined;
      const city = url.searchParams.get("city") || undefined;
      const mode = (url.searchParams.get("mode") || "holidays").toLowerCase(); // holidays | business | all

      const c = state || city ? createCalendar({ state, city, providers: [Providers.brasilApi(), Providers.nagerDate()], cache: new MemoryCache() })
                              : cal;
      const hols = await c.listHolidays(year);
      const fmt = (d: Date) => d.toISOString().slice(0,10).replace(/-/g,"");
      const escape = (s: string) => s.replace(/([,;])/g, "\\$1");

      let events: string[] = [];

      if (mode === "holidays" || mode === "all") {
        for (const h of hols) {
          const dt = fmt(h.date);
          const title = h.halfDay ? `Meio Expediente — ${h.name}` : h.name;
          events.push(
            "BEGIN:VEVENT\n"
            + `UID:${dt}-${encodeURIComponent(h.id || h.name)}@br-date-lit\n`
            + `DTSTAMP:${dt}T000000Z\n`
            + `DTSTART;VALUE=DATE:${dt}\n`
            + `SUMMARY:${escape(title)}\n`
            + `CATEGORIES:${h.scope || "other"}\n`
            + (h.state ? `LOCATION:${h.state}${h.city ? " - " + escape(h.city) : ""}\n` : "")
            + "END:VEVENT"
          );
        }
      }

      if (mode === "business" || mode === "all") {
        const start = new Date(year, 0, 1);
        const end = new Date(year, 11, 31);
        // build a set of holiday dates for quick check
        const holSet = new Set(hols.map(h => h.date.toISOString().slice(0,10)));
        for (let d = new Date(start); d <= end; d.setDate(d.getDate()+1)) {
          const iso = d.toISOString().slice(0,10);
          const dow = d.getDay();
          const isWeekend = (dow === 0 || dow === 6);
          // business day if not weekend and not in holSet or halfDay with hours>0 will still be business;
          // for ICS we add "Dia Útil" for any isBusinessDay true
          const isBiz = await c.isBusinessDay(d);
          if (isBiz) {
            const dt = fmt(d);
            events.push(
              "BEGIN:VEVENT\n"
              + `UID:biz-${dt}@br-date-lit\n`
              + `DTSTAMP:${dt}T000000Z\n`
              + `DTSTART;VALUE=DATE:${dt}\n`
              + `SUMMARY:Dia Útil\n`
              + "CATEGORIES:business\n"
              + "END:VEVENT"
            );
          }
        }
      }

      const ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//br-date-lit//BR//PT-BR\n"
        + events.join("\n") + "\nEND:VCALENDAR\n";

      res.setHeader("Content-Type", "text/calendar; charset=utf-8");
      return res.end(ics);
    }
    
    if (url.pathname === "/report.json") {
      const year = Number(url.searchParams.get("year") || new Date().getFullYear());
      const state = url.searchParams.get("state") || undefined;
      const city = url.searchParams.get("city") || undefined;
      const c = state || city ? createCalendar({ state, city, providers: [Providers.brasilApi(), Providers.nagerDate()], cache: new MemoryCache() })
                              : cal;
      const rep = await c.monthlyReport(year);
      return res.end(JSON.stringify({ year, report: rep }));
    }

    if (url.pathname === "/report.csv") {
      const year = Number(url.searchParams.get("year") || new Date().getFullYear());
      const state = url.searchParams.get("state") || undefined;
      const city = url.searchParams.get("city") || undefined;
      const c = state || city ? createCalendar({ state, city, providers: [Providers.brasilApi(), Providers.nagerDate()], cache: new MemoryCache() })
                              : cal;
      const rep = await c.monthlyReport(year);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      const rows = ["month,totalBusiness,full,half"].concat(rep.map(r => `${r.month},${r.totalBusiness},${r.full},${r.half}`));
      return res.end(rows.join("\n"));
    }
    
    if (url.pathname === "/next-business-day") {
      const date = url.searchParams.get("date");
      if (!date) throw new Error("date= obrigatório");
      const d = date.includes("/") ? parseBR(date) : new Date(date);
      const n = await cal.nextBusinessDay(d, 1);
      return res.end(JSON.stringify({ date: d.toISOString().slice(0,10), next: n.toISOString().slice(0,10) }));
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ error: "not found" }));
  } catch (e: any) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: e?.message || String(e) }));
  }
});

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  server.listen(port, () => console.log("Demo API listening on :" + port));
}

export default server;
