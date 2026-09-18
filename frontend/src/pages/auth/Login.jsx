import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/AuthLayout";
import FormField, { inputClass, buttonClass } from "../../components/FormField";
import { getErrorMessage } from "../../lib/errorMessage";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await login({ username: identifier, email: identifier, password });
      toast.success(data.message || "Welcome back!");
      navigate(location.state?.from || "/home", { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't log you in."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Login to keep cooking with FoodAI.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Username or Email">
          <input
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className={inputClass}
            placeholder="ayush or you@email.com"
          />
        </FormField>
        <FormField label="Password">
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="••••••••"
          />
        </FormField>

        <div className="text-right">
          <Link to="/forgot-password" className="text-xs font-semibold text-secondary hover:underline">
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={submitting} className={buttonClass}>
          {submitting ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Don't have an account?{" "}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          Create account
        </Link>
      </p>
    </AuthLayout>
  );
}
