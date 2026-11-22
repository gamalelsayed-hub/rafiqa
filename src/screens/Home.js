import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, useNav } from '../nav';
import { Btn, Bullets, C, Card, Chip, H, ListItem, Row, Sub, T, Wrap, row, tone } from '../ui';
import { addDays, formatDate, lateGuidance, todayKey, diffDays } from '../cycle';
import { CALM_TIPS, PHASES } from '../content';
import { pregInfo, weekInfo } from '../pregnancy';
import { useApp } from '../store';
import { womanOfDay } from '../seerah';

export default function Home() {
  const { data, info, actions } = useApp();
  const nav = useNav();
  const today = todayKey();
  const preg = data.pregnancy;
  const woman = womanOfDay(today);

  return (
    <Screen
      title="رفيقة"
      right={
        <Pressable onPress={() => nav.push('settings')} hitSlop={10} accessibilityLabel="الإعدادات">
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </Pressable>
      }
    >
      {preg && !preg.birth ? <PregCard /> : preg?.birth ? <PostCard /> : <CycleCard />}

      <Card color="plum" onPress={() => nav.go('more', 'woman', { id: woman.id })}>
        <Row style={{ gap: 8 }}>
          <Ionicons name="star" size={18} color={C.plum} />
          <Sub style={{ color: C.plum, fontWeight: '800' }}>قدوتك النهارده</Sub>
        </Row>
        <T style={{ fontSize: 20, fontWeight: '800' }}>{woman.name}</T>
        <T style={{ lineHeight: 25 }}>{woman.short}</T>
        <Sub style={{ color: C.plum }}>اقري سيرتها كاملة ←</Sub>
      </Card>

      <FeelCard />

      <View style={{ gap: 8 }}>
        <ListItem icon="book-outline" title="الأحكام" sub="الحيض، والطهارة، والزينة، والزواج، والعدة..." onPress={() => nav.go('more', 'fiqh')} color="fertile" />
        <ListItem icon="shield-checkmark-outline" title="مكانتك في الإسلام" sub="تطمين، وردود على الشبهات" onPress={() => nav.go('more', 'status')} color="plum" />
        <ListItem icon="people-outline" title="تربية الأبناء" sub="من الرضاعة لجواز أولادك، والميراث" onPress={() => nav.go('more', 'parenting')} color="baby" />
        <ListItem icon="barbell-outline" title="تمرين النهارده" sub="تخسيس، وتهدئة، وحمل، وبعد الولادة" onPress={() => nav.go('fitness')} color="period" />
      </View>
    </Screen>
  );
}

function CycleCard() {
  const { data, info, actions } = useApp();
  const nav = useNav();
  const [ending, setEnding] = useState(false);
  const today = todayKey();

  if (!info.hasData) {
    return (
      <Card color="period">
        <H>أهلًا بيكي في رفيقة</H>
        <T style={{ lineHeight: 25 }}>
          سجلي أول يوم في آخر دورة نزلت عليكي، والتطبيق هيبدأ يتوقع الدورة الجاية، ويفكرك بأعراض ما قبلها، وبعلامات الطهر.
        </T>
        <Btn title="الدورة نازلة النهارده" icon="water" color="period" onPress={() => actions.startPeriod(today)} />
        <Btn title="أختار التاريخ من التقويم" kind="soft" color="period" onPress={() => nav.go('cycle')} />
        <Sub>ولو حامل، روحي لقسم «حملي».</Sub>
      </Card>
    );
  }

  const ph = PHASES[info.phase];
  const [fg] = tone(ph.color);
  const late = lateGuidance(info.daysPastExpected, info.irregular);

  return (
    <>
      <Card color={ph.color}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Sub style={{ color: fg, fontWeight: '800' }}>{ph.name}</Sub>
          <Sub>اليوم {info.cycleDay} من الدورة</Sub>
        </Row>
        {info.onPeriod ? (
          <T style={{ fontSize: 26, fontWeight: '800', color: fg }}>اليوم {info.dayOfPeriod} من الدورة</T>
        ) : info.daysPastExpected > 0 ? (
          <T style={{ fontSize: 24, fontWeight: '800', color: fg }}>متأخرة {info.daysPastExpected} يوم</T>
        ) : (
          <T style={{ fontSize: 26, fontWeight: '800', color: fg }}>
            {info.daysUntilNext === 0 ? 'الدورة متوقعة النهارده' : `الدورة بعد ${info.daysUntilNext} يوم`}
          </T>
        )}
        {!info.onPeriod ? (
          <Sub>
            {info.irregular
              ? `دورتك مش منتظمة، فالمتوقع في أي يوم من ${formatDate(info.windowStart)} لـ ${formatDate(info.windowEnd)}`
              : `المتوقع ${formatDate(info.nextStart, true)}، بفرق ${info.margin} أيام تقريبًا`}
          </Sub>
        ) : null}
        <T style={{ lineHeight: 25 }}>{ph.summary}</T>

        {info.onPeriod ? (
          ending ? (
            <EndPeriod onDone={() => setEnding(false)} />
          ) : (
            <Btn title="الدورة خلصت (شفت علامة الطهر)" icon="checkmark-circle" color="fertile" onPress={() => setEnding(true)} />
          )
        ) : (
          <Btn title="الدورة نزلت النهارده" icon="water" color="period" onPress={() => actions.startPeriod(today)} />
        )}
      </Card>

      {late ? (
        <Card color={late.level === 'early' ? 'pms' : 'danger'}>
          <H style={{ fontSize: 17 }}>{late.title}</H>
          <T style={{ lineHeight: 25 }}>{late.body}</T>
          {late.level !== 'early' ? (
            <Btn title="الاختبار إيجابي؟ ابدئي متابعة الحمل" kind="soft" color="baby" onPress={() => nav.go('preg')} />
          ) : null}
        </Card>
      ) : null}

      <Card>
        <H style={{ fontSize: 17 }}>اللي ممكن تحسيه دلوقتي</H>
        {ph.body.length ? (
          <>
            <Sub style={{ fontWeight: '800' }}>في جسمك</Sub>
            <Wrap>
              {ph.body.map((b) => (
                <Chip key={b} label={b} color={ph.color} active />
              ))}
            </Wrap>
          </>
        ) : null}
        <Sub style={{ fontWeight: '800', marginTop: 4 }}>في مزاجك</Sub>
        <Wrap>
          {ph.mood.map((b) => (
            <Chip key={b} label={b} color="calm" active />
          ))}
        </Wrap>
        <Sub style={{ fontWeight: '800', marginTop: 6 }}>نصايح</Sub>
        <Bullets items={ph.tips} color={fg} />
      </Card>
    </>
  );
}

