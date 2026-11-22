import React, { createContext, useContext } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { C, T, backIcon, row } from './ui';

export const NavCtx = createContext(null);
export const useNav = () => useContext(NavCtx);

// غلاف كل شاشة: عنوان + زر رجوع + محتوى قابل للتمرير
export function Screen({ title, children, right, scroll = true, back = true, pad = true }) {
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const canBack = back && nav.depth > 1;
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <LinearGradient colors={C.grad} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={[st.header, { paddingTop: insets.top + 10 }]}>
        <View style={{ flexDirection: row, alignItems: 'center', gap: 6 }}>
          {canBack ? (
            <Pressable onPress={nav.back} hitSlop={12} accessibilityLabel="رجوع" style={st.back}>
              <Ionicons name={backIcon} size={24} color="#fff" />
            </Pressable>
          ) : null}
          <T style={st.title} numberOfLines={1}>
            {title}
          </T>
          {right}
        </View>
      </LinearGradient>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[pad && { padding: 16 }, { gap: 14, paddingBottom: 40 }]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, pad && { padding: 16 }]}>{children}</View>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  title: { fontSize: 21, fontWeight: '800', flex: 1, color: '#fff' },
  back: { padding: 4, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 999 },
});
