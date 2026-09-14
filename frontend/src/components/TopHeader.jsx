import { useNavigate } from "react-router-dom";

export default function TopHeader({ title, onBack, right }) {
  const navigate = useNavigate();
  return (
    <header className="flex items-center justify-between px-4 pt-5 pb-3 bg-cream sticky top-0 z-30">
      <button
        onClick={onBack || (() => navigate(-1))}
        aria-label="Go back"
        className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-card"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <h1 className="font-display font-semibold text-base text-ink">{title}</h1>
      <div className="w-9 h-9 flex items-center justify-center">{right}</div>
    </header>
  );
}