function EndPeriod({ onDone }) {
  const { info, actions } = useApp();
  const nav = useNav();
  const today = todayKey();
  const yesterday = addDays(today, -1);
  const close = (end) => {
    actions.endPeriod(info.last.start, end < info.last.start ? info.last.start : end);
    onDone();
  };
  return (
    <View style={{ gap: 10, backgroundColor: C.card, borderRadius: 14, padding: 12 }}>
      <T style={{ fontWeight: '800' }}>اتأكدتي من علامة الطهر؟</T>
      <Bullets
        color={C.fertile}
        items={[
          'القَصّة البيضاء: سائل أبيض أو شفاف في آخر الدورة.',
          'أو الجفوف: قطنة بيضا تطلع ناشفة، من غير دم ولا صفرة ولا كدرة.',
        ]}
      />
      <Pressable onPress={() => nav.push('purity')}>
        <Sub style={{ color: C.fertile, fontWeight: '700' }}>شرح مفصل لعلامات الطهر ←</Sub>
      </Pressable>
      <T style={{ fontWeight: '700' }}>آخر يوم شفتي فيه دم:</T>
      <Row style={{ gap: 8 }}>
        <Btn title="النهارده" small color="fertile" onPress={() => close(today)} style={{ flex: 1 }} />
        <Btn title="امبارح" small kind="soft" color="fertile" onPress={() => close(yesterday)} style={{ flex: 1 }} />
      </Row>
      <Sub>بعد كده: اغتسلي وصلي الفرض الحاضر. ولو طهرتِ قبل المغرب صلي الظهر والعصر، ولو قبل الفجر صلي المغرب والعشاء، ده عند الجمهور.</Sub>
      <Btn title="لسه" small kind="soft" color="plum" onPress={onDone} />
    </View>
  );
}

function PregCard() {
  const { data } = useApp();
  const nav = useNav();
  const p = pregInfo(data.pregnancy.lmp);
  const w = weekInfo(p.week);
  return (
    <Card color="baby" onPress={() => nav.go('preg')}>
      <Sub style={{ color: C.baby, fontWeight: '800' }}>متابعة الحمل</Sub>
      <T style={{ fontSize: 26, fontWeight: '800', color: C.baby }}>
        الأسبوع {p.week} و{p.day} أيام
      </T>
      <Sub>الشهر {p.month}، وفاضل {Math.max(0, p.left)} يوم على الولادة المتوقعة يوم {formatDate(p.edd, true)}</Sub>
      <View style={{ height: 8, backgroundColor: C.card, borderRadius: 4, overflow: 'hidden' }}>
        <View style={{ height: 8, width: `${p.progress * 100}%`, backgroundColor: C.baby }} />
      </View>
      <T>حجم البيبي قد {w.size}. {w.baby}</T>
    </Card>
  );
}

function PostCard() {
  const { data } = useApp();
  const nav = useNav();
  const d = diffDays(data.pregnancy.birth, todayKey()) + 1;
  return (
    <Card color="fertile" onPress={() => nav.go('preg', 'postpartum')}>
      <Sub style={{ color: C.fertile, fontWeight: '800' }}>ألف مبروك</Sub>
      <T style={{ fontSize: 24, fontWeight: '800', color: C.fertile }}>اليوم {d} بعد الولادة</T>
      <T style={{ lineHeight: 25 }}>
        {d <= 40
          ? 'لو الدم وقف وشفتي علامة الطهر قبل الأربعين، اغتسلي وصلي.'
          : 'عدّت الأربعين. لو الدم لسه مستمر يبقى استحاضة، فصلي وكلمي دكتورتك.'}
      </T>
      <Sub style={{ color: C.fertile }}>نصايح ما بعد الولادة ←</Sub>
    </Card>
  );
}

function FeelCard() {
  const [feel, setFeel] = useState(null);
  const nav = useNav();
  return (
    <Card>
      <H style={{ fontSize: 17 }}>حاسة بإيه دلوقتي؟</H>
      <Wrap>
        {Object.keys(CALM_TIPS).map((k) => (
          <Chip key={k} label={k} active={feel === k} color="calm" onPress={() => setFeel(feel === k ? null : k)} />
        ))}
      </Wrap>
      {feel ? (
        <>
          <Bullets items={CALM_TIPS[feel]} color={C.calm} />
          <Btn title="تمرين تنفس يهديكي" icon="leaf" kind="soft" color="calm" onPress={() => nav.go('more', 'calm')} />
        </>
      ) : null}
    </Card>
  );
}
