import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Screen, Text_, TextField } from '@/src/components/ui';
import { authApi } from '@/src/api/services';
import { toApiError } from '@/src/api/errors';
import { useTheme } from '@/src/theme/ThemeProvider';
import { spacing } from '@/src/theme/tokens';
import { validateOtp } from '@/src/utils/validation';

export default function VerifyOtp() {
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const { colors } = useTheme();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (loading) return;
    const v = validateOtp({ otp });
    setFieldError(v.otp);
    setError(null);
    if (v.otp) return;
    setLoading(true);
    try {
      await authApi.verifyOtp({ email, otp: otp.trim() });
      setDone(true);
    } catch (err) {
      // Backend messages: "OTP expired", "Invalid OTP", "OTP not found or already used, please request again"
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Text_ variant="display">Verify your email</Text_>
      <Text_ muted style={{ marginTop: spacing.sm, marginBottom: spacing.xl }}>
        Enter the 6-digit code sent to {email || 'your email'}. Codes expire after 10 minutes.
      </Text_>
      {done ? (
        <>
          <Text_ variant="subtitle" style={{ color: colors.success, marginBottom: spacing.lg }}>Email verified. You can log in now.</Text_>
          <Button title="Go to login" onPress={() => router.replace('/(auth)/login')} />
        </>
      ) : (
        <>
          <TextField label="6-digit code" value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} error={fieldError} autoComplete="sms-otp" />
          {error ? <Text_ style={{ color: colors.danger, marginBottom: spacing.md }} accessibilityRole="alert">{error}</Text_> : null}
          <Button title="Verify" onPress={submit} loading={loading} />
          <Text_ variant="caption" muted style={{ marginTop: spacing.lg, textAlign: 'center' }}>
            Didn't get a code? Wait a minute, check spam, then register again after the code expires.
          </Text_>
        </>
      )}
    </Screen>
  );
}
