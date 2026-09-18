import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Sparkles, Flame, Users2, Trash2, Undo2, RefreshCw, Filter } from "lucide-react";
import { getUnifiedHistory, deleteHistory, undoHistory, deleteAllHistory } from "../../api/ai.api";
import { getErrorMessage } from "../../lib/errorMessage";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import { cx } from "../../lib/utils";

const filters = [
  { key: "all", label: "All" },
  { key: "protein_recipe", label: "AI Created" },
  { key: "recreated_food", label: "Recreated" },
];

export default function AiHistory() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  // Locally remembers ids removed this session so Undo stays reachable.
  const [recentlyDeleted, setRecentlyDeleted] = useState([]);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    getUnifiedHistory()
      .then(({ data }) => setItems(data.data || []))
      .catch((err) => toast.error(getErrorMessage(err, "Couldn't load your AI history.")))
      .finally(() => setLoading(false));
  }

  async function handleDelete(item, e) {
    e.stopPropagation();
    setItems((prev) => prev.filter((i) => i._id !== item._id));
    setRecentlyDeleted((prev) => [{ id: item._id, name: recipeName(item) }, ...prev].slice(0, 5));
    try {
      await deleteHistory(item._id);
      toast.success("Removed from history");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't delete that."));
      load();
    }
  }

  async function handleUndo(entry) {
    try {
      await undoHistory(entry.id);
      setRecentlyDeleted((prev) => prev.filter((d) => d.id !== entry.id));
      toast.success("Restored");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't restore that."));
    }
  }

  async function handleClearAll() {
    if (!window.confirm("Delete your entire AI history? You can undo individual items afterwards.")) return;
    try {
      await deleteAllHistory();
      setRecentlyDeleted(items.map((i) => ({ id: i._id, name: recipeName(i) })).slice(0, 5));
      setItems([]);
      toast.success("All AI history deleted");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't clear your history."));
    }
  }

  function open(item) {
    if (item.historyType === "recreated_food") {
      navigate("/ai/recreate/result", { state: { food: item } });
    } else {
      navigate("/ai/result", { state: { food: item } });
    }
  }

  const visible = filter === "all" ? items : items.filter((i) => i.historyType === filter);

  if (loading) return <Loading full label="Loading your AI history..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary">FoodAI</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink">My AI Recipes</h1>
        </div>
        <div className="flex gap-2">
          {items.length > 0 && (
            <button
              onClick={handleClearAll}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-danger transition-all duration-200 hover:bg-danger/5"
            >
              Clear all
            </button>
          )}
          <Link to="/ai/create" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
            + New Recipe
          </Link>
        </div>
      </div>

      {recentlyDeleted.length > 0 && (
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
            <Undo2 size={13} /> Recently deleted
          </p>
          {recentlyDeleted.map((d) => (
            <div key={d.id} className="flex items-center justify-between gap-3">
              <span className="truncate text-sm text-ink/80">{d.name}</span>
              <button onClick={() => handleUndo(d)} className="shrink-0 text-xs font-semibold text-secondary hover:underline">
                Undo
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Filter size={14} className="text-muted" />
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cx(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
              filter === f.key ? "bg-primary text-white" : "border border-slate-200 bg-white text-muted hover:text-ink"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={Sparkles} title="Nothing in your AI history yet." actionLabel="Create Recipe" actionTo="/ai/create" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => {
            const r = item.recipe || {};
            const recreated = item.historyType === "recreated_food";
            return (
              <div
                key={item._id}
                onClick={() => open(item)}
                className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={cx(
                      "flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      recreated ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"
                    )}
                  >
                    {recreated ? <RefreshCw size={10} /> : <Sparkles size={10} />}
                    {recreated ? "Recreated" : "AI Created"}
                  </span>
                  <button
                    onClick={(e) => handleDelete(item, e)}
                    className="text-muted transition-all duration-200 hover:text-danger"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <h3 className="mt-3 font-display text-base font-semibold text-ink">{recipeName(item)}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{r.description}</p>

                <div className="mt-3 flex items-center gap-4 text-xs text-muted">
                  <span className="flex items-center gap-1"><Flame size={12} /> {r.proteinPerServing || "—"}</span>
                  {!recreated && (
                    <span className="flex items-center gap-1"><Users2 size={12} /> {r.servings || item.numberofperson}</span>
                  )}
                  <span className="ml-auto text-[11px]">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function recipeName(item) {
  const r = item.recipe || {};
  return r.recipeName || r.newFoodName || item.existingFoodname || "Untitled recipe";
}
