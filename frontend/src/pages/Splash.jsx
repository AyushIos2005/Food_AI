import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChefHat } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Splash() {
  const navigate = useNavigate();
  const { isAuthenticated, isChecking } = useAuth();

  useEffect(() => {
    if (isChecking) return undefined; // wait until the backend confirms the session
    const seen = localStorage.getItem("dishfinder_onboarded");
    const t = setTimeout(() => {
      navigate(isAuthenticated ? "/home" : seen ? "/login" : "/onboarding", { replace: true });
    }, 1200);
    return () => clearTimeout(t);
  }, [navigate, isAuthenticated, isChecking]);

  return (
    <div className="min-h-dvh bg-dark flex flex-col items-center justify-center gap-4 text-white">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-orange-500/30 animate-pulse">
        <ChefHat size={40} strokeWidth={2} />
      </div>
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight">FOODAI</h1>
        <p className="text-[12px] text-white/50 mt-1 tracking-[0.22em]">
          COOK • CREATE • SHARE
        </p>
      </div>
      <p className="absolute bottom-10 text-[11px] text-white/30">
        Good Food Brings People Together
      </p>
    </div>
  );
}
