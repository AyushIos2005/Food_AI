import { useState } from "react";
import { useNavigate } from "react-router-dom";

const cuisines = [
  { key: "indian", label: "Indian", emoji: "🍛" },
  { key: "chinese", label: "Chinese", emoji: "🥡" },
  { key: "italian", label: "Italian", emoji: "🍝" },
  { key: "mexican", label: "Mexican", emoji: "🌮" },
  { key: "japanese", label: "Japanese", emoji: "🍣" },
  { key: "continental", label: "Continental", emoji: "🍽️" },
  { key: "desserts", label: "Desserts", emoji: "🍰" },
  { key: "other", label: "Other", emoji: "✨" },
];

export default function PreferenceSetup() {
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();

  const toggle = (key) =>
    setSelected((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));

  const finish = () => {
    localStorage.setItem("dishfinder_preferences", JSON.stringify(selected));
    navigate("/home");
  };

  return (
    <div className="min-h-dvh flex flex-col bg-cream px-6 pt-16 pb-10">
      <h1 className="text-xl font-bold text-ink mb-1">What do you like?</h1>
      <p className="text-[13px] text-ink-soft/70 mb-6">
        Select your favorite cuisine to personalize your feed
      </p>

      <div className="grid grid-cols-2 gap-3 flex-1">
        {cuisines.map((c) => {
          const active = selected.includes(c.key);
          return (
            <button
              key={c.key}
              onClick={() => toggle(c.key)}
              className={`card flex flex-col items-center justify-center gap-2 py-6 ${
                active ? "!border-orange-500 bg-orange-50" : ""
              }`}
            >
              <span className="text-3xl">{c.emoji}</span>
              <span
                className={`text-[13px] font-medium ${
                  active ? "text-orange-600" : "text-ink-soft"
                }`}
              >
                {c.label}
              </span>
            </button>
          );
        })}
      </div>

      <button className="btn-primary mt-6" onClick={finish}>
        Continue
      </button>
    </div>
  );
}
