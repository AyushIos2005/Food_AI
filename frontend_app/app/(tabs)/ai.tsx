import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Chip, Screen, Text_, TextField } from '@/src/components/ui';
import { aiApi } from '@/src/api/services';
import { toApiError } from '@/src/api/errors';
import { useTheme } from '@/src/theme/ThemeProvider';
import { radius, spacing } from '@/src/theme/tokens';
import { cleanIngredients, validateGenerate } from '@/src/utils/validation';

type Mode = 'generate' | 'recreate';

export default function AiScreen() {
  const { colors } = useTheme();
  const [mode, setMode] = useState<Mode>('generate');

  // Generate form state. Preserved across failed requests so the user never loses input.
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [servings, setServings] = useState(2);
  const [medical, setMedical] = useState('');
  const [genErrors, setGenErrors] = useState<Record<string, string>>({});

  // Recreate form state.
  const [existingName, setExistingName] = useState('');
  const [addOn, setAddOn] = useState<string[]>([]);
  const [addOnInput, setAddOnInput] = useState('');
  const [recErrors, setRecErrors] = useState<Record<string, string>>({});

  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false); // blocks double submission even before state updates
  const [formError, setFormError] = useState<{ message: string; retryable: boolean } | null>(null);

  const addChip = (value: string, list: string[], set: (v: string[]) => void, clear: () => void) => {
    const next = cleanIngredients([...list, value]);
    set(next);
    clear();
  };

  const submitGenerate = async () => {
    if (inFlight.current) return;
    const v = validateGenerate({ ingredients: [...ingredients, ingredientInput].filter(Boolean), servings, medical });
    setGenErrors(v);
    setFormError(null);
    if (Object.keys(v).length) return;
    const list = cleanIngredients([...ingredients, ingredientInput]);
    inFlight.current = true;
    setBusy(true);
    try {
      const item = await aiApi.generate({
        ingredient: list,
        numberofperson: servings,
        anyMedical: medical.trim() || undefined,
      });
      router.push({ pathname: '/history/[id]', params: { id: item._id } });
    } catch (err) {
      const e = toApiError(err);
      setFormError({ message: e.message, retryable: e.retryable });
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  const submitRecreate = async () => {
    if (inFlight.current) return;
    const errs: Record<string, string> = {};
    const name = existingName.trim();
    const adds = cleanIngredients([...addOn, addOnInput]);
    if (!name) errs.existingName = 'Enter the dish you want to recreate';
    if (adds.length === 0) errs.addOn = 'Add at least one ingredient';
    setRecErrors(errs);
    setFormError(null);
    if (Object.keys(errs).length) return;
    inFlight.current = true;
    setBusy(true);
    try {
      const item = await aiApi.recreate({ existingFoodname: name, AddOnIngredient: adds });
      router.push({ pathname: '/history/[id]', params: { id: item._id } });
    } catch (err) {
      const e = toApiError(err);
      setFormError({ message: e.message, retryable: e.retryable });
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: spacing.xxl }}>
          <Text_ variant="display">AI kitchen</Text_>
          <View accessibilityRole="tablist" style={{ flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, padding: 4, marginTop: spacing.lg }}>
            {(['generate', 'recreate'] as Mode[]).map((m) => (
              <Pressable key={m} accessibilityRole="tab" accessibilityState={{ selected: mode === m }} onPress={() => { setMode(m); setFormError(null); }} style={{ flex: 1, paddingVertical: 10, borderRadius: radius.pill, alignItems: 'center', backgroundColor: mode === m ? colors.primary : 'transparent' }}>
                <Text_ style={{ color: mode === m ? colors.primaryText : colors.text, fontWeight: '600' }}>{m === 'generate' ? 'Generate' : 'Recreate'}</Text_>
              </Pressable>
            ))}
          </View>

          {mode === 'generate' ? (
            <View style={{ marginTop: spacing.xl }}>
              <Text_ variant="subtitle" style={{ marginBottom: spacing.sm }}>Ingredients you have</Text_>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                <View style={{ flex: 1 }}>
                  <TextField label="Add ingredient" value={ingredientInput} onChangeText={setIngredientInput} onSubmitEditing={() => addChip(ingredientInput, ingredients, setIngredients, () => setIngredientInput(''))} returnKeyType="done" error={genErrors.ingredients} />
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel="Add ingredient" onPress={() => addChip(ingredientInput, ingredients, setIngredients, () => setIngredientInput(''))} style={{ width: 52, height: 52, marginLeft: spacing.sm, marginBottom: spacing.lg, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="add" size={24} color={colors.primaryText} />
                </Pressable>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {ingredients.map((i) => <Chip key={i} label={i} onRemove={() => setIngredients(ingredients.filter((x) => x !== i))} />)}
              </View>

              <Text_ variant="subtitle" style={{ marginTop: spacing.lg, marginBottom: spacing.sm }}>Servings</Text_>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Pressable accessibilityRole="button" accessibilityLabel="Fewer servings" onPress={() => setServings((s) => Math.max(1, s - 1))} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="remove" size={20} color={colors.text} />
                </Pressable>
                <Text_ variant="title" style={{ marginHorizontal: spacing.lg, minWidth: 32, textAlign: 'center' }} accessibilityLiveRegion="polite">{servings}</Text_>
                <Pressable accessibilityRole="button" accessibilityLabel="More servings" onPress={() => setServings((s) => Math.min(50, s + 1))} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="add" size={20} color={colors.text} />
                </Pressable>
              </View>
              {genErrors.servings ? <Text_ variant="caption" style={{ color: colors.danger, marginTop: spacing.xs }}>{genErrors.servings}</Text_> : null}

              <View style={{ marginTop: spacing.lg }}>
                <TextField label="Allergies or health notes (optional)" value={medical} onChangeText={setMedical} multiline maxLength={500} error={genErrors.medical} hint="The AI takes this into account, but it is not medical advice." />
              </View>

              {formError ? <ErrorCard message={formError.message} onRetry={formError.retryable ? submitGenerate : undefined} /> : null}
              <Button title="Generate recipe" icon="sparkles" onPress={submitGenerate} loading={busy} accessibilityHint="Sends your ingredients to the AI. This can take up to a minute." />
            </View>
          ) : (
            <View style={{ marginTop: spacing.xl }}>
              <TextField label="Dish you want to recreate" value={existingName} onChangeText={setExistingName} error={recErrors.existingName} />
              <Text_ variant="subtitle" style={{ marginBottom: spacing.sm }}>Ingredients to add or swap in</Text_>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                <View style={{ flex: 1 }}>
                  <TextField label="Add ingredient" value={addOnInput} onChangeText={setAddOnInput} onSubmitEditing={() => addChip(addOnInput, addOn, setAddOn, () => setAddOnInput(''))} returnKeyType="done" error={recErrors.addOn} />
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel="Add ingredient" onPress={() => addChip(addOnInput, addOn, setAddOn, () => setAddOnInput(''))} style={{ width: 52, height: 52, marginLeft: spacing.sm, marginBottom: spacing.lg, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="add" size={24} color={colors.primaryText} />
                </Pressable>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {addOn.map((i) => <Chip key={i} label={i} onRemove={() => setAddOn(addOn.filter((x) => x !== i))} />)}
              </View>
              {formError ? <ErrorCard message={formError.message} onRetry={formError.retryable ? submitRecreate : undefined} /> : null}
              <View style={{ marginTop: spacing.lg }}>
                <Button title="Recreate recipe" icon="refresh" onPress={submitRecreate} loading={busy} />
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function ErrorCard({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { colors } = useTheme();
  return (
    <Card style={{ backgroundColor: colors.dangerSoft, marginTop: spacing.lg, marginBottom: spacing.md }}>
      <Text_ style={{ color: colors.danger }} accessibilityRole="alert">{message}</Text_>
      {onRetry ? <View style={{ marginTop: spacing.md, width: 160 }}><Button title="Try again" variant="secondary" onPress={onRetry} icon="refresh" /></View> : null}
    </Card>
  );
}
