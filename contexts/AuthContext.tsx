import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { loginUser, registerUser, logoutUser } from '../services/auth';

interface AuthContextType extends AuthState {
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  checkExportLimit: () => boolean;
  checkAILimit: () => boolean;
  recordAIUsage: () => void;
  recordExportUsage: () => void;
  remainingGuestExports: number;
  remainingUserAIGens: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_EXPORT_LIMIT = 10;
const USER_AI_LIMIT = 5;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const [remainingGuestExports, setRemainingGuestExports] = useState(GUEST_EXPORT_LIMIT);
  const [remainingUserAIGens, setRemainingUserAIGens] = useState(USER_AI_LIMIT);

  // Load user from local storage on mount
  useEffect(() => {
    const token = localStorage.getItem('orion_token');
    const userStr = localStorage.getItem('orion_user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false
        });
        updateLimitsState(user.id);
      } catch (e) {
        localStorage.removeItem('orion_token');
        localStorage.removeItem('orion_user');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
      updateLimitsState(null); // Guest limits check
    }
  }, []);

  const updateLimitsState = (userId: string | null) => {
      const today = new Date().toDateString();
      
      if (userId) {
          // User AI Limits
          const aiKey = `orion_usage_ai_${userId}_${today}`;
          const currentAI = parseInt(localStorage.getItem(aiKey) || '0');
          setRemainingUserAIGens(Math.max(0, USER_AI_LIMIT - currentAI));
          // Logged in users have unlimited exports, so we ignore guest exports
          setRemainingGuestExports(999);
      } else {
          // Guest Export Limits
          const exportKey = `orion_usage_export_guest_${today}`;
          const currentExports = parseInt(localStorage.getItem(exportKey) || '0');
          setRemainingGuestExports(Math.max(0, GUEST_EXPORT_LIMIT - currentExports));
          // Guest has 0 AI
          setRemainingUserAIGens(0);
      }
  };

  const login = async (data: any) => {
    const res = await loginUser(data);
    const { token, user } = res;
    
    localStorage.setItem('orion_token', token);
    localStorage.setItem('orion_user', JSON.stringify(user));
    
    setState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false
    });
    updateLimitsState(user.id);
  };

  const register = async (data: any) => {
    const res = await registerUser(data);
    const { token, user } = res;
    
    localStorage.setItem('orion_token', token);
    localStorage.setItem('orion_user', JSON.stringify(user));
    
    setState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false
    });
    updateLimitsState(user.id);
  };

  const logout = async () => {
    if (state.token) {
        await logoutUser(state.token);
    }
    localStorage.removeItem('orion_token');
    localStorage.removeItem('orion_user');
    
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false
    });
    updateLimitsState(null);
  };

  const checkExportLimit = (): boolean => {
      if (state.isAuthenticated) return true; // Unlimited for users

      const today = new Date().toDateString();
      const exportKey = `orion_usage_export_guest_${today}`;
      const count = parseInt(localStorage.getItem(exportKey) || '0');
      
      return count < GUEST_EXPORT_LIMIT;
  };

  const recordExportUsage = () => {
      if (state.isAuthenticated) return;

      const today = new Date().toDateString();
      const exportKey = `orion_usage_export_guest_${today}`;
      const count = parseInt(localStorage.getItem(exportKey) || '0');
      const newCount = count + 1;
      localStorage.setItem(exportKey, newCount.toString());
      setRemainingGuestExports(Math.max(0, GUEST_EXPORT_LIMIT - newCount));
  };

  const checkAILimit = (): boolean => {
      if (!state.isAuthenticated || !state.user) return false;

      const today = new Date().toDateString();
      const aiKey = `orion_usage_ai_${state.user.id}_${today}`;
      const count = parseInt(localStorage.getItem(aiKey) || '0');

      return count < USER_AI_LIMIT;
  };

  const recordAIUsage = () => {
      if (!state.isAuthenticated || !state.user) return;
      
      const today = new Date().toDateString();
      const aiKey = `orion_usage_ai_${state.user.id}_${today}`;
      const count = parseInt(localStorage.getItem(aiKey) || '0');
      const newCount = count + 1;
      localStorage.setItem(aiKey, newCount.toString());
      setRemainingUserAIGens(Math.max(0, USER_AI_LIMIT - newCount));
  };

  return (
    <AuthContext.Provider value={{ 
        ...state, 
        login, 
        register, 
        logout, 
        checkExportLimit, 
        checkAILimit,
        recordAIUsage,
        recordExportUsage,
        remainingGuestExports,
        remainingUserAIGens
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
