import React, { useMemo } from 'react';
import { LibraryItem } from '../types';
import { translations } from '../utils/translations';

type Translation = typeof translations.en;

interface LibraryProps {
  onInsert: (code: string) => void;
  t: Translation;
}

export const Library: React.FC<LibraryProps> = ({ onInsert, t }) => {
  const handleDragStart = (e: React.DragEvent, code: string) => {
    e.dataTransfer.setData('application/vectorverse-snippet', code);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const items = useMemo<LibraryItem[]>(() => [
    {
        id: 'star',
        name: 'Star',
        icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
        code: '<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>'
    },
    {
        id: 'heart',
        name: 'Heart',
        icon: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
        code: '<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill="#f43f5e" stroke="none"/>'
    },
    {
        id: 'cloud',
        name: 'Cloud',
        icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z',
        code: '<path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" fill="#e0f2fe" stroke="#38bdf8" stroke-width="2"/>'
    },
    {
        id: 'badge',
        name: 'Badge',
        icon: 'M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6.4-4.8-6.4 4.8 2.4-7.2-6-4.8h7.6z', 
        code: '<circle cx="256" cy="256" r="100" fill="#3b82f6" /><path d="M256 320l-40 40v-60l-40-20 40-20v-60l40 40 40-40v60l40 20-40 20v60z" fill="white" />'
    },
    {
        id: 'tree',
        name: 'Tree',
        icon: 'M12 2L2 22h20L12 2zm0 4l6 12H6l6-12z',
        code: '<g transform="translate(0,0)"><rect x="180" y="300" width="40" height="100" fill="#78350f" /><path d="M200 100 L100 300 H300 Z" fill="#15803d" /><path d="M200 50 L130 180 H270 Z" fill="#16a34a" /></g>'
    },
    {
        id: 'cat',
        name: 'Cat',
        icon: 'M12 2c-.5 0-1 .2-1.4.6l-2.2 2.2c-.4.4-.6 1-.6 1.6v2.4c0 .6.2 1.2.6 1.6l1 1c.4.4 1 .6 1.6.6h2c.6 0 1.2-.2 1.6-.6l1-1c.4-.4.6-1 .6-1.6V6.4c0-.6-.2-1.2-.6-1.6L13.4 2.6c-.4-.4-.9-.6-1.4-.6z',
        code: '<g transform="scale(0.8)"><path d="M200 250 Q150 250 150 350 Q150 450 250 450 Q350 450 350 350 Q350 250 300 250 L280 180 L250 220 L220 180 Z" fill="#374151"/><circle cx="220" cy="300" r="10" fill="white"/><circle cx="280" cy="300" r="10" fill="white"/><path d="M240 330 Q250 340 260 330" stroke="pink" stroke-width="3" fill="none"/></g>'
    },
    {
        id: 'house',
        name: 'House',
        icon: 'M3 10l9-7 9 7v10a1 1 0 01-1 1h-4v-6h-4v6H4a1 1 0 01-1-1V10z',
        code: '<g transform="scale(1)"><rect x="150" y="200" width="200" height="200" fill="#fcd34d"/><polygon points="130,200 250,80 370,200" fill="#ef4444"/><rect x="220" y="300" width="60" height="100" fill="#78350f"/><rect x="180" y="240" width="50" height="50" fill="#93c5fd" rx="2"/><rect x="270" y="240" width="50" height="50" fill="#93c5fd" rx="2"/></g>'
    }
  ], []);

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 w-16 items-center py-4 gap-4 shadow-sm z-10 overflow-y-auto custom-scrollbar">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider -rotate-90 mb-2 mt-2">{t.assets}</span>
      {items.map((item) => (
        <div
          key={item.id}
          draggable
          onDragStart={(e) => handleDragStart(e, item.code)}
          onClick={() => onInsert(item.code)}
          className="w-10 h-10 min-h-[2.5rem] bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center cursor-grab hover:bg-white hover:border-brand-500 hover:text-brand-500 hover:shadow-md transition-all group text-gray-400"
          title={`Drag or Click to add ${item.name}`}
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={item.icon} />
          </svg>
        </div>
      ))}
    </div>
  );
};