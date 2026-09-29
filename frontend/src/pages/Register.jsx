import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role: "user",
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Same rules as the backend's registerSchema (src/validators/schemas.js).
  const validate = () => {
    if (!form.name.trim()) return "Enter your name.";
    if (!/^[a-zA-Z0-9._-]{3,40}$/.test(form.username.trim()))
      return "Username must be 3-40 characters: letters, numbers, . _ -";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const problem = validate();
    if (problem) return setError(problem);
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
      };
      await register(payload);
      navigate("/verify-otp", { state: { email: payload.email } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-cream px-6 pt-16 pb-10">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink">Create your account</h1>
        <p className="text-[13px] text-ink-soft/70 mt-1">
          Join our food community
        </p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          className="input-field"
          placeholder="Full Name"
          value={form.name}
          onChange={update("name")}
          required
        />
        <input
          className="input-field"
          placeholder="Username"
          value={form.username}
          onChange={update("username")}
          required
        />
        <input
          className="input-field"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={update("email")}
          required
        />
        <div className="relative">
          <input
            className="input-field pr-10"
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

        <div className="flex gap-2">
          {[
            { v: "user", label: "Food Lover" },
            { v: "chef", label: "Chef" },
          ].map((opt) => (
            <button
              type="button"
              key={opt.v}
              onClick={() => setForm((f) => ({ ...f, role: opt.v }))}
              className={`flex-1 py-2.5 rounded-2xl text-[13px] font-medium border ${
                form.role === opt.v
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-ink-soft border-(--color-line)"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {error && <p className="text-[12px] text-red-500">{error}</p>}

        <button className="btn-primary mt-2" disabled={submitting}>
          {submitting ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="text-center text-[13px] text-ink-soft/70 mt-auto pt-8">
        Already have an account?{" "}
        <Link to="/login" className="text-orange-600 font-semibold">
          Login
        </Link>
      </p>
    </div>
  );
}
