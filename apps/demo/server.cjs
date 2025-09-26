const http = require('http');
const { URL } = require('url');
const pkg = require('../../dist/index.cjs');
const { createCalendar, Providers, MemoryCache, parseBR, toBR } = pkg;

const cal = createCalendar({
  profile: 'comercial',
  providers: [Providers.brasilApi(), Providers.nagerDate()],
  cache: new MemoryCache()
});

const server = http.createServer(async (req, res) => {
  try {
    if (!req.url) { res.statusCode = 404; return res.end(); }
    const url = new URL(req.url, 'http://localhost');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (url.pathname === '/is-holiday') {
      const date = url.searchParams.get('date');
      if (!date) throw new Error('date= obrigatório');
      const d = date.includes('/') ? parseBR(date) : new Date(date);
      const h = await cal.isHoliday(d);
      return res.end(JSON.stringify({ date: d.toISOString().slice(0,10), holiday: h?.name || null }));
    }

    if (url.pathname === '/table') {
      const year = Number(url.searchParams.get('year') || new Date().getFullYear());
      const state = url.searchParams.get('state') || undefined;
      const city = url.searchParams.get('city') || undefined;
      const c = state || city ? createCalendar({ state, city, providers: [Providers.brasilApi(), Providers.nagerDate()], cache: new MemoryCache() }) : cal;
      const hols = await c.listHolidays(year);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      const rows = hols.map(h => `<tr><td>${h.date.toISOString().slice(0,10)}</td><td>${h.name}</td><td>${h.scope}${h.state? ' / '+h.state:''}${h.city? ' / '+h.city:''}</td></tr>`).join('');
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Feriados ${year}</title>
      <style>body{font-family:ui-sans-serif,system-ui}table{border-collapse:collapse}td,th{border:1px solid #ddd;padding:6px 10px}</style>
      </head><body><h1>Feriados ${year}${state? ' - '+state:''}${city? ' - '+city:''}</h1><table><thead><tr><th>Data</th><th>Nome</th><th>Escopo</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
      return res.end(html);
    }

    if (url.pathname === '/calendar.csv') {
      const year = Number(url.searchParams.get('year') || new Date().getFullYear());
      const state = url.searchParams.get('state') || undefined;
      const city = url.searchParams.get('city') || undefined;
      const c = state || city ? createCalendar({ state, city, providers: [Providers.brasilApi(), Providers.nagerDate()], cache: new MemoryCache() }) : cal;
      const hols = await c.listHolidays(year);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      const rows = ['date,name,scope,state,city'].concat(
        hols.map(h => `${h.date.toISOString().slice(0,10)},"${h.name.replace(/"/g,'""')}",${h.scope||''},${h.state||''},${h.city||''}`)
      );
      return res.end(rows.join('\n'));
    }

    if (url.pathname === '/report.json') {
      const year = Number(url.searchParams.get('year') || new Date().getFullYear());
      const state = url.searchParams.get('state') || undefined;
      const city = url.searchParams.get('city') || undefined;
      const c = state || city ? createCalendar({ state, city, providers: [Providers.brasilApi(), Providers.nagerDate()], cache: new MemoryCache() }) : cal;
      const rep = await c.monthlyReport(year);
      return res.end(JSON.stringify({ year, report: rep }));
    }

    if (url.pathname === '/report.csv') {
      const year = Number(url.searchParams.get('year') || new Date().getFullYear());
      const state = url.searchParams.get('state') || undefined;
      const city = url.searchParams.get('city') || undefined;
      const c = state || city ? createCalendar({ state, city, providers: [Providers.brasilApi(), Providers.nagerDate()], cache: new MemoryCache() }) : cal;
      const rep = await c.monthlyReport(year);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      const rows = ['month,totalBusiness,full,half'].concat(rep.map(r => `${r.month},${r.totalBusiness},${r.full},${r.half}`));
      return res.end(rows.join('\n'));
    }

    if (url.pathname === '/next-business-day') {
      const date = url.searchParams.get('date');
      if (!date) throw new Error('date= obrigatório');
      const d = date.includes('/') ? parseBR(date) : new Date(date);
      const n = await cal.nextBusinessDay(d, 1);
      return res.end(JSON.stringify({ date: d.toISOString().slice(0,10), next: n.toISOString().slice(0,10) }));
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'not found' }));
  } catch (e) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: e?.message || String(e) }));
  }
});

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  server.listen(port, () => console.log('Demo API listening on :' + port));
}

module.exports = server;
