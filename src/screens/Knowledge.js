import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, useNav } from '../nav';
import { Accordion, Btn, Bullets, C, Card, Chip, H, Input, ListItem, Row, Stepper, Sub, T, Wrap, tone } from '../ui';
import { FIQH, FIQH_NOTE, FIQH_SOURCES } from '../fiqh';
import { ALL_WOMEN, GROUPS, womanOfDay } from '../seerah';
import { DEFENSE, DOUBTS, FEELINGS, HONOR } from '../status';
import { BIRR, INHERITANCE, PARENT_INTRO, STAGES, calcInheritance } from '../parenting';
import { LIFE } from '../life';
import { BOOKS, METHOD, buildLibrary, dorarUrl, quranUrl } from '../library';
import { BREATHING, CALM_TIPS, HEALTH, HEALTH_SOURCES } from '../content';
import { todayKey } from '../cycle';
import { useApp } from '../store';

// ———————————————— قايمة المكتبة ————————————————
export function MoreScreen() {
  const nav = useNav();
  const { data } = useApp();
  const w = womanOfDay(todayKey());
  return (
    <Screen title="المكتبة">
      <ListItem icon="star" color="plum" title="قدوتي" sub={`سير أمهات المؤمنين والصحابيات والصالحات. قريتي ${data.seerahRead.length} من ${ALL_WOMEN.length}`} onPress={() => nav.push('seerah')} />
      <ListItem icon="book" color="fertile" title="الأحكام الفقهية" sub="الطهارة، والعبادات، والزينة، والزواج، والطلاق، والعدة" onPress={() => nav.push('fiqh')} />
      <ListItem icon="shield-checkmark" color="plum" title="مكانتك في الإسلام" sub="تطمين نفسي، وردود على الشبهات" onPress={() => nav.push('status')} />
      <ListItem icon="people" color="baby" title="تربية الأبناء" sub="الأولاد والبنات في كل المراحل، والميراث، والبر" onPress={() => nav.push('parenting')} />
      <ListItem icon="flower" color="period" title="مراحل حياتي" sub="البنت، والعروسة، والأم، وسن الأمل" onPress={() => nav.push('life')} />
      <ListItem icon="water" color="fertile" title="علامات الطهر" sub="القصة البيضاء والجفوف" onPress={() => nav.push('purity')} />
      <ListItem icon="leaf" color="calm" title="التهدئة والتنفس" sub="تمارين تنفس بمؤقت، ونصايح حسب إحساسك" onPress={() => nav.push('calm')} />
      <ListItem icon="medkit" color="danger" title="صحتي" sub="الأنيميا، وتكيس المبايض، والغدة، والإفرازات، وإمتى تروحي للدكتورة" onPress={() => nav.push('health')} />
      <ListItem icon="library" color="pms" title="المصادر والمراجع" sub="كل الآيات والأحاديث بتخريجها، والكتب" onPress={() => nav.push('library')} />
      <ListItem icon="settings" color="plum" title="الإعدادات" sub="الإشعارات، وحجم الخط، والبيانات" onPress={() => nav.push('settings')} />
      <Sub>سيرة النهارده: {w.name}</Sub>
    </Screen>
  );
}

