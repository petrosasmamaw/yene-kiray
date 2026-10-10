import React from 'react';

export default function ListingCardSkeleton() {
  return (
    <div className="bg-white border border-neutral-200/90 rounded-xl sm:rounded-2xl overflow-hidden flex flex-col pointer-events-none select-none shadow-xs">
      {/* Image Container with Badges Skeleton */}
      <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full skeleton-shimmer bg-neutral-200/80">
        {/* Top Right: ONLY Favorite Button Skeleton */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/70 skeleton-shimmer" />
        </div>

        {/* Bottom Floating Price Pill */}
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 z-10">
          <div className="h-6 sm:h-8 w-20 sm:w-28 rounded-lg sm:rounded-xl bg-white/90 border border-neutral-200 skeleton-shimmer shadow-xs" />
        </div>
      </div>

      {/* Content Section Skeleton */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
        <div className="space-y-2">
          {/* Category & Location Row Skeleton in the Box */}
          <div className="flex items-center justify-between gap-1.5">
            <div className="h-5 sm:h-6 w-16 sm:w-24 rounded-md sm:rounded-lg bg-amber-500/20 skeleton-shimmer" />
            <div className="h-3 w-16 sm:w-24 rounded bg-neutral-200 skeleton-shimmer" />
          </div>

          {/* Title Lines */}
          <div className="h-3.5 sm:h-4 w-4/5 rounded bg-neutral-200 skeleton-shimmer" />
          <div className="h-3 sm:h-3.5 w-3/5 rounded bg-neutral-200/80 skeleton-shimmer" />

          {/* Description Preview (Desktop only) */}
          <div className="hidden sm:block space-y-1.5 pt-1">
            <div className="h-2.5 w-full rounded bg-neutral-100 skeleton-shimmer" />
            <div className="h-2.5 w-2/3 rounded bg-neutral-100 skeleton-shimmer" />
          </div>
        </div>

        {/* Card Footer */}
        <div className="pt-2 sm:pt-3 border-t border-neutral-100 flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-neutral-200 skeleton-shimmer shrink-0" />
            <div className="h-2.5 sm:h-3 w-12 sm:w-20 rounded bg-neutral-200 skeleton-shimmer" />
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-neutral-100 skeleton-shimmer" />
            <div className="w-10 sm:w-14 h-6 sm:h-7 rounded-md sm:rounded-lg bg-neutral-100 skeleton-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}
