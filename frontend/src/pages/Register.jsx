import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ChefHat, User, AtSign, Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-cream px-6 pt-14 pb-10">
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
          <ChefHat size={19} className="text-white" />
        </div>
        <span className="font-display text-lg text-ink">FoodMenu</span>
      </div>

      <div className="mb-6">
        <h1 className="font-display text-[26px] text-ink">Create Account</h1>
        <p className="text-[13px] text-ink-soft mt-1">Join FoodMenu today</p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="relative">
          <User size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/50" />
          <input className="input-field pl-11" placeholder="Full Name" value={form.name} onChange={update("name")} required />
        </div>
        <div className="relative">
          <AtSign size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/50" />
          <input className="input-field pl-11" placeholder="Username" value={form.username} onChange={update("username")} required />
        </div>
        <div className="relative">
          <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/50" />
          <input className="input-field pl-11" placeholder="Email Address" type="email" value={form.email} onChange={update("email")} required />
        </div>
        <div className="relative">
          <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/50" />
          <input
            className="input-field pl-11 pr-10"
            placeholder="Password"
            type={showPw ? "text" : "password"}
            value={form.password}
            onChange={update("password")}
            required
            minLength={6}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft/50"
            onClick={() => setShowPw((s) => !s)}
          >
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && <p className="text-[12px] text-red-500">{error}</p>}

        <button className="btn-primary mt-2" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
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
        Already have an account?{" "}
        <Link to="/login" className="text-orange-600 font-semibold">
          Login
        </Link>
      </p>
    </div>
  );
}
