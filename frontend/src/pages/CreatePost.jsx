import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus, X } from "lucide-react";
import { createBlog } from "../api/blog";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../api/client";
import { Button, IconButton } from "../components/ui/Button";

const MAX_FILES = 10;
const MAX_FILE_MB = 50; // backend limit (blogUpload middleware)

// POST /api/blog/create-blog, multipart/form-data: description + media (1..10)
export default function CreatePost() {
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInput = useRef(null);
  const navigate = useNavigate();
  const toast = useToast();

  // Create each object URL once per file list and release it afterwards.
  const previews = useMemo(
    () => files.map((f) => ({ src: URL.createObjectURL(f), type: f.type })),
    [files]
  );
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.src)), [previews]);

  const onPickFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = ""; // allow picking the same file again
    const valid = picked.filter((f) => f.type.startsWith("image/") || f.type.startsWith("video/"));
    if (valid.length !== picked.length) setError("Only images and videos are allowed.");
    const small = valid.filter((f) => f.size <= MAX_FILE_MB * 1024 * 1024);
    if (small.length !== valid.length) setError(`Each file must be under ${MAX_FILE_MB} MB.`);
    setFiles((prev) => [...prev, ...small].slice(0, MAX_FILES));
  };

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
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
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append("description", description.trim());
      files.forEach((f) => formData.append("media", f)); // field name must be "media"
      await createBlog(formData, {
        onUploadProgress: (ev) => ev.total && setProgress(Math.round((ev.loaded / ev.total) * 100)),
      });
      toast.success("Post published");
      navigate("/community");
    } catch (err) {
      // Keep the form contents so the user can retry.
      const msg = getErrorMessage(err, "Couldn't publish your post. Try again.");
      setError(msg);
      toast.error(msg);
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
                  <img src={p.src} className="w-full h-full object-cover" alt="Selected media" />
                )}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  aria-label="Remove this file"
                  className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center"
                >
                  <X size={13} aria-hidden="true" />
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

        {error && <p role="alert" className="text-[14px] font-medium text-danger">{error}</p>}

        <Button type="submit" size="lg" loading={loading}>
          {loading ? (progress > 0 && progress < 100 ? `Uploading ${progress}%` : "Publishing...") : "Publish"}
        </Button>
      </form>
    </div>
  );
}
