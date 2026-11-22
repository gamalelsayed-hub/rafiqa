// «المكتبة»: كل المصادر اللي التطبيق بياخد منها.
// الآيات والأحاديث بتتجمع تلقائيًا من كل محتوى التطبيق مع تخريجها،
// عشان تقدري تراجعي أي معلومة من مصدرها.

import { FIQH } from './fiqh';
import { WOMEN_1 } from './seerah1';
import { WOMEN_2 } from './seerah2';
import { HONOR, FEELINGS, DOUBTS, DEFENSE } from './status';
import { STAGES, BIRR, INHERITANCE, PARENT_INTRO } from './parenting';
import { LIFE } from './life';
import { POSTPARTUM, LABOR } from './pregnancy';
import { PURITY_SIGNS, CALM_TIPS } from './content';

export const BOOKS = [
  { cat: 'القرآن الكريم وتفسيره', items: [
    { t: 'القرآن الكريم', a: 'كلام الله تعالى', d: 'المصدر الأول لكل حكم في التطبيق.' },
    { t: 'جامع البيان عن تأويل آي القرآن', a: 'الإمام الطبري (ت 310 هـ)', d: 'تفسير بالمأثور عن الصحابة والتابعين. نقلنا منه تفسير ابن عباس لآيتي الدرجة والضرب.' },
    { t: 'تفسير القرآن العظيم', a: 'الحافظ ابن كثير (ت 774 هـ)', d: 'مرجعنا لقصص نساء القرآن ومعاني الآيات.' },
  ] },
  { cat: 'الحديث الشريف', items: [
    { t: 'صحيح البخاري', a: 'الإمام البخاري (ت 256 هـ)', d: 'أصح كتاب بعد القرآن. «متفق عليه» معناها إن البخاري ومسلم رووا الحديث الاتنين.' },
    { t: 'صحيح مسلم', a: 'الإمام مسلم (ت 261 هـ)', d: '' },
    { t: 'السنن الأربعة', a: 'أبو داود، والترمذي، والنسائي، وابن ماجه', d: 'ما نقلناه منها نقلناه مع درجة صحته.' },
    { t: 'مسند الإمام أحمد', a: 'الإمام أحمد بن حنبل (ت 241 هـ)', d: '' },
    { t: 'المستدرك على الصحيحين', a: 'الحاكم النيسابوري (ت 405 هـ)', d: '' },
    { t: 'الأدب المفرد', a: 'الإمام البخاري', d: '' },
    { t: 'أحكام الشيخ الألباني', a: 'صحيح وضعيف السنن', d: 'اعتمدنا عليها في الحكم على أحاديث السنن، ومعاها أحكام الترمذي والنووي.' },
  ] },
  { cat: 'الفقه والإجماع', items: [
    { t: 'المغني', a: 'ابن قدامة المقدسي (ت 620 هـ)', d: 'مرجع الفقه الحنبلي والمقارن.' },
    { t: 'المجموع شرح المهذب', a: 'الإمام النووي (ت 676 هـ)', d: 'مرجع الفقه الشافعي والمقارن.' },
    { t: 'بدائع الصنائع', a: 'الكاساني (ت 587 هـ)', d: 'مرجع الفقه الحنفي.' },
    { t: 'الشرح الكبير على مختصر خليل', a: 'الدردير (ت 1201 هـ)', d: 'مرجع الفقه المالكي.' },
    { t: 'الإجماع', a: 'ابن المنذر (ت 319 هـ)', d: 'لما نقول «بالإجماع» بنرجع له ولمراتب الإجماع.' },
    { t: 'مراتب الإجماع', a: 'ابن حزم (ت 456 هـ)', d: '' },
    { t: 'الموسوعة الفقهية الكويتية', a: 'وزارة الأوقاف الكويتية', d: 'لعرض أقوال المذاهب الأربعة.' },
    { t: 'فتاوى دار الإفتاء المصرية', a: 'dar-alifta.org', d: 'للمسائل المعاصرة.' },
  ] },
  { cat: 'السيرة والتراجم', items: [
    { t: 'السيرة النبوية', a: 'ابن هشام (ت 218 هـ) عن ابن إسحاق', d: '' },
    { t: 'الطبقات الكبرى', a: 'ابن سعد (ت 230 هـ)', d: 'الجزء الثامن مخصص لتراجم النساء.' },
    { t: 'الاستيعاب في معرفة الأصحاب', a: 'ابن عبد البر (ت 463 هـ)', d: '' },
    { t: 'الإصابة في تمييز الصحابة', a: 'ابن حجر العسقلاني (ت 852 هـ)', d: 'أوثق كتب تراجم الصحابة والصحابيات.' },
    { t: 'سير أعلام النبلاء', a: 'الإمام الذهبي (ت 748 هـ)', d: 'لتراجم التابعيات والصالحات.' },
    { t: 'وفيات الأعيان', a: 'ابن خلكان (ت 681 هـ)', d: '' },
  ] },
  { cat: 'الطب والصحة', items: [
    { t: 'منظمة الصحة العالمية (WHO)', a: 'who.int', d: 'إرشادات رعاية الحمل (2016)، والرضاعة، وصحة المرأة.' },
    { t: 'الكلية الأمريكية لأطباء النساء والتوليد (ACOG)', a: 'acog.org', d: 'الدورة غير المنتظمة، ومواعيد تحاليل الحمل، والرياضة في الحمل وبعد الولادة.' },
    { t: 'هيئة الخدمات الصحية البريطانية (NHS)', a: 'nhs.uk', d: 'أعراض ما قبل الدورة، وأسبوع بأسبوع في الحمل.' },
    { t: 'وزارة الصحة والسكان المصرية', a: 'mohp.gov.eg', d: 'جدول التطعيمات، وفحص ما قبل الزواج.' },
  ] },
];

