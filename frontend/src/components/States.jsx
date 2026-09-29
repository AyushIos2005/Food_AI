import { CircleAlert, UtensilsCrossed } from "lucide-react";

// Spinner + text. Used where a skeleton makes no sense (session check).
export function LoadingState({ label = "Loading..." }) {
  return (
    <div role="status" className="flex flex-col items-center justify-center py-16 gap-3 text-ink-soft">
      <span aria-hidden="true" className="w-8 h-8 rounded-full border-2 border-orange-200 border-t-orange-600 animate-spin" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function Skeleton({ className = "" }) {
  return <div aria-hidden="true" className={`skeleton ${className}`} />;
}

// Every skeleton has the same footprint as the content it stands in for, so
// nothing jumps when the data arrives. `label` is read out by screen readers.
export function SkeletonGrid({ count = 6, label = "Loading recipes..." }) {
  return (
    <div role="status" aria-busy="true" aria-label={label}>
      <span className="sr-only">{label}</span>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card overflow-hidden" aria-hidden="true">
            <div className="aspect-[4/3] skeleton rounded-none" />
            <div className="p-3.5 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonList({ count = 4, label = "Loading..." }) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className="space-y-3">
      <span className="sr-only">{label}</span>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-4 flex items-center gap-3" aria-hidden="true">
          <Skeleton className="w-11 h-11 !rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonPosts({ count = 2, label = "Loading community..." }) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className="max-w-2xl space-y-5">
      <span className="sr-only">{label}</span>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card overflow-hidden" aria-hidden="true">
          <div className="aspect-[4/3] skeleton rounded-none" />
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-9 h-9 !rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonRecipe({ label = "Loading recipe..." }) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className="max-w-3xl space-y-4">
      <span className="sr-only">{label}</span>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 !rounded-[22px]" />
        ))}
      </div>
      <Skeleton className="h-14 !rounded-2xl" />
      <Skeleton className="h-48 !rounded-[22px]" />
      <Skeleton className="h-48 !rounded-[22px]" />
    </div>
  );
}

// Always give people a next step: pass `action` (and optionally `secondary`).
export function EmptyState({ title, description, action, secondary, icon: Icon = UtensilsCrossed, className = "" }) {
  return (
    <div className={`card flex flex-col items-center justify-center text-center py-14 px-6 gap-2 ${className}`}>
      <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mb-2 text-orange-700">
        <Icon size={26} aria-hidden="true" />
      </div>
      <p className="font-display text-xl text-ink">{title}</p>
      {description && <p className="text-sm text-ink-soft max-w-[320px]">{description}</p>}
      {(action || secondary) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
          {action}
          {secondary}
        </div>
      )}
    </div>
  );
}

// Friendly message + a way out. Pass onRetry, and showBack for "Go back".
export function ErrorState({ title = "Couldn't load this", message, onRetry, showBack = false, className = "" }) {
  return (
    <div role="alert" className={`card flex flex-col items-center justify-center text-center py-14 px-6 gap-3 ${className}`}>
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-danger">
        <CircleAlert size={26} aria-hidden="true" />
      </div>
      <p className="font-display text-xl text-ink">{title}</p>
      <p className="text-sm text-ink-soft max-w-[320px]">{message || "Something went wrong. Please try again."}</p>
      {(onRetry || showBack) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
          {onRetry && (
            <button type="button" onClick={onRetry} className="btn-primary btn-sm">
              Try again
            </button>
          )}
          {showBack && (
            <button type="button" onClick={() => window.history.back()} className="btn-outline btn-sm">
              Go back
            </button>
          )}
        </div>
      )}
    </div>
  );
}
