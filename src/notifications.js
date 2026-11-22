import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { addDays, fromKey, toKey } from './cycle';
import { pregInfo, CHECKS } from './pregnancy';
import { womanOfDay } from './seerah';

if (Platform.OS !== 'web') Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensurePermission() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('rafiqa', {
      name: 'تنبيهات رفيقة',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

function at(key, hour, minute = 0) {
  const d = fromKey(key);
  d.setHours(hour, minute, 0, 0);
  return d;
}

const short = (key) => key.slice(5).split('-').reverse().join('/');

/**
 * بيبني قايمة التنبيهات الجاية (دالة صافية).
 * iOS بيسمح بـ 64 تنبيه مجدول بالكتير، فبنحدد العدد ونعيد الجدولة كل ما التطبيق يتفتح.
 */
export function buildPlan(info, data, now = new Date()) {
  const st = data.settings;
  const n = st.notif || {};
  const plan = [];
  const push = (key, h, m, title, body, kind) => plan.push({ date: at(key, h, m), title, body, kind });
  const today = toKey(now);
  const preg = data.pregnancy && !data.pregnancy.birth ? data.pregnancy : null;

  // الدورة (لو مش حامل)
  if (info?.hasData && !preg) {
    if (info.onPeriod && n.purity !== false) {
      const from = Math.max(3, info.avgPeriod - 1);
      for (let d = from; d <= 10; d++) {
        push(addDays(info.last.start, d - 1), 21, 0, 'تأكدي من علامات الطهر',
          `ده اليوم ${d} من الدورة. لو شفتي القَصّة البيضاء أو الجفوف، سجلي إن الدورة خلصت واغتسلي.`, 'cycle');
      }
    }
    if (!info.onPeriod) {
      if (n.pms !== false) {
        push(info.pmsStart, 9, 0, 'أيام ما قبل الدورة بدأت',
          'ممكن تحسي بعصبية أو انتفاخ أو رغبة في السكريات. ده هرموني ومؤقت. قللي الملح والقهوة، واشربي مية كتير.', 'cycle');
      }
      if (n.period !== false) {
        push(addDays(info.nextStart, -2), 20, 0, 'الدورة متوقعة بعد يومين',
          'جهزي الفوط والمسكن وقربة المية السخنة. وخدي بالك من مواعيد الصلاة عشان لو احتجتي تقضي.', 'cycle');
        if (info.irregular) {
          push(info.windowStart, 9, 0, 'دخلتِ في نافذة الدورة المتوقعة',
            `دورتك مش منتظمة، فممكن تيجي في أي يوم لحد ${short(info.windowEnd)}.`, 'cycle');
        }
      }
      if (n.fertility) {
        push(info.fertileStart, 9, 0, 'أيام الخصوبة بدأت', 'من النهارده لحد بعد التبويض بيوم، ده أعلى احتمال للحمل.', 'cycle');
      }
      if (n.late !== false) {
        push(addDays(info.nextStart, 3), 10, 0, 'الدورة متأخرة 3 أيام', 'سجلي لو نزلت. ولو ما نزلتش، افتحي التطبيق وهتلاقي تعملي إيه.', 'cycle');
        push(addDays(info.nextStart, 7), 10, 0, 'الدورة متأخرة أسبوع', 'لو فيه احتمال حمل، النهارده وقت مناسب لاختبار الحمل المنزلي.', 'cycle');
      }
    }
  }

  // الحمل
  if (preg && n.preg !== false) {
    const done = preg.checks || {};
    for (const c of CHECKS) {
      if (done[c.id]?.done) continue;
      const due = addDays(preg.lmp, c.week * 7);
      push(addDays(due, -3), 10, 0, `قرّب ميعاد: ${c.title}`, `في الأسبوع ${c.week}. احجزي مع دكتورتك. ${c.items[0]}.`, 'preg');
      push(due, 10, 0, `ميعاد ${c.title}`, 'لو عملتيه، علّميه في التطبيق وارفعي النتيجة.', 'preg');
    }
    const p = pregInfo(preg.lmp, today);
    for (let w = p.week + 1; w <= Math.min(41, p.week + 6); w++) {
      push(addDays(preg.lmp, w * 7), 9, 0, `بدأتِ الأسبوع ${w} من الحمل`, 'افتحي التطبيق وشوفي البيبي بقى حجمه قد إيه، ونصايح الأسبوع.', 'preg');
    }
  }

  // سنن الفطرة
  if (n.istihdad !== false && st.lastIstihdad) {
    push(addDays(st.lastIstihdad, 30), 11, 0, 'تذكير بسنن الفطرة',
      'عدّى 30 يوم. الأفضل ما تعدّيش 40 يوم على الاستحداد ونتف الإبط وتقليم الأظافر.', 'fitra');
    push(addDays(st.lastIstihdad, 38), 11, 0, 'فاضل يومين على الأربعين', 'افتكري سنن الفطرة النهارده أو بكرة.', 'fitra');
  }

  // سيرة اليوم: كل يوم سيرة مختلفة
  if (st.seerah?.on) {
    for (let i = 0; i < 14; i++) {
      const key = addDays(today, i);
      const w = womanOfDay(key);
      push(key, st.seerah.h, st.seerah.m, `قدوتك النهارده: ${w.name}`, w.short, 'seerah');
    }
  }

  return plan
    .filter((p) => p.date > now)
    .sort((a, b) => a.date - b.date)
    .slice(0, 52);
}

export async function reschedule(info, data) {
  if (Platform.OS === 'web') return 0;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const st = data.settings;
    if (!st.notifications) return 0;
    const ok = await ensurePermission();
    if (!ok) return -1;
    const plan = buildPlan(info, data);
    for (const p of plan) {
      await Notifications.scheduleNotificationAsync({
        content: { title: p.title, body: p.body, data: { kind: p.kind } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: p.date, channelId: 'rafiqa' },
      });
    }
    if (st.journal?.on) {
      await Notifications.scheduleNotificationAsync({
        content: { title: 'يومك كان عامل إيه؟', body: 'سجلي مزاجك وأعراضك في دقيقة. ده بيخلي التوقعات أدق.', data: { kind: 'journal' } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: st.journal.h, minute: st.journal.m, channelId: 'rafiqa' },
      });
    }
    if (st.workout?.on) {
      // weekday في expo: 1 = الأحد ... 7 = السبت
      for (const d of st.workout.days || []) {
        await Notifications.scheduleNotificationAsync({
          content: { title: 'ميعاد التمرين', body: 'ربع ساعة حركة لجسمك ونفسيتك. يلا!', data: { kind: 'workout' } },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: d + 1, hour: st.workout.h, minute: st.workout.m, channelId: 'rafiqa' },
        });
      }
    }
    return plan.length;
  } catch (e) {
    console.warn('notification scheduling failed', e);
    return -1;
  }
}

