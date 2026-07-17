import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

type ToastVariant = 'success' | 'info' | 'error';

interface ToastData {
  id: number;
  message: string;
  icon: string;
  variant: ToastVariant;
}

let toastId = 0;
let setToasts: React.Dispatch<React.SetStateAction<ToastData[]>> | null = null;

export function toast(message: string, icon = '✓', variant: ToastVariant = 'success') {
  const id = ++toastId;
  if (setToasts) {
    setToasts(prev => [...prev, { id, message, icon, variant }]);
    setTimeout(() => {
      setToasts?.(prev => prev.filter(t => t.id !== id));
    }, 2200);
  }
}

export function ToastProvider({ children }: { children: any }) {
  const [items, setItems] = useState<ToastData[]>([]);
  setToasts = setItems;

  return (
    <View style={styles.wrapper}>
      {children}
      <View style={[styles.container, { pointerEvents: 'none' as any }]}>
        {items.map(t => (
          <View
            key={t.id}
            style={[
              styles.toast,
              t.variant === 'info' && styles.info,
              t.variant === 'error' && styles.error,
            ]}
          >
            <Text style={styles.icon}>{t.icon}</Text>
            <Text style={styles.text}>{t.message}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 999,
    alignItems: 'center',
    gap: 8,
    pointerEvents: 'none',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: colors.chalk,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    boxShadow: '0 10px 30px -8px rgba(27,42,31,0.35)',
    elevation: 10,
  },
  info: { backgroundColor: colors.indigo },
  error: { backgroundColor: colors.brick },
  icon: { fontSize: 16 },
  text: { fontSize: 13, fontWeight: '600', color: colors.paperSoft },
});
