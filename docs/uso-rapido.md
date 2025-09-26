
# Uso Rápido

```ts
import { createCalendar, Providers, FSCache, parseBR, toBR } from "br-date-lit";

const cal = createCalendar({
  profile: "comercial",
  state: "SP",
  city: "São Paulo",
  providers: [Providers.brasilApi(), Providers.nagerDate()],
  cache: new FSCache(".br-date-lit-cache")
});

console.log(await cal.isBusinessDay(parseBR("01/05/2026")));
console.log(toBR(await cal.nextBusinessDay(parseBR("01/05/2026"))));
```
