import React from 'react';

export default function ListingCardSkeleton() {
  return (
    <div className="bg-white border border-neutral-100 rounded-xl sm:rounded-2xl overflow-hidden flex flex-col pointer-events-none select-none shadow-xs w-full max-w-full min-w-0">
      {/* 1. Image Skeleton (Matches 30% taller mobile aspect ratio) */}
      <div className="relative aspect-[10/14] sm:aspect-[16/17] w-full max-w-full skeleton-shimmer bg-neutral-200/80">
        <div className="absolute top-2 right-2 z-10">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/70 skeleton-shimmer" />
        </div>
      </div>

      {/* 2. Text Box Skeleton (Matching clean unbordered layout) */}
      <div className="p-2 sm:p-3 flex-1 flex flex-col justify-between gap-2 bg-white w-full max-w-full min-w-0 overflow-hidden">
        <div className="space-y-1.5 w-full max-w-full min-w-0 overflow-hidden">
          {/* Price skeleton at top */}
          <div className="h-4 sm:h-5 w-24 sm:w-28 rounded bg-emerald-500/20 skeleton-shimmer" />

          {/* Title skeletons */}
          <div className="h-3.5 sm:h-4 w-full rounded bg-neutral-200 skeleton-shimmer" />
          <div className="h-3 sm:h-3.5 w-3/4 rounded bg-neutral-200/80 skeleton-shimmer" />

          {/* Location skeleton */}
          <div className="h-3 w-28 rounded bg-neutral-150 skeleton-shimmer pt-0.5" />
        </div>
      </div>
    </div>
  );
}
