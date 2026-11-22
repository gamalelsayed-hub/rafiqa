// بيخلّي Node يقرا ملفات src كـ ES modules ومن غير امتداد
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
export async function resolve(spec, ctx, next) {
  if (spec.startsWith('.') && !/\.\w+$/.test(spec)) {
    const u = new URL(spec + '.js', ctx.parentURL);
    if (existsSync(fileURLToPath(u))) return next(u.href, ctx);
  }
  return next(spec, ctx);
}
export async function load(url, ctx, next) {
  if (url.includes('/src/') && url.endsWith('.js')) {
    const r = await next(url, { ...ctx, format: 'module' });
    return { ...r, format: 'module' };
  }
  return next(url, ctx);
}
