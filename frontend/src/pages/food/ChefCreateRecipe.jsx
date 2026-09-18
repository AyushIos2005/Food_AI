import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ImagePlus, X } from "lucide-react";
import { uploadFood } from "../../api/food.api";
import { getErrorMessage } from "../../lib/errorMessage";
import IngredientInput from "../../components/IngredientInput";
import FormField, { inputClass, buttonClass } from "../../components/FormField";

export default function ChefCreateRecipe() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [foodName, setFoodName] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [precautions, setPrecautions] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!image) return toast.error("Add a food image.");
    if (!foodName.trim()) return toast.error("Food name is required.");
    if (ingredients.length === 0) return toast.error("Add at least one ingredient.");
    if (!precautions.trim() || !description.trim()) return toast.error("Precautions and description are required.");

    const formData = new FormData();
    formData.append("foodImage", image);
    formData.append("foodName", foodName.trim());
    formData.append("ingredients", JSON.stringify(ingredients));
    formData.append("precautions", precautions.trim());
    formData.append("description", description.trim());

    setSubmitting(true);
    try {
      await uploadFood(formData);
      toast.success("Recipe published successfully");
      navigate("/chef/recipes");
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to upload recipe."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Chef Tools</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Publish a Recipe</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <FormField label="Food Image">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Preview" className="h-48 w-full rounded-xl object-cover" />
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setPreview(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-ink/70 text-white"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 text-muted transition-all duration-200 hover:border-primary hover:text-primary"
            >
              <ImagePlus size={22} />
              <span className="text-sm font-medium">Upload food image</span>
            </button>
          )}
        </FormField>

        <FormField label="Food Name">
          <input required value={foodName} onChange={(e) => setFoodName(e.target.value)} className={inputClass} placeholder="Paneer Tikka" />
        </FormField>

        <FormField label="Ingredients">
          <IngredientInput items={ingredients} onChange={setIngredients} />
        </FormField>

        <FormField label="Precautions">
          <textarea
            required
            value={precautions}
            onChange={(e) => setPrecautions(e.target.value)}
            rows={2}
            className={inputClass}
            placeholder="e.g. contains dairy, not suitable for nut allergies"
          />
        </FormField>

        <FormField label="Description">
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={inputClass}
            placeholder="Tell people what makes this dish special..."
          />
        </FormField>

        <button type="submit" disabled={submitting} className={buttonClass}>
          {submitting ? "Publishing..." : "Publish Recipe"}
        </button>
      </form>
    </div>
  );
}
