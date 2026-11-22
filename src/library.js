// «المكتبة»: الآيات والأحاديث بتتجمع تلقائيًا من كل المحتوى مع تخريجها.
// قايمة الكتب ومنهج التطبيق في content/library.json
import { ALL_WOMEN, BIRR, CALM_TIPS, DEFENSE, DOUBTS, FEELINGS, FIQH, HONOR, INHERITANCE, LABOR, LIFE, PARENT_INTRO, POSTPARTUM, PURITY_SIGNS, STAGES, SURAH, VERSION } from './data';

export { BOOKS, METHOD } from './data';

function collectStrings(x, out) {
  if (typeof x === 'string') out.push(x);
  else if (Array.isArray(x)) x.forEach((y) => collectStrings(y, out));
  else if (x && typeof x === 'object') Object.values(x).forEach((y) => collectStrings(y, out));
  return out;
}

let cache = null;
let cacheVersion = -1;

export function buildLibrary() {
  if (cache && cacheVersion === VERSION) return cache;
  const sources = [
    ['الأحكام', FIQH], ['قدوتي', ALL_WOMEN], ['مكانتك في الإسلام', [HONOR, FEELINGS, DOUBTS, DEFENSE]],
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
  cacheVersion = VERSION;
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
