import { useNavigate } from "react-router-dom";
import { ChefHat } from "lucide-react";

export default function Splash() {
  const navigate = useNavigate();

  const goOnboarding = () => {
    navigate("/onboarding");
  };

  return (
    <div className="relative min-h-dvh flex flex-col overflow-hidden bg-night text-white">
      {/* Decorative food-glow background */}
      <div className="absolute inset-0">
        <div className="absolute -top-24 -left-16 w-72 h-72 rounded-full bg-orange-500/30 blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-orange-600/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-5 px-8 text-center">
        <div className="w-20 h-20 rounded-[26px] bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-orange-500/40">
          <ChefHat size={38} strokeWidth={2} />
        </div>
        <div>
          <h1 className="font-display text-4xl tracking-tight">FoodMenu</h1>
          <p className="text-[12px] text-white/45 mt-2 tracking-[0.24em] font-medium">
            DISCOVER · COOK · SHARE · GROW
          </p>
        </div>
        <p className="text-white/55 text-[14px] max-w-[280px] leading-relaxed">
          Good food makes life better. Find recipes, connect with chefs and
          explore the world of food.
        </p>
      </div>

      <div className="relative z-10 px-7 pb-10 pt-4 flex flex-col gap-3">
        <button onClick={goOnboarding} className="btn-primary">
          Get Started
        </button>
        <button
          onClick={() => navigate("/login")}
          className="text-center text-[13px] text-white/60 py-1"
        >
          Already have an account?{" "}
          <span className="text-orange-400 font-semibold">Login</span>
        </button>
      </div>
    </div>
  );
}
