import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ChefHat, Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const isEmail = identifier.includes("@");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(
        isEmail
          ? { email: identifier, password }
          : { username: identifier, password }
      );
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-cream px-6 pt-14 pb-10">
      <div className="flex items-center gap-2.5 mb-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
          <ChefHat size={19} className="text-white" />
        </div>
        <span className="font-display text-lg text-ink">FoodMenu</span>
      </div>

      <div className="mb-7">
        <h1 className="font-display text-[26px] text-ink">Welcome Back</h1>
        <p className="text-[13px] text-ink-soft mt-1">Login to continue your food journey</p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="relative">
          <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/50" />
          <input
            className="input-field pl-11"
            placeholder="Email or Username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </div>
        <div className="relative">
          <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/50" />
          <input
            className="input-field pl-11 pr-10"
            placeholder="Password"
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft/50"
            onClick={() => setShowPw((s) => !s)}
          >
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="flex items-center justify-end text-[12px]">
          <Link to="/forgot-password" className="text-orange-600 font-medium">
            Forgot password?
          </Link>
        </div>

        {error && <p className="text-[12px] text-red-500">{error}</p>}

        <button className="btn-primary mt-2" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="h-px bg-(--color-line) flex-1" />
        <span className="text-[11px] text-ink-soft/50">or continue with</span>
        <div className="h-px bg-(--color-line) flex-1" />
      </div>

      <div className="flex items-center justify-center gap-4">
        {["G", "", "f"].map((l, i) => (
          <div
            key={i}
            className="w-11 h-11 rounded-full border border-(--color-line) bg-white flex items-center justify-center text-sm font-semibold text-ink-soft"
          >
            {l}
          </div>
        ))}
      </div>

      <p className="text-center text-[13px] text-ink-soft mt-auto pt-8">
        Don't have an account?{" "}
        <Link to="/register" className="text-orange-600 font-semibold">
          Register
        </Link>
      </p>
    </div>
  );
}
