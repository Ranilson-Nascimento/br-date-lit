# Referência da CLI

Comandos principais:

- `next <date>` — calcula o próximo dia útil a partir da data informada.
  - Exemplo (PowerShell):
  ```powershell
  npx br-date-lit next 2026-05-01 --state SP --city "São Paulo"
  ```

- `ish <date>` — verifica se a data é feriado e retorna informações.

- `list <year> --state <UF> [--city <Cidade>]` — lista feriados do ano para a UF / cidade.

- `report <year> --state <UF> [--city <Cidade>]` — gera relatório mensal (dias úteis por mês).

Opções comuns:

- `--state` / `-s` — sigla da UF (ex: `SP`)
- `--city` / `-c` — nome da cidade (caso queira feriados municipais)
- `--profile` — perfil (`comercial`, `bancario`, `fiscal`)

Exemplo avançado (PowerShell):

```powershell
# Próximo dia útil considerando perfil fiscal e cache em disco
npx br-date-lit next 2026-05-01 --state SP --city "São Paulo" --profile fiscal
```

Observações
- A CLI usa a mesma lógica da API/SDK interna. Para resultados mais ricos (municipais), prefira rodar contra um servidor que tenha importado os datasets via `import-dir`.
