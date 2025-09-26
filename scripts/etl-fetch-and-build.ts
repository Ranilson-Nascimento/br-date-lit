
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as cp from 'node:child_process'

/**
 * DATA_SOURCES: JSON string com lista de fontes:
 * [
 *   {"in":"https://.../feriados-2026.xlsx","out":"dataset/2026/SP/SP-Capital.json"},
 *   {"in":"https://.../feriados-2026-rj.xlsx","out":"dataset/2026/RJ/RJ-Rio_de_Janeiro.json"}
 * ]
 *
 * Pode apontar para links HTTP/HTTPS ou links de compartilhamento do Google Drive
 * (use links diretos/export=download).
 */

type Source = { in: string, out: string }

async function run(cmd: string, args: string[]) {
  await new Promise<void>((resolve, reject) => {
    const p = cp.spawn(cmd, args, { stdio: 'inherit' })
    p.on('exit', code => code === 0 ? resolve() : reject(new Error(cmd + ' ' + args.join(' ') + ' exit ' + code)))
  })
}

async function main() {
  const json = process.env.DATA_SOURCES || '[]'
  const sources: Source[] = JSON.parse(json)
  if (!Array.isArray(sources) || sources.length === 0) {
    console.log('Sem DATA_SOURCES; nada a fazer.')
    return
  }

  fs.mkdirSync('tmp-etl', { recursive: true })

  for (const s of sources) {
    const destX = 'tmp-etl/input.xlsx'
    // download
    await run(process.platform === 'win32' ? 'powershell' : 'curl', process.platform === 'win32'
      ? ['-o', destX, s.in]
      : ['-L', s.in, '-o', destX]
    )
    // etl
    await run('npx', ['ts-node', '--transpile-only', 'scripts/etl-xlsx-to-dataset.ts', destX, s.out])
  }

  // validate
  await run('npm', ['run', 'validate:dataset'])
}

main().catch(err => { console.error(err); process.exit(1) })
