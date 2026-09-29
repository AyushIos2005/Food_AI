import { asArray } from "../hooks/useAsync";
import { parseServings } from "./format";

// The backend reads diet, allergies and any medical note from one free-text
// field (`anyMedical`), so the structured chips are folded into it.
export function buildMedicalNote({ diet = [], allergies = [], note = "" }) {
  const parts = [];
  if (diet.length) parts.push(`Dietary preferences: ${diet.join(", ")}`);
  if (allergies.length) parts.push(`Allergies, avoid strictly: ${allergies.join(", ")}`);
  if (note.trim()) parts.push(note.trim());
  return parts.join(". ");
}

// One-tap remixes. There is no "edit recipe" endpoint, so each remix asks the
// AI for a NEW version with the same inputs plus this instruction; the
// original stays untouched in the AI history.
export const REMIXES = [
  { key: "protein", label: "More Protein", note: "Make it higher in protein." },
  { key: "mild", label: "Less Spicy", note: "Make it mild: cut back the spice and chilli." },
  { key: "lowoil", label: "Less Oil", note: "Use much less oil; prefer steaming, baking or dry-roasting." },
  { key: "veg", label: "Make Vegetarian", note: "Make it fully vegetarian: replace any meat, fish or egg with vegetarian alternatives." },
];

// The inputs a history document was created from (or the closest equivalent).
export function baseInputs(doc) {
  const recipe = doc?.recipe || {};
  const own = asArray(doc?.ingredient).map(String);
  return {
    ingredient: own.length ? own : asArray(recipe.ingredients).map(String),
    numberofperson: doc?.numberofperson || parseServings(recipe.servings),
    anyMedical: doc?.anyMedical || "",
  };
}

// Payload for POST /ai-service/amzingFood (same contract as a fresh recipe).
export function remixPayload(doc, { note = "", addIngredient = "", servings = 0 } = {}) {
  const base = baseInputs(doc);
  const recreated = doc?.historyType === "recreated_food";
  const title = doc?.recipe?.recipeName || doc?.recipe?.newFoodName || doc?.existingFoodname || "";
  return {
    ingredient: addIngredient ? [...base.ingredient, addIngredient] : base.ingredient,
    numberofperson: servings || base.numberofperson,
    anyMedical: [base.anyMedical, recreated && title ? `Remix of "${title}"` : "", note].filter(Boolean).join(". "),
  };
}

// Plain-text version for the share sheet / clipboard.
export function recipeToText(title, recipe) {
  const ing = asArray(recipe?.ingredients).map((i) => `- ${i}`).join("\n");
  const steps = asArray(recipe?.instructions).map((s, i) => `${i + 1}. ${s}`).join("\n");
  return `${title}\n\nIngredients:\n${ing}\n\nMethod:\n${steps}\n\nMade with FOODAI`;
}
