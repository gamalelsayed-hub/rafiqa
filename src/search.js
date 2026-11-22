// «اسألي»: بحث ذكي بالعربي في كل محتوى التطبيق (من غير إنترنت).
// بيفهم العامية والكلمات القريبة، وبيرتب النتايج حسب الأقرب لسؤالك.
// الإجابات كلها من المحتوى الموثق في التطبيق، ومفيش أي إجابة بتتألف.

import {
  ALL_WOMEN, BIRR, CALM_TIPS, DOUBTS, EXERCISES, DETAILS, FEELINGS, FIQH, HEALTH, LABOR, LIFE, PHASES,
  POSTPARTUM, PURITY_SIGNS, STAGES, INHERITANCE, VERSION, HONOR, DEFENSE,
} from './data';
import { buildLibrary } from './library';

const TASHKEEL = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;

export function norm(s) {
  return String(s)
    .replace(TASHKEEL, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/[ءئ]/g, '')
    .toLowerCase();
}

const STOP = new Set(
  'في من على عن الى الي هل ايه اي ازاي ليه امتي فين مين ممكن ينفع يجوز حكم انا انتي عندي عندنا لو و او يا ده دي دا اللي التي الذي مع ما لا كان كانت هو هي بس كده كدا يعني طيب عايزه عايز اعمل اعرف لازم حد'.split(' ').map(norm)
);

// كلمات بتتقال بأكتر من طريقة
const SYN = {
  بريود: ['حيض', 'دوره'], البريود: ['حيض', 'دوره'], دوره: ['حيض'], الدوره: ['حيض'], العاده: ['حيض'], عاده: ['حيض'], حايض: ['حيض'], الحيض: ['حيض'],
  مانيكير: ['طلاء', 'اظافر', 'مانيكير'], مناكير: ['طلاء', 'اظافر', 'مانيكير'], طلاء: ['مانيكير'], ضوافر: ['اظافر'], ضوافري: ['اظافر'],
  طهرت: ['طهر', 'قصه', 'جفوف'], الطهر: ['طهر', 'قصه', 'جفوف'], افرازات: ['افرازات', 'رطوبه'],
  حامل: ['حمل', 'حامل'], حمل: ['حامل'], ولاده: ['ولاده', 'نفاس'], ولدت: ['ولاده', 'نفاس'], نفاس: ['نفاس'], رضاعه: ['رضاعه', 'ترضع', 'مرضع'], مرضع: ['رضاعه'],
  ميراث: ['ميراث', 'ورث', 'تركه'], ورث: ['ميراث'], تركه: ['ميراث'],
  غسل: ['غسل', 'اغتسال'], استحمام: ['غسل'], جنابه: ['غسل', 'جنابه'], احتلام: ['احتلمت', 'غسل'],
  صيام: ['صيام', 'صوم', 'رمضان'], صوم: ['صيام'], رمضان: ['صيام'],
  جوزي: ['زوج'], زوجي: ['زوج'], جوز: ['زوج'], مراتي: ['زوجه'],
  عيالي: ['اولاد', 'ابناء'], ولادي: ['اولاد', 'ابناء'], ابني: ['اولاد', 'ولد'], بنتي: ['بنات', 'بنت'],
  حواجب: ['حواجب', 'نمص'], حاجب: ['نمص'], شعري: ['شعر'], صبغه: ['صبغه'], مكياج: ['مكياج'],
  برفان: ['عطر'], بارفان: ['عطر'], ريحه: ['عطر'],
  قران: ['قران', 'مصحف'], مصحف: ['قران', 'مصحف'],
  اتاخرت: ['تاخير', 'متاخره', 'تاخر'], متاخره: ['تاخير', 'تاخر'], تاخير: ['تاخر'],
  عصبيه: ['عصبيه', 'غضب'], زعلانه: ['حزن', 'متضايقه'], مخنوقه: ['متضايقه', 'قلق'], قلقانه: ['قلق'],
  تخسيس: ['تخسيس', 'حرق'], رجيم: ['تخسيس'], وزن: ['تخسيس', 'وزن'],
  حجاب: ['حجاب', 'خمار'], لبس: ['لبس', 'حجاب'],
  وسواس: ['وسواس', 'شك'], شك: ['وسواس', 'شك'], بشك: ['وسواس', 'شك'],
  طلاق: ['طلاق', 'عده'], اتطلقت: ['طلاق', 'عده'], ارمله: ['متوفي', 'عده', 'احداد'],
  ضرب: ['ضرب', 'ظلم', 'عنف'], يضربني: ['ضرب', 'ظلم'], ظالمني: ['ظلم'], اعلم: ['علم', 'تعليم'], وضو: ['وضو', 'وضوء'],
  تكيس: ['تكيس'], انيميا: ['انيميا', 'دم'],
};

