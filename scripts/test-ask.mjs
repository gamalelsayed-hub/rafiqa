import { readFileSync } from 'node:fs';
const { applyPacks } = await import('../src/data.js');
const K = {};
for (const n of ['cycle','fiqh','seerah','status','parenting','life','pregnancy','fitness','library']) K[n] = JSON.parse(readFileSync(`content/${n}.json`, 'utf8'));
applyPacks(K);
const { ask, EXAMPLES } = await import('../src/search.js');
for (const q of [...EXAMPLES, 'جوزي بيضربني', 'خديجة']) {
  const r = ask(q, 3);
  console.log('\n؟', q);
  for (const x of r) console.log('  ', x.score.toFixed(1), x.type, '|', x.title.slice(0, 60));
}
