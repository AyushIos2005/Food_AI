import { Link } from "react-router-dom";
import { UtensilsCrossed } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <UtensilsCrossed size={24} />
      </span>
      <h1 className="font-display text-3xl font-semibold text-ink">Nothing cooking here</h1>
      <p className="text-sm text-muted">The page you're looking for doesn't exist.</p>
      <Link to="/home" className="mt-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark">
        Back to Home
      </Link>
    </div>
  );
}