function stem(w) {
  let x = w;
  // أفعال العامية: بيضربني، بتعمل، هيروح
  if (x.length > 5 && /^(بي|بت|بن|هي|هت|هن)/.test(x)) x = x.slice(2);
  for (const p of ['وال', 'بال', 'فال', 'كال', 'لل', 'ال']) {
    if (x.startsWith(p) && x.length - p.length >= 2) {
      x = x.slice(p.length);
      break;
    }
  }
  if (x.length > 4 && x.startsWith('و')) x = x.slice(1);
  for (const s of ['هما', 'كما', 'ني', 'ات', 'ين', 'ون', 'ها', 'هم', 'كم', 'نا', 'ه', 'ي', 'ك']) {
    if (x.endsWith(s) && x.length - s.length >= 3) {
      x = x.slice(0, -s.length);
      break;
    }
  }
  return x;
}

export function tokens(s) {
  return norm(s)
    .split(/[^ء-يa-z0-9]+/)
    .filter((w) => w.length >= 2 && !STOP.has(w));
}

let index = null;
let indexVersion = -1;
let df = new Map();

function add(list, type, title, body, route, extra = {}) {
  const text = Array.isArray(body) ? body.join(' ') : body;
  const nt = norm(title);
  const nb = norm(text);
  const toks = new Set([...tokens(title), ...tokens(text)].map(stem));
  list.push({ type, title, body: text, route, nt, nb, toks, ...extra });
}

