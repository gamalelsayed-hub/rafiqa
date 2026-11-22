// المحتوى نفسه في content/parenting.json، وهنا حاسبة الميراث بس.
export { PARENT_INTRO, STAGES, BIRR, INHERITANCE } from './data';

/**
 * حاسبة ميراث مبسطة للحالات الشائعة:
 * زوج أو زوجات، أبناء، بنات، أب، أم. (من غير إخوة ولا أجداد)
 * بترجع أنصبة كنسب من التركة الصافية، وبتطبق العول والرد.
 */
export function calcInheritance({ deceased = 'male', wives = 0, husband = false, sons = 0, daughters = 0, father = false, mother = false }) {
  const kids = sons + daughters > 0;
  const shares = []; // {who, frac, each}
  const spouseFrac = deceased === 'male' ? (wives > 0 ? (kids ? 1 / 8 : 1 / 4) : 0) : husband ? (kids ? 1 / 4 : 1 / 2) : 0;
  const hasSpouse = spouseFrac > 0;

  const spouse = spouseFrac;
  const fatherFixed = father && kids ? 1 / 6 : 0;
  let motherFixed = 0;
  if (mother) {
    if (kids) motherFixed = 1 / 6;
    else if (hasSpouse && father) motherFixed = (1 - spouse) / 3; // العُمَريّتان: ثلث الباقي
    else motherFixed = 1 / 3;
  }
  const daughtersFixed = daughters > 0 && sons === 0 ? (daughters === 1 ? 1 / 2 : 2 / 3) : 0;

  const fixed = spouse + fatherFixed + motherFixed + daughtersFixed;
  // العَول: لو الفروض زادت عن التركة، بتتقسم بنسبتها
  const awl = fixed > 1 + 1e-9;
  const scale = awl ? 1 / fixed : 1;
  const spouseTotal = spouse * scale;
  let fatherTotal = fatherFixed * scale;
  let motherTotal = motherFixed * scale;
  let daughtersTotal = daughtersFixed * scale;
  let sonsTotal = 0;
  let rest = Math.max(0, 1 - fixed * scale);

  if (sons > 0) {
    // الأبناء عصبة، ومعاهم البنات للذكر مثل حظ الأنثيين
    const units = sons * 2 + daughters;
    sonsTotal = (rest * sons * 2) / units;
    daughtersTotal = (rest * daughters) / units;
    rest = 0;
  } else if (father) {
    fatherTotal += rest;
    rest = 0;
  }

  // الرَّد: الباقي يرجع لأصحاب الفروض بنسبتهم، ما عدا الزوجين
  let radd = false;
  const pool = daughtersTotal + motherTotal;
  if (rest > 1e-9 && pool > 0) {
    radd = true;
    const k = 1 + rest / pool;
    daughtersTotal *= k;
    motherTotal *= k;
    rest = 0;
  }

  if (hasSpouse) {
    const v = spouseTotal;
    if (deceased === 'male') shares.push({ who: wives > 1 ? `الزوجات (${wives})` : 'الزوجة', frac: v, each: wives > 1 ? v / wives : null });
    else shares.push({ who: 'الزوج', frac: v });
  }
  if (sons > 0) shares.push({ who: sons > 1 ? `الأبناء (${sons})` : 'الابن', frac: sonsTotal, each: sons > 1 ? sonsTotal / sons : null });
  if (daughters > 0) shares.push({ who: daughters > 1 ? `البنات (${daughters})` : 'البنت', frac: daughtersTotal, each: daughters > 1 ? daughtersTotal / daughters : null });
  if (father) shares.push({ who: 'الأب', frac: fatherTotal });
  if (mother) shares.push({ who: 'الأم', frac: motherTotal });
  if (rest > 1e-9) shares.push({ who: 'الباقي (لعصبة آخرين: إخوة أو أعمام... اسألي متخصص)', frac: rest });

  return { shares, awl, radd };
}
