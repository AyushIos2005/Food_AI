import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { getAllFood } from "../api/food";
import { getAllBlogs } from "../api/blog";
import { useAuth } from "../context/AuthContext";
import DishCard from "../components/DishCard";
import { EmptyState, ErrorState, SkeletonGrid } from "../components/States";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dishes, setDishes] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAllFood().then((res) => setDishes(res.foods || [])).catch((err) => setError(err.message)),
      getAllBlogs().then((res) => setBlogs(res.data || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[28px] bg-[#17110D] text-white p-6 sm:p-8">
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-orange-500/30 blur-2xl" />
        <p className="text-[12px] tracking-[0.2em] text-orange-300">FOODMENU</p>
        <h2 className="font-display text-3xl sm:text-4xl mt-2 max-w-lg">
          {greeting()}, {user?.name || user?.username || "chef"} 👋
        </h2>
        <p className="text-white/65 mt-2 max-w-md">
          Cook from what you have, share your table, and explore recipes from the community.
        </p>
        <div className="flex flex-wrap gap-3 mt-6">
          <button onClick={() => navigate("/ai/create")} className="btn-primary flex items-center gap-2">
            <Sparkles size={16} /> Generate a recipe
          </button>
          <button onClick={() => navigate("/community/create")} className="btn-outline bg-white/10 text-white border-white/15">
            Share a post
          </button>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl">Trending dishes</h2>
          <button onClick={() => navigate("/recipes")} className="text-[13px] text-orange-600 font-semibold flex items-center gap-1">
            See all <ArrowRight size={14} />
          </button>
        </div>
        {error && <ErrorState message={error} />}
        {loading ? (
          <SkeletonGrid count={4} />
        ) : dishes.length === 0 ? (
          <EmptyState title="No dishes yet" description="The kitchen is warming up. Check back soon." />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {dishes.slice(0, 8).map((d) => (
              <DishCard key={d._id} dish={d} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl">From the community</h2>
          <button onClick={() => navigate("/community")} className="text-[13px] text-orange-600 font-semibold flex items-center gap-1">
            See all <ArrowRight size={14} />
          </button>
        </div>
        {blogs.length === 0 ? (
          <EmptyState title="No posts yet" description="Be the first to share a food story." action={
            <button onClick={() => navigate("/community/create")} className="btn-primary mt-3">Create post</button>
          } />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {blogs.slice(0, 4).map((b) => (
              <button
                key={b._id}
                onClick={() => navigate("/community")}
                className="card flex items-center gap-3 p-3 text-left hover:-translate-y-0.5 transition"
              >
                <div className="w-20 h-20 rounded-2xl bg-orange-50 overflow-hidden shrink-0">
                  {b.media?.[0] && <img src={b.media[0].url} className="w-full h-full object-cover" alt="" />}
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-ink line-clamp-2">{b.description}</p>
                  <p className="text-[12px] text-ink-soft mt-1">
                    {b.createdBy?.name || b.createdBy?.username} · {b.likes?.length || 0} likes
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
