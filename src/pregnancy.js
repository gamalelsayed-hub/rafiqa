// المحتوى نفسه في content/pregnancy.json، وهنا الحسابات بس.
import { addDays, diffDays, todayKey } from './cycle';
import { WEEKS } from './data';

export { TRIMESTERS, WEEKS, CHECKS, DANGER, PREG_TIPS, LABOR, POSTPARTUM } from './data';

export function pregInfo(lmp, today = todayKey()) {
  const days = diffDays(lmp, today);
  const week = Math.floor(days / 7);
  const day = days % 7;
  const edd = addDays(lmp, 280); // قاعدة نيجل: أول يوم في آخر دورة + 280 يوم
  const left = diffDays(today, edd);
  const trimester = week < 14 ? 1 : week < 28 ? 2 : 3;
  const month = Math.min(9, Math.floor(days / 30.4) + 1);
  const progress = Math.max(0, Math.min(1, days / 280));
  return { days, week, day, edd, left, trimester, month, progress };
}

export function weekInfo(week) {
  const keys = Object.keys(WEEKS).map(Number).sort((a, b) => a - b);
  let k = keys[0];
  for (const x of keys) if (x <= week) k = x;
  return { from: k, ...WEEKS[k] };
}
