
# Hooks React

```tsx
import { useBusinessCalendar } from "br-dates-library";

export function Badge({ iso }: { iso: string }) {
  const { calendar, ready } = useBusinessCalendar({ profile: "fiscal", preloadYears: [new Date().getFullYear()] });
  const [date, setDate] = useState<Date | null>(null);
  useEffect(() => { if (ready) calendar.adjustDueDateFiscal(new Date(iso)).then(setDate); }, [ready, iso]);
  return <span>{date?.toISOString().slice(0,10) || "..."}</span>;
}
```
