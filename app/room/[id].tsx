import { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, fonts, radii } from '@/constants/theme';
import { MOCK } from '@/lib/mock-data';
import { toast } from '@/components/Toast';
import { SafeScreen } from '@/components/SafeScreen';
import { TopBar } from '@/components/TopBar';

type ChatMsg = { from: string; text: string; avatar?: string };

function matchReply(text: string): string {
  const t = text.toLowerCase();
  for (const entry of MOCK.gemmaChatReplies) {
    if (entry.match.some((k: string) => t.includes(k))) return entry.reply;
  }
  return MOCK.gemmaDefaultReply;
}

function initials(name: string) {
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

function avatarColor(name: string) {
  const palette = [colors.avatarA, colors.avatarB, colors.avatarC, colors.avatarD, colors.avatarE];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

export default function RoomDetail() {
  const { id: roomId } = useLocalSearchParams<{ id: string }>();
  const r = (MOCK.rooms as any)[roomId!];
  const u = MOCK.units.find(x => x.roomId === roomId);
  const chatScrollRef = useRef<ScrollView>(null);

  const [tab, setTab] = useState<'chat' | 'files' | 'members'>('chat');
  const [messages, setMessages] = useState<ChatMsg[]>(r?.chat || []);
  const [draft, setDraft] = useState('');
  const [gemmaTyping, setGemmaTyping] = useState(false);
  const [roomFiles, setRoomFiles] = useState<any[]>((MOCK.roomFiles as any)[roomId!] || []);

  useEffect(() => {
    setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: false }), 100);
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const sendMessage = useCallback((text: string) => {
    const t = text.trim();
    if (!t) return;
    setMessages(prev => [...prev, { from: 'me', text: t }]);
    setDraft('');
    scrollToBottom();

    if (/@gemma/i.test(t)) {
      setGemmaTyping(true);
      scrollToBottom();
      setTimeout(() => {
        setGemmaTyping(false);
        const reply = matchReply(t);
        setMessages(prev => [...prev, { from: 'Gemma', text: reply }]);
        scrollToBottom();
      }, 1500);
    }
  }, [scrollToBottom]);

  const handleSaveFile = useCallback((file: any) => {
    toast('Saved to your unit', '📥');
  }, []);

  const quickPrompts = [
    { label: 'CAT 1 topics?', text: '@Gemma what topics are in the CAT 1 past paper?' },
    { label: 'Practice questions', text: '@Gemma generate practice questions on this unit' },
    { label: 'Re-explain simply', text: '@Gemma re-explain this in simple terms' },
    { label: 'Next deadline?', text: '@Gemma when is the next deadline?' },
  ];

  if (!r || !u) {
    return (
      <SafeScreen>
        <Text style={styles.notFound}>Room not found</Text>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen
      bottomInset
      topBar={
        <TopBar
          title={`${u.code} room`}
          backLabel="Rooms"
          onBack={() => router.back()}
          breadcrumb="Rooms / Chat"
        />
      }
    >
      <View style={styles.tabsBar}>
        {(['chat', 'files', 'members'] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'chat' && (
        <KeyboardAvoidingView
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ScrollView ref={chatScrollRef} style={styles.chatScroll} contentContainerStyle={styles.chatContent}>
            {messages.map((m, i) => {
              if (m.from === 'system') return <Text key={i} style={styles.systemMsg}>{m.text}</Text>;
              if (m.from === 'me') return (
                <View key={i} style={styles.myMsg}>
                  <View style={styles.myBubble}><Text style={styles.myText}>{m.text}</Text></View>
                </View>
              );
              if (m.from === 'Gemma') return (
                <View key={i} style={styles.gemmaMsg}>
                  <View style={[styles.av, { backgroundColor: colors.marigoldDark }]}>
                    <Text style={styles.avText}>G</Text>
                  </View>
                  <View style={styles.gemmaBubble}>
                    <Text style={styles.gemmaWho}>✓ Gemma · grounded in {u.code}</Text>
                    <Text style={styles.gemmaText}>{m.text}</Text>
                  </View>
                </View>
              );
              return (
                <View key={i} style={styles.otherMsg}>
                  <View style={[styles.av, { backgroundColor: avatarColor(m.from) }]}>
                    <Text style={styles.avText}>{initials(m.from)}</Text>
                  </View>
                  <View style={styles.otherBubble}>
                    <Text style={styles.otherWho}>{m.from}</Text>
                    <Text style={styles.otherText}>{m.text}</Text>
                  </View>
                </View>
              );
            })}
            {gemmaTyping && (
              <View style={styles.gemmaMsg}>
                <View style={[styles.av, { backgroundColor: colors.marigoldDark }]}>
                  <Text style={styles.avText}>G</Text>
                </View>
                <View style={styles.gemmaBubble}>
                  <Text style={styles.gemmaWho}>Gemma is answering…</Text>
                  <View style={styles.typingDots}>
                    <View style={styles.dot} /><View style={[styles.dot, styles.dot2]} /><View style={[styles.dot, styles.dot3]} />
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
          <View style={styles.quickPromptsWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickPrompts}>
              {quickPrompts.map((qp, i) => (
                <TouchableOpacity key={i} style={styles.qpChip} onPress={() => sendMessage(qp.text)}>
                  <Text style={styles.qpText}>{qp.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={styles.inputBar}>
            <TextInput
              style={styles.chatInput}
              placeholder="Message the room, or tag @Gemma…"
              placeholderTextColor={colors.inkSoft + '99'}
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={() => sendMessage(draft)}
              returnKeyType="send"
            />
            <TouchableOpacity style={styles.sendBtn} onPress={() => sendMessage(draft)}>
              <Text style={styles.sendBtnText}>➤</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {tab === 'files' && (
        <ScrollView contentContainerStyle={styles.pagePad}>
          {roomFiles.length > 0 ? roomFiles.map((f: any) => (
            <View key={f.id} style={styles.fileRow}>
              <View style={[styles.fileIcon, f.type === 'img' && styles.fileIconImg]}>
                <Text>{f.type === 'img' ? '🖼' : '📄'}</Text>
              </View>
              <View style={styles.fileBody}>
                <Text style={styles.fileName} numberOfLines={1}>{f.name}</Text>
                <Text style={styles.fileMeta}>{f.topic} · {f.uploader} · {f.uploaded}</Text>
              </View>
              <TouchableOpacity style={styles.iconBtn} onPress={() => handleSaveFile(f)}>
                <Text style={styles.iconBtnText}>⬇</Text>
              </TouchableOpacity>
            </View>
          )) : (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📁</Text>
              <Text style={styles.emptyTitle}>No shared files</Text>
              <Text style={styles.emptyText}>Files anyone shares here will show up for the whole room.</Text>
            </View>
          )}
        </ScrollView>
      )}

      {tab === 'members' && (
        <ScrollView contentContainerStyle={styles.pagePad}>
          <View style={styles.stampRow}>
            <View style={styles.stamp}>
              <Text style={styles.stampIcon}>🔒</Text>
              <Text style={styles.stampText}>Room code: {r.code}</Text>
            </View>
          </View>
          {r.members.map((m: any, i: number) => (
            <View key={i} style={styles.memberRow}>
              <View style={[styles.memberAv, { backgroundColor: avatarColor(m.name) }]}>
                <Text style={styles.memberAvText}>{initials(m.name)}</Text>
              </View>
              <View>
                <Text style={styles.memberName}>{m.name}</Text>
                <Text style={styles.memberRole}>{m.role}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  notFound: { padding: 20, fontSize: 16, color: colors.inkSoft },

  tabsBar: { flexDirection: 'row', gap: 6, padding: 12, borderBottomWidth: 1, borderBottomColor: colors.paperLine, backgroundColor: colors.white },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: colors.paper },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.inkSoft },
  tabTextActive: { color: colors.chalkDark },

  chatContainer: { flex: 1 },
  chatScroll: { flex: 1 },
  chatContent: { padding: 16, gap: 12 },
  systemMsg: { textAlign: 'center', fontSize: 12, color: colors.inkSoft, fontFamily: fonts.mono, marginVertical: 4 },
  myMsg: { alignItems: 'flex-end', maxWidth: '86%', alignSelf: 'flex-end' },
  myBubble: { backgroundColor: colors.chalk, borderRadius: 14, borderBottomRightRadius: 4, padding: 10, maxWidth: '100%' },
  myText: { color: colors.paperSoft, fontSize: 14, lineHeight: 20 },
  gemmaMsg: { flexDirection: 'row', gap: 9, maxWidth: '90%' },
  av: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  avText: { fontSize: 11, fontWeight: '700', color: colors.white, fontFamily: fonts.mono },
  gemmaBubble: { backgroundColor: colors.marigoldTint, borderRadius: 14, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.marigoldDark, padding: 10, flex: 1 },
  gemmaWho: { fontSize: 11, fontWeight: '700', color: colors.marigoldDark, marginBottom: 3 },
  gemmaText: { fontSize: 14, lineHeight: 20 },
  otherMsg: { flexDirection: 'row', gap: 9, maxWidth: '86%' },
  otherBubble: { backgroundColor: colors.white, borderRadius: 14, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.paperLine, padding: 10 },
  otherWho: { fontSize: 11, fontWeight: '700', color: colors.inkSoft, marginBottom: 3 },
  otherText: { fontSize: 14, lineHeight: 20 },
  typingDots: { flexDirection: 'row', gap: 3, paddingVertical: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.marigoldDark, opacity: 0.5 },
  dot2: { opacity: 0.3 }, dot3: { opacity: 0.15 },
  quickPromptsWrapper: {
    backgroundColor: colors.paperSoft,
    borderTopWidth: 1,
    borderTopColor: colors.paperLine,
    paddingVertical: 8,
  },
  quickPrompts: { gap: 7, paddingHorizontal: 16 },
  qpChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.paperLine },
  qpText: { fontSize: 12, color: colors.inkSoft },
  inputBar: { flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12, backgroundColor: colors.paperSoft, borderTopWidth: 1, borderTopColor: colors.paperLine },
  chatInput: { flex: 1, padding: 11, borderRadius: 999, borderWidth: 1.5, borderColor: colors.paperLine, fontSize: 14, backgroundColor: colors.white },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.chalk, justifyContent: 'center', alignItems: 'center' },
  sendBtnText: { color: colors.paperSoft, fontSize: 16 },

  pagePad: { padding: 20 },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, backgroundColor: colors.white, borderRadius: radii.md, borderWidth: 1, borderColor: colors.paperLine, marginBottom: 9 },
  fileIcon: { width: 38, height: 38, borderRadius: 9, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.indigoTint },
  fileIconImg: { backgroundColor: colors.marigoldTint },
  fileBody: { flex: 1 },
  fileName: { fontWeight: '600', fontSize: 14 },
  fileMeta: { fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  iconBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: colors.paperLine, justifyContent: 'center', alignItems: 'center' },
  iconBtnText: { fontSize: 14 },

  stampRow: { marginBottom: 14 },
  stamp: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1.6, borderColor: colors.chalkSoft, borderStyle: 'dashed', backgroundColor: 'rgba(47,69,56,0.04)' },
  stampIcon: { fontSize: 11 },
  stampText: { fontFamily: fonts.mono, fontSize: 11, fontWeight: '600', color: colors.chalkSoft },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 10 },
  memberAv: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  memberAvText: { fontSize: 11, fontWeight: '700', color: colors.white, fontFamily: fonts.mono },
  memberName: { fontSize: 14, fontWeight: '600' },
  memberRole: { fontSize: 12, color: colors.inkSoft },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyTitle: { fontFamily: fonts.display, fontSize: 18, fontWeight: '600', color: colors.chalkDark, marginBottom: 6 },
  emptyText: { fontSize: 14, color: colors.inkSoft, textAlign: 'center', opacity: 0.75 },
});
