import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ChefHat, Users, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { getAllFood } from "../../api/food.api";
import { getAllBlogs } from "../../api/blog.api";
import { getErrorMessage } from "../../lib/errorMessage";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../components/Loading";
import FoodCard from "../../components/FoodCard";
import BlogCard from "../../components/BlogCard";
import EmptyState from "../../components/EmptyState";

const cards = [
  { to: "/ai/create", icon: Sparkles, title: "AI Recipe", text: "Create something new", cta: "Create Recipe" },
  { to: "/recipes", icon: ChefHat, title: "Chef Recipes", text: "Discover recipes", cta: "Explore" },
  { to: "/community", icon: Users, title: "Community", text: "Share your food", cta: "Explore Community" },
];

export default function Home() {
  const { user } = useAuth();
  const [foods, setFoods] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getAllFood(), getAllBlogs()])
      .then(([foodRes, blogRes]) => {
        if (!active) return;
        setFoods((foodRes.data.foods || []).slice(0, 4));
        setBlogs((blogRes.data.data || []).slice(0, 3));
      })
      .catch((err) => toast.error(getErrorMessage(err, "Couldn't load your feed.")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const firstName = (user?.name || user?.username || "there").split(" ")[0];

  return (
    <div className="space-y-8">
      <div>
        <p className="font-display text-2xl font-semibold text-ink sm:text-3xl">Good to see you, {firstName} 👋</p>
        <p className="mt-1 text-sm text-muted">What are you cooking today?</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(({ to, icon: Icon, title, text, cta }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon size={18} />
            </span>
            <h3 className="mt-4 font-display text-base font-semibold text-ink">{title}</h3>
            <p className="text-sm text-muted">{text}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-secondary">
              {cta} <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>

      {loading ? (
        <Loading label="Loading your feed..." />
      ) : (
        <>
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">Latest Recipes</h2>
              <Link to="/recipes" className="text-sm font-semibold text-secondary hover:underline">
                View all
              </Link>
            </div>
            {foods.length === 0 ? (
              <EmptyState title="No recipes found." icon={ChefHat} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {foods.map((f) => (
                  <FoodCard key={f._id} food={f} />
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">Latest Community Posts</h2>
              <Link to="/community" className="text-sm font-semibold text-secondary hover:underline">
                View all
              </Link>
            </div>
            {blogs.length === 0 ? (
              <EmptyState title="No posts found." icon={Users} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {blogs.map((b) => (
                  <BlogCard key={b._id} blog={b} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
