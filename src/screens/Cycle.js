import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Screen, useNav } from '../nav';
import { Btn, Bullets, C, Card, Chip, H, Input, Row, Sub, T, Wrap } from '../ui';
import { MonthGrid, Legend } from '../components';
import { addDays, diffDays, formatDate, fromKey, todayKey } from '../cycle';
import { FLOW, MOODS, PURITY_SIGNS, SYMPTOMS } from '../content';
import { useApp } from '../store';

export function CycleScreen() {
  const [tab, setTab] = useState('cal');
  return (
    <Screen title="دورتي">
      <Wrap>
        <Chip label="التقويم" active={tab === 'cal'} onPress={() => setTab('cal')} />
        <Chip label="يومياتي" active={tab === 'log'} onPress={() => setTab('log')} />
        <Chip label="إحصائياتي" active={tab === 'stats'} onPress={() => setTab('stats')} />
      </Wrap>
      {tab === 'cal' ? <Calendar /> : tab === 'log' ? <JournalHistory /> : <Stats />}
    </Screen>
  );
}

function useMarks() {
  const { data, info } = useApp();
  return useMemo(() => {
    const map = {};
    const today = todayKey();
    const sorted = [...data.periods].sort((a, b) => a.start.localeCompare(b.start));
    const avgP = info.hasData ? info.avgPeriod : 6;
    for (const p of sorted) {
      const end = p.end || (diffDays(p.start, today) < 15 && p === sorted[sorted.length - 1] && info.onPeriod ? today : addDays(p.start, avgP - 1));
      for (let k = p.start; k <= end; k = addDays(k, 1)) map[k] = 'period';
    }
    if (info.hasData && !data.pregnancy) {
      // نتوقع 3 دورات جاية
      for (let i = 0; i < 3; i++) {
        const start = addDays(info.nextStart, i * info.avgCycle);
        const ov = addDays(start, -14);
        for (let k = addDays(ov, -5); k <= addDays(ov, 1); k = addDays(k, 1)) if (k > today && !map[k]) map[k] = k === ov ? 'ovulation' : 'fertile';
        for (let k = addDays(start, -5); k < start; k = addDays(k, 1)) if (k > today && !map[k]) map[k] = 'pms';
        for (let j = 0; j < avgP; j++) {
          const k = addDays(start, j);
          if (k > today && !map[k]) map[k] = 'predicted';
        }
      }
    }
    return (key) => ({ kind: map[key] || null, dot: !!data.journal[key] });
  }, [data, info]);
}

function Calendar() {
  const now = new Date();
  const [month, setMonth] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [sel, setSel] = useState(todayKey());
  const marks = useMarks();
  return (
    <>
      <Card>
        <MonthGrid month={month} onMonth={setMonth} marks={marks} selected={sel} onPick={setSel} />
        <Legend
          items={[
            [C.period, 'الدورة'],
            [C.periodSoft, 'متوقعة', true],
            [C.fertileSoft, 'خصوبة'],
            [C.fertile, 'تبويض'],
            [C.pmsSoft, 'ما قبل الدورة'],
          ]}
        />
      </Card>
      <DayPanel day={sel} />
    </>
  );
}

function DayPanel({ day }) {
  const { data, info, actions } = useApp();
  const today = todayKey();
  const sorted = [...data.periods].sort((a, b) => a.start.localeCompare(b.start));
  const containing = sorted.find((p) => p.start <= day && (p.end ? day <= p.end : diffDays(p.start, day) < 15 && (p === sorted[sorted.length - 1] ? day <= today : false)));
  const open = sorted.find((p) => !p.end && p.start < day && diffDays(p.start, day) < 15);
  const future = day > today;

  return (
    <Card>
      <H style={{ fontSize: 17 }}>{formatDate(day, true)}</H>
      {future ? (
        <Sub>ده يوم جاي. التسجيل بيكون للأيام اللي عدت أو النهارده.</Sub>
      ) : (
        <View style={{ gap: 8 }}>
          {containing ? (
            <>
              <Sub>اليوم ده جزء من دورة بدأت {formatDate(containing.start)}{containing.end ? ` وخلصت ${formatDate(containing.end)}` : ''}.</Sub>
              <Row style={{ gap: 8, flexWrap: 'wrap' }}>
                {containing.start !== day ? (
                  <Btn small title="آخر يوم دم كان ده" color="fertile" onPress={() => actions.endPeriod(containing.start, day)} />
                ) : null}
                {containing.end ? <Btn small kind="soft" title="الدورة لسه مكملة" color="period" onPress={() => actions.reopenPeriod(containing.start)} /> : null}
                <Btn small kind="soft" title="امسحي الدورة دي" color="danger" onPress={() => actions.removePeriod(containing.start)} />
              </Row>
            </>
          ) : (
            <Row style={{ gap: 8, flexWrap: 'wrap' }}>
              <Btn small title="الدورة بدأت اليوم ده" color="period" onPress={() => actions.startPeriod(day)} />
              {open ? <Btn small kind="soft" title="آخر يوم دم كان ده" color="fertile" onPress={() => actions.endPeriod(open.start, day)} /> : null}
            </Row>
          )}
          <DayJournal day={day} />
        </View>
      )}
    </Card>
  );
}

