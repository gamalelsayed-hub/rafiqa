// بعد أي تعديل في content/*.json شغّلي: node scripts/build-manifest.mjs
// بيحسب بصمة لكل ملف، والتطبيق بينزّل بس الملفات اللي اتغيرت.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
const packs = {};
for (const f of readdirSync('content').filter((x) => x.endsWith('.json') && x !== 'manifest.json').sort()) {
  const txt = readFileSync(`content/${f}`, 'utf8');
  JSON.parse(txt); // نتأكد إن الملف سليم
  packs[f.replace('.json', '')] = createHash('sha1').update(txt).digest('hex').slice(0, 12);
}
writeFileSync('content/manifest.json', JSON.stringify({ updated: new Date().toISOString().slice(0, 10), packs }, null, 1) + '\n');
console.log(packs);
