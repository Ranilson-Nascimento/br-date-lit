# Quickstart — br-date-lit

Este guia rápido mostra as operações mais comuns: criar um calendário, verificar dias úteis, usar a CLI e o hook React.

## Node — exemplo mínimo
```ts
import { createCalendar, parseBR, toBR, Providers } from "br-date-lit";

async function main() {
  const cal = createCalendar({
    profile: "comercial",
    state: "SP",
    city: "São Paulo",
    providers: [Providers.brasilApi(), Providers.nagerDate()]
  });

  console.log(await cal.isBusinessDay(parseBR("01/05/2026"))); // false
  console.log(toBR(await cal.nextBusinessDay(parseBR("01/05/2026"))));
}

main();
```

## CLI
```powershell
# próximo dia útil
npx br-date-lit next 2026-05-01 --state SP --city "São Paulo"

# lista de feriados do ano
npx br-date-lit list 2026 --state SP
```

## React Hook
Veja `docs/react-hook.md` para exemplos do hook `useBusinessCalendar`.

## Cache opcional
```ts
import { createCalendar, Providers, MemoryCache } from "br-date-lit";

const cal = createCalendar({ providers: [Providers.brasilApi()], cache: new MemoryCache() });
```

## Build & Test
- Instalar: `npm ci`
- Build: `npm run build`
- Testes: `npm test`
- Validar dataset: `npm run validate:dataset`

## Troubleshooting (curto)

- Build falha resolvendo `react`: instale como devDep para a sessão local (tests/dts):
```powershell
npm i -D react react-dom @types/react
```

- Problema ao rodar CLI no Windows/PowerShell: use o `node` diretamente para rodar o bundle em `dist/`:
```powershell
node dist/cli.js next 2026-05-01 --state SP --city "São Paulo"
```

## Exemplos avançados

- Usando cache em disco:
```ts
import { createCalendar, Providers, FSCache } from 'br-date-lit';

const cal = createCalendar({ providers: [Providers.brasilApi()], cache: new FSCache('.cache') });
```
