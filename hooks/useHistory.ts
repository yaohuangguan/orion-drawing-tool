import { useState, useCallback } from 'react';

export function useHistory<T>(initialState: T) {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const state = history[currentIndex];

  const setState = useCallback((newState: T) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(newState);
      return newHistory;
    });
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex]);

  const undo = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  }, []);

  const redo = useCallback(() => {
    setCurrentIndex(prev => Math.min(history.length - 1, prev + 1));
  }, [history.length]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  // Function to reset history if needed (e.g., loading a new project)
  const resetState = useCallback((newState: T) => {
    setHistory([newState]);
    setCurrentIndex(0);
  }, []);

  return { state, setState, undo, redo, canUndo, canRedo, resetState };
}