import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChefHat, Sparkles } from "lucide-react";
import { deleteAiHistory, getAiHistory, undoAiHistory } from "../api/ai";
import { getErrorMessage } from "../api/client";
import AiRecipeCard, { aiTitle } from "../components/AiRecipeCard";
import { EmptyState, ErrorState, SkeletonList } from "../components/States";
import { Button } from "../components/ui/Button";
import { useToast } from "../context/ToastContext";
import { asArray, useAsync } from "../hooks/useAsync";

export default function AiHub() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [busyId, setBusyId] = useState(null);
  // A recipe that was just deleted (here, or from the result page) can be undone.
  const [undoable, setUndoable] = useState(location.state?.deleted || null);

  // Backend: { success, count, data: HistoryDoc[] }, newest first.
  const { data, loading, error, reload } = useAsync((signal) => getAiHistory({ signal }), []);
  const history = asArray(data?.data);

  const undo = async (target = undoable) => {
    if (!target || busyId) return;
    setBusyId(target.id);
    try {
      await undoAiHistory(target.id);
      toast.success(`Restored "${target.name}"`);
      setUndoable(null);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't restore it. Try again."));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (item) => {
    if (busyId) return;
    setBusyId(item._id);
    try {
      await deleteAiHistory(item._id);
      const target = { id: item._id, name: aiTitle(item) };
      setUndoable(target);
      toast.success(`Deleted "${target.name}"`, { duration: 8000, action: { label: "Undo", onClick: () => undo(target) } });
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't delete the recipe. Try again."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <section aria-labelledby="ai-hero" className="rounded-[28px] bg-gradient-to-br from-orange-700 to-orange-800 text-white p-6 sm:p-8 mb-8">
        <h2 id="ai-hero" className="font-display text-3xl sm:text-4xl">Cook from what you already have</h2>
        <p className="text-white/90 mt-2 max-w-lg text-[15px]">
          Tell FOODAI your ingredients, servings and diet. Get a full recipe, tweak it with one tap, then cook it step by step.
        </p>
        <button
          onClick={() => navigate("/ai/create")}
          className="mt-6 bg-white text-orange-800 font-semibold rounded-2xl px-6 min-h-14 inline-flex items-center gap-2 hover:bg-orange-50 transition"
        >
          <Sparkles size={18} aria-hidden="true" /> Create with AI
        </button>
      </section>

      {undoable && (
        <div role="status" className="card flex items-center justify-between gap-3 px-4 py-3 mb-4">
          <p className="text-[14px] text-ink truncate">Deleted “{undoable.name}”.</p>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => undo()} loading={busyId === undoable.id} className="!text-orange-800">
              Undo
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setUndoable(null)}>
              Dismiss
            </Button>
          </div>
        </div>
      )}

      <h3 className="font-display text-2xl mb-4">Your AI recipes</h3>
      {loading ? (
        <SkeletonList count={3} label="Loading your recipes..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : history.length === 0 ? (
        <EmptyState
          icon={ChefHat}
          title="No AI recipes yet"
          description="Your first recipe is one short chat away."
          action={
            <Button icon={Sparkles} onClick={() => navigate("/ai/create")}>
              Create My Recipe
            </Button>
          }
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {history.map((item) => (
            <AiRecipeCard
              key={item._id}
              item={item}
              deleting={busyId === item._id}
              onOpen={() => navigate(`/ai/result/${item._id}`)}
              onDelete={() => remove(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