// ———————————————— الأحكام ————————————————
export function FiqhScreen() {
  const nav = useNav();
  const [q, setQ] = useState('');
  const tags = [...new Set(FIQH.map((t) => t.tag))];
  const results = useMemo(() => {
    const s = q.trim();
    if (s.length < 2) return null;
    const out = [];
    for (const t of FIQH) for (const it of t.items) if (it.q.includes(s) || it.a.includes(s)) out.push({ t, it });
    return out;
  }, [q]);
  const [open, setOpen] = useState(-1);
  return (
    <Screen title="الأحكام الفقهية">
      <Card color="fertile">
        <T style={{ lineHeight: 25 }}>{FIQH_NOTE}</T>
      </Card>
      <Input placeholder="ابحثي: مانيكير، غسل، عدة، قرآن..." value={q} onChangeText={setQ} />
      {results ? (
        results.length ? (
          results.map(({ t, it }, i) => (
            <Accordion key={i} title={it.q} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)}>
              <T style={{ lineHeight: 26 }}>{it.a}</T>
              <Sub style={{ marginTop: 6 }}>من: {t.title}</Sub>
            </Accordion>
          ))
        ) : (
          <Sub>مفيش نتايج. جربي كلمة تانية.</Sub>
        )
      ) : (
        tags.map((tag) => (
          <View key={tag} style={{ gap: 8 }}>
            <H style={{ fontSize: 16, color: C.sub }}>{tag}</H>
            {FIQH.filter((t) => t.tag === tag).map((t) => (
              <ListItem key={t.id} icon="document-text-outline" color="fertile" title={t.title} sub={`${t.items.length} مسائل`} onPress={() => nav.push('fiqhTopic', { id: t.id })} />
            ))}
          </View>
        ))
      )}
      <Card>
        <H style={{ fontSize: 16 }}>المراجع</H>
        <Bullets items={FIQH_SOURCES} />
      </Card>
    </Screen>
  );
}

export function FiqhTopicScreen({ id }) {
  const t = FIQH.find((x) => x.id === id);
  const [open, setOpen] = useState(0);
  return (
    <Screen title={t.title}>
      {t.items.map((it, i) => (
        <Accordion key={i} title={it.q} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)}>
          <T style={{ lineHeight: 27 }}>{it.a}</T>
        </Accordion>
      ))}
      <Sub>لو حالتك مختلفة، اسألي دار الإفتاء أو شيخ موثوق.</Sub>
    </Screen>
  );
}

// ———————————————— قدوتي ————————————————
export function SeerahScreen() {
  const nav = useNav();
  const { data } = useApp();
  const w = womanOfDay(todayKey());
  const favs = ALL_WOMEN.filter((x) => data.favorites.includes(x.id));
  return (
    <Screen title="قدوتي">
      <Card color="plum" onPress={() => nav.push('woman', { id: w.id })}>
        <Sub style={{ color: C.plum, fontWeight: '800' }}>سيرة النهارده</Sub>
        <T style={{ fontSize: 22, fontWeight: '800' }}>{w.name}</T>
        <Sub>{w.title}</Sub>
        <T style={{ lineHeight: 25 }}>{w.short}</T>
      </Card>
      <T style={{ lineHeight: 25 }}>
        ﴿لقد كان في قصصهم عبرة لأولي الألباب﴾ (يوسف: 111). هنا سير نساء عظيمات من القرآن والسنة الصحيحة وكتب التراجم الموثوقة: حياتهن، وزواجهن، ومواقفهن، ودروس عملية ليكي.
      </T>
      <View style={{ height: 6, backgroundColor: C.line, borderRadius: 3, overflow: 'hidden' }}>
        <View style={{ height: 6, width: `${(data.seerahRead.length / ALL_WOMEN.length) * 100}%`, backgroundColor: C.plum }} />
      </View>
      <Sub>قريتي {data.seerahRead.length} من {ALL_WOMEN.length} سيرة</Sub>
      {GROUPS.map((g) => (
        <ListItem key={g.key} icon={g.icon} color={g.color} title={g.name} sub={`${ALL_WOMEN.filter((x) => x.group === g.key).length} سير`} onPress={() => nav.push('seerahGroup', { group: g.key })} />
      ))}
      {favs.length ? (
        <>
          <H style={{ fontSize: 16 }}>المفضلة</H>
          {favs.map((x) => (
            <ListItem key={x.id} icon="heart" color="period" title={x.name} sub={x.title} onPress={() => nav.push('woman', { id: x.id })} />
          ))}
        </>
      ) : null}
    </Screen>
  );
}

export function SeerahGroupScreen({ group }) {
  const nav = useNav();
  const { data } = useApp();
  const g = GROUPS.find((x) => x.key === group);
  return (
    <Screen title={g.name}>
      {ALL_WOMEN.filter((x) => x.group === group).map((x) => (
        <ListItem
          key={x.id}
          icon={data.seerahRead.includes(x.id) ? 'checkmark-circle' : g.icon}
          color={data.seerahRead.includes(x.id) ? 'fertile' : g.color}
          title={x.name}
          sub={x.title}
          onPress={() => nav.push('woman', { id: x.id })}
        />
      ))}
    </Screen>
  );
}

