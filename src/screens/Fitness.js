import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Vibration, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { Screen, useNav } from '../nav';
import { Btn, Bullets, C, Card, Chip, H, ListItem, Row, Stepper, Sub, T, Wrap, fmtSecs, fmtTime, row, tone } from '../ui';
import { Figure } from '../components';
import { CATS, DETAILS, EXERCISES, PHASE_PLAN, ROUTINES, SAFETY, WARM_SECS } from '../exercises';
import { diffDays, todayKey } from '../cycle';
import { useApp } from '../store';

const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const PHASE_NAME = { warm: 'إحماء', work: 'التمرين', cool: 'تهدئة', rest: 'راحة', ready: 'استعدي' };
const PHASE_COLOR = { warm: C.pms, work: C.period, cool: C.calm, rest: C.fertile, ready: C.baby };
const isPreg = (cat) => cat === 'preg' || cat === 'birth';

function say(text, on) {
  if (!on) return;
  try {
    Speech.stop();
    Speech.speak(text, { language: 'ar', rate: 0.95 });
  } catch {}
}

// خطوات البرنامج بالترتيب: إحماء ← (تمرين ← راحة)×الجولات ← تهدئة
export function buildSteps(r, cu = {}) {
  const plan = PHASE_PLAN[r.cat] || { warm: [], cool: [] };
  const rest = cu.rest ?? r.rest;
  const rounds = cu.rounds || r.rounds;
  const first = plan.warm[0] || r.list[0];
  const out = [{ kind: 'ready', secs: 5, ex: first }];
  plan.warm.forEach((eid) => out.push({ kind: 'warm', secs: WARM_SECS, ex: eid }));
  for (let k = 0; k < rounds; k++) {
    r.list.forEach((eid, i) => {
      out.push({ kind: 'work', secs: cu.work || EXERCISES[eid].secs, ex: eid, round: k + 1 });
      const last = k === rounds - 1 && i === r.list.length - 1;
      if (!last && rest > 0) out.push({ kind: 'rest', secs: rest, ex: r.list[(i + 1) % r.list.length] });
    });
  }
  plan.cool.forEach((eid) => out.push({ kind: 'cool', secs: WARM_SECS + 10, ex: eid }));
  return out;
}

