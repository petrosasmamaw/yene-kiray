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
    <div className="flex sm:grid sm:grid-cols-4 lg:grid-cols-7 gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden border border-neutral-200 shrink-0 w-32 sm:w-auto h-28 bg-white skeleton-shimmer relative shadow-xs"
        >
          <div className="absolute inset-x-2.5 bottom-2.5 space-y-1.5">
            <div className="h-3 w-3/4 rounded bg-neutral-200 skeleton-shimmer" />
            <div className="h-2 w-1/2 rounded bg-amber-500/20 skeleton-shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}
