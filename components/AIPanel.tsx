import React, { useState } from 'react';
import { generateSVGWithAI } from '../services/gemini';
import { cleanSVGCode } from '../utils/export';
import { AIRequestState } from '../types';
import { translations } from '../utils/translations';

type Translation = typeof translations.en;

interface AIPanelProps {
  currentCode: string;
  onCodeGenerated: (newCode: string) => void;
  t: Translation;
}

export const AIPanel: React.FC<AIPanelProps> = ({ currentCode, onCodeGenerated, t }) => {
  const [prompt, setPrompt] = useState('');
  const [state, setState] = useState<AIRequestState>({
    isLoading: false,
    error: null,
    status: 'idle'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setState({ isLoading: true, error: null, status: 'thinking' });

    try {
      const rawCode = await generateSVGWithAI(prompt, currentCode);
      const cleanCode = cleanSVGCode(rawCode);
      onCodeGenerated(cleanCode);
      setState({ isLoading: false, error: null, status: 'completed' });
      setPrompt(''); // Optional: clear prompt on success
    } catch (err) {
      setState({ 
        isLoading: false, 
        error: "Failed to generate SVG. Please try again.", 
        status: 'error' 
      });
    }
  };

  return (
    <div className="flex flex-col h-64 bg-gray-850 border-t border-gray-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          {t.aiTitle} (Gemini 3 Pro)
        </h3>
        {state.status === 'thinking' && (
          <span className="text-xs text-purple-400 animate-pulse">{t.aiThinking}</span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-2">
        <div className="relative flex-1">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t.aiPlaceholder}
            className="w-full h-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        </div>
        
        <div className="flex justify-between items-center">
            {state.error && <span className="text-xs text-red-400">{state.error}</span>}
            <div className="flex-1"></div>
            <button
                type="submit"
                disabled={state.isLoading || !prompt.trim()}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2
                ${state.isLoading 
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg'
                }`}
            >
                {state.isLoading ? (
                    <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{t.generating}</span>
                    </>
                ) : (
                    <>
                    <span>{t.generate}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    </>
                )}
            </button>
        </div>
      </form>
    </div>
  );
};