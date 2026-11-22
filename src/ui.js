import React, { createContext, useContext } from 'react';
import { I18nManager, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// الواجهة عربية. لو الجهاز مفعّل RTL، row بيبدأ من اليمين لوحده.
// لو مش مفعّل، بنعكس الاتجاه يدويًا.
export const RTL = I18nManager.isRTL;
export const row = RTL ? 'row' : 'row-reverse';
export const ta = RTL ? 'left' : 'right'; // في وضع RTL الـ left بيتقلب لـ start
export const backIcon = RTL ? 'chevron-back' : 'chevron-forward';
export const fwdIcon = RTL ? 'chevron-forward' : 'chevron-back';

// ألوان بناتي ناعمة: توتي ووردي وبنفسجي فاتح
export const C = {
  bg: '#FCF4F8',
  card: '#FFFFFF',
  ink: '#33202D',
  sub: '#7D6474',
  line: '#F1DCE7',
  plum: '#9B2F6B',
  plumDeep: '#7E2156',
  plumSoft: '#FBE5F0',
  grad: ['#B8407F', '#9A5CC6'],
  period: '#E04F7E',
  periodSoft: '#FDE4EC',
  fertile: '#3C9C8E',
  fertileSoft: '#DFF4EF',
  pms: '#D0843A',
  pmsSoft: '#FDEEDC',
  calm: '#8E6CCB',
  calmSoft: '#F0E8FB',
  baby: '#5A8ED6',
  babySoft: '#E5EFFC',
  danger: '#C73552',
  dangerSoft: '#FDE3E8',
};

// خط Cairo: بنختار الوزن المناسب لأن أندرويد ما بيعملش Bold للخطوط المخصصة لوحده
export const FONT = {
  400: 'Cairo_400Regular',
  500: 'Cairo_500Medium',
  600: 'Cairo_600SemiBold',
  700: 'Cairo_700Bold',
  800: 'Cairo_800ExtraBold',
};
export const fontFor = (w) => {
  const n = w === 'bold' ? 700 : parseInt(w || '400', 10);
  return FONT[n >= 800 ? 800 : n >= 700 ? 700 : n >= 600 ? 600 : n >= 500 ? 500 : 400];
};
export const FontsCtx = createContext(false);

export const tone = (name) =>
  ({
    period: [C.period, C.periodSoft],
    fertile: [C.fertile, C.fertileSoft],
    pms: [C.pms, C.pmsSoft],
    calm: [C.calm, C.calmSoft],
    plum: [C.plum, C.plumSoft],
    baby: [C.baby, C.babySoft],
    danger: [C.danger, C.dangerSoft],
  }[name] || [C.plum, C.plumSoft]);

// حجم الخط: المستخدمة بتختاره من الإعدادات وبيتطبق على كل النصوص
export const ScaleCtx = createContext(1);
export const useScale = () => useContext(ScaleCtx);

export function T({ style, children, ...rest }) {
  const k = useScale();
  const fonts = useContext(FontsCtx);
  const flat = StyleSheet.flatten([s.text, style]);
  const size = (flat.fontSize || 16) * k;
  // خط Cairo طويل شوية، فبنزود ارتفاع السطر عشان الحروف ما تتقصش
  const lh = (flat.lineHeight || (flat.fontSize || 16) * 1.55) * k;
  const fam = fonts ? { fontFamily: fontFor(flat.fontWeight), fontWeight: undefined } : null;
  return (
    <Text style={[flat, { fontSize: size, lineHeight: lh }, fam]} {...rest}>
      {children}
    </Text>
  );
}

export function H({ children, style }) {
  return <T style={[s.h, style]}>{children}</T>;
}

export function Sub({ children, style }) {
  return <T style={[{ color: C.sub, fontSize: 14, lineHeight: 21 }, style]}>{children}</T>;
}

export function Card({ children, style, color, onPress }) {
  const bg = color ? tone(color)[1] : C.card;
  const body = (
    <View style={[s.card, { backgroundColor: bg }, color && { borderColor: bg }, style]}>{children}</View>
  );
  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      {body}
    </Pressable>
  );
}

export function Btn({ title, onPress, kind = 'solid', color = 'plum', style, small, icon, disabled }) {
  const [fg, bg] = tone(color);
  const solid = kind === 'solid';
  const k = useScale();
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        s.btn,
        small && s.btnSmall,
        { backgroundColor: solid ? fg : bg, opacity: disabled ? 0.4 : pressed ? 0.8 : 1 },
        style,
      ]}
    >
      <View style={{ flexDirection: row, alignItems: 'center', gap: 6 }}>
        {icon ? <Ionicons name={icon} size={(small ? 16 : 19) * k} color={solid ? '#fff' : fg} /> : null}
        <T style={[s.btnText, small && { fontSize: 14 }, { color: solid ? '#fff' : fg }]}>{title}</T>
      </View>
    </Pressable>
  );
}

