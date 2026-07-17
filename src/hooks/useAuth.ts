import { useCallback } from 'react';
import { useAuthStore } from '@/lib/store';

export function useAuth() {
  const { profile, onboarded, setProfile, setOnboarded } = useAuthStore();

  const completeOnboarding = useCallback(async (data: {
    name: string;
    courseId: string;
    year: string;
    unitCodes: string[];
  }) => {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 200));
    setProfile({
      id: 'mock-user-1',
      name: data.name,
      course_id: data.courseId as any,
      year: data.year,
      created_at: new Date().toISOString(),
    });
    setOnboarded(true);
  }, []);

  const signOut = useCallback(async () => {
    setProfile(null);
    setOnboarded(false);
  }, []);

  return {
    loading: false,
    profile,
    onboarded,
    completeOnboarding,
    signOut,
  };
}
