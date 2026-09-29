import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChefHat, Pencil, Sparkles, Trash2, UtensilsCrossed } from "lucide-react";
import { getProfile } from "../api/profile";
import { getAllBlogs, getSavedBlogs } from "../api/blog";
import { getAiHistory } from "../api/ai";
import { useAuth } from "../context/AuthContext";
import { EmptyState, ErrorState, SkeletonGrid, SkeletonList } from "../components/States";
import { Button } from "../components/ui/Button";
import { Tabs } from "../components/ui/Tabs";
import Avatar from "../components/ui/Avatar";
import { aiTitle } from "../components/AiRecipeCard";
import { asArray, useAsync } from "../hooks/useAsync";
import { useCooked, useSavedDishes } from "../hooks/useSaved";
import { timeAgo } from "../utils/format";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") || "posts";
  const setTab = (key) => setParams({ tab: key }, { replace: true });

  const { ids: savedDishIds } = useSavedDishes();
  const { entries: cooked, remove: removeCooked } = useCooked();

  const profileReq = useAsync((signal) => getProfile({ signal }), []);
  const profile = profileReq.data?.profile || null;
  const profileMissing = profileReq.status === 404;

  const blogsReq = useAsync((signal) => getAllBlogs(null, { signal }), []);
  const savedReq = useAsync((signal) => getSavedBlogs({ signal }), []);
  const aiReq = useAsync((signal) => getAiHistory({ signal }), []);

  const myPosts = useMemo(() => asArray(blogsReq.data?.data).filter((b) => b.createdBy?._id === user?.id), [blogsReq.data, user]);
  const savedPosts = asArray(savedReq.data?.data);
  const aiRecipes = asArray(aiReq.data?.data);
  const totalLikes = useMemo(() => myPosts.reduce((sum, b) => sum + (b.likes?.length || 0), 0), [myPosts]);

  const displayName = profile?.fullName || user?.name || "";

  const tabs = [
    { key: "posts", label: "Posts", count: myPosts.length },
    { key: "saved", label: "Saved recipes", count: savedDishIds.length + savedPosts.length },
    { key: "ai", label: "AI recipes", count: aiRecipes.length },
    { key: "cooked", label: "Cooked", count: cooked.length },
  ];

  return (
    <div>
      <div className="card p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
        <Avatar name={displayName || user?.username} size={96} className="!text-3xl" />
        <div className="flex-1 text-center sm:text-left">
          <h2 className="font-display text-3xl">{displayName || user?.username}</h2>
          {user?.username && <p className="text-ink-soft">@{user.username}</p>}
          {profileReq.error && !profileMissing && (
            <p className="text-[13px] text-danger mt-2">
              Couldn't load profile details.{" "}
              <button onClick={profileReq.reload} className="underline font-semibold">Retry</button>
            </p>
          )}
          {profileMissing && <p className="text-[14px] text-ink-soft mt-2">You haven't set up your profile yet.</p>}
          {profile?.bio && <p className="text-[15px] text-ink-soft mt-2 max-w-xl">{profile.bio}</p>}
          {profile?.profession && <p className="text-[13px] text-orange-800 font-semibold mt-1">{profile.profession}</p>}
          <div className="flex items-center justify-center sm:justify-start gap-8 mt-5">
            <div><p className="text-[18px] font-bold">{myPosts.length}</p><p className="text-[12px] text-ink-soft">Posts</p></div>
            <div><p className="text-[18px] font-bold">{aiRecipes.length}</p><p className="text-[12px] text-ink-soft">AI Recipes</p></div>
            <div><p className="text-[18px] font-bold">{cooked.length}</p><p className="text-[12px] text-ink-soft">Cooked</p></div>
            <div><p className="text-[18px] font-bold">{totalLikes}</p><p className="text-[12px] text-ink-soft">Likes</p></div>
          </div>
          <Button variant="outline" size="sm" icon={Pencil} className="mt-5" onClick={() => navigate("/profile/edit")}>
            {profileMissing ? "Create profile" : "Edit profile"}
          </Button>
        </div>
      </div>

      <Tabs tabs={tabs} value={tab} onChange={setTab} label="Profile sections" className="mb-5" />

      {tab === "posts" && (
        <div role="tabpanel" aria-labelledby="tab-posts">
          {blogsReq.loading ? (
            <SkeletonGrid count={3} label="Loading your posts..." />
          ) : blogsReq.error ? (
            <ErrorState message={blogsReq.error} onRetry={blogsReq.reload} />
          ) : myPosts.length === 0 ? (
            <EmptyState title="No posts yet" description="Share your first food story." action={<Button onClick={() => navigate("/community/create")}>Create post</Button>} />
          ) : (
            <PostGrid posts={myPosts} />
          )}
        </div>
      )}

      {tab === "saved" && (
        <div role="tabpanel" aria-labelledby="tab-saved" className="space-y-8">
          <section>
            <h3 className="font-display text-xl mb-3">Saved recipes</h3>
            {savedDishIds.length === 0 ? (
              <EmptyState icon={UtensilsCrossed} title="No saved recipes" description="Tap the bookmark on any dish to save it here." action={<Button variant="outline" onClick={() => navigate("/recipes")}>Browse recipes</Button>} />
            ) : (
              <p className="text-[14px] text-ink-soft">
                {savedDishIds.length} recipe{savedDishIds.length === 1 ? "" : "s"} saved. Open{" "}
                <button onClick={() => navigate("/recipes")} className="text-orange-800 font-semibold underline">Recipe Explorer</button> to view them.
              </p>
            )}
          </section>
          <section>
            <h3 className="font-display text-xl mb-3">Saved posts</h3>
            {savedReq.loading ? (
              <SkeletonGrid count={3} label="Loading saved posts..." />
            ) : savedReq.error ? (
              <ErrorState message={savedReq.error} onRetry={savedReq.reload} />
            ) : savedPosts.length === 0 ? (
              <EmptyState title="Nothing saved yet" description="Save community posts to find them later." />
            ) : (
              <PostGrid posts={savedPosts} />
            )}
          </section>
        </div>
      )}

      {tab === "ai" && (
        <div role="tabpanel" aria-labelledby="tab-ai">
          {aiReq.loading ? (
            <SkeletonList count={3} label="Loading AI recipes..." />
          ) : aiReq.error ? (
            <ErrorState message={aiReq.error} onRetry={aiReq.reload} />
          ) : aiRecipes.length === 0 ? (
            <EmptyState icon={Sparkles} title="No AI recipes yet" description="Generate your first recipe." action={<Button icon={Sparkles} onClick={() => navigate("/ai/create")}>Create with AI</Button>} />
          ) : (
            <ul className="grid md:grid-cols-2 gap-3">
              {aiRecipes.map((item) => (
                <li key={item._id}>
                  <button onClick={() => navigate(`/ai/result/${item._id}`)} className="card card-hover w-full text-left p-4">
                    <span className="badge">{item.historyType === "recreated_food" ? "Remixed" : "AI recipe"}</span>
                    <p className="font-display text-lg mt-1.5">{aiTitle(item)}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "cooked" && (
        <div role="tabpanel" aria-labelledby="tab-cooked">
          {cooked.length === 0 ? (
            <EmptyState icon={ChefHat} title="Nothing cooked yet" description="Recipes you finish in Cooking Mode, or mark as cooked, show up here." />
          ) : (
            <ul className="space-y-2">
              {cooked.map((c) => (
                <li key={c.at} className="card flex items-center gap-3 p-3.5">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-700 shrink-0">
                    <ChefHat size={18} aria-hidden="true" />
                  </div>
                  <button onClick={() => navigate(c.kind === "ai" ? `/ai/result/${c.id}` : `/dish/${c.id}`)} className="flex-1 min-w-0 text-left">
                    <p className="text-[14px] font-semibold text-ink truncate">{c.name}</p>
                    <p className="text-[12px] text-ink-soft">{timeAgo(c.at)}</p>
                  </button>
                  <Button variant="ghost" size="sm" icon={Trash2} onClick={() => removeCooked(c.at)} aria-label={`Remove ${c.name} from cooked history`} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function PostGrid({ posts }) {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {posts.map((b) => (
        <button key={b._id} onClick={() => navigate(`/community/post/${b._id}`)} className="card card-hover overflow-hidden text-left">
          <div className="aspect-square bg-orange-50">
            {b.media?.[0]?.type !== "video" && b.media?.[0]?.url && (
              <img src={b.media[0].url} className="w-full h-full object-cover" alt="" loading="lazy" decoding="async" />
            )}
          </div>
          <p className="text-[13px] text-ink p-3 line-clamp-2">{b.description}</p>
        </button>
      ))}
    </div>
  );
}
