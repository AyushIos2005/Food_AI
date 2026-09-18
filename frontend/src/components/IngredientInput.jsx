import { useState } from "react";
import { X, Plus } from "lucide-react";

export default function IngredientInput({ items, onChange, placeholder = "e.g. paneer" }) {
  const [draft, setDraft] = useState("");

  function addItem() {
    const value = draft.trim();
    if (!value) return;
    if (items.some((i) => i.toLowerCase() === value.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...items, value]);
    setDraft("");
  }

  function removeItem(index) {
    onChange(items.filter((_, i) => i !== index));
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addItem();
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3">
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-1.5 rounded-full bg-secondary/10 px-3 py-1.5 text-sm font-medium text-secondary"
          >
            {item}
            <button type="button" onClick={() => removeItem(i)} className="text-secondary/60 hover:text-secondary">
              <X size={13} />
            </button>
          </span>
        ))}
        <div className="flex flex-1 items-center gap-1.5 min-w-[140px]">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 min-w-0 bg-transparent px-1 py-1.5 text-sm text-ink placeholder:text-muted focus:outline-none"
          />
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-primary transition-all duration-200 hover:bg-primary hover:text-white"
          >
            <Plus size={13} /> Add
          </button>
        </div>
      </div>
      <p className="mt-1.5 text-xs text-muted">Press Enter or comma to add an ingredient.</p>
    </div>
  );
}
