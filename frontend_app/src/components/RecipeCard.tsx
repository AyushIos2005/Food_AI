import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Card, Text_ } from './ui';
import { useTheme } from '@/src/theme/ThemeProvider';
import { radius, spacing } from '@/src/theme/tokens';

export function RecipeCard({ title, subtitle, imageUrl, onPress, width }: {
  title: string; subtitle?: string; imageUrl?: string; onPress: () => void; width?: number;
}) {
  const { colors } = useTheme();
  return (
    <Card onPress={onPress} accessibilityLabel={title} style={{ ...styles.card, ...(width ? { width } : {}) }}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" transition={200} accessibilityIgnoresInvertColors />
      ) : (
        <View style={[styles.image, styles.placeholder, { backgroundColor: colors.primarySoft }]}>
          <Ionicons name="restaurant-outline" size={36} color={colors.primary} />
        </View>
      )}
      <View style={{ paddingTop: spacing.md }}>
        <Text_ variant="subtitle" numberOfLines={2}>{title}</Text_>
        {subtitle ? <Text_ variant="caption" muted numberOfLines={1} style={{ marginTop: 2 }}>{subtitle}</Text_> : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.md, marginBottom: spacing.md },
  image: { width: '100%', height: 140, borderRadius: radius.md, overflow: 'hidden' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
});
