import React, { useEffect, useRef, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { Screen, useNav } from '../nav';
import { Accordion, Btn, Bullets, C, Card, Chip, H, Input, ListItem, Row, Stepper, Sub, T, Wrap, fmtSecs, row } from '../ui';
import { MonthGrid } from '../components';
import { addDays, diffDays, formatDate, todayKey } from '../cycle';
import { CHECKS, DANGER, LABOR, POSTPARTUM, PREG_TIPS, TRIMESTERS, pregInfo, weekInfo } from '../pregnancy';
import { dropFile, keepFile, useApp } from '../store';

export function PregnancyScreen() {
  const { data } = useApp();
  if (!data.pregnancy) return <PregSetup />;
  if (data.pregnancy.birth) return <PostpartumScreen root />;
  return <PregOverview />;
}

function PregSetup() {
  const { info, actions } = useApp();
  const now = new Date();
  const [month, setMonth] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [sel, setSel] = useState(info.hasData ? info.last.start : null);
  const today = todayKey();
  const valid = sel && diffDays(sel, today) >= 14 && diffDays(sel, today) <= 300;
  return (
    <Screen title="حملي">
      <Card color="baby">
        <H>متابعة الحمل</H>
        <T style={{ lineHeight: 25 }}>
          اختاري أول يوم في آخر دورة نزلت قبل الحمل. التطبيق هيحسب أسبوع الحمل، وميعاد الولادة المتوقع، ومواعيد الكشوفات والتحاليل، ويفكرك بيها.
        </T>
      </Card>
      <Card>
        <MonthGrid month={month} onMonth={setMonth} selected={sel} onPick={setSel} maxDate={today} marks={(k) => ({ kind: k === sel ? 'period' : null })} />
        {sel ? (
          <Sub>
            {valid
              ? `الحمل دلوقتي في الأسبوع ${pregInfo(sel).week}، والولادة المتوقعة ${formatDate(pregInfo(sel).edd, true)}.`
              : 'التاريخ لازم يكون من أسبوعين لـ 10 شهور فاتوا.'}
          </Sub>
        ) : null}
        <Btn title="ابدئي المتابعة" icon="heart" color="baby" disabled={!valid} onPress={() => actions.startPregnancy(sel)} />
      </Card>
      <Sub>لو مش فاكرة التاريخ، الدكتورة هتحدده من السونار، وتقدري تغيريه بعدين.</Sub>
    </Screen>
  );
}

function PregOverview() {
  const { data, actions } = useApp();
  const nav = useNav();
  const preg = data.pregnancy;
  const p = pregInfo(preg.lmp);
  const w = weekInfo(p.week);
  const [birthMode, setBirthMode] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const done = preg.checks || {};
  const next = CHECKS.find((c) => !done[c.id]?.done && c.week >= p.week - 1);

  return (
    <Screen title="حملي">
      <Card color="baby">
        <Sub style={{ color: C.baby, fontWeight: '800' }}>{TRIMESTERS[p.trimester].name}، الشهر {p.month}</Sub>
        <T style={{ fontSize: 30, fontWeight: '800', color: C.baby }}>الأسبوع {p.week}</T>
        <Sub>و{p.day} أيام. فاضل {Math.max(0, p.left)} يوم على الولادة المتوقعة يوم {formatDate(p.edd, true)}</Sub>
        <View style={{ height: 10, backgroundColor: C.card, borderRadius: 5, overflow: 'hidden' }}>
          <View style={{ height: 10, width: `${p.progress * 100}%`, backgroundColor: C.baby }} />
        </View>
      </Card>

      <Card>
        <Row style={{ gap: 10 }}>
          <Ionicons name="happy-outline" size={28} color={C.baby} />
          <T style={{ flex: 1, fontWeight: '800', fontSize: 18 }}>البيبي قد {w.size}</T>
        </Row>
        <T style={{ lineHeight: 25 }}>{w.baby}</T>
        <Sub style={{ fontWeight: '800', marginTop: 4 }}>ليكي</Sub>
        <T style={{ lineHeight: 25 }}>{w.mom}</T>
      </Card>

      {next ? (
        <Card color="pms" onPress={() => nav.push('check', { id: next.id })}>
          <Sub style={{ color: C.pms, fontWeight: '800' }}>الكشف الجاي، في الأسبوع {next.week}</Sub>
          <T style={{ fontWeight: '800', fontSize: 18 }}>{next.title}</T>
          <Sub>{formatDate(addDays(preg.lmp, next.week * 7), true)}</Sub>
        </Card>
      ) : null}

      <H style={{ fontSize: 17 }}>الكشوفات والتحاليل</H>
      {CHECKS.map((c) => {
        const st = done[c.id];
        const due = addDays(preg.lmp, c.week * 7);
        const past = c.week < p.week;
        return (
          <ListItem
            key={c.id}
            icon={st?.done ? 'checkmark-circle' : past ? 'alert-circle-outline' : 'calendar-outline'}
            color={st?.done ? 'fertile' : past ? 'pms' : 'baby'}
            title={c.title}
            sub={`الأسبوع ${c.week}، ${formatDate(due)}${st?.files?.length ? `، ${st.files.length} ملف` : ''}`}
            onPress={() => nav.push('check', { id: c.id })}
          />
        );
      })}

      <H style={{ fontSize: 17 }}>أدوات</H>
      <ListItem icon="document-text-outline" title="سجل الزيارات" sub={`${preg.visits?.length || 0} زيارة: وزن وضغط وملاحظات وملفات`} onPress={() => nav.push('pregExtra', { mode: 'visits' })} color="baby" />
      <ListItem icon="hand-left-outline" title="عدّاد حركة الجنين" sub="من الأسبوع 28: لازم 10 حركات في ساعتين" onPress={() => nav.push('pregExtra', { mode: 'kicks' })} color="calm" />
      <ListItem icon="timer-outline" title="مؤقت الطلق" sub="يحسب مدة التقلصات والوقت بينهم" onPress={() => nav.push('pregExtra', { mode: 'contractions' })} color="period" />
      <ListItem icon="barbell-outline" title="تمارين الحمل" sub="آمنة، مع رسمة ومؤقت" onPress={() => nav.go('fitness')} color="fertile" />

      <Card>
        <H style={{ fontSize: 17 }}>نصايح {TRIMESTERS[p.trimester].name}</H>
        <Bullets items={PREG_TIPS[p.trimester]} color={C.baby} />
      </Card>

      <Card color="danger">
        <H style={{ fontSize: 17, color: C.danger }}>روحي للدكتورة أو الطوارئ فورًا لو حصل:</H>
        <Bullets items={DANGER} color={C.danger} />
      </Card>

      {p.week >= 30 ? (
        <Card>
          <H style={{ fontSize: 17 }}>علامات الولادة</H>
          <Bullets items={LABOR.signs} color={C.period} />
          <T style={{ lineHeight: 25, fontWeight: '700' }}>{LABOR.rule}</T>
          <Sub style={{ fontWeight: '800' }}>شنطة الولادة</Sub>
          <Bullets items={LABOR.bag} />
          <Sub>{LABOR.duaa}</Sub>
        </Card>
      ) : null}

      {birthMode ? (
        <Card color="fertile">
          <T style={{ fontWeight: '800' }}>ألف مبروك! إمتى ولدتي؟</T>
          <Row style={{ gap: 8 }}>
            <Btn small title="النهارده" color="fertile" style={{ flex: 1 }} onPress={() => actions.setPreg({ birth: todayKey() })} />
            <Btn small title="امبارح" kind="soft" color="fertile" style={{ flex: 1 }} onPress={() => actions.setPreg({ birth: addDays(todayKey(), -1) })} />
          </Row>
          <Btn small title="رجوع" kind="soft" onPress={() => setBirthMode(false)} />
        </Card>
      ) : (
        <Btn title="ولدت الحمد لله" icon="gift" color="fertile" onPress={() => setBirthMode(true)} />
      )}

      {confirmEnd ? (
        <Card color="danger">
          <T>متأكدة إنك عايزة توقفي متابعة الحمل وتمسحي بياناتها؟</T>
          <Row style={{ gap: 8 }}>
            <Btn small title="أيوه، امسحي" color="danger" style={{ flex: 1 }} onPress={() => actions.endPregnancy()} />
            <Btn small title="لأ" kind="soft" style={{ flex: 1 }} onPress={() => setConfirmEnd(false)} />
          </Row>
        </Card>
      ) : (
        <Btn title="إيقاف المتابعة" kind="soft" color="danger" small onPress={() => setConfirmEnd(true)} />
      )}
    </Screen>
  );
}

// ———————————————— المرفقات (صور التحاليل والسونار وملفات PDF) ————————————————
export function Attachments({ files = [], onChange }) {
  const [view, setView] = useState(null);
  const add = async (src) => {
    try {
      let picked = null;
      if (src === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) return;
        const r = await ImagePicker.launchCameraAsync({ quality: 0.7 });
        if (!r.canceled) picked = { uri: r.assets[0].uri, name: r.assets[0].fileName || 'صورة.jpg', type: 'image' };
      } else if (src === 'gallery') {
        const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
        if (!r.canceled) picked = { uri: r.assets[0].uri, name: r.assets[0].fileName || 'صورة.jpg', type: 'image' };
      } else {
        const r = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'], copyToCacheDirectory: true });
        if (!r.canceled) {
          const a = r.assets[0];
          picked = { uri: a.uri, name: a.name, type: a.mimeType?.includes('pdf') ? 'pdf' : 'image' };
        }
      }
      if (picked) {
        const kept = await keepFile(picked.uri, picked.name, picked.type);
        onChange([...files, { ...kept, date: todayKey() }]);
      }
    } catch (e) {
      console.warn(e);
    }
  };
  const remove = async (f) => {
    await dropFile(f.uri);
    onChange(files.filter((x) => x.uri !== f.uri));
    setView(null);
  };
  const open = async (f) => {
    if (f.type === 'image') setView(f);
    else if (await Sharing.isAvailableAsync()) Sharing.shareAsync(f.uri);
  };
  return (
    <View style={{ gap: 8 }}>
      {files.length ? (
        <Wrap>
          {files.map((f) => (
            <Pressable key={f.uri} onPress={() => open(f)} style={{ width: 86, gap: 4 }}>
              {f.type === 'image' ? (
                <Image source={{ uri: f.uri }} style={{ width: 86, height: 86, borderRadius: 10, backgroundColor: C.line }} />
              ) : (
                <View style={{ width: 86, height: 86, borderRadius: 10, backgroundColor: C.dangerSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="document-text" size={34} color={C.danger} />
                </View>
              )}
              <Sub numberOfLines={1} style={{ fontSize: 11 }}>{f.name}</Sub>
            </Pressable>
          ))}
        </Wrap>
      ) : (
        <Sub>مفيش ملفات لسه.</Sub>
      )}
      <Row style={{ gap: 8, flexWrap: 'wrap' }}>
        <Btn small kind="soft" icon="camera-outline" title="صوّري" color="baby" onPress={() => add('camera')} />
        <Btn small kind="soft" icon="images-outline" title="من المعرض" color="baby" onPress={() => add('gallery')} />
        <Btn small kind="soft" icon="document-outline" title="ملف PDF" color="baby" onPress={() => add('doc')} />
      </Row>
      <Modal visible={!!view} transparent animationType="fade" onRequestClose={() => setView(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', padding: 12, gap: 12 }}>
          {view ? (
            <ScrollView maximumZoomScale={4} minimumZoomScale={1} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
              <Image source={{ uri: view.uri }} style={{ width: '100%', aspectRatio: 0.75 }} resizeMode="contain" />
            </ScrollView>
          ) : null}
          <Row style={{ gap: 8 }}>
            <Btn title="قفل" style={{ flex: 1 }} onPress={() => setView(null)} />
            <Btn title="مشاركة" kind="soft" style={{ flex: 1 }} onPress={() => Sharing.shareAsync(view.uri)} />
            <Btn title="مسح" color="danger" style={{ flex: 1 }} onPress={() => remove(view)} />
          </Row>
        </View>
      </Modal>
    </View>
  );
}

export function CheckScreen({ id }) {
  const { data, actions } = useApp();
  const c = CHECKS.find((x) => x.id === id);
  const st = data.pregnancy?.checks?.[id] || { files: [] };
  const [note, setNote] = useState(st.note || '');
  const due = addDays(data.pregnancy.lmp, c.week * 7);
  return (
    <Screen title={c.title}>
      <Card color={c.color}>
        <Sub>الأسبوع {c.week}، حوالي يوم {formatDate(due, true)}</Sub>
        <Bullets items={c.items} />
      </Card>
      <Card>
        {st.done ? (
          <>
            <T style={{ fontWeight: '800', color: C.fertile }}>اتعمل يوم {formatDate(st.date)}</T>
            <Btn small kind="soft" title="رجّعيه لسه ما اتعملش" onPress={() => actions.setCheck(id, { done: false })} />
          </>
        ) : (
          <Btn title="عملته" icon="checkmark" color="fertile" onPress={() => actions.setCheck(id, { done: true, date: todayKey() })} />
        )}
      </Card>
      <Card>
        <H style={{ fontSize: 17 }}>النتايج والصور</H>
        <Attachments files={st.files} onChange={(files) => actions.setCheck(id, { files })} />
        <Input placeholder="ملاحظات الدكتورة أو النتيجة" value={note} onChangeText={setNote} onEndEditing={() => actions.setCheck(id, { note })} multiline />
      </Card>
    </Screen>
  );
}

export function PregExtraScreen({ mode }) {
  if (mode === 'kicks') return <Kicks />;
  if (mode === 'contractions') return <Contractions />;
  return <Visits />;
}

function Visits() {
  const { data, actions } = useApp();
  const visits = data.pregnancy?.visits || [];
  const [adding, setAdding] = useState(false);
  const [offset, setOffset] = useState(0);
  const [weight, setWeight] = useState('');
  const [bp, setBp] = useState('');
  const [note, setNote] = useState('');
  const [files, setFiles] = useState([]);
  const date = addDays(todayKey(), -offset);
  const save = () => {
    actions.addVisit({ date, weight: weight.trim(), bp: bp.trim(), note: note.trim(), files, week: pregInfo(data.pregnancy.lmp, date).week });
    setAdding(false);
    setWeight(''); setBp(''); setNote(''); setFiles([]); setOffset(0);
  };
  return (
    <Screen title="سجل الزيارات">
      {adding ? (
        <Card>
          <H style={{ fontSize: 17 }}>زيارة جديدة</H>
          <Row style={{ justifyContent: 'space-between' }}>
            <T style={{ fontWeight: '700' }}>{formatDate(date, true)}</T>
            <Stepper value={offset} onChange={setOffset} min={0} max={60} format={(v) => (v === 0 ? 'النهارده' : `من ${v} يوم`)} />
          </Row>
          <Input placeholder="الوزن (كيلو)" keyboardType="decimal-pad" value={weight} onChangeText={setWeight} />
          <Input placeholder="الضغط (مثلًا 120/80)" value={bp} onChangeText={setBp} />
          <Input placeholder="ملاحظات الدكتورة" value={note} onChangeText={setNote} multiline />
          <Attachments files={files} onChange={setFiles} />
          <Row style={{ gap: 8 }}>
            <Btn title="حفظ" color="baby" style={{ flex: 1 }} onPress={save} />
            <Btn title="إلغاء" kind="soft" style={{ flex: 1 }} onPress={() => setAdding(false)} />
          </Row>
        </Card>
      ) : (
        <Btn title="أضيفي زيارة" icon="add" color="baby" onPress={() => setAdding(true)} />
      )}
      {visits.length === 0 && !adding ? <Sub>سجلي كل زيارة: وزنك وضغطك وكلام الدكتورة وصور السونار، عشان يبقى ملفك كامل معاكي.</Sub> : null}
      {visits.map((v) => (
        <VisitCard key={v.id} v={v} />
      ))}
    </Screen>
  );
}

function VisitCard({ v }) {
  const { actions } = useApp();
  const [open, setOpen] = useState(false);
  return (
    <Accordion title={`${formatDate(v.date, true)}، الأسبوع ${v.week}`} open={open} onToggle={() => setOpen(!open)}>
      <View style={{ gap: 6 }}>
        {v.weight ? <T>الوزن: {v.weight} كيلو</T> : null}
        {v.bp ? <T>الضغط: {v.bp}</T> : null}
        {v.note ? <T>{v.note}</T> : null}
        {v.files?.length ? <Attachments files={v.files} onChange={() => {}} /> : null}
        <Btn small kind="soft" color="danger" title="مسح الزيارة" onPress={() => actions.removeVisit(v.id)} />
      </View>
    </Accordion>
  );
}

function Kicks() {
  const { data, actions } = useApp();
  const [start, setStart] = useState(null);
  const [count, setCount] = useState(0);
  const [, tick] = useState(0);
  useEffect(() => {
    if (!start) return undefined;
    const id = setInterval(() => tick((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [start]);
  const secs = start ? Math.floor((Date.now() - start) / 1000) : 0;
  const finish = () => {
    actions.pushTo('kicks', { date: todayKey(), count, mins: Math.round(secs / 60) });
    setStart(null);
    setCount(0);
  };
  return (
    <Screen title="عدّاد حركة الجنين">
      <Card color="calm">
        <T style={{ lineHeight: 25 }}>
          من الأسبوع 28: اختاري وقت البيبي بيبقى نشيط فيه، غالبًا بعد الأكل. اقعدي أو نامي على جنبك الشمال، وعدّي أي حركة: ركلة، أو لفة، أو رفرفة. المفروض توصلي 10 حركات في ساعتين أو أقل.
        </T>
      </Card>
      <Card style={{ alignItems: 'center' }}>
        <T style={{ fontSize: 64, fontWeight: '800', color: C.calm, textAlign: 'center' }}>{count}</T>
        <Sub style={{ textAlign: 'center' }}>{start ? `الوقت: ${fmtSecs(secs)}` : 'اضغطي «ابدئي» وبعدين اضغطي مع كل حركة'}</Sub>
        {start ? (
          <>
            <Pressable onPress={() => setCount((c) => c + 1)} style={{ width: 150, height: 150, borderRadius: 75, backgroundColor: C.calm, alignItems: 'center', justifyContent: 'center', marginVertical: 10 }}>
              <T style={{ color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center' }}>حركة</T>
            </Pressable>
            {count >= 10 ? <T style={{ color: C.fertile, fontWeight: '800', textAlign: 'center' }}>تمام! 10 حركات في {Math.round(secs / 60)} دقيقة.</T> : null}
            {secs > 7200 && count < 10 ? <T style={{ color: C.danger, fontWeight: '800', textAlign: 'center' }}>عدّت ساعتين وأقل من 10 حركات. كلمي دكتورتك أو روحي الطوارئ.</T> : null}
            <Btn title="خلصت" kind="soft" color="calm" onPress={finish} style={{ alignSelf: 'stretch' }} />
          </>
        ) : (
          <Btn title="ابدئي" color="calm" onPress={() => setStart(Date.now())} style={{ alignSelf: 'stretch', marginTop: 10 }} />
        )}
      </Card>
      {(data.pregnancy?.kicks || []).slice(0, 14).map((k, i) => (
        <Card key={i}>
          <Row style={{ justifyContent: 'space-between' }}>
            <T>{formatDate(k.date, true)}</T>
            <Sub>{k.count} حركة في {k.mins} دقيقة</Sub>
          </Row>
        </Card>
      ))}
    </Screen>
  );
}

function Contractions() {
  const [list, setList] = useState([]); // {start, end}
  const [current, setCurrent] = useState(null);
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const toggle = () => {
    if (current) {
      setList((l) => [{ start: current, end: Date.now() }, ...l]);
      setCurrent(null);
    } else setCurrent(Date.now());
  };
  const recent = list.slice(0, 6);
  const avgDur = recent.length ? Math.round(recent.reduce((s, c) => s + (c.end - c.start), 0) / recent.length / 1000) : 0;
  const gaps = recent.slice(0, -1).map((c, i) => (c.start - recent[i + 1].start) / 1000);
  const avgGap = gaps.length ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : 0;
  const go = gaps.length >= 3 && avgGap <= 5 * 60 && avgDur >= 50;
  return (
    <Screen title="مؤقت الطلق">
      <Card color="period">
        <T style={{ lineHeight: 25 }}>اضغطي أول ما الطلقة تبدأ، واضغطي تاني لما تخلص. التطبيق بيحسب مدة كل طلقة والوقت بين كل واحدة والتانية.</T>
        <Sub>{LABOR.rule}</Sub>
      </Card>
      <Pressable onPress={toggle} style={{ alignSelf: 'center', width: 190, height: 190, borderRadius: 95, backgroundColor: current ? C.period : C.periodSoft, alignItems: 'center', justifyContent: 'center' }}>
        <T style={{ fontSize: 22, fontWeight: '800', color: current ? '#fff' : C.period, textAlign: 'center' }}>{current ? 'الطلقة خلصت' : 'بدأت طلقة'}</T>
        {current ? <T style={{ color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center' }}>{fmtSecs(Math.floor((Date.now() - current) / 1000))}</T> : null}
      </Pressable>
      {recent.length ? (
        <Row style={{ gap: 10 }}>
          <Card style={{ flex: 1 }}>
            <Sub style={{ textAlign: 'center' }}>متوسط المدة</Sub>
            <T style={{ fontSize: 24, fontWeight: '800', textAlign: 'center' }}>{fmtSecs(avgDur)}</T>
          </Card>
          <Card style={{ flex: 1 }}>
            <Sub style={{ textAlign: 'center' }}>كل قد إيه</Sub>
            <T style={{ fontSize: 24, fontWeight: '800', textAlign: 'center' }}>{avgGap ? fmtSecs(avgGap) : '—'}</T>
          </Card>
        </Row>
      ) : null}
      {go ? (
        <Card color="danger">
          <T style={{ fontWeight: '800', color: C.danger }}>الطلق منتظم وقريب. اتوكلي على الله وروحي المستشفى.</T>
        </Card>
      ) : null}
      {list.map((c, i) => (
        <Row key={c.start} style={{ justifyContent: 'space-between', paddingHorizontal: 4 }}>
          <Sub>{new Date(c.start).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</Sub>
          <Sub>المدة {fmtSecs(Math.round((c.end - c.start) / 1000))}</Sub>
          <Sub>{list[i + 1] ? `بعد ${fmtSecs(Math.round((c.start - list[i + 1].start) / 1000))}` : ''}</Sub>
        </Row>
      ))}
    </Screen>
  );
}

export function PostpartumScreen({ root }) {
  const { data, actions } = useApp();
  const nav = useNav();
  const [confirm, setConfirm] = useState(false);
  const birth = data.pregnancy?.birth;
  const d = birth ? diffDays(birth, todayKey()) + 1 : null;
  const [open, setOpen] = useState(0);
  return (
    <Screen title="بعد الولادة">
      {birth ? (
        <Card color="fertile">
          <T style={{ fontSize: 24, fontWeight: '800', color: C.fertile }}>اليوم {d} بعد الولادة</T>
          <Sub>اتولد يوم {formatDate(birth, true)}. ربنا يجعله قرة عين ليكي.</Sub>
          {d <= 7 ? <T>كشف الأسبوع الأول قرّب.</T> : d <= 45 ? <T>كشف الـ 6 أسابيع يوم {formatDate(addDays(birth, 42))}.</T> : null}
        </Card>
      ) : null}
      {POSTPARTUM.map((s, i) => (
        <Accordion key={s.title} title={s.title} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)}>
          <Bullets items={s.points} color={C.fertile} />
        </Accordion>
      ))}
      <ListItem icon="barbell-outline" title="تمارين بعد الولادة" sub="كيجل، وتنفس، وإمالة الحوض" onPress={() => nav.go('fitness')} color="fertile" />
      <ListItem icon="people-outline" title="تربية الرضيع" sub="من قسم تربية الأبناء" onPress={() => nav.go('more', 'stage', { id: 'infant' })} color="baby" />
      {root ? (
        confirm ? (
          <Card>
            <T>هترجعي لمتابعة الدورة، وبيانات الحمل هتتمسح. موافقة؟</T>
            <Row style={{ gap: 8 }}>
              <Btn small title="أيوه" color="plum" style={{ flex: 1 }} onPress={() => actions.endPregnancy()} />
              <Btn small title="لأ" kind="soft" style={{ flex: 1 }} onPress={() => setConfirm(false)} />
            </Row>
          </Card>
        ) : (
          <Btn title="الدورة رجعت: ارجعي لمتابعة الدورة" kind="soft" onPress={() => setConfirm(true)} />
        )
      ) : null}
    </Screen>
  );
}