export function FitnessScreen() {
  const { data, actions } = useApp();
  const nav = useNav();
  const preg = data.pregnancy;
  const initial = preg ? (preg.birth ? 'post' : 'preg') : 'slim';
  const [cat, setCat] = useState(initial);
  const c = CATS.find((x) => x.key === cat) || CATS[0];
  const week = data.workouts.log.filter((l) => diffDays(l.date, todayKey()) < 7);
  const mins = week.reduce((s, l) => s + l.mins, 0);
  const w = data.settings.workout;

  return (
    <Screen title="تمارين">
      <Row style={{ gap: 10 }}>
        <Card style={{ flex: 1 }}>
          <T style={{ fontSize: 26, fontWeight: '800', color: C.period, textAlign: 'center' }}>{mins}</T>
          <Sub style={{ textAlign: 'center' }}>دقيقة الأسبوع ده</Sub>
        </Card>
        <Card style={{ flex: 1 }}>
          <T style={{ fontSize: 26, fontWeight: '800', color: C.fertile, textAlign: 'center' }}>{week.length}</T>
          <Sub style={{ textAlign: 'center' }}>تمرين الأسبوع ده</Sub>
        </Card>
      </Row>
      <Sub>منظمة الصحة العالمية بتنصح بـ 150 دقيقة حركة متوسطة في الأسبوع.</Sub>

      <Wrap>
        {CATS.map((x) => (
          <Chip key={x.key} label={x.name} color={x.color} active={cat === x.key} onPress={() => setCat(x.key)} />
        ))}
      </Wrap>
      <Card color={c.color}>
        <T style={{ lineHeight: 25 }}>{c.desc}</T>
        <Bullets items={SAFETY[cat] || SAFETY.general} color={tone(c.color)[0]} />
      </Card>

      <H style={{ fontSize: 17 }}>البرامج</H>
      {ROUTINES.filter((r) => r.cat === cat).map((r) => {
        const cu = data.workouts.custom[r.id] || {};
        const total = Math.round(buildSteps(r, cu).reduce((s, x) => s + x.secs, 0) / 60);
        return (
          <ListItem
            key={r.id}
            icon={c.icon}
            color={c.color}
            title={r.name}
            sub={`${total} دقيقة، ${r.list.length} تمارين، ${cu.rounds || r.rounds} جولة، ${r.level}`}
            onPress={() => nav.push('routine', { id: r.id })}
          />
        );
      })}

      <H style={{ fontSize: 17 }}>كل التمارين</H>
      <Wrap>
        {Object.entries(EXERCISES)
          .filter(([, e]) => e.cat === cat || (cat === 'birth' && e.cat === 'preg'))
          .map(([id, e]) => (
            <Pressable key={id} onPress={() => nav.push('exercise', { id, cat })} style={{ width: '47%', backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.line, padding: 8, alignItems: 'center' }}>
              <Figure frames={e.frames} speed={e.speed} size={110} pregnant={isPreg(cat)} kegel={e.kegel} />
              <T style={{ textAlign: 'center', fontWeight: '700', fontSize: 14 }}>{e.name}</T>
            </Pressable>
          ))}
      </Wrap>

      <Card>
        <H style={{ fontSize: 17 }}>تذكير التمرين</H>
        <Row style={{ justifyContent: 'space-between' }}>
          <T>{w.on ? `مفعّل: ${fmtTime(w.h, w.m)}` : 'مش مفعّل'}</T>
          <Btn small kind={w.on ? 'soft' : 'solid'} title={w.on ? 'إيقاف' : 'تفعيل'} onPress={() => actions.setGroup('workout', { on: !w.on })} />
        </Row>
        {w.on ? (
          <>
            <Wrap>
              {DAYS.map((d, i) => (
                <Chip
                  key={d}
                  label={d}
                  active={w.days.includes(i)}
                  onPress={() => actions.setGroup('workout', { days: w.days.includes(i) ? w.days.filter((x) => x !== i) : [...w.days, i].sort() })}
                />
              ))}
            </Wrap>
            <Row style={{ justifyContent: 'space-around' }}>
              <Stepper label="الساعة" value={w.h} min={0} max={23} onChange={(h) => actions.setGroup('workout', { h })} format={(h) => fmtTime(h, 0).replace(':00', '')} />
              <Stepper label="الدقيقة" value={w.m} min={0} max={55} step={5} onChange={(m) => actions.setGroup('workout', { m })} />
            </Row>
          </>
        ) : null}
      </Card>
    </Screen>
  );
}

