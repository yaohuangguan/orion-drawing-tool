import React from 'react';
import { translations } from '../utils/translations';

type Translation = typeof translations.en;

interface EditorProps {
  code: string;
  onChange: (value: string) => void;
  t: Translation;
}

export const Editor: React.FC<EditorProps> = ({ code, onChange, t }) => {
  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      <div className="bg-gray-50 px-4 py-2 text-xs font-mono font-semibold text-gray-500 border-b border-gray-200 flex justify-between items-center tracking-wider uppercase">
        <span>{t.source}</span>
        <span className="text-gray-400">{code.length} chars</span>
      </div>
      <textarea
        className="flex-1 w-full h-full bg-white text-gray-800 font-mono text-sm p-4 outline-none resize-none leading-relaxed selection:bg-blue-100"
        value={code}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        placeholder="<!-- SVG code will appear here -->"
      />
    </div>
  );
};