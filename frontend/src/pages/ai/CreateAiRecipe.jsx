import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Minus, Plus, Sparkles } from "lucide-react";
import { createAiRecipe } from "../../api/ai.api";
import { getErrorMessage } from "../../lib/errorMessage";
import IngredientInput from "../../components/IngredientInput";
import FormField, { inputClass, buttonClass } from "../../components/FormField";

const steps = ["Analyzing ingredients", "Creating recipe", "Calculating nutrition", "Preparing instructions"];

export default function CreateAiRecipe() {
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState([]);
  const [persons, setPersons] = useState(2);
  const [medical, setMedical] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (ingredients.length === 0) {
      toast.error("Add at least one ingredient.");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await createAiRecipe({
        ingredient: ingredients,
        numberofperson: persons,
        anyMedical: medical,
      });
      navigate("/ai/result", { state: { food: data.data } });
    } catch (err) {
      toast.error(getErrorMessage(err, "Recipe generation failed."));
      setSubmitting(false);
    }
  }

  if (submitting) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-accent/30 animate-pulse-ring" />
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white">
            <Sparkles size={24} />
          </span>
        </div>
        <div>
          <p className="font-display text-xl font-semibold text-ink">FoodAI is thinking...</p>
          <ul className="mt-3 space-y-1.5 text-sm text-muted">
            {steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Create New Recipe</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink">What ingredients do you have?</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <FormField label="Ingredients">
          <IngredientInput items={ingredients} onChange={setIngredients} placeholder="e.g. tomato, paneer, onion" />
        </FormField>

        <FormField label="Number of persons">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setPersons((p) => Math.max(1, p - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-ink transition-all duration-200 hover:bg-bg"
            >
              <Minus size={15} />
            </button>
            <span className="w-8 text-center text-lg font-semibold text-ink">{persons}</span>
            <button
              type="button"
              onClick={() => setPersons((p) => Math.min(20, p + 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-ink transition-all duration-200 hover:bg-bg"
            >
              <Plus size={15} />
            </button>
          </div>
        </FormField>

        <FormField label="Medical condition / dietary restriction (optional)">
          <input value={medical} onChange={(e) => setMedical(e.target.value)} className={inputClass} placeholder="e.g. diabetic, low sodium" />
        </FormField>

        <button type="submit" className={buttonClass}>
          Generate Recipe
        </button>
      </form>
    </div>
  );
}
