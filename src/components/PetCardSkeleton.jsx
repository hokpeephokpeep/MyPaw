import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPaw } from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '../i18n.jsx';

/**
 * 💀 Modern Shimmer Skeleton for Pet Cards
 * Prevents Layout Shift (CLS = 0) with identical dimensions
 */

export function PetCardSkeleton({ compact = false, isPlaceholder = false, onClick }) {
  const { t } = useLanguage();
  if (compact) {
    // 2-Column Grid Card Skeleton
    return (
      <div 
        onClick={onClick}
        className={`relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-2xs p-0 flex flex-col select-none ${
          isPlaceholder 
            ? 'cursor-pointer hover:border-paw-300 active:scale-[0.98] transition-all duration-150 group/skeleton' 
            : 'animate-pulse'
        }`}
      >
        {/* Aspect-square Hero Image placeholder */}
        <div className="w-full aspect-square bg-gradient-to-tr from-slate-200/70 via-slate-100 to-slate-200/60 rounded-t-2xl relative overflow-hidden flex flex-col justify-between p-3">
          {isPlaceholder ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-slate-300 group-hover/skeleton:text-paw-400 transition-colors">
              <div className="w-10 h-10 rounded-full bg-white/90 shadow-2xs flex items-center justify-center text-slate-400 group-hover/skeleton:bg-paw-50 group-hover/skeleton:text-paw-500 transition-all mb-1 active:scale-95">
                <FontAwesomeIcon icon={faPlus} className="text-sm" />
              </div>
              <span className="font-mitr text-xs text-slate-400 font-normal group-hover/skeleton:text-paw-600 transition-colors">
                {t('add_cat_placeholder')}
              </span>
            </div>
          ) : (
            <div className="w-full h-full animate-pulse" />
          )}

          {/* Bottom text overlays (name & date placeholders) */}
          <div className="relative z-10 space-y-1.5 mt-auto">
            <div className="h-3.5 bg-slate-300/50 rounded-md w-2/3 animate-pulse" />
            <div className="h-2.5 bg-slate-300/30 rounded-md w-1/2 animate-pulse" />
          </div>
        </div>
        
        {/* Info footer */}
        <div className="px-[6%] py-2.5 flex items-center justify-between bg-white border-t border-slate-100">
          <div className="h-4 bg-slate-200/80 rounded-md w-16 animate-pulse" />
          <div className="h-5 bg-amber-50/80 border border-amber-100/70 rounded-xl px-1.5 py-0.5 flex items-center justify-center">
            <div className="h-2.5 bg-amber-200/80 rounded-full w-6 animate-pulse" />
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
