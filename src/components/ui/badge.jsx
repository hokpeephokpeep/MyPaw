import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors focus:outline-none select-none',
  {
    variants: {
      variant: {
        default: 'bg-paw-100 text-paw-700 border border-paw-200/60',
        alive: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
        memorial: 'bg-sky-50 text-sky-800 border border-sky-200/80',
        birthday: 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse',
        secondary: 'bg-slate-100 text-slate-700 border border-slate-200/60',
        outline: 'border border-slate-200 text-slate-700 bg-white',
        destructive: 'bg-red-50 text-red-700 border border-red-200/60',
        subtle: 'bg-white/20 backdrop-blur-md text-white border border-white/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
