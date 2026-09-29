export default function Avatar({ name = "", size = 36, className = "" }) {
  const letter = (String(name).trim()[0] || "U").toUpperCase();
  return (
    <div
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      className={`rounded-full bg-orange-100 text-orange-800 font-semibold flex items-center justify-center shrink-0 ${className}`}
    >
      {letter}
    </div>
  );
}

export function Badge({ tone = "orange", children, className = "" }) {
  const tones = { orange: "badge", green: "badge badge-green", dark: "badge badge-dark" };
  return <span className={`${tones[tone] || tones.orange} ${className}`}>{children}</span>;
}
