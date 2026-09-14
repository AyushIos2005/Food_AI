import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Heart, PlusCircle, Users, UtensilsCrossed } from "lucide-react";
import { getFoodAdmin } from "../api/food";
import { getAllBlogs } from "../api/blog";
import { useAuth } from "../context/AuthContext";
import DishCard from "../components/DishCard";
import { EmptyState, ErrorState, SkeletonGrid } from "../components/States";

export default function ChefDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getFoodAdmin().then((res) => setRecipes(res.foods || [])).catch((err) => setError(err.message || "Could not load recipes.")),
      getAllBlogs().then((res) => setBlogs((res.data || []).filter((b) => b.createdBy?._id === user?.id))).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [user?.id]);

  const likes = blogs.reduce((s, b) => s + (b.likes?.length || 0), 0);
  const hour = new Date().getHours();
  const hello = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const stats = [
    { label: "Total Recipes", value: recipes.length, icon: UtensilsCrossed },
    { label: "Total Blogs", value: blogs.length, icon: BookOpen },
    { label: "Followers", value: "—", icon: Users },
    { label: "Likes Received", value: likes, icon: Heart },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-3xl sm:text-4xl">{hello}, Chef!</h2>
        <p className="text-ink-soft mt-1">{user?.name || user?.username}, your kitchen at a glance.</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-4 sm:p-5">
            <s.icon size={18} className="text-[#247A4C]" />
            <p className="text-2xl font-bold mt-3">{s.value}</p>
            <p className="text-[12px] text-ink-soft">{s.label}</p>
          </div>
        ))}
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-2xl">Your Recent Recipes</h3>
          <button onClick={() => navigate("/chef/recipes")} className="text-[13px] text-[#247A4C] font-semibold">
            Manage
          </button>
        </div>
        {error && <ErrorState message={error} />}
        {loading ? (
          <SkeletonGrid count={3} />
        ) : recipes.length === 0 ? (
          <EmptyState title="No recipes yet" description="Publish your first dish." />
        ) : (
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 xl:grid-cols-3 gap-4">
            {recipes.slice(0, 6).map((d) => (
              <DishCard key={d._id} dish={d} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="font-display text-2xl mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button onClick={() => navigate("/chef/recipes/create")} className="card p-5 text-left">
            <PlusCircle className="text-[#247A4C]" />
            <p className="font-semibold mt-2">Create Recipe</p>
          </button>
          <button onClick={() => navigate("/community/create")} className="card p-5 text-left">
            <BookOpen className="text-[#247A4C]" />
            <p className="font-semibold mt-2">Write Blog</p>
          </button>
          <button onClick={() => navigate("/community")} className="card p-5 text-left">
            <Users className="text-[#247A4C]" />
            <p className="font-semibold mt-2">View Community</p>
          </button>
        </div>
      </section>
    </div>
  );
}
