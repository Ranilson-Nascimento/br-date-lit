
import { useEffect, useMemo, useState } from "react";
import { createCalendar, Providers, MemoryCache } from "..";

export function useBusinessCalendar(opts?: {
  state?: string;
  city?: string;
  profile?: "comercial" | "bancario" | "fiscal" | "custom";
  preloadYears?: number[]; // ex: [new Date().getFullYear(), new Date().getFullYear()+1]
}) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cal = useMemo(() => createCalendar({
    profile: opts?.profile ?? "comercial",
    state: opts?.state,
    city: opts?.city,
    providers: [Providers.brasilApi(), Providers.nagerDate()],
    cache: new MemoryCache()
  }), [opts?.state, opts?.city, opts?.profile]);

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const years = opts?.preloadYears ?? [new Date().getFullYear()];
        await Promise.all(years.map(y => cal.listHolidays(y)));
        if (!dead) setReady(true);
      } catch (e: any) {
        if (!dead) setError(e?.message || String(e));
      }
    })();
    return () => { dead = true; };
  }, [cal, opts?.preloadYears]);

  return { calendar: cal, ready, error };
}
