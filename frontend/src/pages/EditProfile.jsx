import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProfile, deleteProfile, getProfile, updateProfile } from "../api/profile";
import { ErrorState, LoadingState } from "../components/States";
import { useToast } from "../context/ToastContext";
import { asArray, useAsync } from "../hooks/useAsync";

const EMPTY = {
  fullName: "",
  contactNumber: "",
  dateOfBirth: "",
  profession: "",
  bio: "",
  hobbies: "",
  SocialMedia: "",
};

const splitList = (value) => value.split(",").map((v) => v.trim()).filter(Boolean);

export default function EditProfile() {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const toast = useToast();

  // Backend: { message, profile }. 404 => no profile yet => "create" mode.
  const { data, loading, error: loadError, status, reload } = useAsync(
    (signal) => getProfile({ signal }),
    []
  );
  const profile = data?.profile || null;
  const profileId = profile?._id || null;

  useEffect(() => {
    if (!profile) return;
    setForm({
      fullName: profile.fullName || "",
      contactNumber: profile.contactNumber || "",
      dateOfBirth: profile.dateOfBirth ? String(profile.dateOfBirth).slice(0, 10) : "",
      profession: profile.profession || "",
      bio: profile.bio || "",
      hobbies: asArray(profile.hobbies).join(", "),
      SocialMedia: asArray(profile.SocialMedia).join(", "),
    });
  }, [profile]);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!form.fullName.trim()) return setError("Full name is required.");
    setError("");
    setSaving(true);
    const payload = {
      fullName: form.fullName.trim(),
      contactNumber: form.contactNumber.trim(),
      dateOfBirth: form.dateOfBirth || undefined,
      profession: form.profession.trim(),
      bio: form.bio.trim(),
      hobbies: splitList(form.hobbies),
      SocialMedia: splitList(form.SocialMedia),
    };
    try {
      const res = profileId ? await updateProfile(profileId, payload) : await createProfile(payload);
      toast.success(res?.message || "Profile saved");
      navigate("/profile");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!profileId || deleting) return;
    if (!window.confirm("Delete your profile details? This can't be undone.")) return;
    setDeleting(true);
    try {
      await deleteProfile(profileId);
      toast.success("Profile deleted");
      navigate("/profile", { replace: true });
    } catch (err) {
      toast.error(err.message);
      setDeleting(false);
    }
  };

  if (loading) return <LoadingState label="Loading profile..." />;
  // Only a real failure blocks the form; 404 just means "create".
  if (loadError && status !== 404) return <ErrorState message={loadError} onRetry={reload} />;

  return (
    <div className="max-w-xl">
      <h2 className="font-display text-3xl mb-5">{profileId ? "Edit profile" : "Create profile"}</h2>
      <form onSubmit={submit} className="card p-5 flex flex-col gap-3">
        <input className="input-field" placeholder="Full name" value={form.fullName} onChange={update("fullName")} maxLength={80} required />
        <input className="input-field" placeholder="Contact number" value={form.contactNumber} onChange={update("contactNumber")} maxLength={20} />
        <input className="input-field" type="date" value={form.dateOfBirth} onChange={update("dateOfBirth")} />
        <input className="input-field" placeholder="Profession" value={form.profession} onChange={update("profession")} maxLength={80} />
        <input className="input-field" placeholder="Hobbies (comma separated)" value={form.hobbies} onChange={update("hobbies")} />
        <input className="input-field" placeholder="Social media links (comma separated)" value={form.SocialMedia} onChange={update("SocialMedia")} />
        <textarea className="input-field min-h-[90px] resize-none" placeholder="Bio" value={form.bio} onChange={update("bio")} maxLength={1000} />
        {error && <p className="text-[13px] text-red-500">{error}</p>}
        <button className="btn-primary mt-2" disabled={saving || deleting}>
          {saving ? "Saving..." : "Save Profile"}
        </button>
        {profileId && (
          <button type="button" onClick={remove} disabled={saving || deleting} className="btn-outline text-red-500">
            {deleting ? "Deleting..." : "Delete profile"}
          </button>
        )}
      </form>
    </div>
  );
}