export function Chip({ label, active, onPress, color = 'plum' }) {
  const [fg, bg] = tone(color);
  return (
    <Pressable
      onPress={onPress}
      style={[s.chip, { borderColor: active ? fg : C.line, backgroundColor: active ? bg : C.card }]}
    >
      <T style={{ color: active ? fg : C.sub, fontSize: 14, fontWeight: active ? '700' : '400' }}>{label}</T>
    </Pressable>
  );
}

export function Row({ children, style }) {
  return <View style={[{ flexDirection: row, alignItems: 'center' }, style]}>{children}</View>;
}

export function Wrap({ children, style }) {
  return <View style={[{ flexDirection: row, flexWrap: 'wrap', gap: 8 }, style]}>{children}</View>;
}

export function Bullets({ items, color = C.plum }) {
  return (
    <View style={{ gap: 8 }}>
      {items.map((t, i) => (
        <View key={i} style={{ flexDirection: row, gap: 8, alignItems: 'flex-start' }}>
          <View style={[s.dot, { backgroundColor: color }]} />
          <T style={{ flex: 1, lineHeight: 25 }}>{t}</T>
        </View>
      ))}
    </View>
  );
}

// صف في قايمة: أيقونة + عنوان + وصف + سهم
export function ListItem({ icon, title, sub, onPress, color = 'plum', right }) {
  const [fg, bg] = tone(color);
  const k = useScale();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.item, { opacity: pressed ? 0.85 : 1 }]}>
      <View style={[s.itemIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={22 * k} color={fg} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <T style={{ fontWeight: '700' }}>{title}</T>
        {sub ? <Sub>{sub}</Sub> : null}
      </View>
      {right ?? (onPress ? <Ionicons name={fwdIcon} size={20} color={C.plum} /> : null)}
    </Pressable>
  );
}

export function Input(props) {
  const k = useScale();
  const fonts = useContext(FontsCtx);
  return (
    <TextInput
      placeholderTextColor={C.sub}
      {...props}
      style={[s.input, { fontSize: 16 * k }, fonts && { fontFamily: FONT[400] }, props.multiline && { minHeight: 80, textAlignVertical: 'top' }, props.style]}
    />
  );
}

// عداد + و - لاختيار رقم (ساعة، دقايق، ثواني...)
export function Stepper({ value, onChange, min = 0, max = 999, step = 1, format = (v) => String(v), label }) {
  return (
    <View style={{ gap: 4, alignItems: 'center' }}>
      {label ? <Sub>{label}</Sub> : null}
      <View style={{ flexDirection: row, alignItems: 'center', gap: 10 }}>
        <Pressable onPress={() => onChange(Math.max(min, value - step))} style={s.stepBtn} accessibilityLabel="أقل">
          <Ionicons name="remove" size={20} color={C.plum} />
        </Pressable>
        <T style={{ fontSize: 20, fontWeight: '800', minWidth: 54, textAlign: 'center' }}>{format(value)}</T>
        <Pressable onPress={() => onChange(Math.min(max, value + step))} style={s.stepBtn} accessibilityLabel="أكتر">
          <Ionicons name="add" size={20} color={C.plum} />
        </Pressable>
      </View>
    </View>
  );
}

export function Section({ title, children, style }) {
  return (
    <View style={[{ gap: 10 }, style]}>
      {title ? <T style={s.section}>{title}</T> : null}
      {children}
    </View>
  );
}

export function Accordion({ title, children, open, onToggle }) {
  return (
    <View style={s.acc}>
      <Pressable onPress={onToggle} style={{ flexDirection: row, alignItems: 'center', gap: 8, padding: 14 }}>
        <T style={{ flex: 1, fontWeight: '700', lineHeight: 24 }}>{title}</T>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={C.sub} />
      </Pressable>
      {open ? <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>{children}</View> : null}
    </View>
  );
}

export const pad2 = (n) => String(n).padStart(2, '0');
export const fmtTime = (h, m) => {
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${pad2(m)} ${h < 12 ? 'ص' : 'م'}`;
};
export const fmtSecs = (s) => `${Math.floor(s / 60)}:${pad2(s % 60)}`;

const s = StyleSheet.create({
  text: { color: C.ink, fontSize: 16, textAlign: ta, writingDirection: 'rtl' },
  h: { fontSize: 19, fontWeight: '800', marginBottom: 4 },
  section: { fontSize: 15, fontWeight: '800', color: C.sub, letterSpacing: 0.3 },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: C.line,
    gap: 8,
    shadowColor: '#9B2F6B',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  btn: { borderRadius: 999, paddingVertical: 13, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  btnSmall: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999 },
  btnText: { fontWeight: '700', fontSize: 16, textAlign: 'center' },
  chip: { borderWidth: 1.5, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 14 },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 10 },
  item: {
    flexDirection: row,
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.card,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: C.line,
    shadowColor: '#9B2F6B',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  itemIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  input: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    padding: 12,
    color: C.ink,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  stepBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.plumSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acc: { backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.line, elevation: 1, shadowColor: '#9B2F6B', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
});
