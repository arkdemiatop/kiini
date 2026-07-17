import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors, fonts } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/lib/store';

export default function Room() {
  const [code, setCode] = useState('');
  const { studentProfile } = useAuthStore();
  const { completeOnboarding } = useAuth();

  const handleFinish = async (skip: boolean) => {
    if (!studentProfile) return;
    await completeOnboarding({
      name: studentProfile.name,
      courseId: studentProfile.courseId,
      year: studentProfile.year,
      unitCodes: studentProfile.unitCodes,
    });
    if (!skip && code.trim()) {
      // TODO: call join_room_by_code() RPC
    }
    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.progress}>
          {[0, 1, 2].map(i => (
            <View key={i} style={[styles.progressDot, i <= 2 && styles.progressDone]} />
          ))}
        </View>

        <Text style={styles.eyebrow}>Step 3 of 3</Text>
        <Text style={styles.title}>Join a unit room</Text>
        <Text style={styles.lead}>
          Optional — paste a room code from a classmate, or skip and join later from any unit.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Room code</Text>
          <TextInput
            style={[styles.input, styles.mono]}
            placeholder="e.g. CIT301-9F2K"
            placeholderTextColor="rgba(250,246,232,0.4)"
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => handleFinish(true)}
          >
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleFinish(false)}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Join &amp; finish</Text>
        </TouchableOpacity>
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
  field: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: 'rgba(250,246,232,0.72)', marginBottom: 7 },
  input: {
    width: '100%', padding: 13, borderRadius: 8,
    borderWidth: 1.5, borderColor: 'rgba(250,246,232,0.25)',
    backgroundColor: 'rgba(250,246,232,0.06)', color: colors.paperSoft, fontSize: 16,
  },
  mono: { fontFamily: fonts.mono, letterSpacing: 0.5 },
  footer: { padding: 24, paddingBottom: 32, gap: 10 },
  footerRow: { flexDirection: 'row', gap: 10 },
  backButton: { flex: 1, paddingVertical: 13, borderRadius: 999, alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(250,246,232,0.35)' },
  backText: { fontSize: 15, fontWeight: '600', color: colors.paperSoft },
  skipButton: {
    paddingVertical: 13, borderRadius: 999, alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(250,246,232,0.35)',
  },
  skipText: { fontSize: 15, fontWeight: '600', color: colors.paperSoft },
  button: {
    paddingVertical: 13, borderRadius: 999,
    backgroundColor: colors.marigold, alignItems: 'center',
  },
  buttonText: { fontSize: 15, fontWeight: '600', color: colors.chalkDark },
});
