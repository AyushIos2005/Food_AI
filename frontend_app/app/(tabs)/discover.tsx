import { useEffect, useRef, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { EmptyState, ErrorState, Loading, Screen, Text_, TextField } from '@/src/components/ui';
import { RecipeCard } from '@/src/components/RecipeCard';
import { foodApi } from '@/src/api/services';
import { toApiError, type ApiError } from '@/src/api/errors';
import { rememberCatalogItem } from '@/src/store/catalogCache';
import { useTheme } from '@/src/theme/ThemeProvider';
import { spacing } from '@/src/theme/tokens';
import type { CatalogFood } from '@/src/types/api';
import { chefName } from '@/src/utils/format';

const PAGE_SIZE = 12;

export default function Discover() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const { colors } = useTheme();
  const [search, setSearch] = useState(q ?? '');
  const [debounced, setDebounced] = useState(search);
  const [items, setItems] = useState<CatalogFood[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const seq = useRef(0);

  // Debounce search input (400 ms) so typing does not spam the API.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch page 1 whenever the search term changes; ignore stale responses.
  useEffect(() => {
    let mounted = true;
    const id = ++seq.current;
    setLoading(true);
    setError(null);
    foodApi.list({ page: 1, limit: PAGE_SIZE, search: debounced || undefined })
      .then((res) => {
        if (!mounted || id !== seq.current) return;
        setItems(res);
        setPage(1);
        setHasMore(res.length === PAGE_SIZE);
      })
      .catch((err) => {
        if (mounted && id === seq.current) setError(toApiError(err));
      })
      .finally(() => {
        if (mounted && id === seq.current) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [debounced]);

  const loadMore = async () => {
    if (loading || !hasMore || error) return;
    const next = page + 1;
    setLoading(true);
    try {
      const res = await foodApi.list({ page: next, limit: PAGE_SIZE, search: debounced || undefined });
      setItems((prev) => [...prev, ...res]);
      setPage(next);
      setHasMore(res.length === PAGE_SIZE);
    } catch (err) {
      setError(toApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    try {
      const res = await foodApi.list({ page: 1, limit: PAGE_SIZE, search: debounced || undefined });
      setItems(res);
      setPage(1);
      setHasMore(res.length === PAGE_SIZE);
      setError(null);
    } catch (err) {
      setError(toApiError(err));
    } finally {
      setRefreshing(false);
    }
  };

  const open = (f: CatalogFood) => {
    rememberCatalogItem(f);
    router.push({ pathname: '/recipes/[id]', params: { id: f._id } });
  };

  return (
    <Screen>
      <TextField label="Search by recipe name" value={search} onChangeText={setSearch} autoCapitalize="none" returnKeyType="search" accessibilityHint="Results update as you type" />
      {error && items.length === 0 ? (
        <ErrorState message={error.message} onRetry={refresh} />
      ) : loading && items.length === 0 ? (
        <Loading label="Finding recipes…" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(f) => f._id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={{ paddingBottom: spacing.xxl }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          ListEmptyComponent={<EmptyState icon="search-outline" title={debounced ? `No recipes match “${debounced}”` : 'No recipes yet'} body="Try a different name." />}
          ListFooterComponent={
            error && items.length > 0 ? <ErrorState message={error.message} onRetry={loadMore} /> :
              loading && items.length > 0 ? <View style={{ padding: spacing.lg }}><Text_ muted style={{ textAlign: 'center' }}>Loading more…</Text_></View> : null
          }
          renderItem={({ item }) => (
            <View style={{ width: '48%' }}>
              <RecipeCard title={item.foodName} subtitle={chefName(item)} imageUrl={item.foodImage} onPress={() => open(item)} />
            </View>
          )}
        />
      )}
    </Screen>
  );
}
