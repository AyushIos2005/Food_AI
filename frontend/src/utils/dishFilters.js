import { asArray } from "../hooks/useAsync";

// Dishes only carry { foodName, description, ingredients[], precautions }, so
// diet / cuisine / difficulty are ESTIMATED from that text. That is fine for
// browsing, and the UI says so. If the backend later adds real fields, only
// this file has to change.

const MEAT = /\b(chicken|mutton|lamb|fish|prawns?|shrimp|beef|pork|bacon|ham|turkey|meat|keema|salmon|tuna|crab|sausage|eggs?)\b/i;
const PROTEIN = /(paneer|chicken|egg|dal|lentil|tofu|soy|fish|bean|chickpea|chana|rajma|yogurt|curd|whey|protein|quinoa|tempeh|prawn|shrimp|mutton|salmon|tuna|cottage cheese)/i;
const HEALTHY = /(salad|grill|steam|boiled|sprout|oats|quinoa|soup|lentil|dal|veggie|vegetable|smoothie|low.?(fat|oil|cal)|fib(re|er)|millet)/i;
const QUICK = /(quick|instant|easy|5.?min|10.?min|15.?min|20.?min|no.?cook|toast|sandwich|omelet)/i;
const DESSERT = /(cake|sweet|halwa|kheer|ice.?cream|pudding|brownie|cookie|gulab|jamun|dessert|chocolate|pastry|laddu|barfi|payasam|custard|mousse|tart)/i;
const SPICY = /(spicy|chil+i|masala|hot|pepper|schezwan|vindaloo|jalape)/i;

export const TAGS = [
  { key: "vegetarian", label: "Vegetarian" },
  { key: "protein", label: "High Protein" },
  { key: "healthy", label: "Healthy" },
  { key: "quick", label: "Quick" },
  { key: "dessert", label: "Dessert" },
];

export const CUISINES = [
  { key: "indian", label: "Indian", re: /(paneer|masala|biryani|\bdal\b|tikka|curry|roti|naan|samosa|dosa|idli|paratha|chaat|raita|sabzi|khichdi|pulao|tandoori|korma|poha|upma|chole|rajma|pav)/i },
  { key: "chinese", label: "Chinese", re: /(noodle|manchurian|fried rice|chow|hakka|schezwan|dumpling|momo|wonton)/i },
  { key: "italian", label: "Italian", re: /(pasta|pizza|risotto|lasagn|spaghetti|penne|carbonara|bruschetta|tiramisu|gnocchi|pesto|margherita)/i },
  { key: "mexican", label: "Mexican", re: /(taco|burrito|quesadilla|nacho|enchilada|fajita|guacamole|salsa)/i },
  { key: "japanese", label: "Japanese", re: /(sushi|ramen|teriyaki|miso|tempura|udon|katsu|onigiri)/i },
  { key: "continental", label: "Continental", re: /(steak|roast|salad|sandwich|burger|soup|bake|casserole|grill)/i },
];

export const LEVELS = [
  { key: "easy", label: "Easy", hint: "5 ingredients or fewer" },
  { key: "medium", label: "Medium", hint: "6 to 9 ingredients" },
  { key: "hard", label: "Involved", hint: "10+ ingredients" },
];

export const dishText = (d) =>
  `${d?.foodName || ""} ${d?.description || ""} ${asArray(d?.ingredients).join(" ")}`;

export const isVegetarian = (d) => !MEAT.test(dishText(d));

export function levelOf(d) {
  const n = asArray(d?.ingredients).length;
  if (n === 0) return null;
  return n <= 5 ? "easy" : n <= 9 ? "medium" : "hard";
}

export function tagsOf(d) {
  const text = dishText(d);
  const out = new Set();
  if (!MEAT.test(text)) out.add("vegetarian");
  if (PROTEIN.test(text)) out.add("protein");
  if (HEALTHY.test(text)) out.add("healthy");
  if (QUICK.test(text)) out.add("quick");
  if (DESSERT.test(text)) out.add("dessert");
  if (SPICY.test(text)) out.add("spicy");
  return out;
}

export const cuisineOf = (d) => {
  const text = dishText(d);
  return CUISINES.find((c) => c.re.test(text))?.key || null;
};

export function matchesQuery(d, query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return true;
  return (
    d.foodName?.toLowerCase().includes(q) ||
    d.description?.toLowerCase().includes(q) ||
    asArray(d.ingredients).some((i) => String(i).toLowerCase().includes(q))
  );
}

export function matchesFilters(d, { q, tags = [], cuisine = "", level = "" }) {
  if (!matchesQuery(d, q)) return false;
  if (tags.length) {
    const have = tagsOf(d);
    if (!tags.every((t) => have.has(t))) return false;
  }
  if (cuisine && cuisineOf(d) !== cuisine) return false;
  if (level && levelOf(d) !== level) return false;
  return true;
}

// Saved preference keys -> the estimated tags / cuisines above.
const PREF_TO_TAG = {
  vegetarian: "vegetarian",
  vegan: "vegetarian",
  "high-protein": "protein",
  healthy: "healthy",
  spicy: "spicy",
  "quick-meals": "quick",
  desserts: "dessert",
};

export function preferenceMatches(d, prefs) {
  const tags = tagsOf(d);
  const cuisine = cuisineOf(d);
  return asArray(prefs).filter((p) => (PREF_TO_TAG[p] ? tags.has(PREF_TO_TAG[p]) : cuisine === p));
}