function buildIndex() {
  if (index && indexVersion === VERSION) return index;
  const L = [];
  for (const t of FIQH) for (const it of t.items) add(L, 'حكم', it.q, it.a, ['fiqhTopic', { id: t.id }], { sub: t.title });
  const lib = buildLibrary();
  const cut = (t) => (t.length > 70 ? `${t.slice(0, 70)}…` : t);
  for (const a of lib.ayat) add(L, 'آية', `﴿${cut(a.text)}﴾`, a.text, ['library', {}], { sub: `سورة ${a.surah}: ${a.ayah}`, full: `﴿${a.text}﴾` });
  for (const h of lib.hadith) add(L, 'حديث', `«${cut(h.text)}»`, h.text, ['library', {}], { sub: h.src, full: `«${h.text}»` });
  for (const w of ALL_WOMEN) add(L, 'سيرة', w.name, [w.title, w.short, ...w.story, ...(w.life || []), ...w.lessons], ['woman', { id: w.id }], { sub: w.title });
  for (const f of FEELINGS) add(L, 'لنفسك', f.q, f.a, ['status', {}]);
  for (const d of DOUBTS) add(L, 'رد على شبهة', d.q, d.a, ['status', {}]);
  add(L, 'مكانتك', 'كرامة المرأة في الإسلام', HONOR, ['status', {}]);
  add(L, 'مكانتك', 'إزاي ما تنساقيش وراء الشبهات', DEFENSE, ['status', {}]);
  for (const s of STAGES) add(L, 'تربية', `${s.name}${s.age ? ` (${s.age})` : ''}`, [s.role, ...s.common, ...s.boys, ...s.girls], ['stage', { id: s.id }]);
  for (const b of BIRR.after) add(L, 'بر الوالدين', b.t, b.d, ['birr', {}]);
  add(L, 'الميراث', 'الميراث والتركات', [INHERITANCE.intro, ...INHERITANCE.order, ...INHERITANCE.shares.map((x) => `${x.who}: ${x.rule}`), ...INHERITANCE.doubts], ['inheritance', {}]);
  for (const l of LIFE) for (const s of l.sections) add(L, 'مراحل حياتي', `${l.name}: ${s.title}`, s.points, ['lifeStage', { id: l.id }]);
  for (const h of HEALTH) add(L, 'صحة', h.title, h.points, ['health', {}]);
  for (const p of POSTPARTUM) add(L, 'بعد الولادة', p.title, p.points, ['postpartum', {}]);
  add(L, 'الحمل', 'علامات الولادة وشنطة الولادة', [...LABOR.signs, LABOR.rule, ...LABOR.bag], ['preg', {}]);
  add(L, 'الطهارة', 'علامات الطهر: القصة البيضاء والجفوف', [PURITY_SIGNS.intro, ...PURITY_SIGNS.signs.map((s) => `${s.title}: ${s.text}`), ...PURITY_SIGNS.howTo], ['purity', {}]);
  for (const [k, ph] of Object.entries(PHASES)) add(L, 'الدورة', ph.name, [ph.summary, ...ph.body, ...ph.mood, ...ph.tips], ['cycle', {}]);
  for (const [k, tips] of Object.entries(CALM_TIPS)) add(L, 'تهدئة', `لو ${k}`, tips, ['calm', {}]);
  for (const [id, e] of Object.entries(EXERCISES)) add(L, 'تمرين', e.name, [...e.steps, e.tip || '', DETAILS[id]?.target || ''], ['exercise', { id, cat: e.cat }]);
  // كل ما الكلمة نادرة في المحتوى، وزنها في البحث بيزيد
  df = new Map();
  for (const d of L) for (const t of d.toks) df.set(t, (df.get(t) || 0) + 1);
  index = L;
  indexVersion = VERSION;
  return L;
}

const TYPE_BOOST = { سيرة: 1.4, حكم: 1.35, آية: 1.2, حديث: 1.2, 'رد على شبهة': 1.15, لنفسك: 1.1 };

export function ask(question, limit = 25) {
  const base = tokens(question);
  if (!base.length) return [];
  // كل كلمة في السؤال + مرادفاتها
  const groups = base.map((w) => {
    const alts = new Set([w, stem(w), ...(SYN[w] || []), ...(SYN[stem(w)] || [])].map(norm));
    return [...alts];
  });
  const phrase = norm(question).trim();
  const all = buildIndex();
  const N = all.length;
  const idf = (a) => 1 + Math.log(N / (1 + (df.get(stem(a)) || 0)));
  const out = [];
  for (const d of all) {
    let score = 0;
    let hit = 0;
    for (const alts of groups) {
      let best = 0;
      for (const a of alts) {
        const sa = stem(a);
        const w = idf(a);
        if (a.length >= 4 && d.nt.includes(a)) best = Math.max(best, 4 * w);
        else if (d.toks.has(sa)) best = Math.max(best, 2 * w);
        else if (a.length >= 4 && d.nb.includes(a)) best = Math.max(best, 1.5 * w);
      }
      if (best) hit++;
      score += best;
    }
    if (!hit) continue;
    // الأفضل إن كل كلمات السؤال تكون موجودة
    score *= 0.4 + 0.6 * (hit / groups.length);
    if (phrase.length > 6 && (d.nt.includes(phrase) || d.nb.includes(phrase))) score += 15;
    score *= TYPE_BOOST[d.type] || 1;
    out.push({ ...d, score });
  }
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, limit);
}

export const EXAMPLES = [
  'ينفع أصلي بالمانيكير؟',
  'أعرف إزاي إني طهرت؟',
  'أقرا قرآن وأنا حايض؟',
  'البريود اتأخرت',
  'صيام الحامل',
  'عدة الأرملة',
  'ليه البنت نص الولد في الميراث؟',
  'بشك في وضوئي',
  'إزاي أعلّم ابني الصلاة؟',
  'حاسة إني ضعيفة',
];
