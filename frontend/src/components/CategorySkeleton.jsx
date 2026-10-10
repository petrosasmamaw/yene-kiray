import React from 'react';

export function CategoryPillSkeleton() {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div
          key={i}
          className="h-8 w-28 sm:w-36 rounded-xl bg-white border border-neutral-200 skeleton-shimmer shrink-0 shadow-xs"
        />
      ))}
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3 pb-2 sm:pb-1">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div
          key={i}
          className="rounded-xl sm:rounded-2xl overflow-hidden border border-neutral-200 w-full h-20 sm:h-32 bg-white skeleton-shimmer relative shadow-xs"
        >
          <div className="absolute inset-x-1.5 sm:inset-x-2.5 bottom-1.5 sm:bottom-2.5 space-y-1 sm:space-y-1.5">
            <div className="h-2.5 sm:h-3 w-4/5 rounded bg-neutral-200 skeleton-shimmer" />
            <div className="h-2 w-1/2 rounded bg-amber-500/20 skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}
