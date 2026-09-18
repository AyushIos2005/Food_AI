import { useState } from "react";
import toast from "react-hot-toast";
import { Info } from "lucide-react";
import { sendComplaint } from "../../api/feedback.api";
import { getErrorMessage } from "../../lib/errorMessage";
import { useAuth } from "../../context/AuthContext";
import FormField, { inputClass, buttonClass } from "../../components/FormField";

export default function Complaint() {
  const { isChef } = useAuth();
  const [complainMessage, setComplainMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!complainMessage.trim()) return toast.error("Please describe the issue.");
    setSubmitting(true);
    try {
      await sendComplaint({ complainMessage: complainMessage.trim() });
      toast.success("Complaint registered successfully");
      setComplainMessage("");
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't submit your complaint."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="font-display text-lg font-semibold text-ink">Report an Issue</h2>
        <p className="mt-1 text-sm text-muted">Something wrong? Tell us and we'll look into it.</p>
      </div>

      {isChef && (
        <div className="flex items-start gap-2 rounded-xl bg-warning/10 px-4 py-3">
          <Info size={15} className="mt-0.5 shrink-0 text-warning" />
          <p className="text-xs text-ink/80">
            This endpoint is restricted to accounts with the <b>user</b> role, so a chef account will get a
            403. Use Contact Developer instead.
          </p>
        </div>
      )}

      <FormField label="Describe the issue">
        <textarea
          required
          value={complainMessage}
          onChange={(e) => setComplainMessage(e.target.value)}
          rows={6}
          maxLength={2000}
          className={inputClass}
          placeholder="What happened, and what did you expect?"
        />
      </FormField>
      <p className="-mt-3 text-right text-xs text-muted">{complainMessage.length}/2000</p>

      <button type="submit" disabled={submitting} className={buttonClass}>
        {submitting ? "Submitting..." : "Submit Complaint"}
      </button>
    </form>
  );
}
