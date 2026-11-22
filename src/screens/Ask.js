import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, useNav } from '../nav';
import { C, Card, Chip, Input, Row, Sub, T, Wrap, row } from '../ui';
import { EXAMPLES, ask } from '../search';

const TYPE_COLOR = {
  حكم: 'fertile', آية: 'fertile', حديث: 'plum', سيرة: 'plum', 'رد على شبهة': 'plum', لنفسك: 'calm', تهدئة: 'calm',
  تربية: 'baby', 'بر الوالدين': 'baby', الميراث: 'pms', صحة: 'danger', 'بعد الولادة': 'fertile', الحمل: 'baby', تمرين: 'period', الدورة: 'period',
};
const TONES = {
  fertile: [C.fertile, C.fertileSoft], plum: [C.plum, C.plumSoft], calm: [C.calm, C.calmSoft], baby: [C.baby, C.babySoft],
  pms: [C.pms, C.pmsSoft], danger: [C.danger, C.dangerSoft], period: [C.period, C.periodSoft],
};

export default function AskScreen({ q: initial = '' }) {
  const nav = useNav();
  const [q, setQ] = useState(initial);
  const [sent, setSent] = useState(initial);
  const results = useMemo(() => (sent.trim() ? ask(sent) : []), [sent]);
  const go = (text) => {
    setQ(text);
    setSent(text);
  };
  return (
    <Screen title="اسألي">
      <Card color="plum">
        <T style={{ lineHeight: 25 }}>
          اكتبي سؤالك بكلامك العادي، والتطبيق هيطلّعلك الأحكام والآيات والأحاديث والسير والنصايح اللي ليها علاقة بيه من الكتب اللي جواه، ومعاها مصادرها.
        </T>
      </Card>
      <View style={{ flexDirection: row, gap: 8, alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Input placeholder="مثلًا: ينفع أصلي بالمانيكير؟" value={q} onChangeText={setQ} onSubmitEditing={() => setSent(q)} returnKeyType="search" autoFocus={!initial} />
        </View>
        <Pressable onPress={() => setSent(q)} style={{ backgroundColor: C.plum, borderRadius: 999, width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel="ابحثي">
          <Ionicons name="search" size={22} color="#fff" />
        </Pressable>
      </View>

      {!sent.trim() ? (
        <>
          <Sub style={{ fontWeight: '800' }}>أسئلة ممكن تجربيها</Sub>
          <Wrap>
            {EXAMPLES.map((e) => (
              <Chip key={e} label={e} onPress={() => go(e)} />
            ))}
          </Wrap>
        </>
      ) : results.length ? (
        <>
          <Sub>{results.length} نتيجة، الأقرب لسؤالك الأول</Sub>
          {results.map((r, i) => {
            const [fg, bg] = TONES[TYPE_COLOR[r.type] || 'plum'];
            const text = r.full || r.body;
            const long = !r.full && text.length > 260;
            return (
              <Card key={i} onPress={() => nav.push(r.route[0], r.route[1])}>
                <Row style={{ gap: 8, justifyContent: 'space-between' }}>
                  <View style={{ backgroundColor: bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 1 }}>
                    <T style={{ color: fg, fontWeight: '800', fontSize: 12, textAlign: 'center' }}>{r.type}</T>
                  </View>
                  {r.sub && !r.full ? <Sub numberOfLines={1} style={{ flex: 1 }}>{r.sub}</Sub> : null}
                </Row>
                {!r.full ? <T style={{ fontWeight: '800', fontSize: 17, lineHeight: 27 }}>{r.title}</T> : null}
                <T style={{ lineHeight: 27, fontSize: r.full ? 17 : 15 }}>{long ? `${text.slice(0, 260)}…` : text}</T>
                {r.full ? <Sub style={{ fontWeight: '800', color: fg }}>{r.sub}</Sub> : null}
                <Sub style={{ color: C.plum }}>افتحي التفاصيل ←</Sub>
              </Card>
            );
          })}
        </>
      ) : (
        <Card>
          <T style={{ lineHeight: 25 }}>
            ما لقيتش إجابة للسؤال ده في الكتب اللي في التطبيق. جربي تكتبيه بكلمات تانية، أو اسألي دار الإفتاء أو شيخ موثوق.
          </T>
        </Card>
      )}
      <Sub>الإجابات من المحتوى الموثق في التطبيق بس. التطبيق ما بيفتيش من عنده، ولو حالتك خاصة اسألي أهل العلم.</Sub>
    </Screen>
  );
}
