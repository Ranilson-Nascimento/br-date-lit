# React Hook — useBusinessCalendar

O hook `useBusinessCalendar` facilita o carregamento e uso do calendário em componentes React.

Assinatura (resumida):
- useBusinessCalendar(opts?: { state?: string; city?: string; profile?: string; preloadYears?: number[] })
- Retorna: { calendar, ready, error }

Exemplo básico:
```tsx
import React, { useEffect, useState } from 'react';
import { useBusinessCalendar } from 'br-dates-lib';

export function DueDate({ iso, uf, cidade }: { iso: string; uf?: string; cidade?: string }) {
  const { calendar, ready } = useBusinessCalendar({ state: uf, city: cidade, profile: 'fiscal', preloadYears: [new Date().getFullYear()] });
  const [adjusted, setAdjusted] = useState<Date | null>(null);

  useEffect(() => {
    if (!ready) return;
    calendar.adjustDueDateFiscal(new Date(iso)).then(setAdjusted);
  }, [ready, iso]);

  if (!ready) return <span>Carregando...</span>;
  return <span>{adjusted ? adjusted.toISOString().slice(0,10) : '-'};</span>;
}
```

Notas
- O hook não força a instalação de `react` no bundle (a lib marca `react` como external). Em desenvolvimento ou testes, adicione `react` e `react-dom` como dependências Dev para permitir tipagem e execução de testes.
- Prefira pré-carregar os anos com `preloadYears` quando precisar de cálculos imediatos no primeiro render.

Shape retornado (exemplo):

- calendar: API principal com métodos como `isBusinessDay(date)`, `nextBusinessDay(date)`, `businessDaysBetween(start,end, inclusive?)`, `adjustDueDateFiscal(date)`
- ready: boolean — indica se o calendário e caches/provedores foram carregados
- error: Error | null — erro de carregamento dos provedores (se houver)

Dicas de uso
- Para evitar flicker no primeiro render, use `preloadYears: [new Date().getFullYear()]` para pré-carregar o ano atual.
- Se você precisar de tipagem mais forte, importe os tipos públicos do pacote (`import type { Calendar } from 'br-dates-lib'`).

Exemplo com tratamento de erro:
```tsx
const { calendar, ready, error } = useBusinessCalendar({ state: 'SP', preloadYears: [2026] });

if (error) return <div>Falha ao carregar provedores: {error.message}</div>;
```
