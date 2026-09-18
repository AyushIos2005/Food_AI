import { useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { MailCheck } from "lucide-react";
import { verifyOtp } from "../../api/auth.api";
import AuthLayout from "../../components/AuthLayout";
import { buttonClass } from "../../components/FormField";
import { getErrorMessage } from "../../lib/errorMessage";

const LENGTH = 6;

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";
  const [digits, setDigits] = useState(Array(LENGTH).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const inputsRef = useRef([]);

  function handleChange(i, value) {
    const clean = value.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = clean;
      return next;
    });
    if (clean && i < LENGTH - 1) inputsRef.current[i + 1]?.focus();
  }

  function handleKeyDown(i, e) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!pasted) return;
    e.preventDefault();
    setDigits(Array.from({ length: LENGTH }, (_, i) => pasted[i] || ""));
    inputsRef.current[Math.min(pasted.length, LENGTH - 1)]?.focus();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length !== LENGTH) {
      toast.error("Enter the full 6-digit code.");
      return;
    }
    setSubmitting(true);
    try {
      await verifyOtp({ email, otp });
      toast.success("Email verified — you can log in now");
      navigate("/login");
    } catch (err) {
      toast.error(getErrorMessage(err, "That code didn't work."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Verify your email" subtitle={email ? `OTP sent to ${email}` : "Enter the code we sent you."}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-center gap-2" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              inputMode="numeric"
              maxLength={1}
              className="h-12 w-11 rounded-xl border border-slate-200 bg-white text-center text-lg font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          ))}
        </div>

        <button type="submit" disabled={submitting} className={buttonClass}>
          {submitting ? "Verifying..." : "Verify Email"}
        </button>

        <button
          type="button"
          onClick={() => toast("Didn't get it? Please check spam, or contact support to resend.", { icon: "📮" })}
          className="flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-secondary hover:underline"
        >
          <MailCheck size={14} /> Resend OTP
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Wrong email?{" "}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          Go back
        </Link>
      </p>
    </AuthLayout>
  );
}
