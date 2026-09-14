import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadFood } from "../api/food";
import { useToast } from "../context/ToastContext";

export default function ChefCreateRecipe() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    foodName: "",
    ingredients: "",
    precautions: "",
    description: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const onFile = (e) => {
    const next = e.target.files?.[0] || null;
    setFile(next);
    setPreview(next ? URL.createObjectURL(next) : "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!file) {
      setError("A food image is required.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("foodImage", file);
      formData.append("foodName", form.foodName);
      formData.append("ingredients", form.ingredients);
      formData.append("precautions", form.precautions);
      formData.append("description", form.description);
      await uploadFood(formData);
      toast.success("Recipe published");
      navigate("/chef/recipes");
    } catch (err) {
      setError(err.message || "Could not publish this recipe.");
      toast.error(err.message || "Could not publish this recipe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-3xl sm:text-4xl mb-6">Create Recipe</h2>
      <form onSubmit={handleSubmit} className="card p-5 sm:p-6 flex flex-col gap-4">
        <label className="border-2 border-dashed border-(--color-line) rounded-2xl overflow-hidden cursor-pointer">
          <input type="file" accept="image/*" className="hidden" onChange={onFile} />
          {preview ? (
            <img src={preview} alt="" className="w-full aspect-[16/9] object-cover" />
          ) : (
            <div className="py-12 text-center text-ink-soft text-sm">Tap to add a food image</div>
          )}
        </label>
        <input className="input-field" placeholder="Food Name" value={form.foodName} onChange={update("foodName")} required />
        <input className="input-field" placeholder="Ingredients (comma separated)" value={form.ingredients} onChange={update("ingredients")} required />
        <textarea className="input-field min-h-[90px] resize-none" placeholder="Description" value={form.description} onChange={update("description")} required />
        <textarea className="input-field min-h-[80px] resize-none" placeholder="Precautions" value={form.precautions} onChange={update("precautions")} required />
        {error && <p className="text-[13px] text-red-500">{error}</p>}
        <button className="btn-primary" disabled={loading}>
          {loading ? "Publishing..." : "Publish Recipe"}
        </button>
      </form>
    </div>
  );
}
