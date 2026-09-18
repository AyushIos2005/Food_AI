import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { RefreshCw } from "lucide-react";
import { recreateFood } from "../../api/ai.api";
import { getErrorMessage } from "../../lib/errorMessage";
import IngredientInput from "../../components/IngredientInput";
import FormField, { inputClass, buttonClass } from "../../components/FormField";

export default function RecreateFood() {
  const navigate = useNavigate();
  const [existingFoodname, setExistingFoodname] = useState("");
  const [addOns, setAddOns] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!existingFoodname.trim()) {
      toast.error("Tell us which food to recreate.");
      return;
    }
    if (addOns.length === 0) {
      toast.error("Add at least one new ingredient.");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await recreateFood({ existingFoodname: existingFoodname.trim(), AddOnIngredient: addOns });
      navigate("/ai/recreate/result", { state: { food: data.data } });
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't recreate this dish."));
      setSubmitting(false);
    }
  }

  if (submitting) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-accent/30 animate-pulse-ring" />
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-white">
            <RefreshCw size={24} />
          </span>
        </div>
        <p className="font-display text-xl font-semibold text-ink">FoodAI is reinventing {existingFoodname}...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">FoodAI</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Recreate Existing Food</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <FormField label="Existing food">
          <input
            value={existingFoodname}
            onChange={(e) => setExistingFoodname(e.target.value)}
            className={inputClass}
            placeholder="e.g. Paneer Tikka"
          />
        </FormField>

        <FormField label="Add ingredients">
          <IngredientInput items={addOns} onChange={setAddOns} placeholder="e.g. cheese, spinach" />
        </FormField>

        <button type="submit" className={buttonClass}>
          Create New Version
        </button>
      </form>
    </div>
  );
}