const SURAH = {
  'البقرة': 2, 'يوسف': 12, 'الرعد': 13, 'آل عمران': 3, 'النساء': 4, 'هود': 11, 'إبراهيم': 14, 'النحل': 16, 'الإسراء': 17, 'مريم': 19, 'طه': 20,
  'النور': 24, 'الفرقان': 25, 'القصص': 28, 'الأحزاب': 33, 'الحجرات': 49, 'الذاريات': 51, 'المجادلة': 58, 'الطلاق': 65,
  'التحريم': 66, 'التكوير': 81,
};

function collectStrings(x, out) {
  if (typeof x === 'string') out.push(x);
  else if (Array.isArray(x)) x.forEach((y) => collectStrings(y, out));
  else if (x && typeof x === 'object') Object.values(x).forEach((y) => collectStrings(y, out));
  return out;
}

let cache = null;

export function buildLibrary() {
  if (cache) return cache;
  const sources = [
    ['الأحكام', FIQH], ['قدوتي', [WOMEN_1, WOMEN_2]], ['مكانتك في الإسلام', [HONOR, FEELINGS, DOUBTS, DEFENSE]],
    ['تربية الأبناء', [STAGES, BIRR, INHERITANCE, PARENT_INTRO]], ['مراحل حياتي', LIFE], ['الحمل', [POSTPARTUM, LABOR]],
    ['الطهارة والتهدئة', [PURITY_SIGNS, CALM_TIPS]],
  ];
  const ayat = new Map();
  const hadith = new Map();
  const ayahRe = /﴿([^﴾]+)﴾\s*\(([^():]+):\s*([\d\-–]+)\)/g;
  const hadRe = /«([^»]{12,})»[^«(]{0,40}?\(((?:رواه|متفق)[^)]*)\)/g;
  for (const [section, data] of sources) {
    for (const s of collectStrings(data, [])) {
      for (const m of s.matchAll(ayahRe)) {
        const surah = m[2].trim().replace(/^سورة\s+/, '');
        const key = `${surah}:${m[3]}`;
        if (!ayat.has(key)) ayat.set(key, { text: m[1].trim(), surah, ayah: m[3], n: SURAH[surah], sections: new Set() });
        ayat.get(key).sections.add(section);
      }
      for (const m of s.matchAll(hadRe)) {
        const text = m[1].trim();
        if (!hadith.has(text)) hadith.set(text, { text, src: m[2].trim(), sections: new Set() });
        hadith.get(text).sections.add(section);
      }
    }
  }
  const ayatList = [...ayat.values()]
    .map((a) => ({ ...a, sections: [...a.sections] }))
    .sort((a, b) => (a.n || 999) - (b.n || 999) || parseInt(a.ayah, 10) - parseInt(b.ayah, 10));
  const hadithList = [...hadith.values()].map((h) => ({ ...h, sections: [...h.sections] }));
  cache = { ayat: ayatList, hadith: hadithList };
  return cache;
}

export function quranUrl(a) {
  if (!a.n) return null;
  const first = String(a.ayah).split(/[-–]/)[0];
  return `https://quran.com/${a.n}/${first}`;
}

export function dorarUrl(h) {
  const words = h.text.replace(/[^؀-ۿ\s]/g, ' ').split(/\s+/).filter(Boolean).slice(0, 7).join(' ');
  return `https://dorar.net/hadith/search?q=${encodeURIComponent(words)}`;
}

export const METHOD = [
  'أي حكم في التطبيق مأخوذ من القرآن، أو من السنة الصحيحة أو الحسنة، ومكتوب جنبه مصدره.',
  'في المسائل اللي فيها إجماع، كتبنا إنها إجماع ونقلناه من كتب الإجماع.',
  'في المسائل اللي فيها خلاف معتبر بين الأئمة الأربعة، كتبنا قول الجمهور وأشرنا للخلاف، ومفيش مذهب بيلغي التاني.',
  'في السير، ابتعدنا عن القصص الضعيفة والمشهورة على الألسنة من غير سند. ولما نذكر حاجة من كتب السيرة والتراجم، بنقول كده.',
  'المعلومات الطبية من الهيئات العالمية المعتمدة، وهي توعية ومش بديل عن الدكتورة.',
];
