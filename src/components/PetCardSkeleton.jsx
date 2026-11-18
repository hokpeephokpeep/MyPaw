import React from 'react';

/**
 * 💀 Modern Shimmer Skeleton for Pet Cards
 * Prevents Layout Shift (CLS = 0) with identical dimensions
 */

export function PetCardSkeleton({ compact = false }) {
  if (compact) {
    // 2-Column Grid Card Skeleton
    return (
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/70 shadow-2xs p-0 flex flex-col animate-pulse">
        {/* Aspect-square Hero Image placeholder */}
        <div className="w-full aspect-square bg-gradient-to-tr from-slate-200 via-slate-100 to-slate-200 rounded-t-[14px]" />
        
        {/* Info footer */}
        <div className="p-3 space-y-2">
          {/* Pet name & gender placeholder */}
          <div className="flex items-center justify-between">
            <div className="h-4 bg-slate-200 rounded-md w-3/5" />
            <div className="w-4 h-4 bg-slate-200 rounded-full" />
          </div>

          {/* Birthday placeholder */}
          <div className="h-3 bg-slate-100 rounded-md w-4/5" />

          {/* Age tags placeholder */}
          <div className="flex items-center justify-between pt-1">
            <div className="h-5 bg-slate-200/80 rounded-full w-20" />
            <div className="h-5 bg-slate-100 rounded-full w-12" />
          </div>
        </div>
      </div>
    );
  }

  // 1-Column Hero Card Skeleton
  return (
    <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/70 shadow-sm p-0 flex flex-col animate-pulse">
      {/* Aspect-square Hero Image placeholder */}
      <div className="w-full aspect-square bg-gradient-to-tr from-slate-200 via-slate-100 to-slate-200 rounded-t-[30px]" />

      {/* Hero content footer */}
      <div className="p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-slate-200 rounded-md w-2/5" />
          <div className="w-5 h-5 bg-slate-200 rounded-full" />
        </div>
        <div className="h-3.5 bg-slate-100 rounded-md w-1/2" />
        <div className="flex items-center gap-2 pt-1">
          <div className="h-6 bg-slate-200 rounded-full w-28" />
          <div className="h-6 bg-slate-100 rounded-full w-16" />
        </div>
      </div>
    </div>
  );
}

export function PetListItemSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200/70 shadow-2xs animate-pulse">
      <div className="flex items-center gap-3">
        {/* Round thumbnail placeholder */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-200 via-slate-100 to-slate-200 flex-shrink-0" />
        <div className="space-y-1.5">
          <div className="h-4 bg-slate-200 rounded-md w-24" />
          <div className="h-3 bg-slate-100 rounded-md w-36" />
        </div>
      </div>
      <div className="h-6 bg-slate-200/80 rounded-full w-14" />
    </div>
  );
}

export function NotificationItemSkeleton() {
  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-2xs space-y-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-slate-200 flex-shrink-0" />
          <div className="space-y-1.5">
            <div className="h-4 bg-slate-200 rounded-md w-32" />
            <div className="h-3 bg-slate-100 rounded-md w-24" />
          </div>
        </div>
        <div className="h-5 bg-slate-100 rounded-full w-16" />
      </div>
    </div>
  );
}

export default PetCardSkeleton;
