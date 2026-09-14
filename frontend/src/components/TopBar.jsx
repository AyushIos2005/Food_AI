import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TopBar({ title, onBack, right }) {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-30 bg-cream/95 backdrop-blur px-4 pt-4 pb-3 flex items-center justify-between">
      <button
        onClick={onBack || (() => navigate(-1))}
        className="w-9 h-9 rounded-full bg-white border border-(--color-line) flex items-center justify-center"
      >
        <ChevronLeft size={20} />
      </button>
      <h1 className="text-[16px] font-semibold text-ink">{title}</h1>
      <div className="w-9 h-9 flex items-center justify-center">{right}</div>
    </div>
  );
}
