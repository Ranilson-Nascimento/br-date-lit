# API

Métodos do calendário e opções.


## Relatórios
- `monthlyReport(year)` → `{ month, totalBusiness, full, half }[]` (half-day = 0.5).
- Endpoints: `/report.json`, `/report.csv` (Demo API).


### Workload e Half-day por horas
- `CalendarOptions.workdayHours` (default 8).
- Feriados especiais podem definir `workHours` (0..workdayHours).
- `HalfDay.registerHalfDayRanges(uf, year, [{ dateISO, hours, city? }])`.
