import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus } from "lucide-react";
import { uploadFood } from "../api/food";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../api/client";
import { Button } from "../components/ui/Button";

const MAX_IMAGE_MB = 10;
const EMPTY = { foodName: "", ingredients: "", precautions: "", description: "" };

// Chef-only (role "chef"): POST /api/food/upload, multipart/form-data with
// fields foodImage (file), foodName, ingredients, precautions, description.
export default function UploadFood() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const pickFile = (e) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    if (!picked.type.startsWith("image/")) return setError("Please choose an image file.");
    if (picked.size > MAX_IMAGE_MB * 1024 * 1024) return setError(`Image must be under ${MAX_IMAGE_MB} MB.`);
    setError("");
    setFile(picked);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!file) return setError("A food image is required.");
    const ingredients = form.ingredients.split(",").map((i) => i.trim()).filter(Boolean);
    if (ingredients.length === 0) return setError("Add at least one ingredient.");

    setError("");
    setLoading(true);
    setProgress(0);
    try {
      const body = new FormData();
      body.append("foodImage", file); // must match multer's upload.single("foodImage")
      body.append("foodName", form.foodName.trim());
      body.append("ingredients", ingredients.join(","));
      body.append("precautions", form.precautions.trim());
      body.append("description", form.description.trim());

      const res = await uploadFood(body, {
        onUploadProgress: (ev) => ev.total && setProgress(Math.round((ev.loaded / ev.total) * 100)),
      });
      toast.success(res?.message || "Dish uploaded");
      setForm(EMPTY); // reset only after a successful upload
      setFile(null);
      navigate("/recipes", { replace: true });
    } catch (err) {
      const msg = getErrorMessage(err, "Couldn't upload the dish. Try again.");
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <p className="text-[12px] tracking-[0.18em] text-orange-600 font-semibold">CHEF</p>
      <h2 className="font-display text-3xl mt-1 mb-6">Upload a dish</h2>

      <form onSubmit={submit} className="card p-5 sm:p-6 flex flex-col gap-4">
        <label className="border-2 border-dashed border-orange-300 bg-orange-50 rounded-2xl flex flex-col items-center justify-center py-8 text-orange-600 cursor-pointer overflow-hidden">
          <input type="file" accept="image/*" className="hidden" onChange={pickFile} />
          {preview ? (
            <img src={preview} alt="Selected dish" className="max-h-52 rounded-xl object-cover" />
          ) : (
            <>
              <ImagePlus size={26} />
              <span className="text-sm mt-2">Add a photo of your dish</span>
            </>
          )}
        </label>

        <input className="input-field" placeholder="Dish name" value={form.foodName} onChange={update("foodName")} maxLength={120} required />
        <input className="input-field" placeholder="Ingredients (comma separated)" value={form.ingredients} onChange={update("ingredients")} required />
        <textarea className="input-field h-24 resize-none" placeholder="Description" value={form.description} onChange={update("description")} maxLength={5000} required />
        <textarea className="input-field h-20 resize-none" placeholder="Precautions (allergens, spice level, etc.)" value={form.precautions} onChange={update("precautions")} maxLength={2000} required />

        {error && <p role="alert" className="text-[14px] font-medium text-danger">{error}</p>}

        <Button type="submit" size="lg" loading={loading}>
          {loading ? (progress > 0 && progress < 100 ? `Uploading ${progress}%` : "Uploading...") : "Upload Dish"}
        </Button>
      </form>
    </div>
  );
}
