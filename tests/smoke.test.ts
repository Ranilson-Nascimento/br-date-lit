import { expect, test } from 'vitest';
import { createCalendar, parseBR } from '../src/index';

test('smoke: basic API works', async () => {
  const cal = createCalendar({ profile: 'comercial', state: 'SP' });
  const isBiz = await cal.isBusinessDay(parseBR('01/05/2026'));
  expect(typeof isBiz).toBe('boolean');
});
