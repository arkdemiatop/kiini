import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '@/constants/theme';

interface StampProps {
  text: string;
  icon?: string;
  color?: 'marigold' | 'chalk';
  big?: boolean;
}

export function Stamp({ text, icon, color = 'chalk', big }: StampProps) {
  const isMarigold = color === 'marigold';
  return (
    <View style={[
      styles.stamp,
      isMarigold && styles.marigold,
      big && styles.big,
    ]}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[styles.text, isMarigold && styles.marigoldText, big && styles.bigText]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1.6,
    borderColor: colors.chalkSoft,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(47,69,56,0.04)',
    transform: [{ rotate: '-2deg' }],
  },
  marigold: {
    borderColor: colors.marigoldDark,
    backgroundColor: 'rgba(232,163,61,0.09)',
  },
  big: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 2,
    transform: [{ rotate: '-3deg' }],
  },
  icon: { fontSize: 13 },
  text: {
    fontFamily: fonts.mono,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.chalkSoft,
  },
  marigoldText: { color: colors.marigoldDark },
  bigText: { fontSize: 15 },
});