export function RoutineScreen({ id }) {
  const { data, actions } = useApp();
  const nav = useNav();
  const r = ROUTINES.find((x) => x.id === id);
  const cu = data.workouts.custom[id] || {};
  const work = cu.work || 0; // 0 = المدة الافتراضية لكل تمرين
  const rest = cu.rest ?? r.rest;
  const rounds = cu.rounds || r.rounds;
  const voice = data.settings.workout.voice !== false;
  const steps = buildSteps(r, cu);
  const total = Math.round(steps.reduce((s, x) => s + x.secs, 0) / 60);
  const plan = PHASE_PLAN[r.cat] || { warm: [], cool: [] };
  const color = (CATS.find((c) => c.key === r.cat) || CATS[0]).color;

  // الترتيب المكتوب: ابدئي بده، وبعدين ده...
  const order = [
    ...plan.warm.map((e) => ({ ph: 'warm', e, secs: WARM_SECS })),
    ...r.list.map((e) => ({ ph: 'work', e, secs: work || EXERCISES[e].secs })),
    ...plan.cool.map((e) => ({ ph: 'cool', e, secs: WARM_SECS + 10 })),
  ];

  return (
    <Screen title={r.name}>
      <Card color={color}>
        <T style={{ fontWeight: '800', fontSize: 18 }}>{total} دقيقة تقريبًا</T>
        <Sub>
          {plan.warm.length ? 'إحماء، وبعده ' : ''}
          {r.list.length} تمارين × {rounds} {rounds > 1 ? 'جولات' : 'جولة'}، وراحة {rest} ثانية بين كل تمرين
          {plan.cool.length ? '، وفي الآخر تهدئة' : ''}.
        </Sub>
      </Card>

      <Card>
        <H style={{ fontSize: 17 }}>الترتيب</H>
        {order.map((o, i) => {
          const e = EXERCISES[o.e];
          const first = i === 0;
          const prevPh = i > 0 ? order[i - 1].ph : null;
          return (
            <View key={o.e + i} style={{ gap: 4 }}>
              {o.ph !== prevPh ? (
                <T style={{ fontWeight: '800', color: PHASE_COLOR[o.ph], marginTop: i ? 8 : 0 }}>
                  {o.ph === 'warm' ? 'أولًا: الإحماء' : o.ph === 'work' ? `${plan.warm.length ? 'ثانيًا' : 'أولًا'}: التمرين${rounds > 1 ? ` (كرريه ${rounds} مرات)` : ''}` : 'وفي الآخر: التهدئة'}
                </T>
              ) : null}
              <Pressable onPress={() => nav.push('exercise', { id: o.e, cat: r.cat })} style={{ flexDirection: row, alignItems: 'center', gap: 10, backgroundColor: C.bg, borderRadius: 14, padding: 6 }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: PHASE_COLOR[o.ph], alignItems: 'center', justifyContent: 'center' }}>
                  <T style={{ color: '#fff', fontWeight: '800', fontSize: 13, textAlign: 'center' }}>{i + 1}</T>
                </View>
                <Figure frames={e.frames} speed={e.speed} size={56} pregnant={isPreg(r.cat)} kegel={e.kegel} playing={false} />
                <View style={{ flex: 1 }}>
                  <T style={{ fontWeight: '700' }}>{first ? 'ابدئي بـ ' : 'بعدين '}{e.name}</T>
                  <Sub>{o.secs} ثانية{e.hold ? '، ثبات' : ''}</Sub>
                </View>
              </Pressable>
            </View>
          );
        })}
      </Card>

      <Card>
        <H style={{ fontSize: 17 }}>ظبطي البرنامج على قدك</H>
        <Row style={{ justifyContent: 'space-around', flexWrap: 'wrap', gap: 10 }}>
          <Stepper label="مدة التمرين" value={work} min={0} max={180} step={5} format={(v) => (v === 0 ? 'افتراضي' : `${v} ث`)} onChange={(v) => actions.setRoutineCustom(id, { work: v })} />
          <Stepper label="الراحة" value={rest} min={0} max={120} step={5} format={(v) => `${v} ث`} onChange={(v) => actions.setRoutineCustom(id, { rest: v })} />
          <Stepper label="الجولات" value={rounds} min={1} max={6} onChange={(v) => actions.setRoutineCustom(id, { rounds: v })} />
        </Row>
        <Row style={{ justifyContent: 'space-between', marginTop: 6 }}>
          <T>الصوت بيقولك تعملي إيه</T>
          <Chip label={voice ? 'شغال' : 'مقفول'} active={voice} onPress={() => actions.setGroup('workout', { voice: !voice })} />
        </Row>
      </Card>
      <Btn title="ابدئي التمرين" icon="play" color={color} onPress={() => nav.push('player', { id })} />
    </Screen>
  );
}

