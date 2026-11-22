import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, BackHandler, Platform, Pressable, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Cairo_400Regular, Cairo_500Medium, Cairo_600SemiBold, Cairo_700Bold, Cairo_800ExtraBold } from '@expo-google-fonts/cairo';

import { C, FontsCtx, ScaleCtx, T, row } from './src/ui';
import { DataCtx, useData } from './src/store';
import { NavCtx } from './src/nav';

import Home from './src/screens/Home';
import { CycleScreen, PurityScreen } from './src/screens/Cycle';
import { PregnancyScreen, CheckScreen, PostpartumScreen, PregExtraScreen } from './src/screens/Pregnancy';
import { FitnessScreen, RoutineScreen, PlayerScreen, ExerciseScreen } from './src/screens/Fitness';
import {
  MoreScreen, FiqhScreen, FiqhTopicScreen, SeerahScreen, SeerahGroupScreen, WomanScreen, StatusScreen,
  ParentingScreen, StageScreen, BirrScreen, InheritanceScreen, LifeScreen, LifeStageScreen, LibraryScreen,
  CalmScreen, HealthScreen,
} from './src/screens/Knowledge';
import SettingsScreen from './src/screens/Settings';

const ROUTES = {
  home: Home,
  cycle: CycleScreen,
  purity: PurityScreen,
  preg: PregnancyScreen,
  check: CheckScreen,
  postpartum: PostpartumScreen,
  pregExtra: PregExtraScreen,
  fitness: FitnessScreen,
  routine: RoutineScreen,
  player: PlayerScreen,
  exercise: ExerciseScreen,
  more: MoreScreen,
  fiqh: FiqhScreen,
  fiqhTopic: FiqhTopicScreen,
  seerah: SeerahScreen,
  seerahGroup: SeerahGroupScreen,
  woman: WomanScreen,
  status: StatusScreen,
  parenting: ParentingScreen,
  stage: StageScreen,
  birr: BirrScreen,
  inheritance: InheritanceScreen,
  life: LifeScreen,
  lifeStage: LifeStageScreen,
  library: LibraryScreen,
  calm: CalmScreen,
  health: HealthScreen,
  settings: SettingsScreen,
};

const TABS = [
  { key: 'home', label: 'الرئيسية', icon: 'home' },
  { key: 'cycle', label: 'دورتي', icon: 'water' },
  { key: 'preg', label: 'حملي', icon: 'heart-circle' },
  { key: 'fitness', label: 'تمارين', icon: 'barbell' },
  { key: 'more', label: 'المكتبة', icon: 'library' },
];

function Shell() {
  const store = useData();
  const [fontsLoaded, fontError] = useFonts({ Cairo_400Regular, Cairo_500Medium, Cairo_600SemiBold, Cairo_700Bold, Cairo_800ExtraBold });
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('home');
  const [stacks, setStacks] = useState(() => Object.fromEntries(TABS.map((t) => [t.key, [{ name: t.key, params: {} }]])));

  const stack = stacks[tab];
  const top = stack[stack.length - 1];

  const push = useCallback((name, params = {}) => {
    setStacks((s) => ({ ...s, [tab]: [...s[tab], { name, params }] }));
  }, [tab]);
  const back = useCallback(() => {
    setStacks((s) => (s[tab].length > 1 ? { ...s, [tab]: s[tab].slice(0, -1) } : s));
  }, [tab]);
  const go = useCallback((tabKey, name, params = {}) => {
    setTab(tabKey);
    setStacks((s) => ({ ...s, [tabKey]: name && name !== tabKey ? [{ name: tabKey, params: {} }, { name, params }] : [{ name: tabKey, params: {} }] }));
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stacks[tab].length > 1) {
        back();
        return true;
      }
      if (tab !== 'home') {
        setTab('home');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [stacks, tab, back]);

  // لما تضغطي على إشعار، يفتح القسم المناسب
  useEffect(() => {
    if (Platform.OS === 'web') return undefined;
    const open = (kind) => {
      if (kind === 'seerah') go('more', 'seerah');
      else if (kind === 'preg') go('preg');
      else if (kind === 'workout') go('fitness');
      else if (kind === 'cycle' || kind === 'journal') go('cycle');
    };
    Notifications.getLastNotificationResponseAsync()
      .then((r) => r && open(r.notification.request.content.data?.kind))
      .catch(() => {});
    const sub = Notifications.addNotificationResponseReceivedListener((r) => open(r.notification.request.content.data?.kind));
    return () => sub.remove();
  }, [go]);

  const nav = useMemo(() => ({ push, back, go, depth: stack.length, tab }), [push, back, go, stack.length, tab]);

  if (!store.data || (!fontsLoaded && !fontError)) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg }}>
        <ActivityIndicator color={C.plum} size="large" />
      </View>
    );
  }

  const Comp = ROUTES[top.name] || Home;

  return (
    <FontsCtx.Provider value={!!fontsLoaded}>
    <ScaleCtx.Provider value={store.data.settings.fontScale || 1}>
      <DataCtx.Provider value={store}>
        <NavCtx.Provider value={nav}>
          <View style={{ flex: 1, backgroundColor: C.bg }}>
            <View style={{ flex: 1 }}>
              <Comp key={`${tab}-${stack.length}-${top.name}`} {...top.params} />
            </View>
            <LinearGradient colors={[C.plum, C.plumDeep]} style={[s.tabs, { paddingBottom: Math.max(insets.bottom, 8) }]}>
              {TABS.map((t) => {
                const active = t.key === tab;
                return (
                  <Pressable
                    key={t.key}
                    style={s.tab}
                    onPress={() => (active ? go(t.key) : setTab(t.key))}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: active }}
                  >
                    <View style={[s.pill, active && s.pillOn]}>
                      <Ionicons name={active ? t.icon : `${t.icon}-outline`} size={23} color={active ? C.plum : '#F6D6E7'} />
                    </View>
                    <T style={{ fontSize: 11.5, color: active ? '#fff' : '#F6D6E7', fontWeight: active ? '800' : '500', textAlign: 'center' }}>{t.label}</T>
                  </Pressable>
                );
              })}
            </LinearGradient>
          </View>
        </NavCtx.Provider>
      </DataCtx.Provider>
    </ScaleCtx.Provider>
    </FontsCtx.Provider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Shell />
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  tabs: {
    flexDirection: row,
    paddingTop: 8,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  tab: { flex: 1, alignItems: 'center', gap: 1 },
  pill: { paddingHorizontal: 14, paddingVertical: 3, borderRadius: 999 },
  pillOn: { backgroundColor: '#fff' },
});
