import { useState } from "react";
import IngredientInput from "../../components/IngredientInput";
import FormField, { inputClass, buttonClass } from "../../components/FormField";

// Fields mirror the backend profileSchema exactly:
// fullName, contactNumber, dateOfBirth, SocialMedia[], profession, hobbies[], bio
export default function ProfileForm({ initial = {}, onSubmit, submitting, submitLabel = "Save Profile" }) {
  const [form, setForm] = useState({
    fullName: initial.fullName || "",
    contactNumber: initial.contactNumber || "",
    dateOfBirth: (initial.dateOfBirth || initial.dateOfBrith || "").toString().slice(0, 10),
    profession: initial.profession || "",
    bio: initial.bio || "",
  });
  const [hobbies, setHobbies] = useState(initial.hobbies || []);
  const [socialMedia, setSocialMedia] = useState(initial.SocialMedia || []);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      fullName: form.fullName.trim(),
      bio: form.bio.trim(),
      profession: form.profession.trim(),
      contactNumber: form.contactNumber.trim(),
      hobbies,
      SocialMedia: socialMedia,
    };
    if (form.dateOfBirth) payload.dateOfBirth = form.dateOfBirth;
    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <FormField label="Full name">
        <input required value={form.fullName} onChange={update("fullName")} className={inputClass} placeholder="Vikash Kumar" />
      </FormField>

      <FormField label="Bio">
        <textarea value={form.bio} onChange={update("bio")} rows={3} className={inputClass} placeholder="Tell people about your cooking..." />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Profession">
          <input value={form.profession} onChange={update("profession")} className={inputClass} placeholder="Home cook / Chef" />
        </FormField>
        <FormField label="Contact number">
          <input value={form.contactNumber} onChange={update("contactNumber")} className={inputClass} placeholder="9876543210" />
        </FormField>
      </div>

      <FormField label="Date of birth">
        <input type="date" value={form.dateOfBirth} onChange={update("dateOfBirth")} className={inputClass} />
      </FormField>

      <FormField label="Hobbies">
        <IngredientInput items={hobbies} onChange={setHobbies} placeholder="e.g. baking" />
      </FormField>

      <FormField label="Social media links">
        <IngredientInput items={socialMedia} onChange={setSocialMedia} placeholder="https://instagram.com/you" />
      </FormField>

      <button type="submit" disabled={submitting} className={buttonClass}>
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
