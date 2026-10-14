import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '@/src/store/session';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function TabsLayout() {
  const { status } = useSession();
  const { colors } = useTheme();
  // Protected area: signed-out users go to login. Reads state only, so no loop.
  if (status === 'loading') return null;
  if (status === 'signedOut') return <Redirect href="/(auth)/login" />;

  const icon = (name: React.ComponentProps<typeof Ionicons>['name']) =>
    ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
      <Ionicons name={focused ? name : (`${name}-outline` as typeof name)} size={size} color={color} />
    );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon('home') }} />
      <Tabs.Screen name="discover" options={{ title: 'Discover', tabBarIcon: icon('compass') }} />
      <Tabs.Screen name="ai" options={{ title: 'AI', tabBarIcon: icon('sparkles') }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: icon('time') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: icon('person-circle') }} />
    </Tabs>
  );
}
