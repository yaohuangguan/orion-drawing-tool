export type ViewMode = 'split' | 'preview' | 'code';

export type ToolType = 'select' | 'brush' | 'eraser' | 'rect' | 'circle' | 'text';

export type BrushType = 'pen' | 'pencil' | 'marker' | 'chalk' | 'spray' | 'highlighter';

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