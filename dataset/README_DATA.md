
# br-date-lit Dataset

## Formatos aceitos
- **JSON** (`version: 1`):
```json
{
  "version": 1,
  "source": "nome-da-fonte",
  "holidays": [
    {
      "year": 2026,
      "scope": "state",
      "uf": "SP",
      "id": "revolucao_constitucionalista",
      "name": "Revolução Constitucionalista (SP)",
      "date": "2026-07-09",
      "movable": false
    },
    {
      "year": 2026,
      "scope": "municipal",
      "uf": "SP",
      "city": "São Paulo",
      "id": "aniversario_sp",
      "name": "Aniversário de São Paulo",
      "date": "2026-01-25"
    }
  ]
}
```

- **CSV** (header obrigatório):  
`year,scope,uf,city,id,name,date,movable`

## Organização sugerida de pastas
```
dataset/
  2026/
    SP/
      SP-Sao_Paulo.json
      SP-Santos.csv
    RJ/
      RJ-Rio_de_Janeiro.json
  2027/
    ...
```

## Como importar
```bash
npx br-date-lit import ./dataset/2026/SP/SP-Sao_Paulo.json
npx br-date-lit import-dir ./dataset
npx br-date-lit verify 2026 --state SP --city "São Paulo"
```
