import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors, fonts } from '@/constants/theme';
import { SafeScreen } from '@/components/SafeScreen';
import { TopBar } from '@/components/TopBar';

export default function AdminSignIn() {
  const [email, setEmail] = useState('');

  const handleSendLink = () => {
    if (!email.trim()) return;
    router.replace('/admin/console');
  };

  return (
    <SafeScreen
      scrollable
      topBar={
        <TopBar
          title="Official sign-in"
          backLabel="Hub"
          onBack={() => router.back()}
          breadcrumb="Hub / Sign in"
        />
      }
    >
      <View style={styles.card}>
        <Text style={styles.eyebrow}>University Official</Text>
        <Text style={styles.cardTitle}>Sign in with a magic link</Text>
        <Text style={styles.cardSub}>
          The one place in Kiini that uses real authentication — students never need this.
        </Text>
        <View style={styles.field}>
          <Text style={styles.label}>Work email</Text>
          <TextInput
            style={styles.input}
            placeholder="j.mwangi@embu.ac.ke"
            placeholderTextColor={colors.inkSoft + '88'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleSendLink}>
          <Text style={styles.buttonText}>Send magic link</Text>
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.paperLine },
  eyebrow: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: colors.marigoldDark, fontWeight: '600' },
  cardTitle: { fontFamily: fonts.display, fontSize: 20, fontWeight: '600', color: colors.chalkDark, marginTop: 8, marginBottom: 8 },
  cardSub: { fontSize: 13, color: colors.inkSoft, lineHeight: 18 },
  field: { marginTop: 16, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: colors.inkSoft, marginBottom: 6 },
  input: { padding: 12, borderRadius: 10, borderWidth: 1.5, borderColor: colors.paperLine, fontSize: 14, backgroundColor: colors.white },
  button: { paddingVertical: 13, borderRadius: 999, backgroundColor: colors.chalk, alignItems: 'center' },
  buttonText: { fontSize: 15, fontWeight: '600', color: colors.paperSoft },
});
