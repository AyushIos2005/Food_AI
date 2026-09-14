const NON_VEG = /chicken|mutton|fish|egg|prawn|beef|pork|lamb|meat|bacon|shrimp|turkey/i;
const VEG = /veg|paneer|dal|salad|tofu|lentil|spinach|rice|tomato|cheese/i;

export function isVegetarian(dish) {
  const hay = `${dish?.foodName || ""} ${dish?.description || ""} ${(dish?.ingredients || []).join(" ")}`;
  if (NON_VEG.test(hay)) return false;
  if (VEG.test(hay)) return true;
  return true;
}

export function estimateTime(dish) {
  return dish?.preparationTime || dish?.time || dish?.cookTime || "30 mins";
}

export function estimateDifficulty(dish) {
  return dish?.difficulty || "Easy";
}

export function asIngredientList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const HERO_IMG =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80";
export const AUTH_IMG =
  "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80";
