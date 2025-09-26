# Provedores remotos

Esta biblioteca oferece integração com provedores remotos para enriquecer a lista de feriados:

- `Providers.brasilApi()` — consome `https://brasilapi.com.br/api/feriados/v1/{year}`
- `Providers.nagerDate()` — consome `https://date.nager.at/api/v3/PublicHolidays/{year}/BR`

Exemplo de uso:

```ts
import { createCalendar, Providers } from 'br-date-lit';

const cal = createCalendar({
  providers: [Providers.brasilApi(), Providers.nagerDate()],
});
```

Notas:
- Esses provedores são opcionais. Se não estiverem disponíveis, a biblioteca recorre ao fallback local (feriados fixos + cálculo móvel).
- Para testes de integração, prefira mockar as respostas HTTP para evitar dependência de rede.
