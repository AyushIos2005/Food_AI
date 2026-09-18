import { useState } from "react";
import toast from "react-hot-toast";
import { Star } from "lucide-react";
import { sendFeedback } from "../../api/feedback.api";
import { getErrorMessage } from "../../lib/errorMessage";
import FormField, { buttonClass } from "../../components/FormField";
import { cx } from "../../lib/utils";

const labels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

export default function Feedback() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!rating) return toast.error("Please pick a rating.");
    setSubmitting(true);
    try {
      // Backend feedbackSchema accepts { rating } only.
      await sendFeedback({ rating });
      toast.success("Thank you for your feedback");
      setRating(0);
    } catch (err) {
      toast.error(getErrorMessage(err, "Couldn't send your feedback."));
    } finally {
      setSubmitting(false);
    }
  }

  const shown = hover || rating;

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="font-display text-lg font-semibold text-ink">Rate FoodAI</h2>
        <p className="mt-1 text-sm text-muted">How is FoodAI working for you?</p>
      </div>

      <FormField label="Your rating">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                className="transition-all duration-200 hover:scale-110"
                aria-label={`${n} star`}
              >
                <Star size={30} className={cx(n <= shown ? "fill-warning text-warning" : "text-slate-300")} />
              </button>
            ))}
          </div>
          {shown > 0 && <span className="text-sm font-semibold text-ink">{labels[shown]}</span>}
        </div>
      </FormField>

      <p className="rounded-xl bg-bg px-4 py-3 text-xs text-muted">
        Want to describe an issue in detail? Use the Complaint tab instead — it accepts a full message.
      </p>

      <button type="submit" disabled={submitting} className={buttonClass}>
        {submitting ? "Sending..." : "Submit Rating"}
      </button>
    </form>
  );
}
