import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors, fonts, radii } from '@/constants/theme';
import { MOCK } from '@/lib/mock-data';
import { toast } from '@/components/Toast';
import { SafeScreen } from '@/components/SafeScreen';

function PageHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <View style={styles.header}>
      <View style={styles.wordmark}>
        <View style={styles.mark}><Text style={styles.markText}>K</Text></View>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

export default function Rooms() {
  const [showJoinSheet, setShowJoinSheet] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const joinedUnits = MOCK.units.filter(u => u.hasRoom);

  const handleJoin = useCallback(() => {
    const code = joinCode.trim().toUpperCase();
    if (!code) {
      setJoinError('Enter a room code');
      return;
    }

    const roomEntry = Object.entries(MOCK.rooms as Record<string, any>).find(
      ([, r]) => r.code.toUpperCase() === code
    );

    if (roomEntry) {
      const [, room] = roomEntry;
      setShowJoinSheet(false);
      setJoinCode('');
      setJoinError('');
      toast('Joined room!', '🎉');
      router.push(`/room/${room.id}`);
    } else {
      setJoinError('Room not found. Check the code and try again.');
    }
  }, [joinCode]);

  return (
    <SafeScreen scrollable>
      <PageHeader
        title="Rooms"
        right={
          <TouchableOpacity
            style={styles.joinBtn}
            onPress={() => { setJoinError(''); setJoinCode(''); setShowJoinSheet(true); }}
          >
            <Text style={styles.joinBtnText}>+ Join</Text>
          </TouchableOpacity>
        }
      />
      <View style={styles.pagePad}>
      {joinedUnits.length > 0 ? joinedUnits.map(u => {
        const r = (MOCK.rooms as any)[u.roomId!];
        const lastMsg = r?.chat?.[r.chat.length - 1];
        const preview = lastMsg
          ? (lastMsg.from === 'system' ? lastMsg.text : `${lastMsg.from === 'me' ? 'You' : lastMsg.from}: ${lastMsg.text}`)
          : 'No messages yet';
        return (
          <TouchableOpacity
            key={u.id}
            style={styles.listRow}
            onPress={() => router.push(`/room/${u.roomId}`)}
          >
            <View style={[styles.avatar, { backgroundColor: u.color + '22' }]}>
              <Text style={[styles.avatarText, { color: u.color }]}>{u.code.split(' ')[0]}</Text>
            </View>
            <View style={styles.listBody}>
              <Text style={styles.listTitle}>
                {u.code} room <Text style={styles.muted}>· {r?.members?.length || 0} members</Text>
              </Text>
              <Text style={styles.listSub} numberOfLines={1}>{preview}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        );
      }) : (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>No rooms yet</Text>
          <Text style={styles.emptyText}>Start a room from any unit, or join one with a code.</Text>
        </View>
      )}
      </View>

      <Modal visible={showJoinSheet} transparent animationType="slide">
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setShowJoinSheet(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Join a room</Text>
            <Text style={styles.sheetLead}>Paste a code shared by a classmate.</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Room code</Text>
              <TextInput
                style={[styles.input, styles.mono, joinError ? styles.inputError : null]}
                placeholder="e.g. CIT301-9F2K"
                placeholderTextColor={colors.inkSoft + '66'}
                value={joinCode}
                onChangeText={(t) => { setJoinCode(t); setJoinError(''); }}
                autoCapitalize="characters"
              />
              {joinError ? <Text style={styles.errorText}>{joinError}</Text> : null}
            </View>
            <TouchableOpacity style={styles.joinButton} onPress={handleJoin}>
              <Text style={styles.joinButtonText}>Join room</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  joinBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1.5, borderColor: colors.paperLine },
  joinBtnText: { fontSize: 13, fontWeight: '600', color: colors.chalk },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14, backgroundColor: colors.white, borderRadius: radii.md, borderWidth: 1, borderColor: colors.paperLine, marginBottom: 4 },
  avatar: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontFamily: fonts.mono, fontWeight: '700', fontSize: 13 },
  listBody: { flex: 1 },
  listTitle: { fontWeight: '700', fontSize: 15 },
  listSub: { fontSize: 13, color: colors.inkSoft, marginTop: 2, overflow: 'hidden' },
  muted: { color: colors.inkSoft, fontSize: 12 },
  chevron: { fontSize: 22, color: colors.inkSoft, opacity: 0.5 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyTitle: { fontFamily: fonts.display, fontSize: 18, fontWeight: '600', color: colors.chalkDark, marginBottom: 6 },
  emptyText: { fontSize: 14, color: colors.inkSoft, textAlign: 'center', opacity: 0.75 },
  backdrop: { flex: 1, backgroundColor: 'rgba(27,42,31,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.paperSoft, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, paddingBottom: 36 },
  handle: { width: 40, height: 4, borderRadius: 4, backgroundColor: colors.paperLine, alignSelf: 'center', marginBottom: 18 },
  sheetTitle: { fontFamily: fonts.display, fontSize: 19, fontWeight: '600', color: colors.chalkDark, marginBottom: 4 },
  sheetLead: { fontSize: 13, color: colors.inkSoft, marginBottom: 18 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: colors.inkSoft, marginBottom: 6 },
  input: { padding: 12, borderRadius: 10, borderWidth: 1.5, borderColor: colors.paperLine, fontSize: 14, backgroundColor: colors.white },
  inputError: { borderColor: colors.brick },
  errorText: { color: colors.brick, fontSize: 12, marginTop: 6, fontWeight: '500' },
  mono: { fontFamily: fonts.mono, letterSpacing: 0.5 },
  joinButton: { paddingVertical: 13, borderRadius: 999, backgroundColor: colors.marigold, alignItems: 'center' },
  joinButtonText: { fontSize: 15, fontWeight: '600', color: colors.chalkDark },
});
