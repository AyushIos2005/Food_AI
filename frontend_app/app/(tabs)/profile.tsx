import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, ErrorState, Loading, Screen, Text_, TextField } from '@/src/components/ui';
import { profileApi } from '@/src/api/services';
import { toApiError } from '@/src/api/errors';
import { useSession } from '@/src/store/session';
import { useTheme } from '@/src/theme/ThemeProvider';
import { spacing } from '@/src/theme/tokens';
import type { Profile } from '@/src/types/api';

type Form = { fullName: string; profession: string; contactNumber: string; bio: string; hobbies: string };
const empty: Form = { fullName: '', profession: '', contactNumber: '', bio: '', hobbies: '' };

export default function ProfileScreen() {
  const { user, signOut } = useSession();
  const { colors } = useTheme();
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const load = async () => {
    setLoadError(null);
    try {
      const p = await profileApi.get();
      setProfile(p);
      setForm(toForm(p));
    } catch (err) {
      setLoadError(toApiError(err).message);
    }
  };

  useEffect(() => { void load(); }, []);

  const save = async () => {
    if (saving) return;
    setSaveError(null);
    const body = {
      fullName: form.fullName.trim() || undefined,
      profession: form.profession.trim() || undefined,
      contactNumber: form.contactNumber.trim() || undefined,
      bio: form.bio.trim() || undefined,
      hobbies: form.hobbies.split(',').map((h) => h.trim()).filter(Boolean),
    };
    setSaving(true);
    try {
      const res = profile ? await profileApi.update(profile._id, body) : await profileApi.create(body);
      setProfile(res.profile);
      setEditing(false);
    } catch (err) {
      setSaveError(toApiError(err).message);
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    setLoggingOut(true);
    await signOut();
    setLoggingOut(false);
    router.replace('/(auth)/login');
  };

  if (profile === undefined && !loadError) return <Screen><Loading label="Loading profile…" /></Screen>;

  const showForm = editing || profile === null;

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: spacing.xxl }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text_ variant="display">Profile</Text_>
            <Pressable accessibilityRole="button" accessibilityLabel="Settings" onPress={() => router.push('/settings')} hitSlop={12}>
              <Ionicons name="settings-outline" size={24} color={colors.text} />
            </Pressable>
          </View>

          <Card style={{ marginTop: spacing.lg }}>
            <Text_ variant="subtitle">{user?.name || user?.username}</Text_>
            <Text_ muted>@{user?.username}</Text_>
            <Text_ muted>{user?.email}</Text_>
            <Text_ variant="caption" muted style={{ marginTop: spacing.xs }}>Role: {user?.role === 'chef' ? 'Chef' : 'Member'}</Text_>
          </Card>

          {loadError ? <ErrorState message={loadError} onRetry={load} /> : null}

          {!loadError ? (
            <Card style={{ marginTop: spacing.lg }}>
              {showForm ? (
                <>
                  <Text_ variant="subtitle" style={{ marginBottom: spacing.md }}>{profile ? 'Edit profile' : 'Create your profile'}</Text_>
                  <TextField label="Full name" value={form.fullName} onChangeText={(v) => setForm({ ...form, fullName: v })} />
                  <TextField label="Profession" value={form.profession} onChangeText={(v) => setForm({ ...form, profession: v })} />
                  <TextField label="Contact number" value={form.contactNumber} onChangeText={(v) => setForm({ ...form, contactNumber: v })} keyboardType="phone-pad" />
                  <TextField label="Hobbies (comma separated)" value={form.hobbies} onChangeText={(v) => setForm({ ...form, hobbies: v })} />
                  <TextField label="Bio" value={form.bio} onChangeText={(v) => setForm({ ...form, bio: v })} multiline maxLength={1000} />
                  {saveError ? <Text_ style={{ color: colors.danger, marginBottom: spacing.md }} accessibilityRole="alert">{saveError}</Text_> : null}
                  <Button title="Save profile" onPress={save} loading={saving} />
                  {profile ? <View style={{ marginTop: spacing.sm }}><Button title="Cancel" variant="ghost" onPress={() => { setEditing(false); setForm(toForm(profile)); }} /></View> : null}
                </>
              ) : (
                <>
                  <Row label="Full name" value={profile?.fullName} />
                  <Row label="Profession" value={profile?.profession} />
                  <Row label="Contact" value={profile?.contactNumber} />
                  <Row label="Hobbies" value={profile?.hobbies?.join(', ')} />
                  <Row label="Bio" value={profile?.bio} />
                  <View style={{ marginTop: spacing.md }}><Button title="Edit profile" variant="secondary" icon="create-outline" onPress={() => setEditing(true)} /></View>
                </>
              )}
            </Card>
          ) : null}

          <View style={{ marginTop: spacing.xl }}>
            <Button title="Log out" variant="danger" icon="log-out-outline" onPress={logout} loading={loggingOut} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text_ variant="caption" muted>{label}</Text_>
      <Text_>{value || '—'}</Text_>
    </View>
  );
}

function toForm(p: Profile | null | undefined): Form {
  if (!p) return empty;
  return {
    fullName: p.fullName ?? '',
    profession: p.profession ?? '',
    contactNumber: p.contactNumber ?? '',
    bio: p.bio ?? '',
    hobbies: (p.hobbies ?? []).join(', '),
  };
}