export function WomanScreen({ id }) {
  const { data, actions } = useApp();
  const w = ALL_WOMEN.find((x) => x.id === id);
  const g = GROUPS.find((x) => x.key === w.group);
  const [fg] = tone(g.color);
  const fav = data.favorites.includes(id);
  useEffect(() => {
    actions.markRead(id);
  }, [id]);
  return (
    <Screen
      title={w.name}
      right={
        <Pressable onPress={() => actions.toggleFav(id)} hitSlop={10} accessibilityLabel="مفضلة">
          <Ionicons name={fav ? 'heart' : 'heart-outline'} size={26} color="#fff" />
        </Pressable>
      }
    >
      <Card color={g.color}>
        <Sub style={{ color: fg, fontWeight: '800' }}>{g.name}</Sub>
        <T style={{ fontSize: 20, fontWeight: '800' }}>{w.title}</T>
        <T style={{ lineHeight: 25 }}>{w.short}</T>
      </Card>
      <Card>
        <H style={{ fontSize: 17 }}>سيرتها</H>
        {w.story.map((p, i) => (
          <T key={i} style={{ lineHeight: 28 }}>
            {p}
          </T>
        ))}
      </Card>
      {w.life?.length ? (
        <Card>
          <H style={{ fontSize: 17 }}>بيتها وزواجها</H>
          <Bullets items={w.life} color={fg} />
        </Card>
      ) : null}
      <Card>
        <H style={{ fontSize: 17 }}>مواقف</H>
        <Bullets items={w.stances} color={fg} />
      </Card>
      <Card color="plum">
        <H style={{ fontSize: 17 }}>دروس ليكي</H>
        <Bullets items={w.lessons} color={C.plum} />
      </Card>
      <Card>
        <H style={{ fontSize: 15, color: C.sub }}>المصادر</H>
        <Bullets items={w.refs} color={C.sub} />
      </Card>
    </Screen>
  );
}

// ———————————————— مكانتك في الإسلام ————————————————
export function StatusScreen() {
  const [tab, setTab] = useState('feel');
  const [open, setOpen] = useState(0);
  const list = tab === 'feel' ? FEELINGS : DOUBTS;
  return (
    <Screen title="مكانتك في الإسلام">
      <Wrap>
        <Chip label="لنفسك" active={tab === 'feel'} onPress={() => { setTab('feel'); setOpen(0); }} />
        <Chip label="الرد على الشبهات" active={tab === 'doubt'} onPress={() => { setTab('doubt'); setOpen(0); }} />
        <Chip label="كرامتك" active={tab === 'honor'} onPress={() => setTab('honor')} />
        <Chip label="إزاي تثبتي" active={tab === 'def'} onPress={() => setTab('def')} />
      </Wrap>
      {tab === 'honor' ? (
        <Card color="plum">
          <H style={{ fontSize: 17 }}>إزاي كرّمك الإسلام</H>
          <Bullets items={HONOR} color={C.plum} />
        </Card>
      ) : tab === 'def' ? (
        <Card>
          <H style={{ fontSize: 17 }}>إزاي ما تنساقيش وراء الشبهات</H>
          <Bullets items={DEFENSE} />
        </Card>
      ) : (
        list.map((it, i) => (
          <Accordion key={it.q} title={it.q} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)}>
            <Bullets items={it.a} color={tab === 'feel' ? C.calm : C.plum} />
          </Accordion>
        ))
      )}
    </Screen>
  );
}

