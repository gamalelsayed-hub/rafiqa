import { ALL_WOMEN } from './data';
import { diffDays } from './cycle';

export { GROUPS, ALL_WOMEN } from './data';

function gcd(a, b) {
  return b ? gcd(b, a % b) : a;
}

// سيرة اليوم: ترتيب ثابت بيلف على كل الأقسام، عشان كل يوم تقري سيرة من مجموعة مختلفة
export function womanOfDay(key) {
  const n = ALL_WOMEN.length;
  let step = 7;
  while (gcd(step, n) !== 1) step++;
  const day = ((diffDays('2026-01-01', key) % n) + n) % n;
  return ALL_WOMEN[(day * step) % n];
}
