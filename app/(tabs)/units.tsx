import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors, fonts, radii } from '@/constants/theme';
import { MOCK } from '@/lib/mock-data';
import { toast } from '@/components/Toast';
import { SafeScreen } from '@/components/SafeScreen';

type MockUnit = (typeof MOCK.units)[number];

function PageHeader({ title }: { title: string }) {
  return (
    <View style={styles.header}>
      <View style={styles.wordmark}>
        <View style={styles.mark}><Text style={styles.markText}>K</Text></View>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
    </View>
  );
}

export default function Units() {
  const [units, setUnits] = useState(MOCK.units);
  const [showSheet, setShowSheet] = useState(false);

  const addUnit = useCallback((code: string, name: string) => {
    const palette = ['#4C6B57', '#3D4E82', '#B34A3C', '#C7842A', '#6B4C7A'];
    const color = palette[units.length % palette.length];
    const newUnit: MockUnit = {
      id: 'u' + Date.now(), code, name, color,
      topics: ['General', 'Past Papers'],
      hasRoom: false, roomId: null,
    };
    setUnits(prev => [...prev, newUnit]);
    setShowSheet(false);
  }, [units.length]);

  const catalogAvailable = MOCK.catalogUnits.filter(
    cu => !units.some(u => u.code === cu.code)
  );

  return (
    <SafeScreen scrollable>
      <PageHeader title="Your units" />
      <View style={styles.pagePad}>
      <View style={styles.card}>
        {units.map(u => {
          const count = ((MOCK.personalFiles as any)[u.id]?.length || 0);
          return (
            <TouchableOpacity
              key={u.id}
              style={styles.listRow}
              onPress={() => router.push(`/unit/${u.id}`)}
            >
              <View style={[styles.avatar, { backgroundColor: u.color + '22' }]}>
                <Text style={[styles.avatarText, { color: u.color }]}>{u.code.split(' ')[0]}</Text>
              </View>
              <View style={styles.listBody}>
                <Text style={styles.listTitle}>
                  {u.code} <Text style={styles.muted}>· {u.name}</Text>
                </Text>
                <Text style={styles.listSub}>
                  {count} personal file{count === 1 ? '' : 's'}
                  {u.hasRoom ? ' · room joined' : ' · no room yet'}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.addButton} onPress={() => setShowSheet(true)}>
        <Text style={styles.addButtonText}>+ Add another unit</Text>
      </TouchableOpacity>
      </View>

      <Modal visible={showSheet} transparent animationType="slide">
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setShowSheet(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Add a unit</Text>
            <Text style={styles.sheetLead}>It becomes its own organized workspace right away.</Text>
            <View style={styles.chipGrid}>
              {catalogAvailable.length > 0 ? catalogAvailable.map(cu => (
                <TouchableOpacity key={cu.code} style={styles.chip} onPress={() => addUnit(cu.code, cu.name)}>
                  <Text style={styles.chipText}>{cu.code} — {cu.name}</Text>
                </TouchableOpacity>
              )) : (
                <Text style={styles.muted}>All catalog units already added.</Text>
              )}
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowSheet(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
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
  card: { backgroundColor: colors.white, borderRadius: radii.md, borderWidth: 1, borderColor: colors.paperLine },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14 },
  avatar: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontFamily: fonts.mono, fontWeight: '700', fontSize: 13 },
  listBody: { flex: 1 },
  listTitle: { fontWeight: '700', fontSize: 15 },
  listSub: { fontSize: 13, color: colors.inkSoft, marginTop: 2 },
  muted: { color: colors.inkSoft, fontSize: 13 },
  chevron: { fontSize: 22, color: colors.inkSoft, opacity: 0.5 },
  addButton: { marginTop: 16, paddingVertical: 13, borderRadius: 999, borderWidth: 1.5, borderColor: colors.paperLine, alignItems: 'center' },
  addButtonText: { fontSize: 14, fontWeight: '600', color: colors.chalk },
  backdrop: { flex: 1, backgroundColor: 'rgba(27,42,31,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.paperSoft, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, paddingBottom: 36 },
  handle: { width: 40, height: 4, borderRadius: 4, backgroundColor: colors.paperLine, alignSelf: 'center', marginBottom: 18 },
  sheetTitle: { fontFamily: fonts.display, fontSize: 19, fontWeight: '600', color: colors.chalkDark, marginBottom: 4 },
  sheetLead: { fontSize: 13, color: colors.inkSoft, marginBottom: 18 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 9, paddingHorizontal: 15, borderRadius: 999, borderWidth: 1.5, borderColor: colors.paperLine, backgroundColor: colors.white },
  chipText: { fontSize: 14, fontWeight: '500', color: colors.inkSoft },
  closeButton: { marginTop: 16, paddingVertical: 13, borderRadius: 999, alignItems: 'center' },
  closeButtonText: { fontSize: 14, fontWeight: '600', color: colors.chalk },
});
