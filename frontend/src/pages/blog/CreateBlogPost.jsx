import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ImagePlus, X, Link2 } from "lucide-react";
import { createBlog } from "../../api/blog.api";
import { getErrorMessage } from "../../lib/errorMessage";
import FormField, { inputClass, buttonClass } from "../../components/FormField";

const socialFields = [
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "twitter", label: "Twitter" },
  { key: "youtube", label: "YouTube" },
  { key: "linkedin", label: "LinkedIn" },
];

export default function CreateBlogPost() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [description, setDescription] = useState("");
  const [social, setSocial] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function handleFiles(e) {
    const picked = Array.from(e.target.files || []);
    if (files.length + picked.length > 10) {
      toast.error("Maximum 10 files are allowed.");
      return;
    }
    setFiles((prev) => [...prev, ...picked]);
  }

  function removeFile(i) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (files.length === 0) return toast.error("Please upload at least one image or video");
    if (!description.trim()) return toast.error("Blog description is required");

    const socialLinks = Object.entries(social)
      .filter(([, value]) => value?.trim())
      .map(([platform, platformId]) => ({ platform, platformId: platformId.trim(), url: platformId.trim() }));

    const formData = new FormData();
    files.forEach((f) => formData.append("media", f));
    formData.append("description", description.trim());
    formData.append("socialLinks", JSON.stringify(socialLinks));

    setSubmitting(true);
    try {
      await createBlog(formData);
      toast.success("Post published successfully");
      navigate("/community");
    } catch (err) {
      toast.error(getErrorMessage(err, "Unable to publish this post."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Food Community</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Create Post</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <FormField label="Photos / Videos">
          <input ref={fileRef} type="file" accept="image/*,video/*" multiple onChange={handleFiles} className="hidden" />
          <div className="flex flex-wrap gap-3">
            {files.map((f, i) => (
              <div key={i} className="relative h-20 w-20 overflow-hidden rounded-xl border border-slate-200 bg-bg">
                {f.type.startsWith("video") ? (
                  <video src={URL.createObjectURL(f)} className="h-full w-full object-cover" />
                ) : (
                  <img src={URL.createObjectURL(f)} className="h-full w-full object-cover" alt="" />
                )}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-white"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 text-muted transition-all duration-200 hover:border-primary hover:text-primary"
            >
              <ImagePlus size={18} />
              <span className="text-[10px] font-medium">Add Media</span>
            </button>
          </div>
          <p className="mt-1.5 text-xs text-muted">Up to 10 files, 50MB each — JPG, PNG, WEBP, MP4, WEBM, MOV.</p>
        </FormField>

        <FormField label="Description">
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={inputClass}
            placeholder="Write your food story... use #hashtags to reach more people"
          />
        </FormField>

        <FormField label="Social Links (optional)">
          <div className="space-y-2">
            {socialFields.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                <Link2 size={15} className="shrink-0 text-muted" />
                <input
                  value={social[key] || ""}
                  onChange={(e) => setSocial((s) => ({ ...s, [key]: e.target.value }))}
                  className={inputClass}
                  placeholder={`${label} link or handle`}
                />
              </div>
            ))}
          </div>
        </FormField>

        <button type="submit" disabled={submitting} className={buttonClass}>
          {submitting ? "Publishing..." : "Publish"}
        </button>
      </form>
    </div>
  );
}
