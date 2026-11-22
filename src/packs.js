// تحميل «الكتب» (ملفات المحتوى):
// 1) أول ما التطبيق يتفتح: بيقرا آخر نسخة محفوظة على الموبايل.
// 2) لو مفيش نسخة محفوظة (أول تشغيل): بيستخدم النسخة اللي جاية مع التطبيق.
// 3) في الخلفية: بيشوف لو فيه تحديث على الإنترنت، فينزّله ويحفظه ويعرضه على طول.
import { Platform } from 'react-native';
import * as FS from 'expo-file-system/legacy';
import { applyPacks } from './data';

export const CONTENT_URL = 'https://raw.githubusercontent.com/gamalelsayed-hub/rafiqa/main/content/';

const BUNDLED = {
  cycle: () => require('../content/cycle.json'),
  fiqh: () => require('../content/fiqh.json'),
  seerah: () => require('../content/seerah.json'),
  status: () => require('../content/status.json'),
  parenting: () => require('../content/parenting.json'),
  life: () => require('../content/life.json'),
  pregnancy: () => require('../content/pregnancy.json'),
  fitness: () => require('../content/fitness.json'),
  library: () => require('../content/library.json'),
};
export const PACK_NAMES = Object.keys(BUNDLED);

const DIR = Platform.OS !== 'web' && FS.documentDirectory ? `${FS.documentDirectory}packs/` : null;
const K = {};

async function readLocal(name) {
  if (!DIR) return null;
  try {
    const info = await FS.getInfoAsync(`${DIR}${name}.json`);
    if (!info.exists) return null;
    return JSON.parse(await FS.readAsStringAsync(`${DIR}${name}.json`));
  } catch {
    return null;
  }
}

export async function loadAll() {
  await Promise.all(
    PACK_NAMES.map(async (n) => {
      K[n] = (await readLocal(n)) || BUNDLED[n]();
    })
  );
  applyPacks(K);
}

async function fetchJson(url, ms = 8000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctl.signal, cache: 'no-store' });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

// بترجع عدد الملفات اللي اتحدثت
export async function checkUpdates() {
  if (!DIR) return 0;
  const remote = await fetchJson(`${CONTENT_URL}manifest.json`);
  if (!remote?.packs) return 0;
  let local = {};
  try {
    local = JSON.parse(await FS.readAsStringAsync(`${DIR}manifest.json`));
  } catch {
    local = (BUNDLED_MANIFEST && BUNDLED_MANIFEST()) || {};
  }
  let changed = 0;
  await FS.makeDirectoryAsync(DIR, { intermediates: true }).catch(() => {});
  for (const n of PACK_NAMES) {
    const want = remote.packs[n];
    if (!want || local.packs?.[n] === want) continue;
    const data = await fetchJson(`${CONTENT_URL}${n}.json?v=${want}`, 15000);
    if (!data || typeof data !== 'object') continue;
    await FS.writeAsStringAsync(`${DIR}${n}.json`, JSON.stringify(data));
    K[n] = data;
    local.packs = { ...(local.packs || {}), [n]: want };
    changed++;
  }
  if (changed) {
    await FS.writeAsStringAsync(`${DIR}manifest.json`, JSON.stringify(local));
    applyPacks(K);
  }
  return changed;
}

const BUNDLED_MANIFEST = () => require('../content/manifest.json');
