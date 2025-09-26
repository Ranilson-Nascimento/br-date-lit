
// Ajuda procedural para quem não quer instanciar Calendar manualmente
import { createCalendar } from "./calendar";
import { Providers } from "./providers";
import { MemoryCache } from "./cache";

export async function proximoDiaUtilFiscal(data: Date, state?: string, city?: string) {
  const cal = createCalendar({
    profile: "fiscal",
    state, city,
    providers: [Providers.brasilApi(), Providers.nagerDate()],
    cache: new MemoryCache()
  });
  return cal.adjustDueDateFiscal(data);
}
