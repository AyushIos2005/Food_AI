import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, EmptyState, ErrorState, Loading, Screen, Text_ } from '@/src/components/ui';
import { aiApi } from '@/src/api/services';
import { toApiError, type ApiError } from '@/src/api/errors';
import { useTheme } from '@/src/theme/ThemeProvider';
import { spacing, radius } from '@/src/theme/tokens';
import { formatDate, isRecreate, recipeTitle } from '@/src/utils/format';
import type { HistoryItem } from '@/src/types/api';

interface PendingUndo { item: HistoryItem; index: number; }

export default function HistoryScreen() {
  const { colors } = useTheme();
  const [items, setItems] = useState<HistoryItem[] | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pending, setPending] = useState<PendingUndo | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setItems(await aiApi.history());
    } catch (err) {
      setError(toApiError(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
    return () => {
      if (undoTimer.current) clearTimeout(undoTimer.current);
    };
  }, [load]);

  const remove = (item: HistoryItem) => {
    Alert.alert('Delete this recipe?', 'You can undo this for a few seconds.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await aiApi.deleteOne(item._id);
            const idx = (items ?? []).findIndex((i) => i._id === item._id);
            setItems((prev) => (prev ?? []).filter((i) => i._id !== item._id));
            setPending({ item, index: idx });
            setNotice('Recipe deleted');
            if (undoTimer.current) clearTimeout(undoTimer.current);
            undoTimer.current = setTimeout(() => { setPending(null); setNotice(null); }, 6000);
          } catch (err) {
            setNotice(toApiError(err).message);
          }
        },
      },
    ]);
  };

  const undo = async () => {
    if (!pending) return;
    const { item } = pending;
    try {
      await aiApi.undo(item._id);
      // Re-fetch rather than re-insert locally, so the server is the source of truth.
      setPending(null);
      setNotice('Recipe restored');
      await load();
    } catch (err) {
      setNotice(toApiError(err).message);
    }
  };

  const clearAll = () => {
    Alert.alert('Clear all history?', 'All your AI recipes will be removed from this list.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear all', style: 'destructive', onPress: async () => {
          try {
            await aiApi.deleteAll();
            setPending(null);
            setNotice('History cleared');
            await load();
          } catch (err) {
            setNotice(toApiError(err).message);
          }
        },
      },
    ]);
  };

  if (loading && !items) return <Screen><Loading label="Loading history…" /></Screen>;
  if (error && !items) return <Screen><ErrorState message={error.message} onRetry={load} /></Screen>;

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.lg, marginBottom: spacing.md }}>
        <Text_ variant="display">History</Text_>
        {items && items.length ? <Button title="Clear all" variant="ghost" onPress={clearAll} icon="trash-outline" /> : null}
      </View>

      {notice ? (
        <Card style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, paddingVertical: spacing.md }}>
          <Text_ style={{ flex: 1 }} accessibilityLiveRegion="polite">{notice}</Text_>
          {pending ? <Pressable accessibilityRole="button" accessibilityLabel="Undo delete" onPress={undo}><Text_ style={{ color: colors.primary, fontWeight: '700' }}>Undo</Text_></Pressable> : null}
        </Card>
      ) : null}

      <FlatList
        data={items ?? []}
        keyExtractor={(i) => i._id}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} tintColor={colors.primary} />}
        ListEmptyComponent={<EmptyState icon="time-outline" title="No history yet" body="Recipes you generate or recreate will appear here." action={<Button title="Generate a recipe" onPress={() => router.push('/(tabs)/ai')} />} />}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: spacing.md, flexDirection: 'row', alignItems: 'center' }}>
            <Pressable accessibilityRole="button" accessibilityLabel={`Open ${recipeTitle(item)}`} onPress={() => router.push({ pathname: '/history/[id]', params: { id: item._id } })} style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md }}>
                  <Ionicons name={isRecreate(item) ? 'refresh' : 'sparkles'} size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text_ variant="subtitle" numberOfLines={1}>{recipeTitle(item)}</Text_>
                  <Text_ variant="caption" muted>{isRecreate(item) ? 'Recreated' : 'Generated'} · {formatDate(item.createdAt)}</Text_>
                </View>
              </View>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={`Delete ${recipeTitle(item)}`} onPress={() => remove(item)} hitSlop={12} style={{ padding: spacing.sm, marginLeft: spacing.sm }}>
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </Pressable>
          </Card>
        )}
      />
    </Screen>
  );
}