// ———————————————— تربية الأبناء ————————————————
export function ParentingScreen() {
  const nav = useNav();
  return (
    <Screen title="تربية الأبناء">
      <Card color="baby">
        <T style={{ lineHeight: 25, fontWeight: '700' }}>{PARENT_INTRO.ayah}</T>
        <T style={{ lineHeight: 25 }}>{PARENT_INTRO.hadith}</T>
        <Sub>{PARENT_INTRO.note}</Sub>
      </Card>
      <H style={{ fontSize: 16 }}>المراحل</H>
      {STAGES.map((s) => (
        <ListItem key={s.id} icon="person-outline" color="baby" title={s.name} sub={[s.age, s.role].filter(Boolean).join('، ')} onPress={() => nav.push('stage', { id: s.id })} />
      ))}
      <H style={{ fontSize: 16 }}>بعد العمر الطويل</H>
      <ListItem icon="heart-outline" color="period" title="البر في الحياة وبعد الموت" sub="إزاي أولادك يبرّوكي وينفعوكي" onPress={() => nav.push('birr')} />
      <ListItem icon="calculator-outline" color="pms" title="الميراث والتركات" sub="الأنصبة، وحاسبة للحالات الشائعة" onPress={() => nav.push('inheritance')} />
    </Screen>
  );
}

export function StageScreen({ id }) {
  const s = STAGES.find((x) => x.id === id);
  const [tab, setTab] = useState('common');
  const items = s[tab];
  return (
    <Screen title={s.name}>
      <Card color="baby">
        {s.age ? <Sub>{s.age}</Sub> : null}
        <T style={{ fontWeight: '800', fontSize: 17 }}>{s.role}</T>
      </Card>
      <Wrap>
        <Chip label="للكل" active={tab === 'common'} onPress={() => setTab('common')} color="baby" />
        {s.boys.length ? <Chip label="الأولاد" active={tab === 'boys'} onPress={() => setTab('boys')} color="baby" /> : null}
        {s.girls.length ? <Chip label="البنات" active={tab === 'girls'} onPress={() => setTab('girls')} color="period" /> : null}
      </Wrap>
      <Card>
        <Bullets items={items} color={tab === 'girls' ? C.period : C.baby} />
      </Card>
    </Screen>
  );
}

export function BirrScreen() {
  return (
    <Screen title="البر في الحياة وبعد الموت">
      <Card>
        <H style={{ fontSize: 17 }}>في حياتنا</H>
        <Bullets items={BIRR.life} />
      </Card>
      <H style={{ fontSize: 17 }}>بعد الموت: إزاي أولادنا ينفعونا</H>
      {BIRR.after.map((b) => (
        <Card key={b.t}>
          <T style={{ fontWeight: '800', color: C.plum }}>{b.t}</T>
          <T style={{ lineHeight: 26 }}>{b.d}</T>
        </Card>
      ))}
      <Card color="pms">
        <H style={{ fontSize: 17 }}>ليكي من دلوقتي</H>
        <Bullets items={BIRR.forYou} color={C.pms} />
      </Card>
    </Screen>
  );
}

const frac = (x) => {
  const dens = [2, 3, 4, 6, 8, 12, 24, 27, 36, 48, 72, 96];
  for (const d of dens) {
    const n = Math.round(x * d);
    if (Math.abs(n / d - x) < 1e-6) return `${n}/${d}`;
  }
  return `${(x * 100).toFixed(1)}%`;
};

