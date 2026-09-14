import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UtensilsCrossed,
  Soup,
  Salad,
  Flame,
  Cookie,
  Sparkles,
  Zap,
  HeartPulse,
  Dumbbell,
  GraduationCap,
  PartyPopper,
} from "lucide-react";

const categories = [
  { label: "Indian", icon: Soup },
  { label: "Chinese", icon: UtensilsCrossed },
  { label: "Italian", icon: Cookie },
  { label: "Mexican", icon: Flame },
  { label: "Healthy", icon: Salad },
  { label: "Desserts", icon: Sparkles },
];

const goals = [
  { label: "Quick Meals", icon: Zap },
  { label: "Healthy Eating", icon: HeartPulse },
  { label: "High Protein", icon: Dumbbell },
  { label: "Learn Cooking", icon: GraduationCap },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState([]);
  const [goal, setGoal] = useState(null);
  const navigate = useNavigate();

  const finish = () => {
    localStorage.setItem("dishfinder_onboarded", "1");
    navigate("/login");
  };

  const toggle = (label) =>
    setPicks((p) => (p.includes(label) ? p.filter((x) => x !== label) : [...p, label]));

  const steps = [
    {
      key: "intro",
      render: () => (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
          <div className="w-48 h-48 rounded-[32px] bg-orange-50 flex items-center justify-center text-7xl">
            🍲
          </div>
          <div>
            <h2 className="font-display text-2xl text-ink mb-2">Good Food Makes Life Better</h2>
            <p className="text-[13px] text-ink-soft leading-relaxed max-w-[280px] mx-auto">
              Discover amazing recipes, connect with chefs and explore the world of food.
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "categories",
      render: () => (
        <div className="flex-1 flex flex-col justify-center gap-6">
          <div>
            <h2 className="font-display text-xl text-ink mb-1">Personalize Your Experience</h2>
            <p className="text-[13px] text-ink-soft">
              Tell us what you like and we'll show you better recommendations.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {categories.map(({ label, icon: Icon }) => {
              const active = picks.includes(label);
              return (
                <button
                  key={label}
                  onClick={() => toggle(label)}
                  className={`flex flex-col items-center gap-2 py-4 rounded-2xl border text-[12px] font-medium transition ${
                    active
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "bg-white border-(--color-line) text-ink-soft"
                  }`}
                >
                  <Icon size={20} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      key: "goals",
      render: () => (
        <div className="flex-1 flex flex-col justify-center gap-6">
          <div>
            <h2 className="font-display text-xl text-ink mb-1">Your Cooking Goals</h2>
            <p className="text-[13px] text-ink-soft">What are you trying to achieve?</p>
          </div>
          <div className="flex flex-col gap-2.5">
            {goals.map(({ label, icon: Icon }) => {
              const active = goal === label;
              return (
                <button
                  key={label}
                  onClick={() => setGoal(label)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-[14px] font-medium transition ${
                    active
                      ? "bg-orange-50 border-orange-500 text-orange-700"
                      : "bg-white border-(--color-line) text-ink"
                  }`}
                >
                  <span
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      active ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-600"
                    }`}
                  >
                    <Icon size={17} />
                  </span>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      key: "ready",
      render: () => (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
          <div className="w-48 h-48 rounded-[32px] bg-orange-50 flex items-center justify-center">
            <PartyPopper size={72} className="text-orange-500" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="font-display text-2xl text-ink mb-2">You're All Set!</h2>
            <p className="text-[13px] text-ink-soft leading-relaxed max-w-[280px] mx-auto">
              Your food journey starts now.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const isLast = step === steps.length - 1;

  return (
    <div className="min-h-dvh flex flex-col bg-cream px-6 pt-14 pb-10">
      <button onClick={finish} className="self-end text-[13px] text-ink-soft/60 font-medium">
        Skip
      </button>

      {steps[step].render()}

      <div className="flex items-center justify-center gap-2 my-8">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === step ? "w-6 bg-orange-500" : "w-1.5 bg-orange-100"
            }`}
          />
        ))}
      </div>

      <button className="btn-primary" onClick={() => (isLast ? finish() : setStep((s) => s + 1))}>
        {isLast ? "Let's Cook" : "Next"}
      </button>
    </div>
  );
}
