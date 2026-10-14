import { Redirect, Stack } from 'expo-router';
import { useSession } from '@/src/store/session';

export default function AuthLayout() {
  const { status } = useSession();
  // Signed-in users never see login screens (no redirect loop: this only reads state).
  if (status === 'signedIn') return <Redirect href="/(tabs)" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
