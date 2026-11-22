// حسابات الدورة: كلها دوال صافية (بدون واجهة) عشان تتختبر بسهولة.
// التواريخ مخزنة كنص بصيغة YYYY-MM-DD بالتوقيت المحلي.

const DAY = 24 * 60 * 60 * 1000;

export function toKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 12); // الظهر لتفادي مشاكل التوقيت الصيفي
}

export function addDays(key, n) {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

export function diffDays(a, b) {
  // عدد الأيام من a إلى b
  return Math.round((fromKey(b) - fromKey(a)) / DAY);
}

export function todayKey() {
  return toKey(new Date());
}

const AR_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const AR_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export function formatDate(key, withDay = false) {
  const d = fromKey(key);
  const base = `${d.getDate()} ${AR_MONTHS[d.getMonth()]}`;
  return withDay ? `${AR_DAYS[d.getDay()]} ${base}` : base;
}

export function monthName(m) {
  return AR_MONTHS[m];
}

function mean(arr) {
  return arr.reduce((s, x) => s + x, 0) / arr.length;
}

function stdev(arr) {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, x) => s + (x - m) ** 2, 0) / (arr.length - 1));
}

const DEFAULT_CYCLE = 28;
const DEFAULT_PERIOD = 6;

/**
 * periods: [{ start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' | null }]
 * بيرجع ملخص الدورة والتوقعات.
 */
export function analyze(periods, today = todayKey()) {
  const sorted = [...periods].sort((a, b) => a.start.localeCompare(b.start));
  if (sorted.length === 0) {
    return { hasData: false };
  }

  // أطوال الدورات (من بداية لبداية). نستبعد القيم الغريبة جدًا (أقل من 15 أو أكتر من 90 يوم)
  // لأنها غالبًا تسجيل غلط أو نزيف مش دورة.
  const lengths = [];
  for (let i = 1; i < sorted.length; i++) {
    const len = diffDays(sorted[i - 1].start, sorted[i].start);
    if (len >= 15 && len <= 90) lengths.push(len);
  }
  const recent = lengths.slice(-6);

  const periodLens = sorted
    .filter((p) => p.end)
    .map((p) => diffDays(p.start, p.end) + 1)
    .filter((n) => n >= 1 && n <= 15)
    .slice(-6);

  // متوسط موزون: الدورات الأحدث ليها وزن أكبر
  let avgCycle = DEFAULT_CYCLE;
  if (recent.length) {
    let w = 0;
    let s = 0;
    recent.forEach((len, i) => {
      const weight = i + 1;
      s += len * weight;
      w += weight;
    });
    avgCycle = Math.round(s / w);
  }
  const sd = recent.length >= 2 ? stdev(recent) : null;
  const spread = recent.length ? Math.max(...recent) - Math.min(...recent) : null;
  // الدورة بتعتبر غير منتظمة لو الفرق بين أقصر وأطول دورة أكتر من 7-9 أيام
  const irregular = recent.length >= 2 && (spread > 8 || sd > 5);
  const avgPeriod = periodLens.length ? Math.round(mean(periodLens)) : DEFAULT_PERIOD;

  const last = sorted[sorted.length - 1];
  const onPeriod = !last.end && diffDays(last.start, today) >= 0 && diffDays(last.start, today) < 15;
  const dayOfPeriod = onPeriod ? diffDays(last.start, today) + 1 : null;

  // نافذة التوقع: كل ما الدورة أقل انتظامًا النافذة بتوسع
  let margin;
  if (recent.length === 0) margin = 5;
  else if (recent.length === 1) margin = 4;
  else margin = Math.max(2, Math.min(10, Math.round(sd ?? 2)));

  const nextStart = addDays(last.start, avgCycle);
  const windowStart = addDays(nextStart, -margin);
  const windowEnd = addDays(nextStart, margin);

  // التبويض تقريبًا 14 يوم قبل الدورة الجاية
  const ovulation = addDays(nextStart, -14);
  const fertileStart = addDays(ovulation, -5);
  const fertileEnd = addDays(ovulation, 1);

  const pmsStart = addDays(nextStart, -7);

  const daysSinceStart = diffDays(last.start, today);
  const cycleDay = daysSinceStart + 1;
  const daysUntilNext = diffDays(today, nextStart);
  // التأخير بيتحسب من آخر النافذة المتوقعة، مش من اليوم المتوقع بالظبط
  const daysLate = onPeriod ? 0 : Math.max(0, diffDays(windowEnd, today));
  const daysPastExpected = onPeriod ? 0 : Math.max(0, -daysUntilNext);

  let phase;
  if (onPeriod) phase = 'period';
  else if (daysPastExpected > 0) phase = 'late';
  else if (today >= fertileStart && today <= fertileEnd) phase = today === ovulation ? 'ovulation' : 'fertile';
  else if (today >= pmsStart) phase = 'pms';
  else if (today < fertileStart) phase = 'follicular';
  else phase = 'luteal';

  const confidence = recent.length >= 3 && !irregular ? 'high' : recent.length >= 1 ? 'medium' : 'low';

  return {
    hasData: true,
    sorted,
    last,
    lengths: recent,
    avgCycle,
    avgPeriod,
    sd,
    spread,
    irregular,
    margin,
    onPeriod,
    dayOfPeriod,
    cycleDay,
    nextStart,
    windowStart,
    windowEnd,
    ovulation,
    fertileStart,
    fertileEnd,
    pmsStart,
    daysUntilNext,
    daysLate,
    daysPastExpected,
    phase,
    confidence,
  };
}

