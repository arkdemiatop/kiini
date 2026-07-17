import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors, fonts } from '@/constants/theme';
import { MOCK } from '@/lib/mock-data';
import { useAuthStore } from '@/lib/store';

export default function Units() {
  const { studentProfile, updateUnitCodes } = useAuthStore();
  const codes = studentProfile?.unitCodes || [];

  const toggleCode = (code: string) => {
    const next = codes.includes(code)
      ? codes.filter(c => c !== code)
      : [...codes, code];
    updateUnitCodes(next);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.progress}>
          {[0, 1, 2].map(i => (
            <View key={i} style={[styles.progressDot, i <= 1 && styles.progressDone]} />
          ))}
        </View>

        <Text style={styles.eyebrow}>Step 2 of 3</Text>
        <Text style={styles.title}>Add your units</Text>
        <Text style={styles.lead}>
          Each unit becomes its own organized workspace. You can add more any time.
        </Text>

        <View style={styles.chipGrid}>
          {MOCK.catalogUnits.map(u => {
            const selected = codes.includes(u.code);
            return (
              <TouchableOpacity
                key={u.code}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => toggleCode(u.code)}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {u.code} — {u.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/onboarding/room')}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
  buttonText: { fontSize: 15, fontWeight: '600', color: colors.chalkDark },
});
