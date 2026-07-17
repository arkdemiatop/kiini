import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, fonts, radii } from '@/constants/theme';
import { MOCK } from '@/lib/mock-data';
import { toast } from '@/components/Toast';
import { SafeScreen } from '@/components/SafeScreen';
import { TopBar } from '@/components/TopBar';

type FileInfo = { id: string; name: string; topic: string; type: 'pdf' | 'img'; size: string; uploaded: string; uploader?: string };

export default function UnitWorkspace() {
  const { id: unitId } = useLocalSearchParams<{ id: string }>();
  const u = MOCK.units.find(x => x.id === unitId);

  const [space, setSpace] = useState<'personal' | 'room'>('personal');
  const [topicFilter, setTopicFilter] = useState('All');
  const [processing, setProcessing] = useState(false);
  const [personalFiles, setPersonalFiles] = useState<Record<string, FileInfo[]>>(MOCK.personalFiles);
  const [roomFiles, setRoomFiles] = useState<Record<string, FileInfo[]>>(MOCK.roomFiles);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomCode, setNewRoomCode] = useState('');

  if (!u) {
    return (
      <SafeScreen>
        <Text style={styles.notFound}>Unit not found</Text>
      </SafeScreen>
    );
  }

  const files = space === 'personal'
    ? (personalFiles[u.id] || [])
    : (u.hasRoom ? (roomFiles[u.roomId!] || []) : []);

  const topics = ['All', ...u.topics];
  const filtered = topicFilter === 'All' ? files : files.filter(f => f.topic === topicFilter);

  const handleStartRoom = useCallback(() => {
    const code = `${u.code.replace(' ', '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    setNewRoomCode(code);
    setShowCreateRoom(true);
  }, [u.code]);

  const confirmCreateRoom = useCallback(() => {
    const newRoomId = 'r' + Date.now();
    (MOCK.rooms as any)[newRoomId] = {
      id: newRoomId, unitId: u.id, code: newRoomCode,
      members: [{ name: 'You', role: 'Member', avatar: u.color }],
      chat: [{ from: 'system', text: 'Room created. Share the code so classmates can join.' }],
    };
    (MOCK.roomFiles as any)[newRoomId] = [];
    u.hasRoom = true;
    u.roomId = newRoomId;
    setShowCreateRoom(false);
    toast('Room created! Share the code.', '🏠');
  }, [u, newRoomCode]);

  const handleShareToRoom = useCallback((file: FileInfo) => {
    if (!u.hasRoom || !u.roomId) return;
    setRoomFiles(prev => ({
      ...prev,
      [u.roomId!]: [{ ...file, uploader: 'You' }, ...(prev[u.roomId!] || [])],
    }));
    toast('Shared to room', '📤');
  }, [u]);

  const handleSaveFromRoom = useCallback((file: FileInfo) => {
    const list = personalFiles[u.id] || [];
    if (list.some(p => p.name === file.name)) {
      toast('Already saved', '✓', 'info');
      return;
    }
    setPersonalFiles(prev => ({
      ...prev,
      [u.id]: [{ ...file, uploaded: 'just now' }, ...list],
    }));
    toast('Saved to your unit', '📥');
  }, [u, personalFiles]);

  const simulateUpload = useCallback(() => {
    if (processing) return;
    setProcessing(true);
    setTimeout(() => {
      const samples: Array<{ topic: string; filename: string; type: 'pdf' | 'img' }> = [
        { topic: 'Normalization', filename: '3NF worked examples — scan.pdf', type: 'pdf' },
        { topic: 'SQL & Queries', filename: 'Joins & subqueries — lecture slides.pdf', type: 'pdf' },
        { topic: 'Past Papers', filename: 'Database Systems — CAT 2 2023.pdf', type: 'pdf' },
      ];
      const sample = samples[Math.floor(Math.random() * samples.length)];
      setPersonalFiles(prev => {
        const list = prev[u.id] || [];
        return { ...prev, [u.id]: [{ id: 'f' + Date.now(), name: sample.filename, topic: sample.topic, type: sample.type, size: Math.round(Math.random() * 800 + 100) + ' KB', uploaded: 'just now' }, ...list] };
      });
      setProcessing(false);
      setTopicFilter('All');
      toast(`Filed under ${sample.topic}`, '🗂️');
    }, 2500);
  }, [processing, u.id]);

  return (
    <SafeScreen
      bottomInset
      topBar={
        <TopBar
          title={u.code}
          backLabel="Units"
          onBack={() => router.back()}
          breadcrumb="Units / Workspace"
          right={
            !u.hasRoom && (
              <TouchableOpacity style={styles.ghostBtn} onPress={handleStartRoom}>
                <Text style={styles.ghostBtnText}>Start room</Text>
              </TouchableOpacity>
            )
          }
        />
      }
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.hero}>
          <Text style={[styles.heroCode, { color: u.color }]}>{u.code}</Text>
          <Text style={styles.heroName}>{u.name}</Text>
          {u.hasRoom && (
            <View style={styles.spaceToggle}>
              {(['personal', 'room'] as const).map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.spaceBtn, space === s && styles.spaceBtnActive]}
                  onPress={() => { setSpace(s); setTopicFilter('All'); }}
                >
                  <Text style={[styles.spaceText, space === s && styles.spaceTextActive]}>
                    {s === 'personal' ? 'My files' : 'Shared with room'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topicScroll}>
          {topics.map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.topicChip, topicFilter === t && styles.topicChipActive]}
              onPress={() => setTopicFilter(t)}
            >
              <Text style={[styles.topicText, topicFilter === t && styles.topicTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {processing && (
          <View style={styles.processingCard}>
            <View style={styles.spinner} />
            <View>
              <Text style={styles.processingText}>Reading document with Gemma 4…</Text>
              <Text style={styles.processingFile}>Classifying, renaming and filing…</Text>
            </View>
          </View>
        )}

        {space === 'personal' && !processing && (
          <TouchableOpacity style={styles.uploadZone} onPress={simulateUpload}>
            <Text style={styles.uploadIcon}>⬆</Text>
            <Text style={styles.uploadTitle}>Upload a PDF or photo</Text>
            <Text style={styles.uploadSub}>Gemma will classify, rename and file it for you</Text>
          </TouchableOpacity>
        )}

        {space === 'room' && u.hasRoom && (
          <TouchableOpacity
            style={styles.openRoomBtn}
            onPress={() => router.push(`/room/${u.roomId}`)}
          >
            <View style={styles.openRoomInner}>
              <Text style={styles.openRoomIcon}>💬</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.openRoomTitle}>Open room chat</Text>
                <Text style={styles.openRoomSub}>Chat with classmates, see all shared files and members</Text>
              </View>
              <Text style={styles.openRoomArrow}>›</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.pagePad}>
          {filtered.length > 0 ? filtered.map(f => (
            <View key={f.id} style={styles.fileRow}>
              <View style={[styles.fileIcon, f.type === 'img' && styles.fileIconImg]}>
                <Text>{f.type === 'img' ? '🖼' : '📄'}</Text>
              </View>
              <View style={styles.fileBody}>
                <Text style={styles.fileName} numberOfLines={1}>{f.name}</Text>
                <Text style={styles.fileMeta}>
                  {f.topic} · {f.size} · {space === 'personal' ? f.uploaded : `${f.uploader} · ${f.uploaded}`}
                </Text>
              </View>
              <View style={styles.fileActions}>
                {space === 'personal' && u.hasRoom && (
                  <TouchableOpacity style={styles.iconBtn} onPress={() => handleShareToRoom(f)}>
                    <Text style={styles.iconBtnText}>⬆</Text>
                  </TouchableOpacity>
                )}
                {space === 'room' && (
                  <TouchableOpacity style={styles.iconBtn} onPress={() => handleSaveFromRoom(f)}>
                    <Text style={styles.iconBtnText}>⬇</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )) : (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📂</Text>
              <Text style={styles.emptyTitle}>Nothing here yet</Text>
              <Text style={styles.emptyText}>
                {space === 'personal'
                  ? 'Upload a PDF or photo and Gemma will file it automatically.'
                  : `No files in this ${topicFilter === 'All' ? 'room' : topicFilter} topic yet.`}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={showCreateRoom} transparent animationType="slide">
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setShowCreateRoom(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Start a room for {u.code}</Text>
            <Text style={styles.sheetLead}>Share this code so classmates can join — no account needed.</Text>
            <View style={styles.codeCard}>
              <View style={styles.stampBig}>
                <Text style={styles.stampBigText}>{newRoomCode}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.createButton} onPress={confirmCreateRoom}>
              <Text style={styles.createButtonText}>Create &amp; open room</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  notFound: { padding: 20, fontSize: 16, color: colors.inkSoft },
  ghostBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1.5, borderColor: colors.paperLine },
  ghostBtnText: { fontSize: 12, fontWeight: '600', color: colors.chalk },

  hero: { padding: 20, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.paperLine },
  heroCode: { fontFamily: fonts.mono, fontWeight: '700', fontSize: 20 },
  heroName: { color: colors.inkSoft, fontSize: 14, marginTop: 2 },
  spaceToggle: { flexDirection: 'row', backgroundColor: colors.paper, borderRadius: 999, padding: 4, gap: 4, marginTop: 16 },
  spaceBtn: { flex: 1, paddingVertical: 9, borderRadius: 999, alignItems: 'center' },
  spaceBtnActive: { backgroundColor: colors.chalk },
  spaceText: { fontSize: 13, fontWeight: '600', color: colors.inkSoft },
  spaceTextActive: { color: colors.paperSoft },

  topicScroll: { gap: 8, padding: 14 },
  topicChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1.5, borderColor: colors.paperLine, backgroundColor: colors.white },
  topicChipActive: { backgroundColor: colors.marigoldTint, borderColor: colors.marigoldDark },
  topicText: { fontSize: 13, fontWeight: '600', color: colors.chalk },
  topicTextActive: { color: colors.marigoldDark },

  processingCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 20, marginBottom: 12, padding: 14, borderRadius: radii.md, backgroundColor: colors.marigoldTint, borderWidth: 1, borderColor: colors.marigoldDark },
  spinner: { width: 20, height: 20, borderRadius: 10, borderWidth: 2.5, borderColor: 'rgba(199,132,42,0.3)', borderTopColor: colors.marigoldDark },
  processingText: { fontSize: 13, fontWeight: '600', color: colors.marigoldDark },
  processingFile: { fontSize: 11, color: colors.marigoldDark, opacity: 0.85, marginTop: 1 },

  uploadZone: { marginHorizontal: 20, marginBottom: 6, padding: 26, borderRadius: radii.lg, borderWidth: 2, borderColor: colors.paperLine, borderStyle: 'dashed', alignItems: 'center', backgroundColor: 'rgba(255,253,247,0.5)' },
  uploadIcon: { fontSize: 26, marginBottom: 8 },
  uploadTitle: { fontWeight: '600', fontSize: 14 },
  uploadSub: { fontSize: 12, color: colors.inkSoft, marginTop: 3 },

  openRoomBtn: { marginHorizontal: 20, marginBottom: 12 },
  openRoomInner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, backgroundColor: colors.white, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.marigoldDark, borderStyle: 'dashed' as any,
  },
  openRoomIcon: { fontSize: 22 },
  openRoomTitle: { fontWeight: '700', fontSize: 14, color: colors.chalkDark },
  openRoomSub: { fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  openRoomArrow: { fontSize: 22, color: colors.inkSoft, opacity: 0.5 },

  pagePad: { padding: 20, paddingTop: 6 },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, backgroundColor: colors.white, borderRadius: radii.md, borderWidth: 1, borderColor: colors.paperLine, marginBottom: 9 },
  fileIcon: { width: 38, height: 38, borderRadius: 9, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.indigoTint },
  fileIconImg: { backgroundColor: colors.marigoldTint },
  fileBody: { flex: 1 },
  fileName: { fontWeight: '600', fontSize: 14 },
  fileMeta: { fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  fileActions: { flexDirection: 'row', gap: 6 },
  iconBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: colors.paperLine, justifyContent: 'center', alignItems: 'center' },
  iconBtnText: { fontSize: 14 },

  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 24, marginBottom: 10 },
  emptyTitle: { fontFamily: fonts.display, fontSize: 17, fontWeight: '600', color: colors.chalkDark, marginBottom: 6 },
  emptyText: { fontSize: 14, color: colors.inkSoft, textAlign: 'center', opacity: 0.75 },

  backdrop: { flex: 1, backgroundColor: 'rgba(27,42,31,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.paperSoft, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, paddingBottom: 36 },
  handle: { width: 40, height: 4, borderRadius: 4, backgroundColor: colors.paperLine, alignSelf: 'center', marginBottom: 18 },
  sheetTitle: { fontFamily: fonts.display, fontSize: 19, fontWeight: '600', color: colors.chalkDark, marginBottom: 4 },
  sheetLead: { fontSize: 13, color: colors.inkSoft, marginBottom: 18 },
  codeCard: { padding: 22, alignItems: 'center', backgroundColor: colors.white, borderRadius: radii.md, borderWidth: 1, borderColor: colors.paperLine },
  stampBig: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 999, borderWidth: 2, borderColor: colors.marigoldDark, borderStyle: 'dashed', backgroundColor: 'rgba(232,163,61,0.09)', transform: [{ rotate: '-3deg' }] },
  stampBigText: { fontFamily: fonts.mono, fontSize: 16, fontWeight: '700', color: colors.marigoldDark, letterSpacing: 0.5 },
  createButton: { marginTop: 16, paddingVertical: 13, borderRadius: 999, backgroundColor: colors.marigold, alignItems: 'center' },
  createButtonText: { fontSize: 15, fontWeight: '600', color: colors.chalkDark },
});
