import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Pencil, Phone, Cake, Briefcase, User as UserIcon, ChefHat, Settings, Link2, Users } from "lucide-react";
import { getProfile } from "../../api/profile.api";
import { getFollowers, getFollowing } from "../../api/user.api";
import { getErrorMessage } from "../../lib/errorMessage";
import { useAuth } from "../../context/AuthContext";
import { initials } from "../../lib/utils";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";

export default function Profile() {
  const { user, isChef } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let active = true;
    getProfile()
      .then(({ data }) => active && setProfile(data.profile))
      .catch((err) => {
        if (!active) return;
        if (err?.response?.status === 404) setMissing(true);
        else toast.error(getErrorMessage(err, "Couldn't load your profile."));
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    Promise.all([getFollowers(user.id), getFollowing(user.id)])
      .then(([f1, f2]) => {
        if (!active) return;
        setCounts({
          followers: f1.data.count ?? f1.data.followers?.length ?? 0,
          following: f2.data.count ?? f2.data.following?.length ?? 0,
        });
      })
      .catch(() => {});
    return () => { active = false; };
  }, [user?.id]);

  if (loading) return <Loading full label="Loading your profile..." />;

  if (missing || !profile) {
    return (
      <div className="mx-auto max-w-xl">
        <EmptyState
          icon={UserIcon}
          title="You haven't set up your profile yet."
          subtitle="Add your name, bio and a few details so the community knows who's cooking."
          actionLabel="Create Profile"
          actionTo="/profile/create"
        />
      </div>
    );
  }

  const dob = profile.dateOfBirth || profile.dateOfBrith;
  const details = [
    { icon: Briefcase, label: profile.profession },
    { icon: Phone, label: profile.contactNumber },
    { icon: Cake, label: dob ? new Date(dob).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : null },
  ].filter((d) => d.label);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-28 bg-gradient-to-br from-primary to-secondary" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex items-end justify-between">
            <span className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-secondary text-2xl font-semibold text-white">
              {initials(profile.fullName || user?.name || user?.username || "U")}
            </span>
            <button
              onClick={() => navigate("/profile/edit", { state: { profile } })}
              className="mb-1 flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-ink transition-all duration-200 hover:bg-bg"
            >
              <Pencil size={14} /> Edit
            </button>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-semibold text-ink">{profile.fullName || user?.name}</h1>
              {isChef && (
                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  <ChefHat size={11} /> Chef
                </span>
              )}
            </div>
            <p className="text-sm text-muted">@{user?.username}</p>
            {profile.bio && <p className="mt-3 text-sm text-ink/80">{profile.bio}</p>}
          </div>

          <div className="mt-4 flex gap-5 text-sm">
            <span className="flex items-center gap-1.5 text-ink">
              <Users size={14} className="text-muted" />
              <b>{counts.followers}</b> <span className="text-muted">followers</span>
            </span>
            <span className="flex items-center gap-1.5 text-ink">
              <b>{counts.following}</b> <span className="text-muted">following</span>
            </span>
          </div>

          {details.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-4 border-t border-slate-100 pt-4">
              {details.map(({ icon: Icon, label }, i) => (
                <span key={i} className="flex items-center gap-1.5 text-sm text-muted">
                  <Icon size={14} /> {label}
                </span>
              ))}
            </div>
          )}

          {profile.hobbies?.length > 0 && (
            <div className="mt-4">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">Hobbies</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.hobbies.map((h) => (
                  <span key={h} className="rounded-full bg-bg px-3 py-1 text-xs font-medium text-ink/80 border border-slate-200">{h}</span>
                ))}
              </div>
            </div>
          )}

          {profile.SocialMedia?.length > 0 && (
            <div className="mt-4">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">Social</p>
              <ul className="space-y-1">
                {profile.SocialMedia.map((s, i) => (
                  <li key={i}>
                    <a href={s} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-secondary hover:underline">
                      <Link2 size={13} /> {s}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link to="/ai/history" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md">
          <p className="font-display text-base font-semibold text-ink">My AI Recipes</p>
          <p className="text-sm text-muted">Everything FoodAI cooked up for you</p>
        </Link>
        {isChef ? (
          <Link to="/chef/recipes" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md">
            <p className="font-display text-base font-semibold text-ink">My Published Recipes</p>
            <p className="text-sm text-muted">Manage the recipes you've shared</p>
          </Link>
        ) : (
          <Link to="/saved" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md">
            <p className="font-display text-base font-semibold text-ink">Saved Posts</p>
            <p className="text-sm text-muted">Posts you bookmarked</p>
          </Link>
        )}
      </div>

      <Link to="/settings/security" className="flex items-center gap-2 text-sm font-semibold text-secondary hover:underline">
        <Settings size={15} /> Account settings
      </Link>
    </div>
  );
}
