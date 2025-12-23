import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../utils/translations';
import { Language } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, lang }) => {
  const { user, remainingUserAIGens, logout } = useAuth();
  const t = translations[lang].profile;
  const tAuth = translations[lang].auth;

  if (!isOpen || !user) return null;

  // Assuming daily limit is 5 based on context
  const TOTAL_AI_LIMIT = 5;
  const usedAI = Math.max(0, TOTAL_AI_LIMIT - remainingUserAIGens);
  const aiPercentage = (usedAI / TOTAL_AI_LIMIT) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm font-bold">
               {user.displayName.charAt(0).toUpperCase()}
            </div>
            {t.title}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
           {/* Account Info */}
           <div>
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t.accountInfo}</h3>
               <div className="flex flex-col gap-2">
                   <div className="flex justify-between items-center text-sm">
                       <span className="text-gray-500">{translations[lang].auth.displayName}</span>
                       <span className="font-medium text-gray-900">{user.displayName}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                       <span className="text-gray-500">{translations[lang].auth.email}</span>
                       <span className="font-medium text-gray-900">{user.email}</span>
                   </div>
                   {user.phone && (
                       <div className="flex justify-between items-center text-sm">
                           <span className="text-gray-500">{translations[lang].auth.phone}</span>
                           <span className="font-medium text-gray-900">{user.phone}</span>
                       </div>
                   )}
               </div>
           </div>

           <div className="h-px bg-gray-100"></div>

           {/* Quota Info */}
           <div>
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t.quotaInfo}</h3>
               
               {/* AI Gen */}
               <div className="mb-4">
                   <div className="flex justify-between items-center mb-2">
                       <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                           <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                           {t.aiGeneration}
                       </span>
                       <span className="text-xs text-gray-500">
                           <span className={remainingUserAIGens === 0 ? "text-red-500 font-bold" : "text-gray-900 font-bold"}>{usedAI}</span>
                           <span className="text-gray-400"> / {TOTAL_AI_LIMIT}</span>
                       </span>
                   </div>
                   <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                       <div 
                         className={`h-full rounded-full transition-all duration-500 ${remainingUserAIGens === 0 ? 'bg-red-500' : 'bg-brand-500'}`} 
                         style={{ width: `${aiPercentage}%` }}
                       ></div>
                   </div>
                   <div className="flex justify-between mt-1 text-[10px] text-gray-400">
                       <span>{t.used}: {usedAI}</span>
                       <span>{t.remaining}: {remainingUserAIGens}</span>
                   </div>
               </div>

               {/* Export */}
               <div>
                   <div className="flex justify-between items-center">
                       <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                           <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                           {t.exportImage}
                       </span>
                       <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                           {t.unlimited}
                       </span>
                   </div>
               </div>
           </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100">
            <button
                onClick={() => {
                    logout();
                    onClose();
                }}
                className="w-full py-2 text-sm text-red-600 hover:text-white hover:bg-red-500 border border-red-200 hover:border-red-500 rounded-lg transition-all font-medium"
            >
                {tAuth.logout}
            </button>
        </div>
      </div>
    </div>
  );
};