import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';
import { colors, fonts } from '@/constants/theme';

interface TopBarProps {
  title: string;
  onBack?: () => void;
  backLabel?: string;
  breadcrumb?: string;
  right?: React.ReactNode;
  style?: ViewStyle;
}

export function TopBar({
  title,
  onBack,
  backLabel,
  breadcrumb,
  right,
  style,
}: TopBarProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.left}>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
            <Text style={styles.backArrow}>‹</Text>
            {backLabel && <Text style={styles.backLabel}>{backLabel}</Text>}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.center}>
        {breadcrumb && <Text style={styles.breadcrumb}>{breadcrumb}</Text>}
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>

      <View style={styles.right}>
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.paperLine,
    backgroundColor: colors.paper,
    minHeight: 52,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 80,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingRight: 8,
  },
  backArrow: {
    fontSize: 26,
    color: colors.chalk,
    lineHeight: 28,
    marginTop: -2,
  },
  backLabel: {
    fontSize: 14,
    color: colors.inkSoft,
    fontWeight: '500',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  breadcrumb: {
    fontSize: 10,
    color: colors.inkSoft,
    fontFamily: fonts.mono,
    letterSpacing: 0.3,
    opacity: 0.7,
    marginBottom: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.chalkDark,
    fontFamily: fonts.display,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 80,
    justifyContent: 'flex-end',
  },
});
