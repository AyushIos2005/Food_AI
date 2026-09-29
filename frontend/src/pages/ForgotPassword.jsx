import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgetPassword, resetPassword } from "../api/auth";

export default function ForgotPassword() {
  const [stage, setStage] = useState("request"); // request | reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [status, setStatus] = useState({ error: "", success: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const requestOtp = async (e) => {
    e.preventDefault();
    if (loading) return;
    setStatus({ error: "", success: "" });
    setLoading(true);
    try {
      const res = await forgetPassword({ email });
      setStatus({ success: res.message, error: "" });
      setStage("reset");
    } catch (err) {
      setStatus({ error: err.message, success: "" });
    } finally {
      setLoading(false);
    }
  };

  const doReset = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (newPassword.length < 6) {
      return setStatus({ error: "Password must be at least 6 characters.", success: "" });
    }
    if (newPassword !== confirmNewPassword) {
      return setStatus({ error: "Passwords do not match.", success: "" });
    }
    setStatus({ error: "", success: "" });
    setLoading(true);
    try {
      const res = await resetPassword({ email, otp, newPassword, confirmNewPassword });
      setStatus({ success: res.message, error: "" });
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setStatus({ error: err.message, success: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-cream px-6 pt-16 pb-10">
      <h1 className="text-xl font-bold text-ink mb-2">Reset password</h1>
      <p className="text-[13px] text-ink-soft/70 mb-8">
        {stage === "request"
          ? "Enter your email to receive a reset OTP."
          : "Enter the OTP and your new password."}
      </p>

      {stage === "request" ? (
        <form onSubmit={requestOtp} className="flex flex-col gap-3">
          <input
            className="input-field"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {status.error && <p className="text-[12px] text-red-500">{status.error}</p>}
          <button className="btn-primary mt-2" disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={doReset} className="flex flex-col gap-3">
          <input
            className="input-field tracking-[6px] text-center text-lg"
            placeholder="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <input
            className="input-field"
            placeholder="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            className="input-field"
            placeholder="Confirm new password"
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
          />
          {status.error && <p className="text-[12px] text-red-500">{status.error}</p>}
          {status.success && <p className="text-[12px] text-green-600">{status.success}</p>}
          <button className="btn-primary mt-2" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  );
}
