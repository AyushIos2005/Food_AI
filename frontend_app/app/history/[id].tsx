import { useEffect, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Button, ErrorState, Loading, Screen } from '@/src/components/ui';
import { RecipeView } from '@/src/components/RecipeView';
import { aiApi } from '@/src/api/services';
import { toApiError, type ApiError } from '@/src/api/errors';
import { spacing } from '@/src/theme/tokens';
import type { HistoryItem } from '@/src/types/api';

export default function HistoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<HistoryItem | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setItem(await aiApi.historyById(String(id)));
    } catch (err) {
      setError(toApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  const remove = () => {
    Alert.alert('Delete this recipe?', 'It will move out of your history. You can undo from the History tab for a few seconds.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          setDeleting(true);
          try {
            await aiApi.deleteOne(String(id));
            router.back();
          } catch (err) {
            Alert.alert('Could not delete', toApiError(err).message);
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: 'AI recipe' }} />
      {loading ? <Loading label="Loading recipe…" /> :
        error || !item ? <ErrorState message={error?.message ?? 'Recipe not found'} onRetry={load} /> : (
          <ScrollView contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: spacing.xxl }}>
            <RecipeView recipe={item.recipe} />
            <View style={{ marginTop: spacing.xl }}>
              <Button title="Delete recipe" variant="danger" onPress={remove} loading={deleting} icon="trash-outline" />
            </View>
          </ScrollView>
        )}
    </Screen>
  );
}
