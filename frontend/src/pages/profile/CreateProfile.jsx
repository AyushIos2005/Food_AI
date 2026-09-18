import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createProfile } from "../../api/profile.api";
import { getErrorMessage } from "../../lib/errorMessage";
import ProfileForm from "./ProfileForm";

export default function CreateProfile() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(payload) {
    setSubmitting(true);
    try {
      await createProfile(payload);
      toast.success("Profile created successfully");
      navigate("/profile");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't create your profile."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Profile</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Complete your profile</h1>
      </div>
      <ProfileForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Create Profile" />
    </div>
  );
}
