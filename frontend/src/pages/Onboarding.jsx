import { useState } from "react";
import { useNavigate } from "react-router-dom";

const slides = [
  {
    emoji: "🍜",
    title: "Discover Amazing Dishes",
    body: "Explore thousands of recipes, restaurants and food stories from food lovers around the world.",
  },
  {
    emoji: "🥗",
    title: "Explore & Save Your Favorites",
    body: "Find the best dishes, save them for later and build your own food collection.",
  },
  {
    emoji: "✍️",
    title: "Share Your Food Stories",
    body: "Write blogs, share your experiences and inspire the food community.",
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const isLast = step === slides.length - 1;

  const finish = () => {
    localStorage.setItem("dishfinder_onboarded", "1");
    navigate("/login");
  };

  const slide = slides[step];

  return (
    <div className="min-h-dvh flex flex-col bg-cream px-6 pt-14 pb-10">
      <button
        onClick={finish}
        className="self-end text-[13px] text-ink-soft/60 font-medium"
      >
        Skip
      </button>

      <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
        <div className="w-48 h-48 rounded-[32px] bg-orange-50 flex items-center justify-center text-7xl">
          {slide.emoji}
        </div>
        <div>
          <h2 className="text-xl font-bold text-ink mb-2">{slide.title}</h2>
          <p className="text-[13px] text-ink-soft leading-relaxed max-w-[280px] mx-auto">
            {slide.body}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mb-8">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === step ? "w-6 bg-orange-500" : "w-1.5 bg-orange-100"
            }`}
          />
        ))}
      </div>

      <button
        className="btn-primary"
        onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
      >
        {isLast ? "Get Started" : "Next"}
      </button>
    </div>
  );
}