export function InheritanceScreen() {
  const [dec, setDec] = useState('male');
  const [wives, setWives] = useState(1);
  const [husband, setHusband] = useState(true);
  const [sons, setSons] = useState(0);
  const [daughters, setDaughters] = useState(0);
  const [father, setFather] = useState(false);
  const [mother, setMother] = useState(false);
  const [amount, setAmount] = useState('');
  const r = calcInheritance({ deceased: dec, wives, husband, sons, daughters, father, mother });
  const total = parseFloat(amount.replace(/,/g, '')) || 0;
  return (
    <Screen title="الميراث والتركات">
      <Card color="pms">
        <T style={{ lineHeight: 25 }}>{INHERITANCE.intro}</T>
      </Card>
      <Card>
        <H style={{ fontSize: 17 }}>قبل القسمة</H>
        <Bullets items={INHERITANCE.order} color={C.pms} />
      </Card>
      <Card>
        <H style={{ fontSize: 17 }}>الحاسبة</H>
        <Wrap>
          <Chip label="المتوفى راجل" active={dec === 'male'} onPress={() => setDec('male')} />
          <Chip label="المتوفاة ست" active={dec === 'female'} onPress={() => setDec('female')} />
        </Wrap>
        <Row style={{ justifyContent: 'space-around', flexWrap: 'wrap', gap: 10 }}>
          {dec === 'male' ? (
            <Stepper label="الزوجات" value={wives} min={0} max={4} onChange={setWives} />
          ) : (
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Sub>الزوج</Sub>
              <Chip label={husband ? 'موجود' : 'مش موجود'} active={husband} onPress={() => setHusband(!husband)} />
            </View>
          )}
          <Stepper label="الأبناء" value={sons} min={0} max={12} onChange={setSons} />
          <Stepper label="البنات" value={daughters} min={0} max={12} onChange={setDaughters} />
        </Row>
        <Wrap>
          <Chip label={`الأب ${father ? 'موجود' : 'متوفى'}`} active={father} onPress={() => setFather(!father)} />
          <Chip label={`الأم ${mother ? 'موجودة' : 'متوفاة'}`} active={mother} onPress={() => setMother(!mother)} />
        </Wrap>
        <Input placeholder="قيمة التركة بعد الديون والوصية (اختياري)" keyboardType="numeric" value={amount} onChangeText={setAmount} />
        {r.shares.length ? (
          <View style={{ gap: 6 }}>
            {r.shares.map((s) => (
              <Row key={s.who} style={{ justifyContent: 'space-between', borderBottomWidth: 1, borderColor: C.line, paddingVertical: 6, gap: 8 }}>
                <T style={{ flex: 1, fontWeight: '700' }}>{s.who}</T>
                <View style={{ alignItems: 'flex-end' }}>
                  <T style={{ fontWeight: '800', color: C.plum }}>{frac(s.frac)}</T>
                  {total ? <Sub>{Math.round(total * s.frac).toLocaleString('ar-EG')}{s.each ? `، لكل واحد ${Math.round(total * s.each).toLocaleString('ar-EG')}` : ''}</Sub> : s.each ? <Sub>لكل واحد {frac(s.each)}</Sub> : null}
                </View>
              </Row>
            ))}
            {r.awl ? <Sub>الأنصبة زادت عن التركة، فاتطبق العَول، يعني كل واحد نصيبه نقص بنفس النسبة.</Sub> : null}
            {r.radd ? <Sub>فضل جزء من التركة، فاترد على أصحاب الفروض ما عدا الزوجين، وده اسمه الرد.</Sub> : null}
          </View>
        ) : (
          <Sub>اختاري الورثة.</Sub>
        )}
        <Sub>الحاسبة للحالات الشائعة بس، من غير إخوة ولا أجداد ولا أحفاد. وفي الحالات دي اسألي متخصص.</Sub>
      </Card>
      <Card>
        <H style={{ fontSize: 17 }}>الأنصبة الأساسية</H>
        {INHERITANCE.shares.map((s) => (
          <View key={s.who} style={{ gap: 2 }}>
            <T style={{ fontWeight: '800', color: C.pms }}>{s.who}</T>
            <T style={{ lineHeight: 25 }}>{s.rule}</T>
          </View>
        ))}
        <Sub>المصدر: سورة النساء، الآيات 11 و12 و176.</Sub>
      </Card>
      <Card color="plum">
        <H style={{ fontSize: 17 }}>«للذكر مثل حظ الأنثيين»: ليه؟</H>
        <Bullets items={INHERITANCE.doubts} color={C.plum} />
      </Card>
    </Screen>
  );
}

// ———————————————— مراحل حياتي ————————————————
export function LifeScreen() {
  const nav = useNav();
  return (
    <Screen title="مراحل حياتي">
      {LIFE.map((l) => (
        <ListItem key={l.id} icon={l.icon} color={l.color} title={l.name} sub={l.sections.map((s) => s.title).join('، ')} onPress={() => nav.push('lifeStage', { id: l.id })} />
      ))}
    </Screen>
  );
}

