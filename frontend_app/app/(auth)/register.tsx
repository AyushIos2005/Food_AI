import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Button, Screen, Text_, TextField } from '@/src/components/ui';
import { authApi } from '@/src/api/services';
import { toApiError } from '@/src/api/errors';
import { useTheme } from '@/src/theme/ThemeProvider';
import { spacing } from '@/src/theme/tokens';
import { validateRegister } from '@/src/utils/validation';

export default function Register() {
  const { colors } = useTheme();
  const [form, setForm] = useState({ username: '', name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (loading) return;
    const v = validateRegister(form);
    setErrors(v);
    setFormError(null);
    if (Object.keys(v).length) return;
    setLoading(true);
    try {
      const email = form.email.trim().toLowerCase();
      await authApi.register({ ...form, username: form.username.trim(), name: form.name.trim(), email });
      router.push({ pathname: '/(auth)/verify-otp', params: { email } });
    } catch (err) {
      setFormError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingVertical: spacing.xl }}>
          <Text_ variant="display">Create account</Text_>
          <Text_ muted style={{ marginBottom: spacing.xl }}>We will email you a 6-digit code to verify it's you.</Text_>
          <TextField label="Username" value={form.username} onChangeText={set('username')} autoCapitalize="none" autoCorrect={false} error={errors.username} />
          <TextField label="Full name" value={form.name} onChangeText={set('name')} error={errors.name} textContentType="name" />
          <TextField label="Email" value={form.email} onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" autoCorrect={false} error={errors.email} textContentType="emailAddress" />
          <TextField label="Password" value={form.password} onChangeText={set('password')} secureTextEntry hint="At least 6 characters" error={errors.password} textContentType="newPassword" />
          {formError ? <Text_ style={{ color: colors.danger, marginBottom: spacing.md }} accessibilityRole="alert">{formError}</Text_> : null}
          <Button title="Create account" onPress={submit} loading={loading} />
          <Pressable accessibilityRole="link" onPress={() => router.back()} style={{ alignSelf: 'center', marginTop: spacing.lg, padding: spacing.sm }}>
            <Text_ style={{ color: colors.primary, fontWeight: '600' }}>I already have an account</Text_>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
