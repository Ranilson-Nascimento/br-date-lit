
# API (Node)

- `createCalendar(options)` → objeto com:
  - `isHoliday(date)`, `isBusinessDay(date)`
  - `nextBusinessDay(date, n)`, `previousBusinessDay(date, n)`
  - `addBusinessDays(date, n)`
  - `businessDaysBetween(start, end, inclusive)`
  - `listBusinessDays(start, end, inclusive)`
  - `adjustDueDateFiscal(date)`
