import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../utils/translations';
import { Language } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, lang }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    phone: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const t = translations[lang].auth;

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login({ email: formData.email, password: formData.password });
      } else {
        if (formData.password !== formData.confirmPassword) {
            throw new Error('Passwords do not match');
        }
        await register({
            displayName: formData.displayName,
            email: formData.email,
            password: formData.password,
            passwordConf: formData.confirmPassword,
            phone: formData.phone
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'login' ? t.loginTitle : t.registerTitle}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 bg-white text-gray-900">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 font-medium">
              {error}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">{t.displayName}</label>
              <input
                type="text"
                name="displayName"
                required
                value={formData.displayName}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm bg-white text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">{t.email}</label>
            <input
              type="text"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm bg-white text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            />
          </div>
          
           {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">{t.phone}</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+86..."
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm bg-white text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">{t.password}</label>
            <input
              type="password"
              name="password"
              required
              minLength={mode === 'register' ? 8 : undefined}
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm bg-white text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">{t.confirmPassword}</label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm bg-white text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? '...' : (mode === 'login' ? t.login : t.register)}
          </button>
        </form>

        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
          <button
            type="button"
            onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError(null);
            }}
            className="text-sm text-brand-600 hover:text-brand-800 font-medium"
          >
            {mode === 'login' ? t.loginSwitch : t.registerSwitch}
          </button>
        </div>
      </div>
    </div>
  );
};