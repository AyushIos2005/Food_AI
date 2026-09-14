import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as authService from "../services/authService";
import { getErrorMessage } from "../services/api";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: location.state?.email || "",
    otp: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.resetPassword(form);
      navigate("/login", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Could not reset password."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell bg-cream flex flex-col px-6 pt-14 pb-8">
      <h1 className="font-display font-bold text-xl text-ink mb-1">Reset password</h1>
      <p className="text-ink-faint text-sm mb-8">
        Enter the code we emailed you and choose a new password.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          className="input-field"
          placeholder="Email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          required
        />
        <input
          className="input-field"
          placeholder="OTP code"
          value={form.otp}
          onChange={(e) => update("otp", e.target.value)}
          required
        />
        <input
          type="password"
          className="input-field"
          placeholder="New password"
          value={form.newPassword}
          onChange={(e) => update("newPassword", e.target.value)}
          required
        />
        <input
          type="password"
          className="input-field"
          placeholder="Confirm new password"
          value={form.confirmNewPassword}
          onChange={(e) => update("confirmNewPassword", e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-600 px-1">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary mt-2">
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
