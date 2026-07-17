import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors, fonts, radii } from '@/constants/theme';
import { COURSES } from '@/constants/courses';
import { MOCK } from '@/lib/mock-data';
import { SafeScreen } from '@/components/SafeScreen';
import { TopBar } from '@/components/TopBar';

export default function AdminConsole() {
  const [view, setView] = useState<'post-event' | 'manage-hub'>('post-event');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [course, setCourse] = useState('');
  const [posted, setPosted] = useState<Array<{ title: string; date: string; course: string }>>([]);

  const handlePostEvent = () => {
    if (!title || !date) return;
    setPosted(prev => [{ title, date, course: course || 'All courses' }, ...prev]);
    setTitle(''); setDate(''); setLocation(''); setCourse('');
  };

  return (
    <SafeScreen
      bottomInset
      topBar={
        <TopBar
          title="Official console"
          backLabel="Hub"
          onBack={() => router.back()}
          breadcrumb="Hub / Console"
          right={<View style={styles.badge}><Text style={styles.badgeText}>admin</Text></View>}
        />
      }
    >
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, view === 'post-event' && styles.filterChipSelected]}
          onPress={() => setView('post-event')}
        >
          <Text style={[styles.filterText, view === 'post-event' && styles.filterTextSelected]}>Post an event</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, view === 'manage-hub' && styles.filterChipSelected]}
          onPress={() => setView('manage-hub')}
        >
          <Text style={[styles.filterText, view === 'manage-hub' && styles.filterTextSelected]}>Manage Info Hub</Text>
        </TouchableOpacity>
      </View>

      {view === 'post-event' && (
        <>
          <View style={styles.card}>
            <View style={styles.field}>
              <Text style={styles.label}>Event title</Text>
              <TextInput style={styles.input} placeholder="e.g. Inter-University Hackathon 2026" placeholderTextColor={colors.inkSoft + '88'} value={title} onChangeText={setTitle} />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Date</Text>
              <TextInput style={styles.input} placeholder="e.g. 22 Jul 2026" placeholderTextColor={colors.inkSoft + '88'} value={date} onChangeText={setDate} />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Location</Text>
              <TextInput style={styles.input} placeholder="e.g. Innovation Hub" placeholderTextColor={colors.inkSoft + '88'} value={location} onChangeText={setLocation} />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Target course</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipGrid}>
                {COURSES.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.chip, course === c.name && styles.chipSelected]}
                    onPress={() => setCourse(course === c.name ? '' : c.name)}
                  >
                    <Text style={[styles.chipText, course === c.name && styles.chipTextSelected]}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <TouchableOpacity style={styles.button} onPress={handlePostEvent}>
              <Text style={styles.buttonText}>Publish event</Text>
            </TouchableOpacity>
          </View>

          {posted.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Posted this session</Text>
              {posted.map((e, i) => (
                <View key={i} style={styles.postedCard}>
                  <View style={styles.postedRow}>
                    <Text style={styles.postedTitle}>{e.title}</Text>
                    <View style={styles.liveBadge}><Text style={styles.liveText}>Live</Text></View>
                  </View>
                  <Text style={styles.postedMeta}>{e.date} · targeting {e.course}</Text>
                </View>
              ))}
            </>
          )}
        </>
      )}

      {view === 'manage-hub' && (
        <>
          <View style={styles.card}>
            <Text style={styles.eyebrow}>School-wide documents</Text>
            <Text style={styles.cardSub}>These ground answers in the University Info Hub.</Text>
            <TouchableOpacity style={styles.uploadZone}>
              <Text style={styles.uploadIcon}>⬆</Text>
              <Text style={styles.uploadTitle}>Upload handbook, timetable or directory</Text>
              <Text style={styles.uploadSub}>PDF or image — Gemma indexes it for the whole school</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionTitle}>Currently indexed</Text>
          <View style={styles.card}>
            {MOCK.hubDocs.map((d, i) => (
              <View key={i} style={styles.docRow}>
                <Text style={styles.docIcon}>📄</Text>
                <View style={styles.docBody}>
                  <Text style={styles.docName}>{d.name}</Text>
                  <Text style={styles.docMeta}>{d.size} · added {d.added}</Text>
                </View>
                <View style={styles.indexedBadge}><Text style={styles.indexedText}>Indexed</Text></View>
              </View>
            ))}
          </View>
        </>
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1.5, borderColor: colors.paperLine, backgroundColor: colors.white },
  filterChipSelected: { backgroundColor: colors.chalk, borderColor: colors.chalk },
  filterText: { fontSize: 13, fontWeight: '500', color: colors.inkSoft },
  filterTextSelected: { color: colors.paperSoft, fontWeight: '600' },
  badge: { paddingVertical: 5, paddingHorizontal: 11, borderRadius: 999, backgroundColor: colors.indigoTint },
  badgeText: { fontFamily: fonts.mono, fontSize: 11, fontWeight: '700', color: colors.indigo, textTransform: 'uppercase' },
  card: { backgroundColor: colors.white, borderRadius: radii.md, padding: 16, borderWidth: 1, borderColor: colors.paperLine, marginBottom: 16 },
  eyebrow: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: colors.marigoldDark, fontWeight: '600' },
  cardSub: { fontSize: 13, color: colors.inkSoft, marginTop: 4 },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: colors.inkSoft, marginBottom: 6 },
  input: { padding: 12, borderRadius: 10, borderWidth: 1.5, borderColor: colors.paperLine, fontSize: 14, backgroundColor: colors.white },
  chipGrid: { flexDirection: 'row', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1.5, borderColor: colors.paperLine, backgroundColor: colors.white },
  chipSelected: { backgroundColor: colors.chalk, borderColor: colors.chalk },
  chipText: { fontSize: 12, fontWeight: '500', color: colors.inkSoft },
  chipTextSelected: { color: colors.paperSoft },
  button: { paddingVertical: 13, borderRadius: 999, backgroundColor: colors.marigold, alignItems: 'center' },
  buttonText: { fontSize: 15, fontWeight: '600', color: colors.chalkDark },
  sectionTitle: { fontFamily: fonts.display, fontSize: 16, fontWeight: '600', color: colors.chalkDark, marginBottom: 12, marginTop: 8 },
  postedCard: { backgroundColor: colors.white, borderRadius: radii.md, padding: 16, borderWidth: 1, borderColor: colors.paperLine, marginBottom: 8 },
  postedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  postedTitle: { fontWeight: '700', fontSize: 14 },
  liveBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, backgroundColor: colors.marigoldTint },
  liveText: { fontFamily: fonts.mono, fontSize: 10, fontWeight: '700', color: colors.marigoldDark, textTransform: 'uppercase' },
  postedMeta: { fontSize: 12, color: colors.inkSoft, marginTop: 4 },
  uploadZone: { marginTop: 16, padding: 26, borderRadius: 22, borderWidth: 2, borderColor: colors.paperLine, borderStyle: 'dashed', alignItems: 'center', backgroundColor: 'rgba(255,253,247,0.5)' },
  uploadIcon: { fontSize: 26, marginBottom: 8 },
  uploadTitle: { fontWeight: '600', fontSize: 14 },
  uploadSub: { fontSize: 12, color: colors.inkSoft, marginTop: 3 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.paperLine },
  docIcon: { fontSize: 20 },
  docBody: { flex: 1 },
  docName: { fontWeight: '600', fontSize: 14 },
  docMeta: { fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  indexedBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, backgroundColor: 'rgba(47,69,56,0.08)' },
  indexedText: { fontSize: 10, fontFamily: fonts.mono, fontWeight: '600', color: colors.chalkSoft },
});
