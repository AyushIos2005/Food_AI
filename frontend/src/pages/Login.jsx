import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, ChefHat } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();

  const isEmail = identifier.includes("@");

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError("");
    const id = identifier.trim();
    if (!id || !password) return setError("Enter your email or username and password.");

    setSubmitting(true);
    try {
      // On success AuthContext becomes "authenticated" and <GuestRoute>
      // redirects to the page the user was trying to open (or /home).
      await login(isEmail ? { email: id, password } : { username: id, password });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-cream px-6 pt-16 pb-10">
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-3">
          <ChefHat size={26} className="text-white" />
        </div>
        <h1 className="font-display text-2xl font-bold text-ink">FOODAI</h1>
        <p className="text-[11px] tracking-[0.2em] text-ink-soft/70 mt-1">COOK • CREATE • SHARE</p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          className="input-field"
          placeholder="Email or Username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          autoComplete="username"
          required
        />
        <div className="relative">
          <input
            className="input-field pr-10"
            placeholder="Password"
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            aria-label={showPw ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft/50"
            onClick={() => setShowPw((s) => !s)}
          >
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="flex items-center justify-end text-[12px]">
          <Link to="/forgot-password" className="text-orange-600 font-medium">
            Forgot Password?
          </Link>
        </div>

        {error && <p className="text-[12px] text-red-500">{error}</p>}

        <button className="btn-primary mt-2" disabled={submitting}>
          {submitting ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="text-center text-[13px] text-ink-soft/70 mt-auto pt-8">
        Don't have an account?{" "}
        <Link to="/register" className="text-orange-600 font-semibold">
          Register
        </Link>
      </p>
    </div>
  );
}
