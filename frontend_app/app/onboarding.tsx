import { useState } from 'react';
import { FlatList, Dimensions, View, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Screen, Text_ } from '@/src/components/ui';
import { useTheme } from '@/src/theme/ThemeProvider';
import { spacing, radius } from '@/src/theme/tokens';

const { width } = Dimensions.get('window');

const SLIDES = [
  { icon: 'search-outline' as const, title: 'Discover real recipes', body: 'Browse dishes shared by FoodAI chefs and search by name.' },
  { icon: 'sparkles-outline' as const, title: 'Generate with AI', body: 'Tell us what ingredients you have and get a recipe for your table.' },
  { icon: 'refresh-outline' as const, title: 'Recreate & keep history', body: 'Reinvent a dish with new ingredients and revisit everything you made.' },
];

export default function Onboarding() {
  const { colors } = useTheme();
  const [index, setIndex] = useState(0);
  const goLogin = () => router.replace('/(auth)/login');
  const isLast = index === SLIDES.length - 1;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <Screen padded={false}>
      <View style={{ alignItems: 'flex-end', padding: spacing.lg }}>
        <Button title="Skip" variant="ghost" onPress={goLogin} accessibilityHint="Skips the introduction and goes to login" />
      </View>
      <FlatList
        data={SLIDES}
        keyExtractor={(s) => s.title}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        renderItem={({ item }) => (
          <View style={{ width, paddingHorizontal: spacing.xxl, alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <View style={{ width: 160, height: 160, borderRadius: 80, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={item.icon} size={72} color={colors.primary} />
            </View>
            <Text_ variant="display" style={{ marginTop: spacing.xxl, textAlign: 'center' }}>{item.title}</Text_>
            <Text_ muted style={{ marginTop: spacing.md, textAlign: 'center' }}>{item.body}</Text_>
          </View>
        )}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: spacing.lg }}>
        {SLIDES.map((_, i) => (
          <View key={i} style={{ width: i === index ? 22 : 8, height: 8, borderRadius: radius.pill, marginHorizontal: 4, backgroundColor: i === index ? colors.primary : colors.border }} />
        ))}
      </View>
      <View style={{ padding: spacing.lg, paddingBottom: spacing.xl }}>
        <Button
          title={isLast ? 'Get started' : 'Next'}
          onPress={isLast ? goLogin : () => setIndex((i) => Math.min(i + 1, SLIDES.length - 1))}
          icon={isLast ? 'arrow-forward' : undefined}
        />
      </View>
    </Screen>
  );
}
