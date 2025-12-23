import React from 'react';
import { LibraryItem } from '../types';

interface LibraryProps {
  onInsert: (code: string) => void;
}

const ITEMS: LibraryItem[] = [
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
  }
];

export const Library: React.FC<LibraryProps> = ({ onInsert }) => {
  const handleDragStart = (e: React.DragEvent, code: string) => {
    e.dataTransfer.setData('application/vectorverse-snippet', code);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 w-16 items-center py-4 gap-4 shadow-sm z-10">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider -rotate-90 mb-2">Assets</span>
      {ITEMS.map((item) => (
        <div
          key={item.id}
          draggable
          onDragStart={(e) => handleDragStart(e, item.code)}
          onClick={() => onInsert(item.code)}
          className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center cursor-grab hover:bg-white hover:border-brand-500 hover:text-brand-500 hover:shadow-md transition-all group text-gray-400"
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