import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-xs font-semibold ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-paw-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 select-none cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-paw-500 text-white shadow-xs hover:bg-paw-600 active:bg-paw-700',
        destructive: 'bg-red-500 text-white shadow-xs hover:bg-red-600 active:bg-red-700',
        outline: 'border border-slate-200 bg-white text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300',
        secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300',
        ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        memorial: 'bg-sky-500 text-white shadow-xs hover:bg-sky-600',
        rainbow: 'bg-gradient-to-r from-sky-400 via-indigo-400 to-amber-400 text-white shadow-xs hover:opacity-95',
      },
      size: {
        default: 'h-10 px-4 py-2 text-xs',
        sm: 'h-8 rounded-xl px-3 text-[11px]',
        lg: 'h-12 rounded-2xl px-6 text-sm',
        icon: 'h-10 w-10 rounded-full p-0',
        'icon-sm': 'h-8 w-8 rounded-full p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, animate = true, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        />
      );
    }

    if (animate) {
      return (
        <motion.button
          ref={ref}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          className={cn(buttonVariants({ variant, size, className }))}
          {...props}
        />
      );
    }

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
