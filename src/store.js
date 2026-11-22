import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FS from 'expo-file-system/legacy';
import { addDays, analyze, todayKey } from './cycle';
import { reschedule } from './notifications';

const KEY = 'rafiqa:data:v2';

export const DEFAULT_SETTINGS = {
  fontScale: 1,
  notifications: true,
  notif: { pms: true, period: true, purity: true, fertility: false, late: true, istihdad: true, preg: true },
  journal: { on: false, h: 21, m: 30 },
  seerah: { on: true, h: 8, m: 0 },
  workout: { on: false, days: [0, 2, 4], h: 18, m: 0 },
  lastIstihdad: null,
};

const EMPTY = {
  periods: [],
  journal: {},
  settings: DEFAULT_SETTINGS,
  pregnancy: null, // { lmp, birth, checks: {id: {done, date, files: []}}, visits: [], kicks: [], contractions: [] }
  workouts: { log: [], custom: {} },
  seerahRead: [],
  favorites: [],
};

function merge(parsed) {
  const s = parsed.settings || {};
  return {
    ...EMPTY,
    ...parsed,
    workouts: { ...EMPTY.workouts, ...(parsed.workouts || {}) },
    settings: {
      ...DEFAULT_SETTINGS,
      ...s,
      notif: { ...DEFAULT_SETTINGS.notif, ...(s.notif || {}) },
      journal: { ...DEFAULT_SETTINGS.journal, ...(s.journal || {}) },
      seerah: { ...DEFAULT_SETTINGS.seerah, ...(s.seerah || {}) },
      workout: { ...DEFAULT_SETTINGS.workout, ...(s.workout || {}) },
    },
  };
}

export const DataCtx = createContext(null);
export const useApp = () => useContext(DataCtx);

const FILE_DIR = FS.documentDirectory ? `${FS.documentDirectory}rafiqa/` : null;

// بنسخ الملف (صورة تحليل أو سونار أو PDF) جوه مساحة التطبيق عشان ما يضيعش لو اتمسح من المعرض
export async function keepFile(uri, name, type) {
  if (!FILE_DIR) return { uri, name, type };
  try {
    await FS.makeDirectoryAsync(FILE_DIR, { intermediates: true });
  } catch {}
  const ext = (name && name.includes('.') ? name.split('.').pop() : type === 'pdf' ? 'pdf' : 'jpg').toLowerCase();
  const dest = `${FILE_DIR}${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
  try {
    await FS.copyAsync({ from: uri, to: dest });
    return { uri: dest, name: name || `ملف.${ext}`, type };
  } catch {
    return { uri, name, type };
  }
}

export async function dropFile(uri) {
  if (FILE_DIR && uri.startsWith(FILE_DIR)) {
    try {
      await FS.deleteAsync(uri, { idempotent: true });
    } catch {}
  }
}

// كل البيانات بتتحفظ على الموبايل بس، ومش بتتبعت لأي سيرفر.
export function useData() {
  const [data, setData] = useState(null);
  const loaded = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        setData(merge(raw ? JSON.parse(raw) : {}));
      } catch {
        setData(merge({}));
      }
      loaded.current = true;
    })();
  }, []);

  const info = useMemo(() => (data ? analyze(data.periods, todayKey()) : { hasData: false }), [data]);

  useEffect(() => {
    if (!data || !loaded.current) return;
    AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {});
    const t = setTimeout(() => reschedule(info, data), 800); // نستنى شوية عشان ما نعيدش الجدولة مع كل ضغطة
    return () => clearTimeout(t);
  }, [data, info]);

  const update = useCallback((fn) => setData((d) => fn(d)), []);

  const actions = useMemo(
    () => ({
      // ——— الدورة ———
      startPeriod(start) {
        update((d) => {
          const periods = d.periods
            .filter((p) => p.start !== start)
            .map((p) => (!p.end && p.start < start ? { ...p, end: maxKey(addDays(start, -1), p.start) } : p));
          periods.push({ start, end: null });
          periods.sort((a, b) => a.start.localeCompare(b.start));
          return { ...d, periods };
        });
      },
      endPeriod(start, end) {
        update((d) => ({ ...d, periods: d.periods.map((p) => (p.start === start ? { ...p, end } : p)) }));
      },
      reopenPeriod(start) {
        update((d) => ({ ...d, periods: d.periods.map((p) => (p.start === start ? { ...p, end: null } : p)) }));
      },
      removePeriod(start) {
        update((d) => ({ ...d, periods: d.periods.filter((p) => p.start !== start) }));
      },
      saveEntry(date, entry) {
        update((d) => {
          const journal = { ...d.journal };
          const empty = !entry.mood && !(entry.symptoms || []).length && !entry.flow && !entry.note;
          if (empty) delete journal[date];
          else journal[date] = entry;
          return { ...d, journal };
        });
      },
      // ——— الإعدادات ———
      setSetting(k, v) {
        update((d) => ({ ...d, settings: { ...d.settings, [k]: v } }));
      },
      setNotif(k, v) {
        update((d) => ({ ...d, settings: { ...d.settings, notif: { ...d.settings.notif, [k]: v } } }));
      },
      setGroup(group, patch) {
        update((d) => ({ ...d, settings: { ...d.settings, [group]: { ...d.settings[group], ...patch } } }));
      },
      // ——— الحمل ———
      startPregnancy(lmp) {
        update((d) => ({ ...d, pregnancy: { lmp, birth: null, checks: {}, visits: [], kicks: [], contractions: [] } }));
      },
      setPreg(patch) {
        update((d) => ({ ...d, pregnancy: { ...d.pregnancy, ...patch } }));
      },
      setCheck(id, patch) {
        update((d) => {
          const checks = { ...(d.pregnancy.checks || {}) };
          checks[id] = { files: [], ...(checks[id] || {}), ...patch };
          return { ...d, pregnancy: { ...d.pregnancy, checks } };
        });
      },
      addVisit(v) {
        update((d) => ({
          ...d,
          pregnancy: { ...d.pregnancy, visits: [...(d.pregnancy.visits || []), { id: String(Date.now()), ...v }].sort((a, b) => b.date.localeCompare(a.date)) },
        }));
      },
      removeVisit(id) {
        update((d) => ({ ...d, pregnancy: { ...d.pregnancy, visits: d.pregnancy.visits.filter((v) => v.id !== id) } }));
      },
      endPregnancy() {
        update((d) => ({ ...d, pregnancy: null }));
      },
      pushTo(listName, item) {
        update((d) => ({ ...d, pregnancy: { ...d.pregnancy, [listName]: [item, ...(d.pregnancy[listName] || [])].slice(0, 60) } }));
      },
      // ——— التمارين ———
      logWorkout(entry) {
        update((d) => ({ ...d, workouts: { ...d.workouts, log: [entry, ...d.workouts.log].slice(0, 200) } }));
      },
      setRoutineCustom(id, patch) {
        update((d) => ({
          ...d,
          workouts: { ...d.workouts, custom: { ...d.workouts.custom, [id]: { ...(d.workouts.custom[id] || {}), ...patch } } },
        }));
      },
      // ——— السيرة ———
      markRead(id) {
        update((d) => (d.seerahRead.includes(id) ? d : { ...d, seerahRead: [...d.seerahRead, id] }));
      },
      toggleFav(id) {
        update((d) => ({ ...d, favorites: d.favorites.includes(id) ? d.favorites.filter((x) => x !== id) : [...d.favorites, id] }));
      },
      wipe() {
        update(() => merge({}));
      },
    }),
    [update]
  );

  return { data, info, actions };
}

function maxKey(a, b) {
  return a < b ? b : a;
}