export function LifeStageScreen({ id }) {
  const l = LIFE.find((x) => x.id === id);
  const [open, setOpen] = useState(0);
  return (
    <Screen title={l.name}>
      {l.sections.map((s, i) => (
        <Accordion key={s.title} title={s.title} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)}>
          <Bullets items={s.points} color={tone(l.color)[0]} />
        </Accordion>
      ))}
    </Screen>
  );
}

// ———————————————— المصادر ————————————————
export function LibraryScreen() {
  const [tab, setTab] = useState('ayat');
  const [q, setQ] = useState('');
  const lib = useMemo(() => buildLibrary(), []);
  const s = q.trim();
  const ayat = lib.ayat.filter((a) => !s || a.text.includes(s) || a.surah.includes(s));
  const hadith = lib.hadith.filter((h) => !s || h.text.includes(s) || h.src.includes(s));
  return (
    <Screen title="المصادر والمراجع">
      <Card color="pms">
        <H style={{ fontSize: 17 }}>منهجنا</H>
        <Bullets items={METHOD} color={C.pms} />
      </Card>
      <Wrap>
        <Chip label={`الآيات (${lib.ayat.length})`} active={tab === 'ayat'} onPress={() => setTab('ayat')} color="fertile" />
        <Chip label={`الأحاديث (${lib.hadith.length})`} active={tab === 'hadith'} onPress={() => setTab('hadith')} color="plum" />
        <Chip label="الكتب" active={tab === 'books'} onPress={() => setTab('books')} color="pms" />
      </Wrap>
      {tab !== 'books' ? <Input placeholder="ابحثي في النصوص..." value={q} onChangeText={setQ} /> : null}
      {tab === 'ayat'
        ? ayat.map((a) => (
            <Card key={`${a.surah}${a.ayah}`}>
              <T style={{ lineHeight: 30, fontSize: 18 }}>﴿{a.text}﴾</T>
              <Row style={{ justifyContent: 'space-between' }}>
                <Sub style={{ fontWeight: '800', color: C.fertile }}>سورة {a.surah}: {a.ayah}</Sub>
                {quranUrl(a) ? (
                  <Pressable onPress={() => Linking.openURL(quranUrl(a))} hitSlop={8}>
                    <Sub style={{ color: C.fertile }}>افتحي في المصحف ↗</Sub>
                  </Pressable>
                ) : null}
              </Row>
              <Sub>ورد في: {a.sections.join('، ')}</Sub>
            </Card>
          ))
        : tab === 'hadith'
        ? hadith.map((h) => (
            <Card key={h.text}>
              <T style={{ lineHeight: 28 }}>«{h.text}»</T>
              <Sub style={{ fontWeight: '800', color: C.plum }}>{h.src}</Sub>
              <Row style={{ justifyContent: 'space-between' }}>
                <Sub>ورد في: {h.sections.join('، ')}</Sub>
                <Pressable onPress={() => Linking.openURL(dorarUrl(h))} hitSlop={8}>
                  <Sub style={{ color: C.plum }}>تحققي في الدرر السنية ↗</Sub>
                </Pressable>
              </Row>
            </Card>
          ))
        : BOOKS.map((c) => (
            <Card key={c.cat}>
              <H style={{ fontSize: 17 }}>{c.cat}</H>
              {c.items.map((b) => (
                <View key={b.t} style={{ gap: 2, paddingVertical: 4 }}>
                  <T style={{ fontWeight: '800' }}>{b.t}</T>
                  <Sub>{b.a}</Sub>
                  {b.d ? <Sub>{b.d}</Sub> : null}
                </View>
              ))}
            </Card>
          ))}
    </Screen>
  );
}

