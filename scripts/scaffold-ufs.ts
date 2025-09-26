
import * as fs from "node:fs";
import * as path from "node:path";

const UFS = ["AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"];
const year = Number(process.argv[2] || "2026");
const base = process.argv[3] || "dataset";

for (const uf of UFS) {
  const dir = path.join(base, String(year), uf);
  fs.mkdirSync(dir, { recursive: true });
  const sample = {
    version: 1,
    source: "preenchimento-manual-ou-oficial",
    holidays: [
      // Exemplo estadual (substitua pela lei local)
      // {"year": year, "scope": "state", "uf": "UF", "id": "data_magna_uf", "name": "Data Magna UF", "date": "2026-01-01"}
      // Exemplos municipais: adicione por cidade
      // {"year": year, "scope": "municipal", "uf": "UF", "city": "Capital", "id": "aniversario_capital", "name": "Aniversário da Capital", "date": "2026-01-01"}
    ]
  };
  const file = path.join(dir, uf + "-README.json");
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(sample, null, 2), "utf8");
}
console.log("Estrutura criada em", base);
