import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { getProfile, updateProfile } from "../../api/profile.api";
import { getErrorMessage } from "../../lib/errorMessage";
import Loading from "../../components/Loading";
import ProfileForm from "./ProfileForm";

export default function EditProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(location.state?.profile || null);
  const [loading, setLoading] = useState(!location.state?.profile);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile) return;
    let active = true;
    getProfile()
      .then(({ data }) => active && setProfile(data.profile))
      .catch((err) => toast.error(getErrorMessage(err, "Couldn't load your profile.")))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [profile]);

  async function handleSubmit(payload) {
    setSubmitting(true);
    try {
      await updateProfile(profile._id, payload);
      toast.success("Profile updated successfully");
      navigate("/profile");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't update your profile."));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Loading full label="Loading your profile..." />;
  if (!profile) return null;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Profile</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Edit Profile</h1>
      </div>
      <ProfileForm initial={profile} onSubmit={handleSubmit} submitting={submitting} submitLabel="Update Profile" />
    </div>
  );
}
