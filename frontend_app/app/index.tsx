import { Redirect } from 'expo-router';
import { useSession } from '@/src/store/session';

// Pure routing based on session state. It never calls the API, so it cannot loop.
export default function Index() {
  const { status } = useSession();
  if (status === 'loading') return null;
  if (status === 'signedIn') return <Redirect href="/(tabs)" />;
  return <Redirect href="/onboarding" />;
}
