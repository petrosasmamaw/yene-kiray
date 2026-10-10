import React from 'react';

export default function ListingCardSkeleton() {
  return (
    <div className="bg-[#090a0d]/90 border border-white/[0.07] rounded-2xl overflow-hidden flex flex-col pointer-events-none select-none">
      {/* Image Container with Badges Skeleton */}
      <div className="relative aspect-[16/10] w-full skeleton-shimmer bg-neutral-900/80">
        {/* Top Badges Bar */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
          <div className="h-6 w-20 rounded-md bg-white/[0.08] skeleton-shimmer" />
          <div className="h-7 w-7 rounded-xl bg-white/[0.08] skeleton-shimmer" />
        </div>

        {/* Bottom Floating Price Pill */}
        <div className="absolute bottom-3 left-3 z-10">
          <div className="h-8 w-28 rounded-xl bg-black/80 border border-white/[0.08] skeleton-shimmer" />
        </div>
      </div>

      {/* Content Section Skeleton */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2.5">
          {/* Location Line */}
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-amber-500/20 skeleton-shimmer shrink-0" />
            <div className="h-3 w-32 rounded bg-white/[0.06] skeleton-shimmer" />
          </div>

          {/* Title Lines */}
          <div className="h-4 w-4/5 rounded bg-white/[0.08] skeleton-shimmer" />
          <div className="h-3.5 w-3/5 rounded bg-white/[0.05] skeleton-shimmer" />

          {/* Description Preview */}
          <div className="space-y-1.5 pt-1">
            <div className="h-2.5 w-full rounded bg-white/[0.04] skeleton-shimmer" />
            <div className="h-2.5 w-2/3 rounded bg-white/[0.04] skeleton-shimmer" />
          </div>
        </div>

        {/* Card Footer */}
        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white/[0.08] skeleton-shimmer shrink-0" />
            <div className="h-3 w-20 rounded bg-white/[0.05] skeleton-shimmer" />
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-white/[0.06] skeleton-shimmer" />
            <div className="w-14 h-7 rounded-lg bg-white/[0.06] skeleton-shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}
