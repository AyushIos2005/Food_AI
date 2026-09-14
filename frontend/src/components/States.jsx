export function LoadingState({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-ink-soft">
      <span className="w-8 h-8 rounded-full border-2 border-orange-200 border-t-orange-500 animate-spin" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="aspect-[4/3] skeleton rounded-none" />
          <div className="p-3 space-y-2">
            <div className="h-4 skeleton w-3/4" />
            <div className="h-3 skeleton w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="card flex flex-col items-center justify-center text-center py-16 px-6 gap-2">
      <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mb-2 text-2xl">
        🍽️
      </div>
      <p className="font-display text-xl text-ink">{title}</p>
      {description && <p className="text-sm text-ink-soft max-w-[280px]">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="card flex flex-col items-center justify-center text-center py-16 px-6 gap-3">
      <p className="font-display text-xl text-ink">Couldn't load this</p>
      <p className="text-sm text-ink-soft max-w-[280px]">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline px-6 py-2 text-sm">
          Try again
        </button>
      )}
    </div>
  );
}
