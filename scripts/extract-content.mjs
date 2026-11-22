// مرة واحدة: بيطلّع المحتوى من ملفات الكود القديمة لملفات JSON في content/
import { writeFileSync } from 'node:fs';
const c = await import('../src/content.js');
const f = await import('../src/fiqh.js');
const s1 = await import('../src/seerah1.js');
const s2 = await import('../src/seerah2.js');
const st = await import('../src/status.js');
const pa = await import('../src/parenting.js');
const li = await import('../src/life.js');
const pr = await import('../src/pregnancy.js');
const ex = await import('../src/exercises.js');
const lib = await import('../src/library.js');
const packs = {
  cycle: { phases: c.PHASES, calm: c.CALM_TIPS, symptoms: c.SYMPTOMS, moods: c.MOODS, flow: c.FLOW, purity: c.PURITY_SIGNS, health: c.HEALTH, healthSources: c.HEALTH_SOURCES, breathing: c.BREATHING },
  fiqh: { note: f.FIQH_NOTE, sources: f.FIQH_SOURCES, topics: f.FIQH },
  seerah: { groups: s1.GROUPS, women: [...s1.WOMEN_1, ...s2.WOMEN_2] },
  status: { honor: st.HONOR, feelings: st.FEELINGS, doubts: st.DOUBTS, defense: st.DEFENSE },
  parenting: { intro: pa.PARENT_INTRO, stages: pa.STAGES, birr: pa.BIRR, inheritance: pa.INHERITANCE },
  life: { stages: li.LIFE },
  pregnancy: { trimesters: pr.TRIMESTERS, weeks: pr.WEEKS, checks: pr.CHECKS, danger: pr.DANGER, tips: pr.PREG_TIPS, labor: pr.LABOR, postpartum: pr.POSTPARTUM },
  fitness: { poses: ex.POSES, cats: ex.CATS, exercises: ex.EXERCISES, routines: ex.ROUTINES, safety: ex.SAFETY, details: ex.DETAILS, phasePlan: ex.PHASE_PLAN, warmSecs: ex.WARM_SECS },
  library: { books: lib.BOOKS, method: lib.METHOD, surah: lib.SURAH },
};
for (const [k, v] of Object.entries(packs)) writeFileSync(`content/${k}.json`, JSON.stringify(v, null, 1) + '\n');
console.log(Object.keys(packs).join(' '));
