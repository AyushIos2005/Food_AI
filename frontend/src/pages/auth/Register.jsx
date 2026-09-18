import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { UtensilsCrossed, ChefHat } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/AuthLayout";
import FormField, { inputClass, buttonClass } from "../../components/FormField";
import { getErrorMessage } from "../../lib/errorMessage";
import { cx } from "../../lib/utils";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("user");
  const [form, setForm] = useState({ username: "", name: "", email: "", password: "", confirmPassword: "" });
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      await register({
        username: form.username,
        name: form.name,
        email: form.email,
        password: form.password,
        role,
      });
      toast.success("OTP sent to your email");
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't create your account."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Join as a home cook or a chef.">
      <div className="mb-5 flex gap-2 rounded-full border border-slate-200 bg-bg p-1">
        {[
          { key: "user", label: "User", icon: UtensilsCrossed },
          { key: "chef", label: "Chef", icon: ChefHat },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setRole(key)}
            className={cx(
              "flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold transition-all duration-200",
              role === key ? "bg-primary text-white shadow-sm" : "text-muted hover:text-ink"
            )}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Username">
          <input required value={form.username} onChange={update("username")} className={inputClass} placeholder="ayush" />
        </FormField>
        <FormField label="Full Name">
          <input required value={form.name} onChange={update("name")} className={inputClass} placeholder="Ayush Verma" />
        </FormField>
        <FormField label="Email">
          <input required type="email" value={form.email} onChange={update("email")} className={inputClass} placeholder="you@email.com" />
        </FormField>
        <FormField label="Password">
          <input required type="password" value={form.password} onChange={update("password")} className={inputClass} placeholder="••••••••" />
        </FormField>
        <FormField label="Confirm Password">
          <input
            required
            type="password"
            value={form.confirmPassword}
            onChange={update("confirmPassword")}
            className={inputClass}
            placeholder="••••••••"
          />
        </FormField>

        <button type="submit" disabled={submitting} className={buttonClass}>
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}
