# br-dates-lib — datas úteis e feriados do Brasil

[![CI](https://github.com/Ranilson-Nascimento/br-dates-lib/actions/workflows/ci.yml/badge.svg)](https://github.com/Ranilson-Nascimento/br-dates-lib/actions/workflows/ci.yml)
[![Release](https://github.com/Ranilson-Nascimento/br-dates-lib/actions/workflows/release.yml/badge.svg)](https://github.com/Ranilson-Nascimento/br-dates-lib/actions/workflows/release.yml)
[![Pages](https://github.com/Ranilson-Nascimento/br-dates-lib/actions/workflows/pages.yml/badge.svg)](https://ranilson-nascimento.github.io/br-dates-lib/)
[![npm version](https://img.shields.io/npm/v/br-dates-lib.svg)](https://www.npmjs.com/package/br-dates-lib)
[![npm downloads](https://img.shields.io/npm/dm/br-dates-lib.svg)](https://www.npmjs.com/package/br-dates-lib)

Biblioteca para cálculo de dias úteis e feriados no Brasil. Fornece:

- Funções principais: `isBusinessDay`, `nextBusinessDay`, `previousBusinessDay`, `addBusinessDays`, `businessDaysBetween`
- Perfis prontos: comercial, bancário, fiscal (ajustam regras de dias úteis)
- Extensível: registre feriados estaduais/municipais em runtime
- Provedores remotos (BrasilAPI, Nager.Date) com timeout + cache local por ano
- CLI e Hook React para integração com apps

## Instalação

```bash
npm install br-dates-lib
# ou (pnpm)
pnpm add br-dates-lib
```

## Quickstart — Node (exemplo mínimo)

```ts
import { createCalendar, parseBR, toBR, Providers } from "br-dates-lib";

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

## CLI (referência rápida)

- Próximo dia útil a partir de uma data:

```bash
npx br-dates-lib next 2026-05-01 --state SP --city "São Paulo"
```

- Verificar se a data é feriado:

```bash
npx br-dates-lib ish 2026-11-15
```

- Listar feriados do ano (por UF):

```bash
npx br-dates-lib list 2026 --state SP
```

**Observação:** no PowerShell use aspas duplas como no exemplo acima; em shells UNIX simples as aspas simples também funcionam.

## React Hook (exemplo)

```tsx
import React, { useEffect, useState } from 'react';
import { useBusinessCalendar } from 'br-dates-lib';

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

## Cache (exemplo de uso)

```ts
import { createCalendar, Providers, FSCache } from "br-dates-lib";

const cal = createCalendar({
  providers: [Providers.brasilApi(), Providers.nagerDate()],
  cache: new FSCache(".br-dates-lib-cache")
});
```

## Perfis de calendário

A biblioteca suporta diferentes perfis que ajustam as regras de dias úteis:

- **comercial**: Seg-Sex, excluindo feriados nacionais/estaduais/municipais
- **bancário**: Seg-Sex, mas com regras especiais para bancos (ex: Carnaval é feriado)
- **fiscal**: Dias úteis para tributação (ex: prazos fiscais)

Exemplo:

```ts
const calComercial = createCalendar({ profile: "comercial", state: "SP" });
const calFiscal = createCalendar({ profile: "fiscal", state: "SP" });
```

## Provedores disponíveis

- `Providers.brasilApi()` — consome `https://brasilapi.com.br` para feriados
- `Providers.nagerDate()` — consome `https://date.nager.at` como alternativa

Se ambos falharem, a biblioteca usa o fallback local (feriados fixos e cálculo móvel como Páscoa).

## API Principal

### Funções do Calendário

- `isBusinessDay(date)`: Verifica se a data é dia útil
- `nextBusinessDay(date)`: Próximo dia útil
- `previousBusinessDay(date)`: Dia útil anterior
- `addBusinessDays(date, days)`: Adiciona dias úteis
- `businessDaysBetween(start, end, inclusive)`: Conta dias úteis entre datas

### Utilitários

- `parseBR(str)`: Converte "DD/MM/YYYY" para Date
- `toBR(date)`: Converte Date para "DD/MM/YYYY"

### Plugins e Estados

- `StatePlugins.SP`, `StatePlugins.RJ`, etc.: Plugins para feriados estaduais
- `Banking.halfDay(date)`: Meios dias bancários
- `HalfDay.carnival(date)`: Regras de meio dia para Carnaval

## Configuração do Repositório

Para publicar automaticamente no npm e deployar docs:

1. **Habilite GitHub Pages** nas configurações do repositório (Settings > Pages > Source: GitHub Actions).

2. **Adicione secrets** (Settings > Secrets and variables > Actions):
   - `NPM_TOKEN`: Token de autenticação do npm (crie em https://www.npmjs.com/settings/tokens)

3. **Push para main**: Aciona CI, release automático e deploy de docs.

## Build, testes e validação

- Build (gera ESM, CJS e .d.ts em `dist/`):

```bash
npm run build
```

- Testes (Vitest):

```bash
npm test
```

- Validar dataset manualmente:

```bash
npm run validate:dataset
```

## Troubleshooting rápido

- **Erro de `react` no build/tests:** instale `react` e `react-dom` como devDependencies para testes locais e tipagem: `npm i -D react react-dom @types/react`
- **Problema de shebang no CLI ao publicar:** garanta que o arquivo `src/cli.ts` contenha `#!/usr/bin/env node` como primeira linha (já foi corrigido no repositório).

## Contribuindo

- Leia `CONTRIBUTING.md` para instruções
- PRs passam por CI: build + tests + validador de dataset

## Licença

MIT

## Apoie o Projeto

Se este projeto te ajudou, considere apoiar o desenvolvimento:

- ⭐ **Star** o repositório no GitHub
- 🐛 **Report** bugs ou sugestões nas [Issues](https://github.com/Ranilson-Nascimento/br-dates-lib/issues)
- 💻 **Contribua** com código via Pull Requests
- ☕ **Doe** via [GitHub Sponsors](https://github.com/sponsors/Ranilson-Nascimento)

## Links rápidos (PowerShell)

```powershell
npm ci
npm run build
npm test
npm run validate:dataset
```

````