/**
 * إرشاد التأخير واحتمال الحمل. مش تشخيص، مجرد خطوات عملية.
 */
export function lateGuidance(daysPastExpected, irregular) {
  if (daysPastExpected <= 0) return null;
  if (daysPastExpected < 7) {
    return {
      level: 'early',
      title: `الدورة متأخرة ${daysPastExpected} ${daysPastExpected === 1 ? 'يوم' : 'أيام'} عن الموعد المتوقع`,
      body: irregular
        ? 'دورتك متغيرة في العادي، فالتأخير ده ممكن يكون طبيعي جدًا. لو فيه احتمال حمل، اختبار الحمل المنزلي بيدي نتيجة من أول يوم تأخير، وبيكون أدق بعد أسبوع.'
        : 'التوتر وقلة النوم وتغيير الأكل أو السفر ممكن يأخروا الدورة كام يوم. لو فيه احتمال حمل، اختبار الحمل المنزلي بيدي نتيجة من أول يوم تأخير، والأفضل تعمليه الصبح بأول بول.',
    };
  }
  if (daysPastExpected < 21) {
    return {
      level: 'test',
      title: `التأخير وصل ${daysPastExpected} يوم`,
      body: 'لو فيه احتمال حمل، ده وقت مناسب جدًا لاختبار الحمل المنزلي لأن النتيجة دلوقتي دقيقة. لو طلع سلبي والدورة لسه ما نزلتش، أعيديه بعد 3 أو 4 أيام، أو اعملي تحليل دم (Beta hCG) وده أدق.',
    };
  }
  if (daysPastExpected < 90) {
    return {
      level: 'doctor',
      title: `التأخير وصل ${daysPastExpected} يوم`,
      body: 'لو الاختبار سلبي، يبقى مهم تكشفي عند دكتورة نساء. ممكن السبب يكون تكيس المبايض أو الغدة الدرقية أو هرمون الحليب أو نقص الوزن أو زيادته. كلها أسباب ليها علاج.',
    };
  }
  return {
    level: 'urgent',
    title: 'الدورة غايبة من أكتر من 3 شهور',
    body: 'ده اسمه انقطاع الطمث، ولازم تكشفي عند دكتورة نساء قريب حتى لو حاسة إنك كويسة.',
  };
}
