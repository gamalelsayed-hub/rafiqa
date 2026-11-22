import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, Line, Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { C, T, row, useScale } from './ui';
import { addDays, monthName, toKey, todayKey } from './cycle';
import { POSES } from './exercises';

// ———————————————— التقويم ————————————————
const WEEK = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];

/** marks(key) => { kind: 'period'|'predicted'|'fertile'|'ovulation'|'pms'|null, dot: bool } */
export function MonthGrid({ month, onMonth, onPick, marks, selected, maxDate }) {
  const k = useScale();
  const today = todayKey();
  const cells = useMemo(() => {
    const first = new Date(month.y, month.m, 1, 12);
    const startKey = addDays(toKey(first), -first.getDay());
    return Array.from({ length: 42 }, (_, i) => addDays(startKey, i));
  }, [month]);
  const mm = String(month.m + 1).padStart(2, '0');
  const prefix = `${month.y}-${mm}`;
  const shift = (n) => {
    const d = new Date(month.y, month.m + n, 1);
    onMonth({ y: d.getFullYear(), m: d.getMonth() });
  };
  const rows = [0, 1, 2, 3, 4, 5].filter((r) => cells.slice(r * 7, r * 7 + 7).some((c) => c.startsWith(prefix)));

  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: row, alignItems: 'center' }}>
        <Pressable onPress={() => shift(-1)} hitSlop={10} style={g.nav} accessibilityLabel="الشهر اللي فات">
          <Ionicons name={row === 'row' ? 'chevron-back' : 'chevron-forward'} size={22} color={C.plum} />
        </Pressable>
        <T style={{ flex: 1, textAlign: 'center', fontWeight: '800', fontSize: 18 }}>
          {monthName(month.m)} {month.y}
        </T>
        <Pressable onPress={() => shift(1)} hitSlop={10} style={g.nav} accessibilityLabel="الشهر الجاي">
          <Ionicons name={row === 'row' ? 'chevron-forward' : 'chevron-back'} size={22} color={C.plum} />
        </Pressable>
      </View>
      <View style={{ flexDirection: row }}>
        {WEEK.map((w) => (
          <T key={w} style={{ flex: 1, textAlign: 'center', color: C.sub, fontSize: 13 }}>
            {w}
          </T>
        ))}
      </View>
      {rows.map((r) => (
        <View key={r} style={{ flexDirection: row }}>
          {cells.slice(r * 7, r * 7 + 7).map((key) => {
            const inMonth = key.startsWith(prefix);
            const mk = marks ? marks(key) : {};
            const disabled = maxDate && key > maxDate;
            const sel = selected === key;
            const bg =
              mk.kind === 'period' ? C.period :
              mk.kind === 'predicted' ? C.periodSoft :
              mk.kind === 'ovulation' ? C.fertile :
              mk.kind === 'fertile' ? C.fertileSoft :
              mk.kind === 'pms' ? C.pmsSoft : 'transparent';
            const fg = mk.kind === 'period' || mk.kind === 'ovulation' ? '#fff' : C.ink;
            return (
              <Pressable
                key={key}
                disabled={!inMonth || disabled}
                onPress={() => onPick && onPick(key)}
                style={g.cellWrap}
              >
                <View
                  style={[
                    g.cell,
                    { backgroundColor: inMonth ? bg : 'transparent', width: 38 * Math.min(k, 1.15), height: 38 * Math.min(k, 1.15) },
                    mk.kind === 'predicted' && { borderWidth: 1.5, borderColor: C.period, borderStyle: 'dashed' },
                    key === today && { borderWidth: 2, borderColor: C.plum },
                    sel && { borderWidth: 3, borderColor: C.ink },
                  ]}
                >
                  <T style={{ textAlign: 'center', color: inMonth ? (disabled ? C.line : fg) : 'transparent', fontSize: 15, fontWeight: key === today ? '800' : '500' }}>
                    {Number(key.slice(8))}
                  </T>
                </View>
                {mk.dot && inMonth ? <View style={g.dot} /> : <View style={{ height: 5 }} />}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export function Legend({ items }) {
  return (
    <View style={{ flexDirection: row, flexWrap: 'wrap', gap: 12 }}>
      {items.map(([color, label, dashed]) => (
        <View key={label} style={{ flexDirection: row, alignItems: 'center', gap: 6 }}>
          <View style={[{ width: 14, height: 14, borderRadius: 7, backgroundColor: color }, dashed && { borderWidth: 1.5, borderColor: C.period, borderStyle: 'dashed' }]} />
          <T style={{ fontSize: 13, color: C.sub }}>{label}</T>
        </View>
      ))}
    </View>
  );
}

const g = StyleSheet.create({
  nav: { padding: 6, backgroundColor: C.plumSoft, borderRadius: 10 },
  cellWrap: { flex: 1, alignItems: 'center', paddingVertical: 2 },
  cell: { borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.calm, marginTop: 1 },
});

// ———————————————— رسمة التمرين المتحركة ————————————————
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const JOINTS = ['head', 'neck', 'hip', 'le', 'lh', 're', 'rh', 'lk', 'lf', 'rk', 'rf'];

function blend(A, B, t) {
  const out = {};
  for (const j of JOINTS) out[j] = lerp(A[j], B[j], t);
  const sa = A.spine || lerp(A.neck, A.hip, 0.5);
  const sb = B.spine || lerp(B.neck, B.hip, 0.5);
  out.spine = lerp(sa, sb, t);
  return out;
}

/** frames: [poseA, poseB]  |  speed: مدة الحركة بالمللي ثانية  |  pregnant: يرسم بطن حامل */
export function Figure({ frames, speed = 1200, size = 180, playing = true, pregnant = false, color = C.plum, kegel = false }) {
  const [t, setT] = useState(0);
  const start = useRef(Date.now());
  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => {
      const el = (Date.now() - start.current) / speed;
      setT((1 - Math.cos(el * Math.PI)) / 2); // ذهاب وعودة بنعومة
    }, 50);
    return () => clearInterval(id);
  }, [playing, speed]);

  const A = POSES[frames[0]] || POSES.stand;
  const B = POSES[frames[1]] || A;
  const p = blend(A, B, t);
  const L = (a, b, w = 4.2, c = color) => <Line x1={p[a][0]} y1={p[a][1]} x2={p[b][0]} y2={p[b][1]} stroke={c} strokeWidth={w} strokeLinecap="round" />;
  const far = '#B89AB0';
  const belly = lerp(p.neck, p.hip, 0.62);
  // اتجاه البطن: عمودي على خط الضهر، ناحية «قدام» الجسم
  const dx = p.hip[0] - p.neck[0];
  const dy = p.hip[1] - p.neck[1];
  const len = Math.hypot(dx, dy) || 1;
  let nx = -dy / len;
  let ny = dx / len;
  if (Math.abs(dx) < 6) {
    nx = 0.9; ny = 0; // واقفة من قدام: نعرضها كأنها من الجنب شوية
  } else if (ny < 0) {
    nx = -nx; ny = -ny; // البطن لتحت في الوضعيات الأفقية
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Line x1="4" y1="91" x2="96" y2="91" stroke={C.line} strokeWidth="1.5" />
      {/* الأطراف البعيدة بلون أفتح */}
      {L('neck', 'le', 4, far)}
      {L('le', 'lh', 4, far)}
      {L('hip', 'lk', 4.4, far)}
      {L('lk', 'lf', 4.4, far)}
      <Path d={`M${p.neck[0]},${p.neck[1]} Q${p.spine[0]},${p.spine[1]} ${p.hip[0]},${p.hip[1]}`} stroke={color} strokeWidth={5.5} fill="none" strokeLinecap="round" />
      {pregnant ? <Ellipse cx={belly[0] + nx * 5} cy={belly[1] + ny * 5} rx={7} ry={7} fill={C.babySoft} stroke={C.baby} strokeWidth={1.6} /> : null}
      {kegel ? <Circle cx={p.hip[0]} cy={p.hip[1]} r={3 + t * 4} fill="none" stroke={C.fertile} strokeWidth={1.4} opacity={1 - t * 0.6} /> : null}
      {L('hip', 'rk', 4.6)}
      {L('rk', 'rf', 4.6)}
      {L('neck', 're')}
      {L('re', 'rh')}
      <Circle cx={p.head[0]} cy={p.head[1]} r={6.2} fill={color} />
    </Svg>
  );
}
