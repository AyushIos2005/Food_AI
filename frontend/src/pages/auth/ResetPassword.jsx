import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { resetPassword } from "../../api/auth.api";
import AuthLayout from "../../components/AuthLayout";
import FormField, { inputClass, buttonClass } from "../../components/FormField";
import { getErrorMessage } from "../../lib/errorMessage";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: location.state?.email || "",
    otp: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.newPassword !== form.confirmNewPassword) {
      toast.error("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(form);
      toast.success("Password reset successfully — please log in");
      navigate("/login");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't reset your password."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Reset Password" subtitle="Enter the OTP we sent you along with a new password.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Email">
          <input required type="email" value={form.email} onChange={update("email")} className={inputClass} placeholder="you@email.com" />
        </FormField>
        <FormField label="OTP">
          <input required value={form.otp} onChange={update("otp")} className={inputClass} placeholder="123456" />
        </FormField>
        <FormField label="New Password">
          <input required type="password" value={form.newPassword} onChange={update("newPassword")} className={inputClass} placeholder="••••••••" />
        </FormField>
        <FormField label="Confirm New Password">
          <input
            required
            type="password"
            value={form.confirmNewPassword}
            onChange={update("confirmNewPassword")}
            className={inputClass}
            placeholder="••••••••"
          />
        </FormField>
        <button type="submit" disabled={submitting} className={buttonClass}>
          {submitting ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}
