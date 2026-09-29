import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { IconButton } from "./ui/Button";

export default function TopBar({ title, onBack, right }) {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-30 bg-cream/95 backdrop-blur px-4 pt-4 pb-3 flex items-center justify-between">
      <IconButton label="Go back" icon={ChevronLeft} size={20} onClick={onBack || (() => navigate(-1))} />
      <h1 className="text-[16px] font-semibold text-ink">{title}</h1>
      <div className="w-11 h-11 flex items-center justify-center">{right}</div>
    </div>
  );
}
