import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, createProfile, updateProfile } from "../api/profile";
import { useToast } from "../context/ToastContext";

export default function EditProfile() {
  const [profileId, setProfileId] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    contactNumber: "",
    dateOfBirth: "",
    profession: "",
    bio: "",
    hobbies: "",
    SocialMedia: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    getProfile()
      .then((res) => {
        const p = res.profile;
        setProfileId(p._id);
        setForm({
          fullName: p.fullName || "",
          contactNumber: p.contactNumber || "",
          dateOfBirth: p.dateOfBirth ? p.dateOfBirth.slice(0, 10) : "",
          profession: p.profession || "",
          bio: p.bio || "",
          hobbies: (p.hobbies || []).join(", "),
          SocialMedia: (p.SocialMedia || []).join(", "),
        });
      })
      .catch(() => {});
  }, []);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      fullName: form.fullName,
      contactNumber: form.contactNumber,
      dateOfBirth: form.dateOfBirth || undefined,
      profession: form.profession,
      bio: form.bio,
      hobbies: form.hobbies ? form.hobbies.split(",").map((h) => h.trim()).filter(Boolean) : [],
      SocialMedia: form.SocialMedia
        ? form.SocialMedia.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    };
    try {
      if (profileId) {
        await updateProfile(profileId, payload);
      } else {
        await createProfile(payload);
      }
      toast.success("Profile saved");
      navigate("/profile");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h2 className="font-display text-3xl mb-5">Edit profile</h2>
      <form onSubmit={submit} className="card p-5 flex flex-col gap-3">
        <input className="input-field" placeholder="Full name" value={form.fullName} onChange={update("fullName")} required />
        <input className="input-field" placeholder="Contact number" value={form.contactNumber} onChange={update("contactNumber")} />
        <input className="input-field" type="date" value={form.dateOfBirth} onChange={update("dateOfBirth")} />
        <input className="input-field" placeholder="Profession" value={form.profession} onChange={update("profession")} />
        <input className="input-field" placeholder="Hobbies (comma separated)" value={form.hobbies} onChange={update("hobbies")} />
        <input className="input-field" placeholder="Social media links (comma separated)" value={form.SocialMedia} onChange={update("SocialMedia")} />
        <textarea className="input-field min-h-[90px] resize-none" placeholder="Bio" value={form.bio} onChange={update("bio")} />
        <button className="btn-primary mt-2" disabled={loading}>
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
