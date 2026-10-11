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
    <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-7 gap-2.5 sm:gap-4 pb-2">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} className="flex flex-col items-center space-y-1.5 w-full pointer-events-none select-none">
          {/* Square Image Box Skeleton */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl bg-neutral-200/60 skeleton-shimmer shadow-2xs" />
          {/* Text Line Below Skeleton */}
          <div className="h-3 w-12 sm:w-16 rounded bg-neutral-200 skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
}
