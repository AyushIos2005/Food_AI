import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, EmptyState, ErrorState, Loading, Section, Screen, Text_, BottomInset } from '@/src/components/ui';
import { RecipeCard } from '@/src/components/RecipeCard';
import { aiApi, foodApi } from '@/src/api/services';
import { useLoader } from '@/src/hooks/useLoader';
import { useSession } from '@/src/store/session';
import { useTheme } from '@/src/theme/ThemeProvider';
import { spacing, radius } from '@/src/theme/tokens';
import { recipeTitle, formatDate } from '@/src/utils/format';
import { rememberCatalogItem } from '@/src/store/catalogCache';
import type { CatalogFood, HistoryItem } from '@/src/types/api';

export default function Home() {
  const { user } = useSession();
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const featured = useLoader(() => foodApi.list({ page: 1, limit: 6 }), []);
  const recent = useLoader(async () => (await aiApi.history()).slice(0, 3), []);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([featured.reload(), recent.reload()]);
    setRefreshing(false);
    // reload functions are stable; deps intentionally empty
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCatalog = (f: CatalogFood) => {
    rememberCatalogItem(f);
    router.push({ pathname: '/recipes/[id]', params: { id: f._id } });
  };
  const openHistory = (h: HistoryItem) => router.push({ pathname: '/history/[id]', params: { id: h._id } });

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Text_ muted>Hello{user?.name ? ',' : ''}</Text_>
        <Text_ variant="display">{user?.name || user?.username || 'Foodie'} 👋</Text_>

        <Pressable
          accessibilityRole="search"
          accessibilityLabel="Search recipes"
          onPress={() => router.push({ pathname: '/(tabs)/discover', params: query ? { q: query } : {} })}
          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, minHeight: 52, marginTop: spacing.lg }}
        >
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <Text_ muted style={{ marginLeft: spacing.sm }}>Search recipes by name</Text_>
        </Pressable>

        <Pressable accessibilityRole="button" accessibilityLabel="Create a recipe with AI" onPress={() => router.push('/(tabs)/ai')} style={{ marginTop: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.primary, padding: spacing.lg, flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="sparkles" size={28} color={colors.primaryText} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text_ variant="subtitle" style={{ color: colors.primaryText }}>Generate a recipe with AI</Text_>
            <Text_ variant="caption" style={{ color: colors.primaryText, opacity: 0.85 }}>Turn the ingredients you have into a dish</Text_>
          </View>
          <Ionicons name="arrow-forward" size={20} color={colors.primaryText} />
        </Pressable>

        <Section title="Featured recipes" action={<Button title="See all" variant="ghost" onPress={() => router.push('/(tabs)/discover')} />}>
          {featured.loading && !featured.data ? <Loading label="Loading recipes…" /> :
            featured.error ? <ErrorState message={featured.error.message} onRetry={featured.reload} /> :
              !featured.data?.length ? <EmptyState title="No recipes yet" body="Chefs have not published recipes yet." /> : (
                <FlatList
                  horizontal
                  data={featured.data}
                  keyExtractor={(f) => f._id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: spacing.lg }}
                  renderItem={({ item }) => (
                    <RecipeCard width={220} title={item.foodName} subtitle={item.ingredients.slice(0, 3).join(', ')} imageUrl={item.foodImage} onPress={() => openCatalog(item)} />
                  )}
                />
              )}
        </Section>

        <Section title="Your AI recipes" action={<Button title="History" variant="ghost" onPress={() => router.push('/(tabs)/history')} />}>
          {recent.loading && !recent.data ? <Loading label="Loading…" /> :
            recent.error ? <ErrorState message={recent.error.message} onRetry={recent.reload} /> :
              !recent.data?.length ? (
                <Card>
                  <Text_ muted>You have not generated any recipes yet. Try the AI tab.</Text_>
                </Card>
              ) : recent.data.map((h) => (
                <Card key={h._id} onPress={() => openHistory(h)} style={{ marginBottom: spacing.md, flexDirection: 'row', alignItems: 'center' }} accessibilityLabel={recipeTitle(h)}>
                  <View style={{ flex: 1 }}>
                    <Text_ variant="subtitle" numberOfLines={1}>{recipeTitle(h)}</Text_>
                    <Text_ variant="caption" muted>{formatDate(h.createdAt)}</Text_>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </Card>
              ))}
        </Section>
        <BottomInset />
      </ScrollView>
    </Screen>
  );
}
