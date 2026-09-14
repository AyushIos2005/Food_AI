import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as foodService from "../services/foodService";
import { getErrorMessage } from "../services/api";
import TopHeader from "../components/TopHeader";

// Chef-only screen — routed to from the bottom nav's "+" button when the
// logged-in user has role "chef". Maps to POST /api/food/upload.
export default function UploadFood() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    foodName: "",
    ingredients: "",
    precautions: "",
    description: "",
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("A food image is required.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      // Field name MUST be "foodImage" — matches multer's
      // upload.single("foodImage") in src/routes/food.route.js.
      formData.append("foodImage", file);
      formData.append("foodName", form.foodName);
      formData.append("ingredients", form.ingredients);
      formData.append("precautions", form.precautions);
      formData.append("description", form.description);

      await foodService.uploadFood(formData);
      navigate("/explore", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Could not upload this dish."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell pb-10">
      <TopHeader title="Upload Dish" />

      <form onSubmit={handleSubmit} className="px-5 flex flex-col gap-4">
        <label className="border-2 border-dashed border-ink/15 rounded-xl2 flex flex-col items-center justify-center py-10 text-ink-faint cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <span className="text-2xl mb-1">🍽️</span>
          <span className="text-sm">{file ? file.name : "Add a photo of your dish"}</span>
        </label>

        <input
          className="input-field"
          placeholder="Dish name"
          value={form.foodName}
          onChange={(e) => update("foodName", e.target.value)}
          required
        />
        <input
          className="input-field"
          placeholder="Ingredients (comma separated)"
          value={form.ingredients}
          onChange={(e) => update("ingredients", e.target.value)}
          required
        />
        <textarea
          className="input-field h-20 resize-none"
          placeholder="Description"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          required
        />
        <textarea
          className="input-field h-16 resize-none"
          placeholder="Precautions (allergens, spice level, etc.)"
          value={form.precautions}
          onChange={(e) => update("precautions", e.target.value)}
          required
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary mt-2">
          {loading ? "Uploading..." : "Upload Dish"}
        </button>
      </form>
    </div>
  );
}
