# Provedores remotos

Esta biblioteca oferece integração com provedores remotos para enriquecer a lista de feriados:

- `Providers.brasilApi()` — consome `https://brasilapi.com.br/api/feriados/v1/{year}`
- `Providers.nagerDate()` — consome `https://date.nager.at/api/v3/PublicHolidays/{year}/BR`
- `Providers.calendarific(apiKey)` — consome `https://calendarific.com/api/v2/holidays` (requer API key gratuita)

Exemplo de uso:

```ts
import { createCalendar, Providers } from 'br-dates-library';

const cal = createCalendar({
  providers: [
    Providers.brasilApi(),
    Providers.nagerDate(),
    Providers.calendarific('YOUR_API_KEY') // opcional
  ],
});
```

Notas:
- Esses provedores são opcionais. Se não estiverem disponíveis, a biblioteca recorre ao fallback local (feriados fixos + cálculo móvel).
- Para testes de integração, prefira mockar as respostas HTTP para evitar dependência de rede.
