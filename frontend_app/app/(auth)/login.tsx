import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Button, Screen, Text_, TextField } from '@/src/components/ui';
import { authApi } from '@/src/api/services';
import { toApiError } from '@/src/api/errors';
import { useSession } from '@/src/store/session';
import { useTheme } from '@/src/theme/ThemeProvider';
import { spacing } from '@/src/theme/tokens';
import { validateLogin } from '@/src/utils/validation';

export default function Login() {
  const { signIn } = useSession();
  const { colors } = useTheme();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (loading) return;
    const v = validateLogin({ identifier, password });
    setErrors(v);
    setFormError(null);
    if (Object.keys(v).length) return;
    setLoading(true);
    try {
      const id = identifier.trim();
      const isEmail = id.includes('@');
      const res = await authApi.login(isEmail ? { email: id.toLowerCase(), password } : { username: id, password });
      await signIn(res.user, res.token ?? null);
      router.replace('/(tabs)');
    } catch (err) {
      setFormError(toApiError(err).message);
    } finally {
      setLoading(false);
      setPassword('');
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: spacing.xl }}>
          <Text_ variant="display">Welcome back</Text_>
          <Text_ muted style={{ marginBottom: spacing.xl }}>Log in to continue cooking with FoodAI.</Text_>
          <TextField label="Username or email" value={identifier} onChangeText={setIdentifier} autoCapitalize="none" autoCorrect={false} error={errors.identifier} textContentType="username" />
          <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry error={errors.password} textContentType="password" onSubmitEditing={submit} returnKeyType="go" />
          {formError ? <Text_ style={{ color: colors.danger, marginBottom: spacing.md }} accessibilityRole="alert">{formError}</Text_> : null}
          <Button title="Log in" onPress={submit} loading={loading} />
          <Pressable accessibilityRole="link" onPress={() => router.push('/(auth)/forgot-password')} style={{ alignSelf: 'center', marginTop: spacing.lg, padding: spacing.sm }}>
            <Text_ style={{ color: colors.primary, fontWeight: '600' }}>Forgot password?</Text_>
          </Pressable>
          <Pressable accessibilityRole="link" onPress={() => router.push('/(auth)/register')} style={{ alignSelf: 'center', marginTop: spacing.sm, padding: spacing.sm }}>
            <Text_ muted>New here? <Text_ style={{ color: colors.primary, fontWeight: '600' }}>Create an account</Text_></Text_>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
