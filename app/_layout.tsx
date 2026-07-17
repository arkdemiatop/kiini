import { Stack, Redirect, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { useAuthStore } from '@/lib/store';
import { ToastProvider } from '@/components/Toast';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { profile, onboarded } = useAuthStore();
  const segments = useSegments();

  const inOnboarding = segments[0] === 'onboarding';
  const inAdmin = segments[0] === 'admin';

  if (!profile && !inOnboarding && !inAdmin) {
    return <Redirect href="/onboarding/welcome" />;
  }

  if (profile && !onboarded && !inOnboarding) {
    return <Redirect href="/onboarding/welcome" />;
  }

  if (profile && onboarded && inOnboarding) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ToastProvider>
          <StatusBar style="dark" />
          <AuthGate>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="onboarding" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
              <Stack.Screen name="unit/[id]" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="room/[id]" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="admin" options={{ animation: 'slide_from_bottom' }} />
            </Stack>
          </AuthGate>
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
