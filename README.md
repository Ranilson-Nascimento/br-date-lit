# br-date-lit — datas úteis e feriados do Brasil

# br-date-lit — datas úteis e feriados do Brasil

[![CI](https://github.com/Ranilson-Nascimento/br-date-lit/actions/workflows/ci.yml/badge.svg)](https://github.com/Ranilson-Nascimento/br-date-lit/actions/workflows/ci.yml)

[![Release](https://github.com/Ranilson-Nascimento/br-date-lit/actions/workflows/release.yml/badge.svg)](https://github.com/Ranilson-Nascimento/br-date-lit/actions/workflows/release.yml)[![CI](https://github.com/Ranilson-Nascimento/br-date-lit/actions/workflows/ci.yml/badge.svg)](https://github.com/Ranilson-Nascimento/br-date-lit/actions/workflows/ci.yml)

[![Pages](https://github.com/Ranilson-Nascimento/br-date-lit/actions/workflows/pages.yml/badge.svg)](https://github.com/Ranilson-Nascimento/br-date-lit/actions/workflows/pages.yml)[![Release](https://github.com/Ranil## Configuração do Repositório

[![npm version](https://img.shields.io/npm/v/br-date-lit.svg)](https://www.npmjs.com/package/br-date-lit)

[![npm downloads](https://img.shields.io/npm/dm/br-date-lit.svg)](https://www.npmjs.com/package/br-date-lit)Para publicar automaticamente no npm e deployar docs:



Biblioteca para cálculo de dias úteis e feriados no Brasil. Fornece:1. **Habilite GitHub Pages** nas configurações do repositório (Settings > Pages > Source: GitHub Actions).



- Funções principais: `isBusinessDay`, `nextBusinessDay`, `previousBusinessDay`, `addBusinessDays`, `businessDaysBetween`2. **Adicione secrets** (Settings > Secrets and variables > Actions):

- Perfis prontos: comercial, bancário, fiscal (ajustam regras de dias úteis)   - `NPM_TOKEN`: Token de autenticação do npm (crie em https://www.npmjs.com/settings/tokens)

- Extensível: registre feriados estaduais/municipais em runtime

- Provedores remotos (BrasilAPI, Nager.Date) com timeout + cache local por ano3. **Push para main**: Aciona CI, release automático e deploy de docs.

- CLI e Hook React para integração com apps

## Build, testes e validação-Nascimento/br-date-lit/actions/workflows/release.yml/badge.svg)](https://github.com/Ranilson-Nascimento/br-date-lit/actions/workflows/release.yml)

## Instalação[![Pages](https://github.com/Ranilson-Nascimento/br-date-lit/actions/workflows/pages.yml/badge.svg)](https://github.com/Ranilson-Nascimento/br-date-lit/actions/workflows/pages.yml)

[![npm version](https://img.shields.io/npm/v/br-date-lit.svg)](https://www.npmjs.com/package/br-date-lit)

```bash

npm install br-date-litBiblioteca para cálculo de dias úteis e feriados no Brasil. Fornece:

# ou (pnpm)

pnpm add br-date-lit- Funções principais: `isBusinessDay`, `nextBusinessDay`, `previousBusinessDay`, `addBusinessDays`, `businessDaysBetween`

```- Perfis prontos: comercial, bancário, fiscal (ajustam regras de dias úteis)

- Extensível: registre feriados estaduais/municipais em runtime

## Quickstart — Node (exemplo mínimo)- Provedores remotos (BrasilAPI, Nager.Date) com timeout + cache local por ano

- CLI e Hook React para integração com apps

```ts

import { createCalendar, parseBR, toBR, Providers } from "br-date-lit";## Instalação



async function example() {```bash

  const cal = createCalendar({npm install br-date-lit

    profile: "comercial",# ou (pnpm)

    state: "SP",pnpm add br-date-lit

    city: "São Paulo",```

    providers: [Providers.brasilApi(), Providers.nagerDate()]

  });## Quickstart — Node (exemplo mínimo)



  console.log(await cal.isBusinessDay(parseBR("01/05/2026"))); // false```ts

  console.log(toBR(await cal.nextBusinessDay(parseBR("01/05/2026"))));import { createCalendar, parseBR, toBR, Providers } from "br-date-lit";

  console.log(await cal.businessDaysBetween(parseBR("10/02/2026"), parseBR("20/02/2026"), true));

}async function example() {

  const cal = createCalendar({

example();    profile: "comercial",

```    state: "SP",

    city: "São Paulo",

## CLI (referência rápida)    providers: [Providers.brasilApi(), Providers.nagerDate()]

  });

- Próximo dia útil a partir de uma data:

```bash  console.log(await cal.isBusinessDay(parseBR("01/05/2026"))); // false

npx br-date-lit next 2026-05-01 --state SP --city "São Paulo"  console.log(toBR(await cal.nextBusinessDay(parseBR("01/05/2026"))));

```  console.log(await cal.businessDaysBetween(parseBR("10/02/2026"), parseBR("20/02/2026"), true));

}

- Verificar se a data é feriado:

```bashexample();

npx br-date-lit ish 2026-11-15```

```

## CLI (referência rápida)

- Listar feriados do ano (por UF):

```bash- Próximo dia útil a partir de uma data:

npx br-date-lit list 2026 --state SP```bash

```npx br-date-lit next 2026-05-01 --state SP --city "São Paulo"

```

**Observação:** no PowerShell use aspas duplas como no exemplo acima; em shells UNIX simples as aspas simples também funcionam.

- Verificar se a data é feriado:

## React Hook (exemplo)```bash

npx br-date-lit ish 2026-11-15

```tsx```

import React, { useEffect, useState } from 'react';

import { useBusinessCalendar } from 'br-date-lit';- Listar feriados do ano (por UF):

```bash

export function DueDate({ iso, uf, cidade }: { iso: string; uf?: string; cidade?: string }) {npx br-date-lit list 2026 --state SP

  const { calendar, ready, error } = useBusinessCalendar({ state: uf, city: cidade, profile: 'fiscal', preloadYears: [new Date().getFullYear()] });```

  const [adjusted, setAdjusted] = useState<Date | null>(null);

**Observação:** no PowerShell use aspas duplas como no exemplo acima; em shells UNIX simples as aspas simples também funcionam.

  useEffect(() => {

    if (!ready || error) return;## React Hook (exemplo)

    calendar.adjustDueDateFiscal(new Date(iso)).then(setAdjusted).catch(() => setAdjusted(null));

  }, [ready, iso, error]);```tsx

import React, { useEffect, useState } from 'react';

  if (!ready) return <span>Carregando...</span>;import { useBusinessCalendar } from 'br-date-lit';

  return <span>{adjusted ? adjusted.toISOString().slice(0,10) : '-'}</span>;

}export function DueDate({ iso, uf, cidade }: { iso: string; uf?: string; cidade?: string }) {

```  const { calendar, ready, error } = useBusinessCalendar({ state: uf, city: cidade, profile: 'fiscal', preloadYears: [new Date().getFullYear()] });

  const [adjusted, setAdjusted] = useState<Date | null>(null);

## Cache (exemplo de uso)

  useEffect(() => {

```ts    if (!ready || error) return;

import { createCalendar, Providers, FSCache } from "br-date-lit";    calendar.adjustDueDateFiscal(new Date(iso)).then(setAdjusted).catch(() => setAdjusted(null));

  }, [ready, iso, error]);

const cal = createCalendar({

  providers: [Providers.brasilApi(), Providers.nagerDate()],  if (!ready) return <span>Carregando...</span>;

  cache: new FSCache(".br-date-lit-cache")  return <span>{adjusted ? adjusted.toISOString().slice(0,10) : '-'}</span>;

});}

``````



## Perfis de calendário## Cache (exemplo de uso)



A biblioteca suporta diferentes perfis que ajustam as regras de dias úteis:```ts

import { createCalendar, Providers, FSCache } from "br-date-lit";

- **comercial**: Seg-Sex, excluindo feriados nacionais/estaduais/municipais

- **bancário**: Seg-Sex, mas com regras especiais para bancos (ex: Carnaval é feriado)const cal = createCalendar({

- **fiscal**: Dias úteis para tributação (ex: prazos fiscais)  providers: [Providers.brasilApi(), Providers.nagerDate()],

  cache: new FSCache(".br-date-lit-cache")

Exemplo:});

```ts```

const calComercial = createCalendar({ profile: "comercial", state: "SP" });

const calFiscal = createCalendar({ profile: "fiscal", state: "SP" });## Provedores disponíveis

```

- `Providers.brasilApi()` — consome `https://brasilapi.com.br` para feriados

## API Principal- `Providers.nagerDate()` — consome `https://date.nager.at` como alternativa



### Funções do Calendário## Perfis de calendário

- `isBusinessDay(date)`: Verifica se a data é dia útil

- `nextBusinessDay(date)`: Próximo dia útilA biblioteca suporta diferentes perfis que ajustam as regras de dias úteis:

- `previousBusinessDay(date)`: Dia útil anterior

- `addBusinessDays(date, days)`: Adiciona dias úteis- **comercial**: Seg-Sex, excluindo feriados nacionais/estaduais/municipais

- `businessDaysBetween(start, end, inclusive)`: Conta dias úteis entre datas- **bancário**: Seg-Sex, mas com regras especiais para bancos (ex: Carnaval é feriado)

- **fiscal**: Dias úteis para tributação (ex: prazos fiscais)

### Utilitários

- `parseBR(str)`: Converte "DD/MM/YYYY" para DateExemplo:

- `toBR(date)`: Converte Date para "DD/MM/YYYY"```ts

const calComercial = createCalendar({ profile: "comercial", state: "SP" });

### Plugins e Estados## API Principal

- `StatePlugins.SP`, `StatePlugins.RJ`, etc.: Plugins para feriados estaduais

- `Banking.halfDay(date)`: Meios dias bancários### Funções do Calendário

- `HalfDay.carnival(date)`: Regras de meio dia para Carnaval- `isBusinessDay(date)`: Verifica se a data é dia útil

- `nextBusinessDay(date)`: Próximo dia útil

## Provedores disponíveis- `previousBusinessDay(date)`: Dia útil anterior

- `addBusinessDays(date, days)`: Adiciona dias úteis

- `Providers.brasilApi()` — consome `https://brasilapi.com.br` para feriados- `businessDaysBetween(start, end, inclusive)`: Conta dias úteis entre datas

- `Providers.nagerDate()` — consome `https://date.nager.at` como alternativa

### Utilitários

Se ambos falharem, a biblioteca usa o fallback local (feriados fixos e cálculo móvel como Páscoa).- `parseBR(str)`: Converte "DD/MM/YYYY" para Date

- `toBR(date)`: Converte Date para "DD/MM/YYYY"

## Configuração do Repositório

### Plugins e Estados

Para publicar automaticamente no npm e deployar docs:- `StatePlugins.SP`, `StatePlugins.RJ`, etc.: Plugins para feriados estaduais

- `Banking.halfDay(date)`: Meios dias bancários

1. **Habilite GitHub Pages** nas configurações do repositório (Settings > Pages > Source: GitHub Actions).- `HalfDay.carnival(date)`: Regras de meio dia para Carnaval

```

2. **Adicione secrets** (Settings > Secrets and variables > Actions):

   - `NPM_TOKEN`: Token de autenticação do npm (crie em https://www.npmjs.com/settings/tokens)- Build (gera ESM, CJS e .d.ts em `dist/`):

```bash

3. **Push para main**: Aciona CI, release automático e deploy de docs.npm run build

```

## Build, testes e validação

- Testes (Vitest):

- Build (gera ESM, CJS e .d.ts em `dist/`):```bash

```bashnpm test

npm run build```

```

- Validar dataset manualmente:

- Testes (Vitest):```bash

```bashnpm run validate:dataset

npm test```

```

## Troubleshooting rápido

- Validar dataset manualmente:

```bash- **Erro de `react` no build/tests:** instale `react` e `react-dom` como devDependencies para testes locais e tipagem: `npm i -D react react-dom @types/react`

npm run validate:dataset- **Problema de shebang no CLI ao publicar:** garanta que o arquivo `src/cli.ts` contenha `#!/usr/bin/env node` como primeira linha (já foi corrigido no repositório).

```

## Contribuindo

## Troubleshooting rápido

- Leia `CONTRIBUTING.md` para instruções

- **Erro de `react` no build/tests:** instale `react` e `react-dom` como devDependencies para testes locais e tipagem: `npm i -D react react-dom @types/react`- PRs passam por CI: build + tests + validador de dataset

- **Problema de shebang no CLI ao publicar:** garanta que o arquivo `src/cli.ts` contenha `#!/usr/bin/env node` como primeira linha (já foi corrigido no repositório).

## Licença

## Contribuindo

MIT

- Leia `CONTRIBUTING.md` para instruções

- PRs passam por CI: build + tests + validador de dataset## Links rápidos (PowerShell)



## Licença```powershell

npm ci

MITnpm run build

npm test

## Apoie o Projetonpm run validate:dataset

```

Se este projeto te ajudou, considere apoiar o desenvolvimento:```markdown

# br-date-lit — datas úteis e feriados do Brasil

- ⭐ **Star** o repositório no GitHub

- 🐛 **Report** bugs ou sugestões nas [Issues](https://github.com/Ranilson-Nascimento/br-date-lit/issues)[![CI](https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/ci.yml)

- 💻 **Contribua** com código via Pull Requests[![Release](https://github.com/OWNER/REPO/actions/workflows/release.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/release.yml)

- ☕ **Doe** via [GitHub Sponsors](https://github.com/sponsors/Ranilson-Nascimento)[![Pages](https://github.com/OWNER/REPO/actions/workflows/pages.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/pages.yml)

[![npm version](https://img.shields.io/npm/v/br-date-lit.svg)](https://www.npmjs.com/package/br-date-lit)

## Links rápidos (PowerShell)

Biblioteca para cálculo de dias úteis e feriados no Brasil. Fornece:

```powershell

npm ci- Funções principais: isBusinessDay, nextBusinessDay, previousBusinessDay, addBusinessDays, businessDaysBetween

npm run build- Perfis prontos: comercial, bancario, fiscal (ajustam regras de dias úteis)

npm test- Extensível: registre feriados estaduais/municipais em runtime

npm run validate:dataset- Provedores remotos (BrasilAPI, Nager.Date) com timeout + cache local por ano

```- CLI e Hook React para integração com apps

Instalação
```powershell
npm install br-date-lit
# ou (pnpm)
pnpm add br-date-lit
```

Quickstart — Node (exemplo mínimo)
```ts
import { createCalendar, parseBR, toBR, Providers } from "br-date-lit";

async function example() {
  const cal = createCalendar({
    profile: "comercial",
    state: "SP",
    city: "São Paulo",
    providers: [Providers.brasilApi(), Providers.nagerDate()]
  });

  console.log(await cal.isBusinessDay(parseBR("01/05/2026"))); // false
  console.log(toBR(await cal.nextBusinessDay(parseBR("01/05/2026"))));
  console.log(await cal.businessDaysBetween(parseBR("10/02/2026"), parseBR("20/02/2026"), true));
}

example();
```

CLI (referência rápida)

- Próximo dia útil a partir de uma data
```powershell
npx br-date-lit next 2026-05-01 --state SP --city "São Paulo"
```

- Verificar se a data é feriado
```powershell
npx br-date-lit ish 2026-11-15
```

- Listar feriados do ano (por UF)
```powershell
npx br-date-lit list 2026 --state SP
```

Observação: no PowerShell use aspas duplas como no exemplo acima; em shells UNIX simples as aspas simples também funcionam.

React Hook (exemplo)
```tsx
import React, { useEffect, useState } from 'react';
import { useBusinessCalendar } from 'br-date-lit';

export function DueDate({ iso, uf, cidade }: { iso: string; uf?: string; cidade?: string }) {
  const { calendar, ready, error } = useBusinessCalendar({ state: uf, city: cidade, profile: 'fiscal', preloadYears: [new Date().getFullYear()] });
  const [adjusted, setAdjusted] = useState<Date | null>(null);

  useEffect(() => {
    if (!ready || error) return;
    calendar.adjustDueDateFiscal(new Date(iso)).then(setAdjusted).catch(() => setAdjusted(null));
  }, [ready, iso, error]);

  if (!ready) return <span>Carregando...</span>;
  return <span>{adjusted ? adjusted.toISOString().slice(0,10) : '-'}</span>;
}
```

Cache (exemplo de uso)
```ts
import { createCalendar, Providers, FSCache } from "br-date-lit";

const cal = createCalendar({ providers: [Providers.brasilApi(), Providers.nagerDate()], cache: new FSCache(".br-date-lit-cache") });
```

Provedores disponíveis (exemplos)
- Providers.brasilApi() — consome `https://brasilapi.com.br` para feriados
- Providers.nagerDate() — consome `https://date.nager.at` como alternativa

Se ambos falharem, a biblioteca usa o fallback local (feriados fixos e cálculo móvel como Páscoa).

Build, testes e validação

- Build (gera ESM, CJS e .d.ts em `dist/`):
```powershell
npm run build
```

- Testes (Vitest):
```powershell
npm test
```

- Validar dataset manualmente:
```powershell
npm run validate:dataset
```

Troubleshooting rápido
- Erro de `react` no build/tests: instale `react` e `react-dom` como devDependencies para testes locais e tipagem: `npm i -D react react-dom @types/react`
- Problema de shebang no CLI ao publicar: garanta que o arquivo `src/cli.ts` contenha `#!/usr/bin/env node` como primeira linha (já foi corrigido no repositório).

Contribuindo

- Leia `CONTRIBUTING.md` para instruções
- PRs passam por CI: build + tests + validador de dataset

Licença

MIT

Links rápidos (PowerShell)
```powershell
npm ci
npm run build
npm test
npm run validate:dataset
```

````
