import { ScrollView, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Card, EmptyState, Screen, Section, Text_ } from '@/src/components/ui';
import { getCatalogItem } from '@/src/store/catalogCache';
import { chefName } from '@/src/utils/format';
import { spacing } from '@/src/theme/tokens';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function CatalogRecipe() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const food = getCatalogItem(String(id));

  if (!food) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Recipe' }} />
        <EmptyState icon="reader-outline" title="Recipe not loaded" body="Open this recipe again from Discover or Home." />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <Stack.Screen options={{ title: food.foodName }} />
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        {food.foodImage ? (
          <Image source={{ uri: food.foodImage }} style={{ width: '100%', height: 240 }} contentFit="cover" transition={200} accessibilityLabel={food.foodName} />
        ) : null}
        <View style={{ padding: spacing.lg }}>
          <Text_ variant="display">{food.foodName}</Text_>
          <Text_ muted style={{ marginTop: spacing.xs }}>By {chefName(food)}</Text_>

          {food.description ? (
            <Section title="About">
              <Text_>{food.description}</Text_>
            </Section>
          ) : null}

          {food.ingredients.length ? (
            <Section title="Ingredients">
              <Card>
                {food.ingredients.map((i, idx) => <Text_ key={`${i}-${idx}`} style={{ marginBottom: spacing.sm }}>• {i}</Text_>)}
              </Card>
            </Section>
          ) : null}

          {food.precautions ? (
            <Section title="Precautions">
              <Card style={{ backgroundColor: colors.dangerSoft }}>
                <Text_>{food.precautions}</Text_>
              </Card>
            </Section>
          ) : null}

          <Text_ variant="caption" muted style={{ marginTop: spacing.xl }}>
            Cooking steps are not available for chef recipes yet. Use the AI tab to generate step-by-step instructions.
          </Text_>
        </View>
      </ScrollView>
    </Screen>
  );
}
