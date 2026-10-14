import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Button, Screen, Text_, TextField } from '@/src/components/ui';
import { authApi } from '@/src/api/services';
import { toApiError } from '@/src/api/errors';
import { useTheme } from '@/src/theme/ThemeProvider';
import { spacing } from '@/src/theme/tokens';
import { isEmail, validateReset } from '@/src/utils/validation';

export default function ForgotPassword() {
  const { colors } = useTheme();
  const [step, setStep] = useState<'email' | 'reset' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestCode = async () => {
    if (loading) return;
    setFormError(null);
    if (!isEmail(email)) return setErrors({ email: 'Enter a valid email address' });
    setErrors({});
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email.trim().toLowerCase());
      setInfo(res.message || 'If the account exists, a code has been sent.');
      setStep('reset');
    } catch (err) {
      setFormError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    if (loading) return;
    setFormError(null);
    const v = validateReset({ otp, newPassword, confirmNewPassword });
    setErrors(v);
    if (Object.keys(v).length) return;
    setLoading(true);
    try {
      await authApi.resetPassword({ email: email.trim().toLowerCase(), otp: otp.trim(), newPassword, confirmNewPassword });
      setStep('done');
    } catch (err) {
      setFormError(toApiError(err).message);
    } finally {
      setLoading(false);
      setNewPassword('');
      setConfirm('');
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingVertical: spacing.xl }}>
          <Text_ variant="display">Reset password</Text_>
          {step === 'email' ? (
            <>
              <Text_ muted style={{ marginVertical: spacing.xl }}>Enter your account email and we'll send a code.</Text_>
              <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" error={errors.email} />
              {formError ? <Text_ style={{ color: colors.danger, marginBottom: spacing.md }} accessibilityRole="alert">{formError}</Text_> : null}
              <Button title="Send code" onPress={requestCode} loading={loading} />
            </>
          ) : step === 'reset' ? (
            <>
              {info ? <Text_ muted style={{ marginVertical: spacing.lg }}>{info}</Text_> : null}
              <TextField label="Code from email" value={otp} onChangeText={setOtp} keyboardType="number-pad" error={errors.otp} />
              <TextField label="New password" value={newPassword} onChangeText={setNewPassword} secureTextEntry error={errors.newPassword} textContentType="newPassword" />
              <TextField label="Confirm new password" value={confirmNewPassword} onChangeText={setConfirm} secureTextEntry error={errors.confirmNewPassword} />
              {formError ? <Text_ style={{ color: colors.danger, marginBottom: spacing.md }} accessibilityRole="alert">{formError}</Text_> : null}
              <Button title="Update password" onPress={reset} loading={loading} />
            </>
          ) : (
            <>
              <Text_ variant="subtitle" style={{ color: colors.success, marginVertical: spacing.xl }}>Password updated. Log in with your new password.</Text_>
              <Button title="Back to login" onPress={() => router.replace('/(auth)/login')} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
