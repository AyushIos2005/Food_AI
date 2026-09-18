import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { forgotPassword } from "../../api/auth.api";
import AuthLayout from "../../components/AuthLayout";
import FormField, { inputClass, buttonClass } from "../../components/FormField";
import { getErrorMessage } from "../../lib/errorMessage";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await forgotPassword({ email });
      toast.success("OTP sent to your email");
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't send the OTP."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Forgot Password?" subtitle="Enter your registered email and we'll send you an OTP.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Email">
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="you@email.com" />
        </FormField>
        <button type="submit" disabled={submitting} className={buttonClass}>
          {submitting ? "Sending..." : "Send OTP"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Remembered it?{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}
