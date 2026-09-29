import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChefHat } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Chip, ChipGroup } from "../components/ui/Chip";
import { CUISINE_OPTIONS, DIET_OPTIONS, usePreferences } from "../utils/preferences";

export default function PreferenceSetup() {
  const { prefs, setPrefs } = usePreferences();
  const [selected, setSelected] = useState(prefs);
  const navigate = useNavigate();

  const toggle = (key) => setSelected((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));

  const finish = () => {
    setPrefs(selected);
    navigate("/home");
  };

  return (
    <div className="min-h-dvh flex flex-col bg-cream px-6 pt-[max(24px,env(safe-area-inset-top))] pb-[max(16px,env(safe-area-inset-bottom))] max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-orange-700 text-white flex items-center justify-center mb-5">
        <ChefHat size={26} aria-hidden="true" />
      </div>
      <h1 className="font-display text-3xl text-ink mb-1">What do you like to eat?</h1>
      <p className="text-[14px] text-ink-soft mb-6">
        Pick as many as you like. This personalizes your Home feed — you can change it anytime in Settings.
      </p>

      <fieldset className="mb-6">
        <legend className="text-[14px] font-bold text-ink mb-2">Diet & style</legend>
        <ChipGroup label="Diet and style preferences">
          {DIET_OPTIONS.map((o) => (
            <Chip key={o.key} selected={selected.includes(o.key)} onClick={() => toggle(o.key)}>
              <span aria-hidden="true">{o.emoji}</span> {o.label}
            </Chip>
          ))}
        </ChipGroup>
      </fieldset>

      <fieldset className="flex-1">
        <legend className="text-[14px] font-bold text-ink mb-2">Favorite cuisines</legend>
        <div className="grid grid-cols-2 gap-3">
          {CUISINE_OPTIONS.map((c) => {
            const active = selected.includes(c.key);
            return (
              <button
                key={c.key}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(c.key)}
                className={`card flex flex-col items-center justify-center gap-2 py-6 ${active ? "!border-orange-700 !bg-orange-50" : ""}`}
              >
                <span className="text-3xl" aria-hidden="true">{c.emoji}</span>
                <span className={`text-[13px] font-semibold ${active ? "text-orange-800" : "text-ink-soft"}`}>{c.label}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <Button size="lg" className="mt-6" onClick={finish}>
        Continue
      </Button>
      <button type="button" onClick={() => navigate("/home")} className="text-[13px] text-ink-soft mt-3 min-h-11">
        Skip for now
      </button>
    </div>
  );
}
