import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../api/profile";
import { getAllBlogs, getSavedBlogs } from "../api/blog";
import { useAuth } from "../context/AuthContext";
import { EmptyState, LoadingState } from "../components/States";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [saved, setSaved] = useState([]);
  const [tab, setTab] = useState("posts");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.allSettled([
      getProfile().then((res) => setProfile(res.profile)).catch(() => setProfile(null)),
      getAllBlogs().then((res) => setMyPosts((res.data || []).filter((b) => b.createdBy?._id === user?.id))),
      getSavedBlogs().then((res) => setSaved(res.data || [])),
    ]).finally(() => setLoading(false));
  }, [user?.id]);

  const list = tab === "posts" ? myPosts : saved;

  return (
    <div>
      <div className="card p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
        <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center text-3xl font-bold text-orange-600">
          {(profile?.fullName || user?.name || "U")[0]?.toUpperCase()}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="font-display text-3xl">{profile?.fullName || user?.name}</h2>
          <p className="text-ink-soft">@{user?.username}</p>
          {profile?.bio && <p className="text-[14px] text-ink-soft mt-2 max-w-xl">{profile.bio}</p>}
          {profile?.profession && <p className="text-[12px] text-orange-600 mt-1">{profile.profession}</p>}
          <div className="flex items-center justify-center sm:justify-start gap-8 mt-5">
            <div>
              <p className="text-[18px] font-bold">{myPosts.length}</p>
              <p className="text-[11px] text-ink-soft">Posts</p>
            </div>
            <div>
              <p className="text-[18px] font-bold">{myPosts.reduce((sum, b) => sum + (b.likes?.length || 0), 0)}</p>
              <p className="text-[11px] text-ink-soft">Likes</p>
            </div>
            <div>
              <p className="text-[18px] font-bold">{saved.length}</p>
              <p className="text-[11px] text-ink-soft">Saved</p>
            </div>
          </div>
          <button onClick={() => navigate("/profile/edit")} className="btn-outline mt-5 text-sm">
            Edit profile
          </button>
        </div>
      </div>

      <div className="flex border-b border-(--color-line) mb-5">
        {[
          { key: "posts", label: "My Posts" },
          { key: "saved", label: "Saved" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-3 text-[13px] font-semibold border-b-2 -mb-px ${
              tab === t.key ? "border-orange-500 text-orange-600" : "border-transparent text-ink-soft/50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState />
      ) : list.length === 0 ? (
        <EmptyState
          title={tab === "posts" ? "No posts yet" : "Nothing saved yet"}
          description={tab === "posts" ? "Share your first food story." : "Save community posts to find them later."}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {list.map((b) => (
            <button key={b._id} onClick={() => navigate("/community")} className="card overflow-hidden text-left">
              <div className="aspect-square bg-orange-50">
                {b.media?.[0] && <img src={b.media[0].url} className="w-full h-full object-cover" alt="" />}
              </div>
              <p className="text-[13px] text-ink p-3 line-clamp-2">{b.description}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