// ———————————————— التهدئة ————————————————
export function CalmScreen() {
  const [ex, setEx] = useState(null);
  const [feel, setFeel] = useState(Object.keys(CALM_TIPS)[0]);
  return (
    <Screen title="التهدئة والتنفس">
      {ex ? (
        <Breath ex={ex} onClose={() => setEx(null)} />
      ) : (
        BREATHING.map((b) => (
          <Card key={b.key} onPress={() => setEx(b)}>
            <Row style={{ gap: 10 }}>
              <Ionicons name="leaf-outline" size={24} color={C.calm} />
              <T style={{ flex: 1, fontWeight: '800' }}>{b.name}</T>
              <Ionicons name="play-circle" size={28} color={C.calm} />
            </Row>
            <Sub>{b.desc}</Sub>
          </Card>
        ))
      )}
      <H style={{ fontSize: 17 }}>نصايح حسب إحساسك</H>
      <Wrap>
        {Object.keys(CALM_TIPS).map((k) => (
          <Chip key={k} label={k} color="calm" active={feel === k} onPress={() => setFeel(k)} />
        ))}
      </Wrap>
      <Card>
        <Bullets items={CALM_TIPS[feel]} color={C.calm} />
      </Card>
      <Card color="calm">
        <T style={{ lineHeight: 26 }}>
          ﴿الذين آمنوا وتطمئن قلوبهم بذكر الله ألا بذكر الله تطمئن القلوب﴾ (الرعد: 28). ومن دعاء الكرب: «لا إله إلا الله العظيم الحليم، لا إله إلا الله رب العرش العظيم، لا إله إلا الله رب السماوات ورب الأرض ورب العرش الكريم» (متفق عليه).
        </T>
      </Card>
    </Screen>
  );
}

function Breath({ ex, onClose }) {
  const [round, setRound] = useState(1);
  const [step, setStep] = useState(0);
  const [left, setLeft] = useState(ex.steps[0].secs);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (done) return undefined;
    const t = setTimeout(() => {
      if (left > 1) setLeft(left - 1);
      else {
        const ns = step + 1;
        if (ns < ex.steps.length) {
          setStep(ns);
          setLeft(ex.steps[ns].secs);
        } else if (round < ex.rounds) {
          setRound(round + 1);
          setStep(0);
          setLeft(ex.steps[0].secs);
        } else setDone(true);
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [left, step, round, done]);
  const label = ex.steps[step].label;
  const grow = label.includes('شهيق') ? 1 - (left - 1) / ex.steps[step].secs : label.includes('زفير') ? (left - 1) / ex.steps[step].secs : label.includes('احبس') ? (step === 1 ? 1 : 0) : 0.5;
  const size = 120 + grow * 100;
  return (
    <Card style={{ alignItems: 'center', gap: 12 }}>
      <T style={{ fontWeight: '800', textAlign: 'center' }}>{ex.name}</T>
      <View style={{ height: 240, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: C.calmSoft, borderWidth: 3, borderColor: C.calm, alignItems: 'center', justifyContent: 'center' }}>
          <T style={{ fontSize: 36, fontWeight: '800', color: C.calm, textAlign: 'center' }}>{done ? '✓' : left}</T>
        </View>
      </View>
      <T style={{ fontSize: 20, fontWeight: '700', textAlign: 'center' }}>{done ? 'أحسنتِ. خدي لحظة هدوء.' : label}</T>
      <Sub style={{ textAlign: 'center' }}>الجولة {round} من {ex.rounds}</Sub>
      <Btn title={done ? 'رجوع' : 'إيقاف'} kind="soft" color="calm" onPress={onClose} style={{ alignSelf: 'stretch' }} />
    </Card>
  );
}

// ———————————————— صحتي ————————————————
export function HealthScreen() {
  const [open, setOpen] = useState(0);
  return (
    <Screen title="صحتي">
      {HEALTH.map((h, i) => (
        <Accordion key={h.title} title={h.title} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)}>
          <Bullets items={h.points} color={h.urgent ? C.danger : C.plum} />
        </Accordion>
      ))}
      <Card>
        <H style={{ fontSize: 15, color: C.sub }}>المصادر</H>
        <Bullets items={HEALTH_SOURCES} color={C.sub} />
        <Sub>معلومات للتوعية، ومش بديل عن الكشف.</Sub>
      </Card>
    </Screen>
  );
}
