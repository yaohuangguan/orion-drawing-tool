export type ViewMode = 'split' | 'preview' | 'code';

export type ToolType = 'select' | 'brush' | 'eraser' | 'rect' | 'circle' | 'text';

export type BrushType = 'pen' | 'pencil' | 'marker' | 'chalk' | 'spray' | 'highlighter' | 'watercolor' | 'oil' | 'charcoal';

export type Language = 'en' | 'zh';

export interface CanvasPreset {
  name: string;
  width: number;
  height: number;
  label: string;
}

export interface DrawingSettings {
  color: string;
  strokeWidth: number;
  opacity: number;
  fill: string; // 'none' or color
  brushType: BrushType;
}

export interface LibraryItem {
  id: string;
  name: string;
  icon: string; // SVG path for the icon
  code: string; // SVG snippet to inject
}

export interface AIRequestState {
  isLoading: boolean;
  error: string | null;
  status: 'idle' | 'thinking' | 'completed' | 'error';
}

export interface Artboard {
  id: string;
  name: string;
  content: string;
  presetName: string;
  createdAt: number;
}

export interface User {
  id: string;
  displayName: string;
  email: string;
  phone?: string;
  vip: boolean;
  // Add other fields from backend payload if needed
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
