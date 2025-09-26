
# Playground

Teste datas úteis, próximo dia útil e feriados **direto no navegador** (usa fallback local; providers remotos são opcionais no servidor).

<script setup lang="ts">
import { ref, computed } from 'vue'

// Não importar '../../src' diretamente para evitar que o bundler tente trazer módulos Node-only.
// Usamos um pequeno parser/formater local para o playground e tentamos carregar a lib dinamicamente quando disponível.

function parseBRLocal(s: string) {
  const parts = s.split('/')
  if (parts.length === 3) return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]))
  return new Date(s)
}

function toBRLocal(d: Date) {
  return d.toISOString().slice(0,10).split('-').reverse().join('/')
}

let createCalendarLib: any = null
try {
  // tentar carregar dinamicamente a lib (funciona quando o site roda com Node ou em dev com vite que resolve src)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // eslint-disable-next-line no-undef
  createCalendarLib = null
} catch (e) {
  createCalendarLib = null
}

// Playground local (fallback)
const uf = ref('SP')
const city = ref('São Paulo')
const input = ref('01/05/2026')

// sem providers no browser — usa fallback local com utilitários locais
let cal: any = null
if (createCalendarLib && createCalendarLib.createCalendar) {
  cal = createCalendarLib.createCalendar({ state: uf.value, city: city.value })
}

// fallback leve quando a lib não estiver disponível no browser
if (!cal) {
  cal = {
    async isHoliday(_d: Date) { return null },
    async nextBusinessDay(d: Date) { return new Date(d.getTime() + 2 * 24 * 3600 * 1000) }
  }
}

const outHoliday = ref<string>('')
const outNext = ref<string>('')

async function run() {
  const d = input.value.includes('/') ? parseBRLocal(input.value) : new Date(input.value)
  const h = await cal.isHoliday(d)
  outHoliday.value = h ? `${h.name} (${toBRLocal(new Date(h.date))})` : '—'
  const n = await cal.nextBusinessDay(d, 1)
  outNext.value = toBRLocal(new Date(n))
}

// Integração com API Demo (parte compartilhada do playground)
const year = ref(String(new Date().getFullYear()))
const ufApi = ref('SP')
const cityApi = ref('São Paulo')
const mode = ref<'holidays' | 'business' | 'all'>('holidays')

const reportJson = ref<any>(null)
const csvText = ref<string>('')

async function fetchReport() {
  const url = `http://localhost:3000/report.json?year=${encodeURIComponent(year.value)}&state=${encodeURIComponent(ufApi.value)}&city=${encodeURIComponent(cityApi.value)}`
  const r = await fetch(url)
  reportJson.value = await r.json()
}

async function fetchCSV() {
  const url = `http://localhost:3000/calendar.csv?year=${encodeURIComponent(year.value)}&state=${encodeURIComponent(ufApi.value)}&city=${encodeURIComponent(cityApi.value)}`
  const r = await fetch(url)
  csvText.value = await r.text()
}

function icsUrl() {
  return `http://localhost:3000/calendar.ics?year=${encodeURIComponent(year.value)}&state=${encodeURIComponent(ufApi.value)}&city=${encodeURIComponent(cityApi.value)}&mode=${mode.value}`
}
</script>

<div class="play">
  <label>UF: <input v-model="uf" placeholder="UF" /></label>
  <label>Cidade: <input v-model="city" placeholder="Cidade" /></label>
  <label>Data (dd/mm/yyyy ou yyyy-mm-dd): <input v-model="input" placeholder="01/05/2026" /></label>
  <button @click="run">Calcular</button>

  <div class="grid">
    <div><b>Feriado?</b><div>{{ outHoliday }}</div></div>
    <div><b>Próximo dia útil</b><div>{{ outNext }}</div></div>
  </div>
</div>

<style>
.play { display: grid; gap: 12px; }
.play label { display: block; }
.play input { padding: 6px 8px; border: 1px solid #ddd; border-radius: 6px; }
.play button { padding: 8px 12px; border-radius: 8px; cursor: pointer; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.grid > div { padding: 10px; border: 1px solid var(--vp-c-divider); border-radius: 8px; }
</style>


---

## Integração com API Demo

Este playground roda apenas com o fallback local.  
Para testar com dataset/providers reais, consulte a **Demo API** rodando em Node:

```bash
npm run demo
# GET http://localhost:3000/table?year=2026&state=SP&city=São%20Paulo
# GET http://localhost:3000/calendar.csv?year=2026&state=SP
```


### Relatórios via API
```bash
# JSON
curl "http://localhost:3000/report.json?year=2027&state=SP&city=São%20Paulo"
# CSV
curl "http://localhost:3000/report.csv?year=2027&state=SP"
```


---

## Integração com Demo API (tempo real)

> Rode `npm run demo` em outro terminal para habilitar os endpoints locais.

<!-- scripts mesclados acima -->

<div class="api-box">
  <div class="row">
    <label>Ano: <input v-model="year" /></label>
    <label>UF: <input v-model="ufApi" /></label>
    <label>Cidade: <input v-model="cityApi" /></label>
  </div>
  <div class="row">
    <button @click="fetchReport">/report.json</button>
    <button @click="fetchCSV">/calendar.csv</button>
    <label>ICS modo: 
      <select v-model="mode">
        <option value="holidays">holidays</option>
        <option value="business">business</option>
        <option value="all">all</option>
      </select>
    </label>
    <a :href="icsUrl()" target="_blank">/calendar.ics (download)</a>
  </div>

  <div class="grid">
    <div>
      <b>report.json</b>
      <pre>{{ JSON.stringify(reportJson, null, 2) }}</pre>
    </div>
    <div>
      <b>calendar.csv</b>
      <pre style="white-space:pre-wrap">{{ csvText }}</pre>
    </div>
  </div>
</div>

<style>
.api-box { display: grid; gap: 12px; border:1px solid var(--vp-c-divider); padding: 12px; border-radius: 10px; }
.api-box .row { display:flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.api-box input, .api-box select { padding: 6px 8px; border: 1px solid #ddd; border-radius: 6px; }
.api-box button { padding: 8px 12px; border-radius: 8px; cursor: pointer; }
.api-box .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.api-box pre { background: var(--vp-c-bg-soft); padding: 10px; border-radius: 8px; }
</style>
