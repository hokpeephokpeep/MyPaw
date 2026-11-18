import React from 'react';
import PetCard from './PetCard';

/**
 * Storybook CSF 3.0 definition for PetCard
 * Follows the storybook skill best practices
 */
export default {
  title: 'Components/PetCard',
  component: PetCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export const AlivePet = {
  args: {
    pet: {
      id: 'pet-1',
      name: 'ไข่ต้ม',
      gender: 'male',
      birthDate: '2020-10-22',
      status: 'alive',
      avatar: '/sample/cat1.jpg',
      photos: [],
    },
    compact: false,
    dateFormat: 'th',
  },
};

export const DeceasedMemorial = {
  args: {
    pet: {
      id: 'pet-2',
      name: 'ชายน้อย',
      gender: 'male',
      birthDate: '2013-11-30',
      deceasedDate: '2024-05-15',
      status: 'deceased',
      avatar: '/sample/cat2.jpg',
      photos: [],
    },
    compact: false,
    dateFormat: 'th',
  },
};

export const BirthdayToday = {
  args: {
    pet: {
      id: 'pet-3',
      name: 'ทองจิ๋ว',
      gender: 'male',
      birthDate: new Date().toISOString().split('T')[0], // Birthday today!
      status: 'alive',
      avatar: '/sample/cat3.jpg',
      photos: [],
    },
    compact: false,
    dateFormat: 'th',
  },
};

export const CompactGrid = {
  args: {
    pet: {
      id: 'pet-4',
      name: 'พวยพวย',
      gender: 'male',
      birthDate: '2021-08-14',
      status: 'alive',
      avatar: '/sample/cat4.jpg',
      photos: [],
    },
    compact: true,
    dateFormat: 'en',
  },
};
