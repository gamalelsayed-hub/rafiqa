// كل محتوى التطبيق بيتحمّل هنا من ملفات content/*.json وقت فتح التطبيق
// (من التخزين أو من التحديثات اللي نزلت من النت). الكود نفسه ما فيهوش أي محتوى.
// المتغيرات دي «live bindings»: أي شاشة بتقراها بتاخد آخر نسخة اتحملت.

export let PHASES, CALM_TIPS, SYMPTOMS, MOODS, FLOW, PURITY_SIGNS, HEALTH, HEALTH_SOURCES, BREATHING;
export let FIQH, FIQH_NOTE, FIQH_SOURCES;
export let GROUPS, ALL_WOMEN;
export let HONOR, FEELINGS, DOUBTS, DEFENSE;
export let PARENT_INTRO, STAGES, BIRR, INHERITANCE;
export let LIFE;
export let TRIMESTERS, WEEKS, CHECKS, DANGER, PREG_TIPS, LABOR, POSTPARTUM;
export let POSES, CATS, EXERCISES, ROUTINES, SAFETY, DETAILS, PHASE_PLAN, WARM_SECS;
export let BOOKS, METHOD, SURAH;
export let VERSION = 0;

export function applyPacks(K) {
  const c = K.cycle;
  PHASES = c.phases; CALM_TIPS = c.calm; SYMPTOMS = c.symptoms; MOODS = c.moods; FLOW = c.flow;
  PURITY_SIGNS = c.purity; HEALTH = c.health; HEALTH_SOURCES = c.healthSources; BREATHING = c.breathing;
  FIQH = K.fiqh.topics; FIQH_NOTE = K.fiqh.note; FIQH_SOURCES = K.fiqh.sources;
  GROUPS = K.seerah.groups; ALL_WOMEN = K.seerah.women;
  HONOR = K.status.honor; FEELINGS = K.status.feelings; DOUBTS = K.status.doubts; DEFENSE = K.status.defense;
  PARENT_INTRO = K.parenting.intro; STAGES = K.parenting.stages; BIRR = K.parenting.birr; INHERITANCE = K.parenting.inheritance;
  LIFE = K.life.stages;
  const p = K.pregnancy;
  TRIMESTERS = p.trimesters; WEEKS = p.weeks; CHECKS = p.checks; DANGER = p.danger; PREG_TIPS = p.tips; LABOR = p.labor; POSTPARTUM = p.postpartum;
  const f = K.fitness;
  POSES = f.poses; CATS = f.cats; EXERCISES = f.exercises; ROUTINES = f.routines; SAFETY = f.safety;
  DETAILS = f.details; PHASE_PLAN = f.phasePlan; WARM_SECS = f.warmSecs;
  BOOKS = K.library.books; METHOD = K.library.method; SURAH = K.library.surah;
  VERSION += 1;
}
