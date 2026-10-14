import Constants from 'expo-constants';

// Only PUBLIC, non-secret configuration may live here (EXPO_PUBLIC_* is bundled into the app).
const fromEnv = process.env.EXPO_PUBLIC_API_URL;
const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

export const API_BASE_URL: string = (fromEnv || 'http://10.0.2.2:3000/api').replace(/\/+$/, '');
export const REQUEST_TIMEOUT_MS = 20000;
export const AI_REQUEST_TIMEOUT_MS = 90000; // backend AI timeout is 45s plus retries
export const PRIVACY_POLICY_URL = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL || extra.privacyPolicyUrl || '';
export const TERMS_URL = process.env.EXPO_PUBLIC_TERMS_URL || extra.termsUrl || '';
export const SUPPORT_EMAIL = process.env.EXPO_PUBLIC_SUPPORT_EMAIL || extra.supportEmail || '';
