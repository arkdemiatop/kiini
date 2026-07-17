import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors, fonts } from '@/constants/theme';

export default function Welcome() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.top}>
        <View style={styles.wordmark}>
          <View style={styles.mark}><Text style={styles.markText}>K</Text></View>
          <Text style={styles.wordmarkName}>Kiini</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.eyebrow}>Embu University</Text>
        <Text style={styles.title}>One school.{'\n'}One brain.{'\n'}Every student.</Text>
        <Text style={styles.lead}>
          Kiini turns your unit PDFs, timetables and group chats into one shared, organized
          workspace — no accounts, no passwords, just your name and your units.
        </Text>
        <View style={styles.stamp}>
          <Text style={styles.stampIcon}>✓</Text>
          <Text style={styles.stampText}>Powered by Gemma 4</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/onboarding/profile')}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Get started</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.chalk },
  scroll: { flexGrow: 1 },
  top: {
    padding: 40,
    paddingBottom: 10,
  },
  wordmark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mark: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.chalk,
    borderWidth: 2,
    borderColor: colors.marigold,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markText: {
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 17,
    color: colors.marigold,
  },
  wordmarkName: {
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 18,
    color: colors.paperSoft,
  },
  body: {
    flex: 1,
    padding: 24,
    paddingTop: 28,
  },
  eyebrow: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: colors.marigold,
    marginBottom: 10,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 27,
    lineHeight: 34,
    color: colors.paperSoft,
    fontWeight: '700',
    marginBottom: 8,
  },
  lead: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(250, 246, 232, 0.72)',
    marginBottom: 26,
  },
  stamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1.6,
    borderColor: colors.marigoldDark,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(232, 163, 61, 0.09)',
    transform: [{ rotate: '-2deg' }],
  },
  stampIcon: {
    color: colors.marigoldDark,
    fontSize: 14,
    fontWeight: '700',
  },
  stampText: {
    fontFamily: fonts.mono,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.marigoldDark,
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
  },
  button: {
    backgroundColor: colors.marigold,
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 999,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.chalkDark,
  },
});
