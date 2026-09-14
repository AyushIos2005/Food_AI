import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus, X } from "lucide-react";
import { createBlog } from "../api/blog";
import { useToast } from "../context/ToastContext";

export default function CreatePost() {
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInput = useRef(null);
  const navigate = useNavigate();
  const toast = useToast();

  const previews = files.map((f) => ({ src: URL.createObjectURL(f), type: f.type }));

  const onPickFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...picked].slice(0, 10));
  };

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!description.trim()) {
      setError("Please write something about your post.");
      return;
    }
    if (files.length === 0) {
      setError("Please add at least one image or video.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("description", description);
      files.forEach((f) => formData.append("media", f));
      await createBlog(formData);
      toast.success("Post published");
      navigate("/community");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <p className="text-[12px] tracking-[0.18em] text-orange-600 font-semibold">CREATE</p>
      <h2 className="font-display text-3xl mt-1 mb-6">Share a food story</h2>

      <form onSubmit={submit} className="card p-5 sm:p-6 flex flex-col gap-5">
        <div>
          <p className="text-[13px] font-semibold text-ink mb-2">Photos & videos</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="w-24 h-24 shrink-0 rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50 flex items-center justify-center text-orange-500"
            >
              <ImagePlus size={22} />
            </button>
            {previews.map((p, i) => (
              <div key={i} className="relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden">
                {p.type.startsWith("video") ? (
                  <video src={p.src} className="w-full h-full object-cover" />
                ) : (
                  <img src={p.src} className="w-full h-full object-cover" alt="" />
                )}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <input ref={fileInput} type="file" accept="image/*,video/*" multiple hidden onChange={onPickFiles} />
        </div>

        <div>
          <p className="text-[13px] font-semibold text-ink mb-2">Caption</p>
          <textarea
            className="input-field min-h-[150px] resize-none"
            placeholder="Write your food story... use #hashtags"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {error && <p className="text-[13px] text-red-500">{error}</p>}

        <button className="btn-primary" disabled={loading}>
          {loading ? "Publishing..." : "Publish"}
        </button>
      </form>
    </div>
  );
}
