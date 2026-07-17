import { Stack } from 'expo-router';
import { colors } from '@/constants/theme';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="units" />
      <Stack.Screen name="room" />
    </Stack>
  );
}
