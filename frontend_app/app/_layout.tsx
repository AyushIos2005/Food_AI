import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SessionProvider, useSession } from '@/src/store/session';
import { ThemeProvider, useTheme } from '@/src/theme/ThemeProvider';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SessionProvider>
          <RootNavigator />
        </SessionProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const { status } = useSession();
  const { scheme, colors } = useTheme();

  useEffect(() => {
    if (status !== 'loading') SplashScreen.hideAsync().catch(() => {});
  }, [status]);

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} backgroundColor={colors.background} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="recipes/[id]" options={{ headerShown: true, title: 'Recipe', headerTintColor: colors.text, headerStyle: { backgroundColor: colors.background }, headerShadowVisible: false }} />
        <Stack.Screen name="history/[id]" options={{ headerShown: true, title: 'AI recipe', headerTintColor: colors.text, headerStyle: { backgroundColor: colors.background }, headerShadowVisible: false }} />
        <Stack.Screen name="settings" options={{ headerShown: true, title: 'Settings', headerTintColor: colors.text, headerStyle: { backgroundColor: colors.background }, headerShadowVisible: false }} />
      </Stack>
    </>
  );
}
