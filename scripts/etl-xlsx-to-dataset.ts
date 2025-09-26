
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as XLSX from 'xlsx'

type Row = Record<string, any>

/**
 * Lê um arquivo .xlsx e gera um JSON no schema v1 do br-date-lit (dataset).
 * O script tenta mapear colunas flexivelmente via aliases.
 *
 * Uso:
 *   npx ts-node --transpile-only scripts/etl-xlsx-to-dataset.ts ./input.xlsx ./dataset/2026/SP/SP-Capital.json
 */
const aliases = {
  year: ['ano','year'],
  scope: ['escopo','scope'],
  uf: ['uf','estado','sigla'],
  city: ['cidade','municipio','city'],
  id: ['id','ident','slug'],
  name: ['nome','feriado','name','titulo'],
  date: ['data','date','dia'],
  movable: ['movel','movível','movable']
}

function findCol(row: Row, names: string[]): string | undefined {
  for (const n of names) {
    const key = Object.keys(row).find(k => k.trim().toLowerCase() === n.toLowerCase())
    if (key) return key
  }
  return undefined
}

function normalizeRow(row: Row) {
  const out: any = {}
  out.year = Number(row[findCol(row, aliases.year) ?? 'year'])
  out.scope = String(row[findCol(row, aliases.scope) ?? 'scope'] || '').toLowerCase()
  out.uf = String(row[findCol(row, aliases.uf) ?? 'uf'] || '').toUpperCase()
  const cityKey = findCol(row, aliases.city)
  out.city = cityKey ? String(row[cityKey]) : undefined
  out.id = String(row[findCol(row, aliases.id) ?? 'id'] || '').trim() || slugify(String(row[findCol(row, aliases.name) ?? 'name'] || 'feriado'))
  out.name = String(row[findCol(row, aliases.name) ?? 'name'] || '').trim()
  out.date = toYMD(row[findCol(row, aliases.date) ?? 'date'])
  const mov = row[findCol(row, aliases.movable) ?? 'movable']
  out.movable = typeof mov === 'string' ? mov.toLowerCase() === 'true' : !!mov
  return out
}

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[^\w\s-]/g,'').trim().replace(/[\s-]+/g,'_')
}

function toYMD(val: any): string {
  // tenta datas Excel (serial) ou strings tipo dd/mm/yyyy
  if (typeof val === 'number') {
    // Excel serial date -> JS date
    const d = XLSX.SSF.parse_date_code(val)
    const yyyy = d.y; const mm = String(d.m).padStart(2,'0'); const dd = String(d.d).padStart(2,'0')
    return `${yyyy}-${mm}-${dd}`
  }
  const s = String(val || '').trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [dd,mm,yyyy] = s.split('/')
    return `${yyyy}-${mm}-${dd}`
  }
  const d = new Date(s)
  if (!isNaN(d.getTime())) {
    const yyyy = d.getFullYear(); const mm = String(d.getMonth()+1).padStart(2,'0'); const dd = String(d.getDate()).padStart(2,'0')
    return `${yyyy}-${mm}-${dd}`
  }
  throw new Error('Data inválida: ' + s)
}

function main() {
  const input = process.argv[2]
  const output = process.argv[3]
  if (!input || !output) {
    console.error('Uso: ts-node scripts/etl-xlsx-to-dataset.ts <arquivo.xlsx> <saida.json>')
    process.exit(1)
  }
  const wb = XLSX.readFile(input)
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows: Row[] = XLSX.utils.sheet_to_json(sheet, { raw: true })

  const holidays = rows.map(normalizeRow)
  const data = { version: 1, source: path.basename(input), holidays }
  fs.mkdirSync(path.dirname(output), { recursive: true })
  fs.writeFileSync(output, JSON.stringify(data, null, 2), 'utf8')
  console.log(`Gerado: ${output} (${holidays.length} registros)`)
}

main()
