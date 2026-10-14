import type { AiRecipe, CatalogFood, HistoryItem } from '@/src/types/api';

export function recipeTitle(item: HistoryItem): string {
  const r = item.recipe;
  return r.recipeName || r.newFoodName || 'Untitled recipe';
}

export function isRecreate(item: HistoryItem): boolean {
  return 'existingFoodname' in item;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function chefName(food: CatalogFood): string {
  if (typeof food.chef === 'object' && food.chef?.username) return food.chef.username;
  return 'FoodAI chef';
}

/** Recipe fields that are empty on the server are hidden rather than invented. */
export function presentRecipeFields(r: AiRecipe) {
  return {
    title: r.recipeName || r.newFoodName || 'Untitled recipe',
    description: r.description?.trim() || '',
    ingredients: (r.ingredients || []).filter(Boolean),
    instructions: (r.instructions || []).filter(Boolean),
    time: r.preparationTime?.trim() || '',
    servings: typeof r.servings === 'number' ? r.servings : null,
    protein: r.proteinPerServing?.trim() || '',
    calories: r.caloriesPerServing?.trim() || '',
    proteinSources: (r.proteinSources || []).filter(Boolean),
    notes: (r.medicalConsiderations || []).filter(Boolean),
  };
}
