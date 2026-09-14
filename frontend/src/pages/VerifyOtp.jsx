import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MailCheck } from "lucide-react";
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
    setStatus({ error: "", success: "" });
    setLoading(true);
    try {
      const res = await verifyOtp({ email, otp });
      setStatus({ success: res.message, error: "" });
      setTimeout(() => navigate("/preferences"), 900);
    } catch (err) {
      setStatus({ error: err.message, success: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-cream px-6 pt-16 pb-10">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-16 h-16 rounded-3xl bg-orange-50 flex items-center justify-center mb-4">
          <MailCheck size={28} className="text-orange-500" />
        </div>
        <h1 className="font-display text-xl text-ink">Verify Your Email</h1>
        <p className="text-[13px] text-ink-soft mt-1 max-w-[260px]">
          Enter the OTP sent to your registered email address.
        </p>
      </div>

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
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        {status.error && <p className="text-[12px] text-red-500">{status.error}</p>}
        {status.success && (
          <p className="text-[12px] text-green-600">{status.success}</p>
        )}
        <button className="btn-primary mt-2" disabled={loading}>
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>
    </div>
  );
}
