import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { colors, fonts } from '@/constants/theme';
import { COURSES } from '@/constants/courses';
import { MOCK } from '@/lib/mock-data';
import { useAuthStore } from '@/lib/store';

export default function Profile() {
  const { studentProfile, setStudentProfile } = useAuthStore();
  const [name, setName] = useState(studentProfile?.name || '');
  const [courseId, setCourseId] = useState(studentProfile?.courseId || '');
  const [year, setYear] = useState(studentProfile?.year || '');

  const canContinue = name.trim().length > 0 && courseId && year;

  const handleContinue = () => {
    if (!canContinue) return;
    setStudentProfile({ name: name.trim(), courseId, year, unitCodes: [] });
    router.push('/onboarding/units');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.progress}>
          {[0, 1, 2].map(i => (
            <View key={i} style={[styles.progressDot, i <= 0 && styles.progressDone]} />
          ))}
        </View>

        <Text style={styles.eyebrow}>Step 1 of 3</Text>
        <Text style={styles.title}>Tell us who you are</Text>
        <Text style={styles.lead}>Just enough to build your personal dashboard.</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Wanjiru Kamau"
            placeholderTextColor="rgba(250,246,232,0.4)"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Course / programme</Text>
          <View style={styles.chipGrid}>
            {COURSES.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[styles.chip, courseId === c.id && styles.chipSelected]}
                onPress={() => setCourseId(c.id)}
              >
                <Text style={[styles.chipText, courseId === c.id && styles.chipTextSelected]}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Year of study</Text>
          <View style={styles.chipGrid}>
            {MOCK.years.map(y => (
              <TouchableOpacity
                key={y}
                style={[styles.chip, year === y && styles.chipSelected]}
                onPress={() => setYear(y)}
              >
                <Text style={[styles.chipText, year === y && styles.chipTextSelected]}>{y}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, !canContinue && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={!canContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.chalk },
  scroll: { padding: 24, paddingBottom: 40 },
  progress: { flexDirection: 'row', gap: 6, marginBottom: 28 },
  progressDot: { flex: 1, height: 4, borderRadius: 4, backgroundColor: 'rgba(250,246,232,0.18)' },
  progressDone: { backgroundColor: colors.marigold },
  eyebrow: {
    fontFamily: fonts.mono, fontSize: 12, letterSpacing: 1.3,
    textTransform: 'uppercase', color: colors.marigold, marginBottom: 10,
  },
  title: {
    fontFamily: fonts.display, fontSize: 27, lineHeight: 34,
    color: colors.paperSoft, fontWeight: '700', marginBottom: 8,
  },
  lead: { fontSize: 15, lineHeight: 22, color: 'rgba(250,246,232,0.72)', marginBottom: 26 },
  field: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: 'rgba(250,246,232,0.72)', marginBottom: 7 },
  input: {
    width: '100%', padding: 13, borderRadius: 8,
    borderWidth: 1.5, borderColor: 'rgba(250,246,232,0.25)',
    backgroundColor: 'rgba(250,246,232,0.06)', color: colors.paperSoft,
    fontSize: 16,
  },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 9, paddingHorizontal: 15, borderRadius: 999,
    borderWidth: 1.5, borderColor: 'rgba(250,246,232,0.25)',
    backgroundColor: 'rgba(250,246,232,0.05)',
  },
  chipSelected: { backgroundColor: colors.marigold, borderColor: colors.marigold },
  chipText: { fontSize: 14, fontWeight: '500', color: colors.paperSoft },
  chipTextSelected: { color: colors.chalkDark, fontWeight: '700' },
  footer: { padding: 24, paddingBottom: 32 },
  footerRow: { flexDirection: 'row', gap: 10 },
  backButton: {
    paddingVertical: 13, paddingHorizontal: 20, borderRadius: 999,
    borderWidth: 1.5, borderColor: 'rgba(250,246,232,0.35)',
  },
  backText: { fontSize: 15, fontWeight: '600', color: colors.paperSoft },
  button: {
    flex: 1, paddingVertical: 13, borderRadius: 999,
    backgroundColor: colors.marigold, alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { fontSize: 15, fontWeight: '600', color: colors.chalkDark },
});
