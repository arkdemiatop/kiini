import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts, radii } from '@/constants/theme';
import { MOCK } from '@/lib/mock-data';
import { useAuthStore } from '@/lib/store';
import { SafeScreen } from '@/components/SafeScreen';

function PageHeader({ title }: { title: string }) {
  return (
    <View style={styles.header}>
      <View style={styles.wordmark}>
        <View style={styles.mark}><Text style={styles.markText}>K</Text></View>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
    </View>
  );
}

export default function Events() {
  const { profile } = useAuthStore();
  const [events, setEvents] = useState(MOCK.events);
  const [filter, setFilter] = useState<'mine' | 'all'>('mine');

  const course = profile?.course_id || '';
  const filtered = filter === 'mine'
    ? events.filter(e => e.courses.includes('All courses') || e.courses.includes(course))
    : events;

  const toggleSave = (id: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, saved: !e.saved } : e));
  };

  return (
    <SafeScreen scrollable>
      <PageHeader title="Events" />
      <View style={styles.pagePad}>
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'mine' && styles.filterChipSelected]}
          onPress={() => setFilter('mine')}
        >
          <Text style={[styles.filterText, filter === 'mine' && styles.filterTextSelected]}>
            For {course ? course.split(' ').slice(0, 2).join(' ') : 'you'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'all' && styles.filterChipSelected]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextSelected]}>All campus events</Text>
        </TouchableOpacity>
      </View>

      {filtered.map(e => (
        <View key={e.id} style={styles.eventCard}>
          <View style={styles.eventDate}>
            <Text style={styles.eventDay}>{e.date.d}</Text>
            <Text style={styles.eventMonth}>{e.date.m}</Text>
          </View>
          <View style={styles.eventBody}>
            <Text style={styles.eventTitle}>{e.title}</Text>
            <Text style={styles.eventLoc}>{e.location}</Text>
            <View style={styles.eventTags}>
              {e.courses.map(c => <View key={c} style={styles.tag}><Text style={styles.tagText}>{c}</Text></View>)}
            </View>
          </View>
          <TouchableOpacity style={[styles.saveBtn, e.saved && styles.saveBtnSaved]} onPress={() => toggleSave(e.id)}>
            <Text style={[styles.saveIcon, e.saved && styles.saveIconSaved]}>🔖</Text>
          </TouchableOpacity>
        </View>
      ))}

      {filtered.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🎉</Text>
          <Text style={styles.emptyTitle}>No events right now</Text>
          <Text style={styles.emptyText}>Check back soon, or view all campus events.</Text>
        </View>
      )}
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.paperLine,
    marginBottom: 16,
  },
  wordmark: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.chalk, borderWidth: 2, borderColor: colors.marigold,
    borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center',
  },
  markText: { fontFamily: fonts.display, fontWeight: '700', fontSize: 17, color: colors.marigold },
  headerTitle: { fontFamily: fonts.display, fontSize: 18, fontWeight: '600', color: colors.chalkDark },
  pagePad: { paddingHorizontal: 20 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  filterChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1.5, borderColor: colors.paperLine, backgroundColor: colors.white },
  filterChipSelected: { backgroundColor: colors.chalk, borderColor: colors.chalk },
  filterText: { fontSize: 13, fontWeight: '500', color: colors.inkSoft },
  filterTextSelected: { color: colors.paperSoft, fontWeight: '600' },
  eventCard: { flexDirection: 'row', gap: 14, marginBottom: 12, backgroundColor: colors.white, borderRadius: radii.md, padding: 16, borderWidth: 1, borderColor: colors.paperLine },
  eventDate: { width: 54, height: 58, borderRadius: 12, backgroundColor: colors.chalk, justifyContent: 'center', alignItems: 'center' },
  eventDay: { fontFamily: fonts.mono, fontSize: 18, fontWeight: '700', color: colors.paperSoft, lineHeight: 20 },
  eventMonth: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, color: colors.marigold, marginTop: 3 },
  eventBody: { flex: 1 },
  eventTitle: { fontWeight: '700', fontSize: 15 },
  eventLoc: { fontSize: 13, color: colors.inkSoft, marginTop: 3 },
  eventTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1.5, borderColor: colors.paperLine, backgroundColor: colors.white },
  tagText: { fontSize: 11, fontWeight: '500', color: colors.inkSoft },
  saveBtn: { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: colors.paperLine, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white },
  saveBtnSaved: { backgroundColor: colors.brickTint, borderColor: colors.brick },
  saveIcon: { fontSize: 14, opacity: 0.5 },
  saveIconSaved: { opacity: 1 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyTitle: { fontFamily: fonts.display, fontSize: 18, fontWeight: '600', color: colors.chalkDark, marginBottom: 6 },
  emptyText: { fontSize: 14, color: colors.inkSoft, textAlign: 'center', opacity: 0.75 },
});