function DayJournal({ day }) {
  const { data, actions } = useApp();
  const e = data.journal[day] || { symptoms: [] };
  const [note, setNote] = useState(e.note || '');
  const set = (patch) => actions.saveEntry(day, { ...e, ...patch });
  const toggleSym = (s) => {
    const list = e.symptoms || [];
    set({ symptoms: list.includes(s) ? list.filter((x) => x !== s) : [...list, s] });
  };
  return (
    <View style={{ gap: 8, marginTop: 6 }}>
      <T style={{ fontWeight: '800' }}>مزاجك</T>
      <Wrap>
        {MOODS.map((m) => (
          <Chip key={m.key} label={m.label} color="calm" active={e.mood === m.key} onPress={() => set({ mood: e.mood === m.key ? null : m.key })} />
        ))}
      </Wrap>
      <T style={{ fontWeight: '800' }}>الأعراض</T>
      <Wrap>
        {SYMPTOMS.map((s) => (
          <Chip key={s} label={s} color="pms" active={(e.symptoms || []).includes(s)} onPress={() => toggleSym(s)} />
        ))}
      </Wrap>
      <T style={{ fontWeight: '800' }}>كمية الدم</T>
      <Wrap>
        {FLOW.map((f) => (
          <Chip key={f.key} label={f.label} color="period" active={e.flow === f.key} onPress={() => set({ flow: e.flow === f.key ? null : f.key })} />
        ))}
      </Wrap>
      <Input
        placeholder="ملاحظة (اختياري)"
        value={note}
        onChangeText={setNote}
        onEndEditing={() => set({ note: note.trim() })}
        multiline
      />
    </View>
  );
}

function JournalHistory() {
  const { data } = useApp();
  const days = Object.keys(data.journal).sort().reverse().slice(0, 60);
  if (!days.length) {
    return (
      <Card>
        <T>لسه ما سجلتيش أي يوم. من التقويم، اختاري أي يوم وسجلي فيه مزاجك وأعراضك.</T>
        <Sub>تقدري تفعّلي تذكير يومي من الإعدادات.</Sub>
      </Card>
    );
  }
  return days.map((d) => {
    const e = data.journal[d];
    const mood = MOODS.find((m) => m.key === e.mood);
    return (
      <Card key={d}>
        <Row style={{ justifyContent: 'space-between' }}>
          <T style={{ fontWeight: '800' }}>{formatDate(d, true)}</T>
          {mood ? <Chip label={mood.label} color="calm" active /> : null}
        </Row>
        {e.symptoms?.length ? <Sub>{e.symptoms.join('، ')}</Sub> : null}
        {e.flow ? <Sub>الدم: {FLOW.find((f) => f.key === e.flow)?.label}</Sub> : null}
        {e.note ? <T>{e.note}</T> : null}
      </Card>
    );
  });
}

