import { View, ScrollView, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  bottomInset?: boolean;
  topBar?: React.ReactNode;
  style?: ViewStyle;
}

export function SafeScreen({
  children,
  scrollable,
  bottomInset,
  topBar,
  style,
}: SafeScreenProps) {
  const insets = useSafeAreaInsets();

  const containerStyle = {
    paddingTop: insets.top,
    paddingBottom: bottomInset ? insets.bottom + 20 : 0,
  };

  if (scrollable) {
    return (
      <View style={[styles.container, containerStyle, style]}>
        {topBar}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle, style]}>
      {topBar}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
