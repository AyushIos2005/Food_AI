import { Link } from "react-router-dom";
import { Sparkles, RefreshCw, History } from "lucide-react";

export default function AiHub() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">FoodAI</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">What do you want to cook?</h1>
        <p className="mt-1 text-sm text-muted">Let AI turn ingredients into a full recipe, or reinvent something you already know.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
            <Sparkles size={20} />
          </span>
          <h2 className="mt-4 font-display text-xl font-semibold text-ink">Create New Recipe</h2>
          <p className="mt-1.5 text-sm text-muted">I have ingredients. Let AI create something.</p>
          <Link
            to="/ai/create"
            className="mt-5 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-dark"
          >
            Create New
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-white">
            <RefreshCw size={20} />
          </span>
          <h2 className="mt-4 font-display text-xl font-semibold text-ink">Recreate Existing Food</h2>
          <p className="mt-1.5 text-sm text-muted">Transform an existing food with new ingredients.</p>
          <Link
            to="/ai/recreate"
            className="mt-5 inline-block rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-dark"
          >
            Recreate
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/ai/history" className="flex items-center gap-1.5 text-sm font-semibold text-secondary hover:underline">
          <History size={14} /> My AI Recipes
        </Link>
        <span className="text-muted">·</span>
        <Link to="/ai/recreated" className="flex items-center gap-1.5 text-sm font-semibold text-secondary hover:underline">
          <History size={14} /> Recreated History
        </Link>
      </div>
    </div>
  );
}
