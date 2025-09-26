
# Uso Rápido

```ts
import { createCalendar, Providers, FSCache, parseBR, toBR } from "br-dates-library";

const cal = createCalendar({
  profile: "comercial",
  state: "SP",
  city: "São Paulo",
  providers: [Providers.brasilApi(), Providers.nagerDate()],
  cache: new FSCache(".br-dates-library-cache")
});

console.log(await cal.isBusinessDay(parseBR("01/05/2026")));
console.log(toBR(await cal.nextBusinessDay(parseBR("01/05/2026"))));
```
