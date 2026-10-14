import React from 'react';
import {
  ActivityIndicator, Pressable, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle, Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeProvider';
import { radius, spacing, typography } from '@/src/theme/tokens';

export function Screen({ children, style, padded = true }: { children: React.ReactNode; style?: ViewStyle; padded?: boolean }) {
  const { colors } = useTheme();
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[{ flex: 1, backgroundColor: colors.background }, style]}>
      <View style={[{ flex: 1 }, padded && { paddingHorizontal: spacing.lg }]}>{children}</View>
    </SafeAreaView>
  );
}

export function Text_({ variant = 'body', muted = false, style, children, ...rest }: React.ComponentProps<typeof Text> & { variant?: keyof typeof typography; muted?: boolean }) {
  const { colors } = useTheme();
  return (
    <Text {...rest} style={[typography[variant], { color: muted ? colors.textMuted : colors.text }, style]}>
      {children}
    </Text>
  );
}

export function Button({
  title, onPress, variant = 'primary', loading = false, disabled = false, icon, accessibilityHint,
}: {
  title: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean; disabled?: boolean; icon?: keyof typeof Ionicons.glyphMap; accessibilityHint?: string;
}) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;
  const bg = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : variant === 'secondary' ? colors.primarySoft : 'transparent';
  const fg = variant === 'primary' || variant === 'danger' ? colors.primaryText : variant === 'secondary' ? colors.primary : colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={onPress}
      disabled={isDisabled}
      android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: isDisabled ? 0.5 : pressed && Platform.OS === 'ios' ? 0.85 : 1 },
        variant === 'ghost' && { borderWidth: 0 },
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : (
        <>
          {icon ? <Ionicons name={icon} size={18} color={fg} style={{ marginRight: 6 }} /> : null}
          <Text style={{ color: fg, fontSize: 16, fontWeight: '600' }}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

export function TextField({ label, error, hint, ...props }: TextInputProps & { label: string; error?: string; hint?: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text_ variant="caption" muted style={{ marginBottom: spacing.xs }}>{label}</Text_>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        {...props}
        style={[
          styles.input,
          { backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border, color: colors.text },
        ]}
      />
      {error ? <Text_ variant="caption" style={{ color: colors.danger, marginTop: spacing.xs }} accessibilityLiveRegion="polite">{error}</Text_> : hint ? <Text_ variant="caption" muted style={{ marginTop: spacing.xs }}>{hint}</Text_> : null}
    </View>
  );
}

export function Card({ children, style, onPress, accessibilityLabel }: { children: React.ReactNode; style?: ViewStyle; onPress?: () => void; accessibilityLabel?: string }) {
  const { colors } = useTheme();
  const body = (
    <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }, style]}>{children}</View>
  );
  if (!onPress) return body;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} android_ripple={{ color: 'rgba(0,0,0,0.05)' }}>
      {body}
    </Pressable>
  );
}

export function Chip({ label, onRemove, selected, onPress }: { label: string; onRemove?: () => void; selected?: boolean; onPress?: () => void }) {
  const { colors } = useTheme();
  const content = (
    <View style={[styles.chip, { backgroundColor: selected ? colors.primary : colors.primarySoft }]}>
      <Text style={{ color: selected ? colors.primaryText : colors.primary, fontWeight: '600', fontSize: 14 }}>{label}</Text>
      {onRemove ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${label}`} onPress={onRemove} hitSlop={10} style={{ marginLeft: 6 }}>
          <Ionicons name="close" size={16} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
  if (!onPress) return content;
  return <Pressable accessibilityRole="button" accessibilityState={{ selected: !!selected }} onPress={onPress}>{content}</Pressable>;
}

export function Loading({ label = 'Loading…' }: { label?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.center} accessibilityLabel={label}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text_ muted style={{ marginTop: spacing.md }}>{label}</Text_>
    </View>
  );
}

export function EmptyState({ icon = 'restaurant-outline', title, body, action }: { icon?: keyof typeof Ionicons.glyphMap; title: string; body?: string; action?: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.center}>
      <View style={[styles.iconCircle, { backgroundColor: colors.primarySoft }]}>
        <Ionicons name={icon} size={32} color={colors.primary} />
      </View>
      <Text_ variant="subtitle" style={{ marginTop: spacing.lg, textAlign: 'center' }}>{title}</Text_>
      {body ? <Text_ muted style={{ marginTop: spacing.sm, textAlign: 'center' }}>{body}</Text_> : null}
      {action ? <View style={{ marginTop: spacing.lg }}>{action}</View> : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={styles.center} accessibilityRole="alert">
      <View style={[styles.iconCircle, { backgroundColor: colors.dangerSoft }]}>
        <Ionicons name="alert-circle-outline" size={32} color={colors.danger} />
      </View>
      <Text_ variant="subtitle" style={{ marginTop: spacing.lg, textAlign: 'center' }}>{message}</Text_>
      {onRetry ? <View style={{ marginTop: spacing.lg, width: 180 }}><Button title="Try again" onPress={onRetry} variant="secondary" icon="refresh" /></View> : null}
    </View>
  );
}

export function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: spacing.xl }}>
      <View style={styles.sectionHeader}>
        <Text_ variant="title">{title}</Text_>
        {action}
      </View>
      {children}
    </View>
  );
}

export function BottomInset() {
  const insets = useSafeAreaInsets();
  return <View style={{ height: insets.bottom + spacing.lg }} />;
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52, borderRadius: radius.md, paddingHorizontal: spacing.lg,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
  },
  input: {
    minHeight: 52, borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.md,
    fontSize: 16,
  },
  card: {
    borderRadius: radius.lg, padding: spacing.lg,
    shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  chip: {
    flexDirection: 'row', alignItems: 'center', borderRadius: radius.pill,
    paddingVertical: 6, paddingHorizontal: 12, marginRight: 8, marginBottom: 8,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  iconCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
});
