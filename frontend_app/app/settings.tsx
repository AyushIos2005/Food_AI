import { Alert, Linking, Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Screen, Section, Text_ } from '@/src/components/ui';
import { useTheme, type ThemePreference } from '@/src/theme/ThemeProvider';
import { spacing, radius } from '@/src/theme/tokens';
import { PRIVACY_POLICY_URL, SUPPORT_EMAIL, TERMS_URL } from '@/src/config/env';
import { useSession } from '@/src/store/session';

const THEMES: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function Settings() {
  const { colors, preference, setPreference } = useTheme();
  const { signOut } = useSession();

  const openLink = (url: string, label: string) => {
    if (!url) return Alert.alert(label, 'This link is not configured in this build yet.');
    Linking.openURL(url).catch(() => Alert.alert(label, 'Could not open the link.'));
  };

  const contact = () => {
    if (!SUPPORT_EMAIL) return Alert.alert('Contact support', 'Support email is not configured in this build yet.');
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=FoodAI%20feedback`).catch(() => {});
  };

  const logout = () => {
    Alert.alert('Log out?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: async () => { await signOut(); router.replace('/(auth)/login'); } },
    ]);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: spacing.xxl }}>
        <Section title="Appearance">
          <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, padding: 4 }}>
            {THEMES.map((t) => (
              <Pressable key={t.value} accessibilityRole="radio" accessibilityState={{ checked: preference === t.value }} onPress={() => setPreference(t.value)} style={{ flex: 1, paddingVertical: 10, borderRadius: radius.pill, alignItems: 'center', backgroundColor: preference === t.value ? colors.primary : 'transparent' }}>
                <Text_ style={{ color: preference === t.value ? colors.primaryText : colors.text, fontWeight: '600' }}>{t.label}</Text_>
              </Pressable>
            ))}
          </View>
        </Section>

        <Section title="Legal & support">
          <Card style={{ padding: 0 }}>
            <LinkRow icon="shield-checkmark-outline" label="Privacy policy" onPress={() => openLink(PRIVACY_POLICY_URL, 'Privacy policy')} />
            <LinkRow icon="document-text-outline" label="Terms of service" onPress={() => openLink(TERMS_URL, 'Terms of service')} />
            <LinkRow icon="mail-outline" label="Contact or feedback" onPress={contact} last />
          </Card>
        </Section>

        <Section title="Account">
          <Card style={{ padding: 0 }}>
            <LinkRow icon="log-out-outline" label="Log out" onPress={logout} last danger />
          </Card>
          <Text_ variant="caption" muted style={{ marginTop: spacing.md }}>
            To delete your account, contact support. In-app account deletion is not available in this version.
          </Text_>
        </Section>
      </ScrollView>
    </Screen>
  );
}

function LinkRow({ icon, label, onPress, last, danger }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void; last?: boolean; danger?: boolean }) {
  const { colors } = useTheme();
  const tint = danger ? colors.danger : colors.text;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} android_ripple={{ color: 'rgba(0,0,0,0.05)' }} style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.border }}>
      <Ionicons name={icon} size={20} color={tint} />
      <Text_ style={{ flex: 1, marginLeft: spacing.md, color: tint }}>{label}</Text_>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}
