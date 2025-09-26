
# Dataset (UFs/Municípios)

Mantenha dados oficiais por **ano**, **UF** e **município** em JSON/CSV.

```
dataset/
  2026/
    SP/
      SP-Sao_Paulo.json
    RJ/
      RJ-Rio_de_Janeiro.json
```

Importe tudo:
```bash
npx br-dates-lib import-dir ./dataset
npx br-dates-lib verify 2026
```
