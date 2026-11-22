import React, { useState } from 'react';
import { Switch, View } from 'react-native';
import { Screen } from '../nav';
import { Btn, C, Card, Chip, H, Row, Stepper, Sub, T, Wrap, fmtTime } from '../ui';
import { formatDate, todayKey } from '../cycle';
import { useApp } from '../store';

function Toggle({ label, sub, value, onChange }) {
  return (
    <Row style={{ gap: 10, paddingVertical: 6 }}>
      <View style={{ flex: 1, gap: 2 }}>
        <T style={{ fontWeight: '700' }}>{label}</T>
        {sub ? <Sub>{sub}</Sub> : null}
      </View>
      <Switch value={!!value} onValueChange={onChange} trackColor={{ true: C.plum, false: C.line }} thumbColor="#fff" />
    </Row>
  );
}

function TimePick({ h, m, onChange }) {
  return (
    <Row style={{ justifyContent: 'space-around', paddingVertical: 4 }}>
      <Stepper label="الساعة" value={h} min={0} max={23} onChange={(v) => onChange({ h: v })} format={(v) => fmtTime(v, 0).replace(':00', '')} />
      <Stepper label="الدقيقة" value={m} min={0} max={55} step={5} onChange={(v) => onChange({ m: v })} format={(v) => String(v).padStart(2, '0')} />
    </Row>
  );
}

const SIZES = [
  [0.9, 'صغير'],
  [1, 'عادي'],
  [1.15, 'كبير'],
  [1.3, 'كبير جدًا'],
  [1.5, 'ضخم'],
];

export default function SettingsScreen() {
  const { data, actions } = useApp();
  const st = data.settings;
  const n = st.notif;
  const [wipe, setWipe] = useState(false);
  return (
    <Screen title="الإعدادات">
      <Card>
        <H style={{ fontSize: 17 }}>حجم الخط</H>
        <Wrap>
          {SIZES.map(([v, l]) => (
            <Chip key={v} label={l} active={st.fontScale === v} onPress={() => actions.setSetting('fontScale', v)} />
          ))}
        </Wrap>
        <T>ده شكل الكلام بالحجم اللي اخترتيه.</T>
      </Card>

      <Card>
        <Toggle label="الإشعارات" sub="لو قفلتيها مش هيوصلك أي تنبيه" value={st.notifications} onChange={(v) => actions.setSetting('notifications', v)} />
      </Card>

      {st.notifications ? (
        <>
          <Card>
            <H style={{ fontSize: 17 }}>الدورة</H>
            <Toggle label="أعراض ما قبل الدورة" sub="قبل الدورة بأسبوع" value={n.pms} onChange={(v) => actions.setNotif('pms', v)} />
            <Toggle label="ميعاد الدورة" sub="قبلها بيومين" value={n.period} onChange={(v) => actions.setNotif('period', v)} />
            <Toggle label="علامات الطهر" sub="كل ليلة من اليوم التالت لحد العاشر" value={n.purity} onChange={(v) => actions.setNotif('purity', v)} />
            <Toggle label="أيام الخصوبة" value={n.fertility} onChange={(v) => actions.setNotif('fertility', v)} />
            <Toggle label="تأخر الدورة" sub="بعد 3 أيام وبعد أسبوع" value={n.late} onChange={(v) => actions.setNotif('late', v)} />
          </Card>

          <Card>
            <H style={{ fontSize: 17 }}>قدوتي</H>
            <Toggle label="سيرة كل يوم" sub="كل يوم سيرة صحابية أو أم من أمهات المؤمنين أو امرأة صالحة" value={st.seerah.on} onChange={(v) => actions.setGroup('seerah', { on: v })} />
            {st.seerah.on ? <TimePick h={st.seerah.h} m={st.seerah.m} onChange={(p) => actions.setGroup('seerah', p)} /> : null}
          </Card>

          <Card>
            <H style={{ fontSize: 17 }}>اليوميات</H>
            <Toggle label="تذكير يومي بتسجيل المزاج والأعراض" value={st.journal.on} onChange={(v) => actions.setGroup('journal', { on: v })} />
            {st.journal.on ? <TimePick h={st.journal.h} m={st.journal.m} onChange={(p) => actions.setGroup('journal', p)} /> : null}
          </Card>

          <Card>
            <H style={{ fontSize: 17 }}>الحمل</H>
            <Toggle label="مواعيد الكشوفات والتحاليل والأسبوع الجديد" value={n.preg} onChange={(v) => actions.setNotif('preg', v)} />
          </Card>

          <Card>
            <H style={{ fontSize: 17 }}>سنن الفطرة</H>
            <Toggle label="تذكير الاستحداد وتقليم الأظافر" sub="بعد 30 يوم، وقبل الأربعين بيومين" value={n.istihdad} onChange={(v) => actions.setNotif('istihdad', v)} />
            <Sub>{st.lastIstihdad ? `آخر مرة: ${formatDate(st.lastIstihdad, true)}` : 'لسه ما سجلتيش'}</Sub>
            <Btn small title="عملتها النهارده" color="fertile" onPress={() => actions.setSetting('lastIstihdad', todayKey())} />
          </Card>

          <Sub>تذكير التمارين بتظبطيه من قسم التمارين.</Sub>
        </>
      ) : null}

      <Card>
        <H style={{ fontSize: 17 }}>بياناتك</H>
        <T style={{ lineHeight: 25 }}>كل بياناتك، يعني الدورة واليوميات والحمل والصور، محفوظة على موبايلك بس، ومش بتتبعت لأي حد.</T>
        {wipe ? (
          <View style={{ gap: 8 }}>
            <T style={{ color: C.danger, fontWeight: '700' }}>هتمسحي كل حاجة ومش هتقدري ترجعيها. متأكدة؟</T>
            <Row style={{ gap: 8 }}>
              <Btn small title="امسحي كل حاجة" color="danger" style={{ flex: 1 }} onPress={() => { actions.wipe(); setWipe(false); }} />
              <Btn small title="لأ" kind="soft" style={{ flex: 1 }} onPress={() => setWipe(false)} />
            </Row>
          </View>
        ) : (
          <Btn small kind="soft" color="danger" title="مسح كل البيانات" onPress={() => setWipe(true)} />
        )}
      </Card>
      <Sub>رفيقة، إصدار 1.0. المعلومات الطبية للتوعية ومش بديل عن الدكتورة، والأحكام مأخوذة من مصادرها المذكورة في المكتبة.</Sub>
    </Screen>
  );
}
