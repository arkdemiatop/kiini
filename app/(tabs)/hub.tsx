import { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { colors, fonts, radii } from '@/constants/theme';
import { MOCK } from '@/lib/mock-data';
import { SafeScreen } from '@/components/SafeScreen';

interface HubAnswer { text: string; sources: string[] | null; }

function matchAnswer(text: string): HubAnswer {
  const t = text.toLowerCase();
  for (const entry of MOCK.hubAnswers) {
    if (entry.match.some(k => t.includes(k))) return { text: entry.answer, sources: entry.sources };
  }
  return { text: MOCK.hubDefaultAnswer, sources: null };
}

export default function Hub() {
  const [messages, setMessages] = useState<Array<{ from: string; text: string; sources?: string[] | null }>>([]);
  const [input, setInput] = useState('');

  const sendQuery = (text: string) => {
    const q = text.trim();
    if (!q) return;
    setMessages(prev => [...prev, { from: 'me', text: q }]);
    setInput('');
    setTimeout(() => {
      const result = matchAnswer(q);
      setMessages(prev => [...prev, { from: 'Gemma', ...result }]);
    }, 900);
  };

  return (
    <SafeScreen scrollable>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>University Info Hub</Text>
        <Text style={styles.heroSub}>
          Ask about offices, deadlines, hours — grounded only in official {MOCK.university.shortName} documents.
        </Text>
      </View>

      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Ask the University Info Hub…"
          placeholderTextColor={colors.inkSoft + '99'}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => sendQuery(input)}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={() => sendQuery(input)}>
          <Text style={styles.searchBtnText}>➤</Text>
        </TouchableOpacity>
      </View>

      {messages.length > 0 ? (
        <View style={styles.chatContent}>
          {messages.map((m, i) => {
            if (m.from === 'me') {
              return <View key={i} style={styles.myMsg}><View style={styles.myBubble}><Text style={styles.myText}>{m.text}</Text></View></View>;
            }
            return (
              <View key={i} style={styles.gemmaMsg}>
                <View style={[styles.av, { backgroundColor: colors.marigoldDark }]}>
                  <Text style={styles.avText}>G</Text>
                </View>
                <View style={styles.gemmaBubble}>
                  <Text style={styles.gemmaWho}>✓ Gemma · University Info Hub</Text>
                  <Text style={styles.gemmaText}>{m.text}</Text>
                  {m.sources && m.sources.length > 0 && (
                    <View style={styles.sources}>
                      {m.sources.map((s, j) => (
                        <View key={j} style={styles.sourceChip}>
                          <Text style={styles.sourceText}>📄 {s}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.suggestions}>
          <Text style={styles.suggestLabel}>Try asking</Text>
          <View style={styles.suggestGrid}>
            {MOCK.hubSuggestions.map((q, i) => (
              <TouchableOpacity key={i} style={styles.suggestChip} onPress={() => sendQuery(q)}>
                <Text style={styles.suggestText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>School-wide documents</Text>
          <View style={styles.card}>
            {MOCK.hubDocs.map((d, i) => (
              <View key={i} style={styles.docRow}>
                <Text style={styles.docIcon}>📄</Text>
                <View style={styles.docBody}>
                  <Text style={styles.docName}>{d.name}</Text>
                  <Text style={styles.docMeta}>{d.size} · added {d.added}</Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.adminLink} onPress={() => router.push('/admin/sign-in')}>
            <Text style={styles.adminLinkText}>I'm a university official →</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.chalk, padding: 30, paddingBottom: 26, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 },
  heroTitle: { fontFamily: fonts.display, fontSize: 22, fontWeight: '600', color: colors.paperSoft, textAlign: 'center' },
  heroSub: { color: 'rgba(250,246,232,0.68)', fontSize: 13, textAlign: 'center', marginTop: 6 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, marginTop: -22, padding: 13, borderRadius: 999, backgroundColor: colors.white, boxShadow: '0 10px 30px -8px rgba(27,42,31,0.35)', elevation: 10 },
  searchIcon: { fontSize: 18 },
  searchInput: { flex: 1, fontSize: 14 },
  searchBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.chalk, justifyContent: 'center', alignItems: 'center' },
  searchBtnText: { color: colors.paperSoft, fontSize: 16 },
  chatContent: { padding: 16, gap: 12 },
  myMsg: { alignItems: 'flex-end', maxWidth: '86%', alignSelf: 'flex-end' },
  myBubble: { backgroundColor: colors.chalk, borderRadius: 14, borderBottomRightRadius: 4, padding: 10 },
  myText: { color: colors.paperSoft, fontSize: 14, lineHeight: 20 },
  gemmaMsg: { flexDirection: 'row', gap: 9, maxWidth: '100%' },
  av: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  avText: { fontSize: 11, fontWeight: '700', color: colors.white, fontFamily: fonts.mono },
  gemmaBubble: { backgroundColor: colors.marigoldTint, borderRadius: 14, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.marigoldDark, padding: 10, flex: 1 },
  gemmaWho: { fontSize: 11, fontWeight: '700', color: colors.marigoldDark, marginBottom: 3, flexDirection: 'row', alignItems: 'center', gap: 5 },
  gemmaText: { fontSize: 14, lineHeight: 20 },
  sources: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 9 },
  sourceChip: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 999, backgroundColor: colors.indigoTint },
  sourceText: { fontSize: 11, fontWeight: '600', color: colors.indigo },
  suggestions: { padding: 20 },
  suggestLabel: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: colors.marigoldDark, fontWeight: '600' },
  suggestGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  suggestChip: { paddingVertical: 9, paddingHorizontal: 15, borderRadius: 999, borderWidth: 1.5, borderColor: colors.paperLine, backgroundColor: colors.white },
  suggestText: { fontSize: 13, fontWeight: '500', color: colors.inkSoft },
  sectionTitle: { fontFamily: fonts.display, fontSize: 17, fontWeight: '600', color: colors.chalkDark, marginTop: 24, marginBottom: 12 },
  card: { backgroundColor: colors.white, borderRadius: radii.md, borderWidth: 1, borderColor: colors.paperLine },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  docIcon: { fontSize: 20 },
  docBody: { flex: 1 },
  docName: { fontWeight: '600', fontSize: 14 },
  docMeta: { fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  adminLink: { alignItems: 'center', marginTop: 24 },
  adminLinkText: { fontSize: 14, fontWeight: '600', color: colors.indigo },
});
