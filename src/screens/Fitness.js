import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Vibration, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { Screen, useNav } from '../nav';
import { Btn, Bullets, C, Card, Chip, H, ListItem, Row, Stepper, Sub, T, Wrap, fmtSecs, fmtTime, row, tone } from '../ui';
import { Figure } from '../components';
import { CATS, EXERCISES, ROUTINES, SAFETY } from '../exercises';
import { diffDays, todayKey } from '../cycle';
import { useApp } from '../store';

const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export function FitnessScreen() {
  const { data, actions } = useApp();
  const nav = useNav();
  const preg = data.pregnancy;
  const initial = preg ? (preg.birth ? 'post' : 'preg') : 'slim';
  const [cat, setCat] = useState(initial);
  const c = CATS.find((x) => x.key === cat);
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
        <Bullets items={cat === 'preg' ? SAFETY.preg : cat === 'post' ? SAFETY.post : SAFETY.general} color={tone(c.color)[0]} />
      </Card>

      <H style={{ fontSize: 17 }}>البرامج</H>
      {ROUTINES.filter((r) => r.cat === cat).map((r) => {
        const cu = data.workouts.custom[r.id] || {};
        const work = cu.work || 0;
        const total = Math.round(
          (r.list.reduce((s, id) => s + (work || EXERCISES[id].secs) + (cu.rest ?? r.rest), 0) * (cu.rounds || r.rounds)) / 60
        );
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
          .filter(([, e]) => e.cat === cat)
          .map(([id, e]) => (
            <Pressable key={id} onPress={() => nav.push('exercise', { id })} style={{ width: '47%', backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.line, padding: 8, alignItems: 'center' }}>
              <Figure frames={e.frames} speed={e.speed} size={110} pregnant={cat === 'preg'} kegel={e.kegel} />
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
  const preg = r.cat === 'preg';
  return (
    <Screen title={r.name}>
      <Card>
        <H style={{ fontSize: 17 }}>ظبطي البرنامج على قدك</H>
        <Row style={{ justifyContent: 'space-around', flexWrap: 'wrap', gap: 10 }}>
          <Stepper label="مدة التمرين" value={work} min={0} max={180} step={5} format={(v) => (v === 0 ? 'افتراضي' : `${v} ث`)} onChange={(v) => actions.setRoutineCustom(id, { work: v })} />
          <Stepper label="الراحة" value={rest} min={0} max={120} step={5} format={(v) => `${v} ث`} onChange={(v) => actions.setRoutineCustom(id, { rest: v })} />
          <Stepper label="الجولات" value={rounds} min={1} max={6} onChange={(v) => actions.setRoutineCustom(id, { rounds: v })} />
        </Row>
      </Card>
      <Btn title="ابدئي التمرين" icon="play" color={CATS.find((c) => c.key === r.cat).color} onPress={() => nav.push('player', { id })} />
      {r.list.map((eid, i) => {
        const e = EXERCISES[eid];
        return (
          <Pressable key={eid + i} onPress={() => nav.push('exercise', { id: eid })} style={{ flexDirection: row, alignItems: 'center', gap: 10, backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.line, padding: 8 }}>
            <Figure frames={e.frames} speed={e.speed} size={70} pregnant={preg} kegel={e.kegel} />
            <View style={{ flex: 1 }}>
              <T style={{ fontWeight: '700' }}>{e.name}</T>
              <Sub>{work || e.secs} ثانية{e.hold ? '، ثبات' : ''}</Sub>
            </View>
          </Pressable>
        );
      })}
    </Screen>
  );
}

export function ExerciseScreen({ id }) {
  const e = EXERCISES[id];
  const [secs, setSecs] = useState(e.secs);
  const [left, setLeft] = useState(null);
  const preg = e.cat === 'preg';
  useEffect(() => {
    if (left === null) return undefined;
    if (left <= 0) {
      Vibration.vibrate([0, 400, 200, 400]);
      setLeft(null);
      return undefined;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  return (
    <Screen title={e.name}>
      <Card style={{ alignItems: 'center' }}>
        <Figure frames={e.frames} speed={e.speed} size={230} pregnant={preg} kegel={e.kegel} />
        {left !== null ? <T style={{ fontSize: 48, fontWeight: '800', color: C.plum, textAlign: 'center' }}>{fmtSecs(left)}</T> : null}
      </Card>
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Stepper value={secs} onChange={setSecs} min={10} max={300} step={5} format={(v) => fmtSecs(v)} label="المؤقت" />
          <Btn title={left !== null ? 'إيقاف' : 'ابدئي'} icon={left !== null ? 'stop' : 'play'} onPress={() => setLeft(left !== null ? null : secs)} />
        </Row>
      </Card>
      <Card>
        <H style={{ fontSize: 17 }}>الطريقة</H>
        <Bullets items={e.steps} />
        {e.tip ? <Sub style={{ marginTop: 6 }}>{e.tip}</Sub> : null}
        {e.calories ? <Sub>تقريبًا {e.calories} سعرات في الدقيقة، وده بيختلف حسب الوزن والمجهود.</Sub> : null}
      </Card>
    </Screen>
  );
}

// ———————————————— مشغّل التمرين بالمؤقت ————————————————
export function PlayerScreen({ id }) {
  const { data, actions } = useApp();
  const nav = useNav();
  const r = ROUTINES.find((x) => x.id === id);
  const cu = data.workouts.custom[id] || {};
  const rest = cu.rest ?? r.rest;
  const rounds = cu.rounds || r.rounds;

  // خطوات التمرين: تجهيز ← تمرين ← راحة ← ...
  const steps = useMemo(() => {
    const out = [{ kind: 'ready', secs: 5, ex: r.list[0] }];
    for (let k = 0; k < rounds; k++) {
      r.list.forEach((eid, i) => {
        out.push({ kind: 'work', secs: cu.work || EXERCISES[eid].secs, ex: eid, round: k + 1 });
        const last = k === rounds - 1 && i === r.list.length - 1;
        if (!last && rest > 0) out.push({ kind: 'rest', secs: rest, ex: r.list[(i + 1) % r.list.length] });
      });
    }
    return out;
  }, [r, rounds, rest, cu.work]);

  const [idx, setIdx] = useState(0);
  const [left, setLeft] = useState(steps[0].secs);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const spent = useRef(0);

  useEffect(() => {
    activateKeepAwakeAsync().catch(() => {});
    return () => deactivateKeepAwake();
  }, []);

  useEffect(() => {
    if (paused || done) return undefined;
    const t = setTimeout(() => {
      spent.current += 1;
      if (left <= 1) {
        Vibration.vibrate(300);
        if (idx + 1 >= steps.length) {
          setDone(true);
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
  const color = step.kind === 'work' ? C.period : step.kind === 'rest' ? C.fertile : C.calm;
  const preg = r.cat === 'preg';
  const workSteps = steps.filter((s) => s.kind === 'work').length;
  const doneWork = steps.slice(0, idx).filter((s) => s.kind === 'work').length;

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
      <View style={{ height: 6, backgroundColor: C.line, borderRadius: 3, overflow: 'hidden' }}>
        <View style={{ height: 6, width: `${(doneWork / workSteps) * 100}%`, backgroundColor: C.period }} />
      </View>
      <Card style={{ alignItems: 'center', gap: 4 }}>
        <Sub style={{ color, fontWeight: '800', textAlign: 'center' }}>
          {step.kind === 'ready' ? 'استعدي' : step.kind === 'rest' ? 'راحة، والجاي:' : `الجولة ${step.round} من ${rounds}`}
        </Sub>
        <T style={{ fontSize: 22, fontWeight: '800', textAlign: 'center' }}>{e.name}</T>
        <Figure frames={e.frames} speed={e.speed} size={220} playing={!paused && step.kind === 'work'} pregnant={preg} kegel={e.kegel} color={step.kind === 'work' ? C.plum : C.sub} />
        <T style={{ fontSize: 64, fontWeight: '800', color, textAlign: 'center' }}>{fmtSecs(left)}</T>
      </Card>
      <Row style={{ gap: 10, justifyContent: 'center' }}>
        <Btn kind="soft" icon={row === 'row' ? 'play-skip-back' : 'play-skip-forward'} title="" onPress={() => jump(-1)} style={{ width: 60 }} />
        <Btn icon={paused ? 'play' : 'pause'} title={paused ? 'كملي' : 'إيقاف مؤقت'} onPress={() => setPaused(!paused)} style={{ flex: 1 }} color="period" />
        <Btn kind="soft" icon={row === 'row' ? 'play-skip-forward' : 'play-skip-back'} title="" onPress={() => jump(1)} style={{ width: 60 }} />
      </Row>
      <Card>
        <Bullets items={e.steps} />
        {e.tip ? <Sub>{e.tip}</Sub> : null}
      </Card>
    </Screen>
  );
}
