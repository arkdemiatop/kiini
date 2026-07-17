import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors, fonts, radii } from '@/constants/theme';
import { useAuthStore } from '@/lib/store';
import { MOCK } from '@/lib/mock-data';
import { SafeScreen } from '@/components/SafeScreen';

export default function Home() {
  const { profile } = useAuthStore();
  const [tasks, setTasks] = useState(MOCK.tasks);

  const firstName = profile?.name?.split(' ')[0] || 'Student';
  const course = profile?.course_id || '';
  const pendingCount = tasks.filter(t => !t.done).length;

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <SafeScreen scrollable>
      {/* Hero band */}
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.greeting}>Karibu, {firstName}</Text>
            <Text style={styles.course}>{course || 'Your dashboard'}</Text>
            <Text style={styles.sub}>{MOCK.university.name}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Today's timetable</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.timetableScroll}
        >
          {MOCK.timetableToday.map((t, i) => (
            <View key={i} style={styles.ttCard}>
              <Text style={styles.ttTime}>{t.time}</Text>
              <Text style={styles.ttUnit}>{t.unit}</Text>
              <Text style={styles.ttRoom}>{t.room}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.pagePad}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleDark}>
            Reminders <Text style={styles.muted}>({pendingCount} pending)</Text>
          </Text>
        </View>
        <View style={styles.card}>
          {tasks.map(t => (
            <View key={t.id} style={styles.taskRow}>
              <TouchableOpacity
                style={[styles.checkbox, t.done && styles.checkboxDone]}
                onPress={() => toggleTask(t.id)}
              >
                {t.done && <Text style={styles.checkMark}>✓</Text>}
              </TouchableOpacity>
              <View style={styles.taskBody}>
                <Text style={[styles.taskTitle, t.done && styles.taskDone]}>{t.title}</Text>
                <Text style={styles.taskUnit}>{t.unitCode}</Text>
                <Text style={styles.taskWhen}>{t.when}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleDark}>Your workspaces</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/units')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.quickGrid}>
          {MOCK.units.map(u => (
            <TouchableOpacity
              key={u.id}
              style={styles.quickCard}
              onPress={() => router.push(`/unit/${u.id}`)}
            >
              <View style={[styles.quickGlyph, { backgroundColor: u.color + '22' }]}>
                <Text style={[styles.quickGlyphText, { color: u.color }]}>
                  {u.code.split(' ')[0]}
                </Text>
              </View>
              <Text style={styles.quickCode}>{u.code}</Text>
              <Text style={styles.quickName}>{u.name}</Text>
              <Text style={styles.quickMeta}>
                {((MOCK.personalFiles as any)[u.id]?.length || 0)} files
                {u.hasRoom ? ' · room joined' : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  // Hero band
  hero: {
    backgroundColor: colors.chalk,
    padding: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  heroTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  greeting: { fontSize: 13, color: 'rgba(250,246,232,0.65)', marginBottom: 4 },
  course: { fontFamily: fonts.display, fontSize: 24, fontWeight: '700', color: colors.paperSoft },
  sub: { fontSize: 13, color: 'rgba(250,246,232,0.7)', marginTop: 4 },

  sectionTitle: { fontFamily: fonts.display, fontSize: 16, color: colors.paperSoft, fontWeight: '600', marginTop: 18, marginBottom: 8 },
  timetableScroll: { gap: 10, paddingBottom: 4 },
  ttCard: {
    width: 148, padding: 14, borderRadius: radii.md,
    backgroundColor: 'rgba(250,246,232,0.08)',
    borderWidth: 1, borderColor: 'rgba(250,246,232,0.18)',
  },
  ttTime: { fontFamily: fonts.mono, fontSize: 11, color: colors.marigold, fontWeight: '600' },
  ttUnit: { fontWeight: '700', fontSize: 15, color: colors.paperSoft, marginTop: 6 },
  ttRoom: { fontSize: 12, color: 'rgba(250,246,232,0.6)', marginTop: 3 },

  // Page content
  pagePad: { padding: 20 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
    marginTop: 22, marginBottom: 12,
  },
  sectionTitleDark: { fontFamily: fonts.display, fontSize: 17, fontWeight: '600', color: colors.chalkDark },
  muted: { fontSize: 13, color: colors.inkSoft },

  // Card
  card: {
    backgroundColor: colors.white, borderRadius: radii.md, padding: 16,
    borderWidth: 1, borderColor: colors.paperLine,
  },
  taskRow: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.paperLine,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 1.6, borderColor: colors.paperLine,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.white,
  },
  checkboxDone: { backgroundColor: colors.chalk, borderColor: colors.chalk },
  checkMark: { color: colors.marigold, fontSize: 12, fontWeight: '700' },
  taskBody: { flex: 1 },
  taskTitle: { fontSize: 14, fontWeight: '600' },
  taskDone: { textDecorationLine: 'line-through', opacity: 0.5 },
  taskUnit: { fontSize: 13, color: colors.inkSoft, marginTop: 2 },
  taskWhen: { fontFamily: fonts.mono, fontSize: 11, color: colors.inkSoft, opacity: 0.7, marginTop: 4 },

  // Quick grid
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickCard: {
    width: '47%', backgroundColor: colors.white, borderRadius: radii.md, padding: 15,
    borderWidth: 1, borderColor: colors.paperLine,
  },
  quickGlyph: {
    width: 34, height: 34, borderRadius: 9, justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  quickGlyphText: { fontFamily: fonts.mono, fontWeight: '700', fontSize: 13 },
  quickCode: { fontWeight: '700', fontSize: 15 },
  quickName: { fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  quickMeta: { fontSize: 11, color: colors.inkSoft, fontFamily: fonts.mono, marginTop: 10 },
  seeAll: { fontSize: 13, fontWeight: '600', color: colors.indigo },
});
