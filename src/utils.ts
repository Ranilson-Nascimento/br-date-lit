
export const TZ = "America/Sao_Paulo";

export function at00(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function sameYMD(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}

export function toBR(date: Date): string {
  const d = at00(date);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function parseBR(s: string): Date {
  const [dd, mm, yyyy] = s.split("/");
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), 0, 0, 0, 0);
  if (isNaN(d.getTime())) throw new Error(`Data inválida PT-BR: ${s}`);
  return d;
}

export function isWeekend(date: Date): boolean {
  const day = at00(date).getDay();
  return day === 0 || day === 6;
}

export function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function rangeDays(start: Date, end: Date, inclusive = false): Date[] {
  const s = at00(start);
  const e = at00(end);
  const out: Date[] = [];
  if (s > e) return out;

  let cur = new Date(s);
  const stop = inclusive ? addDays(e, 1) : e;
  while (cur < stop) {
    out.push(new Date(cur));
    cur = addDays(cur, 1);
  }
  return out;
}

/** pequeno utilitário de timeout p/ fetch */
export async function withTimeout<T>(p: Promise<T>, ms: number, controller: AbortController): Promise<T> {
  let timer: any;
  const t = new Promise<never>((_, rej) => {
    timer = setTimeout(() => {
      try { controller.abort(); } catch {}
      rej(new Error(`timeout after ${ms}ms`));
    }, ms);
  });
  try {
    return await Promise.race([p, t]) as T;
  } finally {
    clearTimeout(timer);
  }
}
