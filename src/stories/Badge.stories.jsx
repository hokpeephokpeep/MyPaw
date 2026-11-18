import React from 'react';
import { Badge } from '../components/ui/badge';
import { Heart, Cake, Sparkles, Scissors } from 'lucide-react';

export default {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export const Alive = {
  args: {
    children: (
      <>
        <Sparkles className="w-3 h-3 text-emerald-500" />
        <span>อยู่ด้วยกัน</span>
      </>
    ),
    variant: 'alive',
  },
};

export const Memorial = {
  args: {
    children: (
      <>
        <Heart className="w-3 h-3 text-sky-500" />
        <span>ดาวแมว</span>
      </>
    ),
    variant: 'memorial',
  },
};

export const Birthday = {
  args: {
    children: (
      <>
        <Cake className="w-3 h-3 text-amber-600" />
        <span>วันเกิดวันนี้! 🎂</span>
      </>
    ),
    variant: 'birthday',
  },
};

export const Neutered = {
  args: {
    children: (
      <>
        <Scissors className="w-3 h-3" />
        <span>ทำหมันแล้ว</span>
      </>
    ),
    variant: 'secondary',
  },
};