export function ExerciseScreen({ id, cat }) {
  const e = EXERCISES[id];
  const d = DETAILS[id] || {};
  const [secs, setSecs] = useState(e.secs);
  const [left, setLeft] = useState(null);
  const preg = isPreg(cat || e.cat);
  useEffect(() => {
    if (left === null) return undefined;
    if (left <= 0) {
      Vibration.vibrate([0, 400, 200, 400]);
      setLeft(null);
      return undefined;
    }
    if (left <= 3) Vibration.vibrate(80);
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  return (
    <Screen title={e.name}>
      <Card style={{ alignItems: 'center' }}>
        <Figure frames={e.frames} speed={e.speed} size={240} pregnant={preg} kegel={e.kegel} />
        {left !== null ? <T style={{ fontSize: 48, fontWeight: '800', color: C.plum, textAlign: 'center' }}>{fmtSecs(left)}</T> : null}
      </Card>
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Stepper value={secs} onChange={setSecs} min={10} max={300} step={5} format={(v) => fmtSecs(v)} label="المؤقت" />
          <Btn title={left !== null ? 'إيقاف' : 'ابدئي'} icon={left !== null ? 'stop' : 'play'} onPress={() => setLeft(left !== null ? null : secs)} />
        </Row>
      </Card>
      {d.target ? (
        <Card color="plum">
          <Sub style={{ color: C.plum, fontWeight: '800' }}>بيشتغل على</Sub>
          <T>{d.target}</T>
        </Card>
      ) : null}
      <Card>
        <H style={{ fontSize: 17 }}>الطريقة خطوة بخطوة</H>
        {e.steps.map((s, i) => (
          <View key={i} style={{ flexDirection: row, gap: 10, alignItems: 'flex-start' }}>
            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: C.plumSoft, alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
              <T style={{ color: C.plum, fontWeight: '800', fontSize: 12, textAlign: 'center' }}>{i + 1}</T>
            </View>
            <T style={{ flex: 1, lineHeight: 25 }}>{s}</T>
          </View>
        ))}
      </Card>
      {d.breath ? (
        <Card color="calm">
          <Sub style={{ color: C.calm, fontWeight: '800' }}>التنفس</Sub>
          <T>{d.breath}</T>
        </Card>
      ) : null}
      {d.mistakes?.length ? (
        <Card color="danger">
          <Sub style={{ color: C.danger, fontWeight: '800' }}>أخطاء ابعدي عنها</Sub>
          <Bullets items={d.mistakes} color={C.danger} />
        </Card>
      ) : null}
      {d.easier || d.harder ? (
        <Row style={{ gap: 10, alignItems: 'stretch' }}>
          {d.easier ? (
            <Card color="fertile" style={{ flex: 1 }}>
              <Sub style={{ color: C.fertile, fontWeight: '800' }}>أسهل</Sub>
              <T style={{ fontSize: 14 }}>{d.easier}</T>
            </Card>
          ) : null}
          {d.harder ? (
            <Card color="pms" style={{ flex: 1 }}>
              <Sub style={{ color: C.pms, fontWeight: '800' }}>أصعب</Sub>
              <T style={{ fontSize: 14 }}>{d.harder}</T>
            </Card>
          ) : null}
        </Row>
      ) : null}
      <Card>
        {e.tip ? <T style={{ lineHeight: 25 }}>{e.tip}</T> : null}
        {e.calories ? <Sub>تقريبًا {e.calories} سعرات في الدقيقة، وده بيختلف حسب الوزن والمجهود.</Sub> : null}
      </Card>
    </Screen>
  );
}

// ———————————————— مشغّل التمرين: مؤقت + ترتيب + صوت ————————————————
export function PlayerScreen({ id }) {
  const { data, actions } = useApp();
  const nav = useNav();
  const r = ROUTINES.find((x) => x.id === id);
  const cu = data.workouts.custom[id] || {};
  const rounds = cu.rounds || r.rounds;
  const voice = data.settings.workout.voice !== false;
  const steps = useMemo(() => buildSteps(r, cu), [r, cu.work, cu.rest, cu.rounds]);

  const [idx, setIdx] = useState(0);
  const [left, setLeft] = useState(steps[0].secs);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const spent = useRef(0);

  useEffect(() => {
    activateKeepAwakeAsync().catch(() => {});
    return () => {
      deactivateKeepAwake();
      Speech.stop();
    };
  }, []);

  // الصوت مع بداية كل خطوة
  useEffect(() => {
    const st = steps[idx];
    const name = EXERCISES[st.ex].name;
    const lines = {
      ready: `استعدي. هنبدأ بـ ${name}`,
      warm: `الإحماء: ${name}`,
      work: idx === steps.findIndex((x) => x.kind === 'work') ? `يلا نبدأ. ${name}` : `${name}`,
      rest: `راحة. الجاي: ${name}`,
      cool: `التهدئة: ${name}. اتنفسي بهدوء`,
    };
    say(lines[st.kind], voice);
  }, [idx]);

  useEffect(() => {
    if (paused || done) return undefined;
    const t = setTimeout(() => {
      spent.current += 1;
      if (left <= 4 && left > 1) Vibration.vibrate(60);
      if (left <= 1) {
        Vibration.vibrate(300);
        if (idx + 1 >= steps.length) {
          setDone(true);
          say('برافو عليكي، خلصتي التمرين', voice);
          actions.logWorkout({ date: todayKey(), routine: r.id, mins: Math.max(1, Math.round(spent.current / 60)) });
        } else {
          setIdx(idx + 1);
          setLeft(steps[idx + 1].secs);
        }
      } else setLeft(left - 1);
    }, 1000);
    return () => clearTimeout(t);
  }, [left, paused, done, idx, steps]);

  const jump = (n) => {
    const j = Math.max(0, Math.min(steps.length - 1, idx + n));
    setIdx(j);
    setLeft(steps[j].secs);
  };

  const step = steps[idx];
  const e = EXERCISES[step.ex];
  const color = PHASE_COLOR[step.kind];
  const preg = isPreg(r.cat);
  const next = steps.slice(idx + 1).find((x) => x.kind !== 'rest');
  const progress = steps.slice(0, idx).reduce((s, x) => s + x.secs, 0) / steps.reduce((s, x) => s + x.secs, 0);

  if (done) {
    return (
      <Screen title={r.name}>
        <Card color="fertile" style={{ alignItems: 'center' }}>
          <Ionicons name="trophy" size={60} color={C.fertile} />
          <T style={{ fontSize: 24, fontWeight: '800', textAlign: 'center' }}>برافو عليكي!</T>
          <T style={{ textAlign: 'center' }}>خلصتي {Math.max(1, Math.round(spent.current / 60))} دقيقة تمرين. اشربي مية وارتاحي.</T>
          <Sub style={{ textAlign: 'center' }}>«إن لبدنك عليك حقًا» (متفق عليه)</Sub>
        </Card>
        <Btn title="رجوع" onPress={nav.back} />
      </Screen>
    );
  }

  return (
    <Screen title={r.name}>
      <View style={{ height: 8, backgroundColor: C.line, borderRadius: 4, overflow: 'hidden' }}>
        <View style={{ height: 8, width: `${progress * 100}%`, backgroundColor: color }} />
      </View>
      <Card style={{ alignItems: 'center', gap: 4 }}>
        <View style={{ backgroundColor: color, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 2 }}>
          <T style={{ color: '#fff', fontWeight: '800', textAlign: 'center' }}>
            {PHASE_NAME[step.kind]}
            {step.kind === 'work' ? ` — الجولة ${step.round} من ${rounds}` : ''}
          </T>
        </View>
        <T style={{ fontSize: 22, fontWeight: '800', textAlign: 'center' }}>
          {step.kind === 'rest' || step.kind === 'ready' ? `الجاي: ${e.name}` : e.name}
        </T>
        <Figure frames={e.frames} speed={e.speed} size={220} playing={!paused && step.kind !== 'rest' && step.kind !== 'ready'} pregnant={preg} kegel={e.kegel} color={step.kind === 'rest' ? C.sub : undefined} />
        <T style={{ fontSize: 64, fontWeight: '800', color, textAlign: 'center' }}>{fmtSecs(left)}</T>
        {next && step.kind !== 'rest' ? <Sub style={{ textAlign: 'center' }}>بعده: {EXERCISES[next.ex].name}</Sub> : null}
      </Card>
      <Row style={{ gap: 10, justifyContent: 'center' }}>
        <Btn kind="soft" icon={row === 'row' ? 'play-skip-back' : 'play-skip-forward'} title="" onPress={() => jump(-1)} style={{ width: 60 }} />
        <Btn icon={paused ? 'play' : 'pause'} title={paused ? 'كملي' : 'إيقاف مؤقت'} onPress={() => setPaused(!paused)} style={{ flex: 1 }} color="period" />
        <Btn kind="soft" icon={row === 'row' ? 'play-skip-forward' : 'play-skip-back'} title="" onPress={() => jump(1)} style={{ width: 60 }} />
      </Row>
      <Card>
        <H style={{ fontSize: 16 }}>إزاي</H>
        <Bullets items={e.steps} />
        {DETAILS[step.ex]?.breath ? <Sub>التنفس: {DETAILS[step.ex].breath}</Sub> : null}
      </Card>
    </Screen>
  );
}
