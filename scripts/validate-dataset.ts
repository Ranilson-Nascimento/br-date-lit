
import * as fs from 'node:fs'
import * as path from 'node:path'

const UFS = new Set(["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"])

type Record = {
  year: number
  scope: 'state' | 'municipal'
  uf: string
  city?: string
  id: string
  name: string
  date: string // yyyy-mm-dd
  movable?: boolean
}

function readJson(p: string): any {
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

function readCsv(p: string): Record[] {
  const raw = fs.readFileSync(p, 'utf8').trim()
  const lines = raw.split(/\r?\n/)
  const out: Record[] = []
  const head = lines.shift()
  if (!head) return out
  for (const line of lines) {
    const parts = line.split(',')
    const [year, scope, uf, city, id, name, date, movable] = parts
    out.push({ year: Number(year), scope: scope as any, uf, city: city || undefined, id, name, date, movable: movable === 'true' })
  }
  return out
}

function* walk(dir: string): Generator<string> {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) yield* walk(full)
    else if (e.isFile() && (e.name.endsWith('.json') || e.name.endsWith('.csv'))) yield full
  }
}

function ymd(d: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return ''
  return d
}

function validateRecords(recs: Record[], file: string, problems: string[]) {
  const seen = new Set<string>()
  for (const r of recs) {
    if (!UFS.has((r.uf || '').toUpperCase())) problems.push(`${file}: UF inválida: ${r.uf}`)
    if (r.scope === 'municipal' && !r.city) problems.push(`${file}: municipal sem city`)
    if (r.scope !== 'municipal' && r.scope !== 'state') problems.push(`${file}: scope inválido: ${r.scope}`)
    if (!r.id || !r.name) problems.push(`${file}: id/name vazios`)
    if (!r.date || !ymd(r.date)) problems.push(`${file}: date inválida: ${r.date}`)
    const y = Number((r.date || '').slice(0,4))
    if (r.year !== y) problems.push(`${file}: year (${r.year}) != year(date) (${y})`)
    const k = `${r.year}|${r.scope}|${r.uf}|${r.city||''}|${r.id}|${r.date}`
    if (seen.has(k)) problems.push(`${file}: duplicado ${k}`)
    seen.add(k)
  }
}

function main() {
  const dir = process.argv[2] || 'dataset'
  const files = Array.from(walk(dir))
  const problems: string[] = []

  for (const f of files) {
    try {
      const recs = f.endsWith('.json') ? (readJson(f).holidays || []) as Record[] : readCsv(f)
      validateRecords(recs, f, problems)
    } catch (e: any) {
      problems.push(`${f}: erro ao ler - ${e?.message || String(e)}`)
    }
  }

  if (problems.length) {
    console.error('VALIDADOR: encontrou problemas:\n' + problems.join('\n'))
    process.exit(1)
  } else {
    console.log('VALIDADOR: OK — sem problemas.')
  }
}

main()
