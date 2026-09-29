import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp } = useAuth();
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState({ error: "", success: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!/^\d{6}$/.test(otp.trim())) {
      return setStatus({ error: "OTP must be 6 digits.", success: "" });
    }
    setStatus({ error: "", success: "" });
    setLoading(true);
    try {
      const res = await verifyOtp({ email: email.trim(), otp: otp.trim() });
      setStatus({ success: res?.message || "Email verified", error: "" });
      setTimeout(() => navigate("/preferences"), 900);
    } catch (err) {
      setStatus({ error: err.message, success: "" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-cream px-6 pt-16 pb-10">
      <h1 className="text-xl font-bold text-ink mb-2">Verify your email</h1>
      <p className="text-[13px] text-ink-soft/70 mb-8">
        Enter the OTP sent to your registered email address.
      </p>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          className="input-field"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="input-field tracking-[6px] text-center text-lg"
          placeholder="- - - - - -"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          required
        />
        {status.error && <p className="text-[12px] text-red-500">{status.error}</p>}
        {status.success && <p className="text-[12px] text-green-600">{status.success}</p>}
        <button className="btn-primary mt-2" disabled={loading}>
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>
    </div>
  );
}
