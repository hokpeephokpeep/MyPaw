import React from 'react';
import { Button } from '../components/ui/button';
import { Heart, Sparkles, Plus, Bell } from 'lucide-react';

export default {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export const Default = {
  args: {
    children: 'บันทึกข้อมูล',
    variant: 'default',
    size: 'default',
  },
};

export const WithIcon = {
  args: {
    children: (
      <>
        <Sparkles className="w-4 h-4 text-amber-200" />
        <span>สุขสันต์วันเกิด</span>
      </>
    ),
    variant: 'default',
  },
};

export const Memorial = {
  args: {
    children: (
      <>
        <Heart className="w-4 h-4 text-sky-200" />
        <span>คิดถึงดาวแมว</span>
      </>
    ),
    variant: 'memorial',
  },
};

export const IconButton = {
  args: {
    children: <Bell className="w-4 h-4" />,
    size: 'icon',
    variant: 'secondary',
    'aria-label': 'การแจ้งเตือน',
  },
};