function Stats() {
  const { data, info } = useApp();
  const insights = useMemo(() => {
    // أكتر الأعراض اللي بتيجي في الأسبوع اللي قبل الدورة
    const starts = data.periods.map((p) => p.start).sort();
    const pre = {};
    let n = 0;
    for (const [day, e] of Object.entries(data.journal)) {
      const next = starts.find((s) => s > day);
      if (next && diffDays(day, next) <= 7) {
        n++;
        for (const s of e.symptoms || []) pre[s] = (pre[s] || 0) + 1;
        if (e.mood && ['sad', 'angry', 'anxious'].includes(e.mood)) pre['تعب نفسي'] = (pre['تعب نفسي'] || 0) + 1;
      }
    }
    return { n, top: Object.entries(pre).sort((a, b) => b[1] - a[1]).slice(0, 4) };
  }, [data]);

  if (!info.hasData) return <Card><T>سجلي دورة واحدة على الأقل عشان تظهر الإحصائيات.</T></Card>;
  const sorted = [...data.periods].sort((a, b) => b.start.localeCompare(a.start));
  return (
    <>
      <Row style={{ gap: 10 }}>
        <Card style={{ flex: 1, alignItems: 'center' }}>
          <T style={{ fontSize: 28, fontWeight: '800', color: C.plum, textAlign: 'center' }}>{info.avgCycle}</T>
          <Sub style={{ textAlign: 'center' }}>متوسط طول الدورة (يوم)</Sub>
        </Card>
        <Card style={{ flex: 1, alignItems: 'center' }}>
          <T style={{ fontSize: 28, fontWeight: '800', color: C.period, textAlign: 'center' }}>{info.avgPeriod}</T>
          <Sub style={{ textAlign: 'center' }}>متوسط أيام الدم</Sub>
        </Card>
      </Row>
      <Card color={info.irregular ? 'pms' : 'fertile'}>
        <H style={{ fontSize: 17 }}>{info.irregular ? 'دورتك مش منتظمة' : info.lengths.length >= 2 ? 'دورتك منتظمة' : 'محتاجين بيانات أكتر'}</H>
        <T style={{ lineHeight: 25 }}>
          {info.irregular
            ? `الفرق بين أقصر وأطول دورة ${info.spread} يوم، فالتطبيق بيديكي نافذة توقع أوسع (±${info.margin} أيام). الطبيعي إن الدورة تيجي كل 21 لـ 35 يوم. لو الفرق كبير باستمرار أو الدورة بتغيب شهور، اكشفي عشان تستبعدي تكيس المبايض أو مشاكل الغدة.`
            : info.lengths.length >= 2
            ? `الفرق بين دوراتك صغير، والتوقعات هتبقى دقيقة.`
            : 'سجلي دورتين أو تلاتة كمان عشان التوقع يبقى أدق. وتقدري تضيفي دورات قديمة من التقويم.'}
        </T>
        {info.lengths.length ? <Sub>أطوال آخر دوراتك: {info.lengths.join('، ')} يوم</Sub> : null}
      </Card>
      {insights.top.length ? (
        <Card color="calm">
          <H style={{ fontSize: 17 }}>من يومياتك</H>
          <T>أكتر حاجات بتجيلك في الأسبوع اللي قبل الدورة:</T>
          <Wrap>
            {insights.top.map(([s, c]) => (
              <Chip key={s} label={`${s} (${c})`} color="calm" active />
            ))}
          </Wrap>
          <Sub>اعرفيها مقدمًا، واستعدي ليها من نصايح ما قبل الدورة.</Sub>
        </Card>
      ) : null}
      <H style={{ fontSize: 17 }}>سجل الدورات</H>
      {sorted.map((p, i) => {
        const next = sorted[i - 1];
        return (
          <Card key={p.start}>
            <Row style={{ justifyContent: 'space-between' }}>
              <T style={{ fontWeight: '700' }}>{formatDate(p.start)} {fromKey(p.start).getFullYear()}</T>
              <Sub>{p.end ? `${diffDays(p.start, p.end) + 1} أيام` : 'لسه مكملة'}</Sub>
            </Row>
            {next ? <Sub>طول الدورة: {diffDays(p.start, next.start)} يوم</Sub> : null}
          </Card>
        );
      })}
    </>
  );
}

export function PurityScreen() {
  return (
    <Screen title="علامات الطهر">
      <Card color="fertile">
        <T style={{ lineHeight: 26 }}>{PURITY_SIGNS.intro}</T>
      </Card>
      {PURITY_SIGNS.signs.map((s) => (
        <Card key={s.title}>
          <H style={{ fontSize: 18, color: C.fertile }}>{s.title}</H>
          <T style={{ lineHeight: 26 }}>{s.text}</T>
        </Card>
      ))}
      <Card>
        <H style={{ fontSize: 17 }}>إزاي تتأكدي</H>
        <Bullets items={PURITY_SIGNS.howTo} color={C.fertile} />
      </Card>
      <Card color="calm">
        <H style={{ fontSize: 17 }}>لو عندك وسواس</H>
        <T style={{ lineHeight: 26 }}>
          افحصي مرة واحدة في وقت محدد، زي قبل كل صلاة، مش كل شوية. ولو اتأكدتي من الطهر، ما ترجعيش تدوري تاني. القاعدة: «اليقين لا يزول بالشك». وفي قسم الأحكام صفحة كاملة عن الوسواس.
        </T>
      </Card>
    </Screen>
  );
}
