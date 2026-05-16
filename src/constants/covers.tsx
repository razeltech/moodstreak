import React from 'react';
import { Ghost, TreePine, Moon, Wind, Compass, Sparkles, MapPin, Feather, Waves, Palette, CloudMoon, Flower2 } from 'lucide-react';

export interface DiaryCover {
  id: string;
  name: string;
  color: string;
  icon: React.ReactNode;
  bgClass: string;
}

export const DIARY_COVERS: DiaryCover[] = [
  { id: 'torii', name: 'Torii Gate', color: '#E87E7E', icon: <MapPin size={48} />, bgClass: 'bg-[#FFE4E1]' },
  { id: 'koi', name: 'Koi Pond', color: '#7EB6E8', icon: <Ghost size={48} />, bgClass: 'bg-[#F0F8FF]' }, // Using Ghost as placeholder for Koi
  { id: 'sakura', name: 'Sakura Branch', color: '#FCA3CC', icon: <Flower2 size={48} />, bgClass: 'bg-[#FFF5F7]' },
  { id: 'moon', name: 'Moon & Clouds', color: '#7A7366', icon: <CloudMoon size={48} />, bgClass: 'bg-[#F8F8F8]' },
  { id: 'lantern', name: 'Lantern', color: '#E8D17E', icon: <Sparkles size={48} />, bgClass: 'bg-[#FFFDF7]' },
  { id: 'crane', name: 'Paper Crane', color: '#E87E7E', icon: <Feather size={48} />, bgClass: 'bg-[#FFF8F8]' },
  { id: 'bamboo', name: 'Bamboo Forest', color: '#95D5B2', icon: <TreePine size={48} />, bgClass: 'bg-[#F5FFF7]' },
  { id: 'waves', name: 'Wave Pattern', color: '#7EB6E8', icon: <Waves size={48} />, bgClass: 'bg-[#F0F5FF]' },
  { id: 'geometric', name: 'Gold Geometric', color: '#E8D17E', icon: <Palette size={48} />, bgClass: 'bg-[#FCFCF2]' },
  { id: 'plum', name: 'Plum Blossoms', color: '#FCA3CC', icon: <Flower2 size={48} />, bgClass: 'bg-[#FFF9FA]' },
  { id: 'ink', name: 'Ink Strokes', color: '#2C2C2C', icon: <Wind size={48} />, bgClass: 'bg-[#F4F4F4]' },
  { id: 'compass', name: 'Compass Rose', color: '#A0998E', icon: <Compass size={48} />, bgClass: 'bg-[#F9F9F9]' },
];
