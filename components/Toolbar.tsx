import React from 'react';
import { ToolType, DrawingSettings, BrushType, CanvasPreset } from '../types';

interface ToolbarProps {
  activeTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  settings: DrawingSettings;
  onUpdateSettings: (settings: DrawingSettings) => void;
  canvasPreset: CanvasPreset;
  onSelectCanvasPreset: (preset: CanvasPreset) => void;
  presets: CanvasPreset[];
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  activeTool, 
  onSelectTool, 
  settings, 
  onUpdateSettings,
  canvasPreset,
  onSelectCanvasPreset,
  presets
}) => {
  const tools: { id: ToolType; icon: React.ReactNode; label: string }[] = [
    {
      id: 'select',
      label: 'Select (V)',
      icon: <path d="M7 2l12 11.2-5.8.5 3.3 7.3-2.2.9-3.2-7.4-4.4 4.6V2z" />
    },
    {
      id: 'brush',
      label: 'Draw (B)',
      icon: <path d="M12 21a9 9 0 0 0 9-9c0-3.3-2.7-6-6-6-2 0-3.7 1-5 2.5a5.9 5.9 0 0 0-5 2.5c-2 3-1.6 5.8 1 7l-.5.5" />
    },
    {
      id: 'eraser',
      label: 'Eraser (E)',
      icon: <path d="M20 20.75L15.25 16 19 12.25 13 6.25 9.25 10 4.5 5.25 1.5 8.25c0 0-1 4.5 3.5 9 3.25 3.25 6 3.5 6 3.5L14.75 20.75H20zM13.75 7L18.25 11.5 14.5 15.25 10 10.75 13.75 7z" />
    },
    {
      id: 'rect',
      label: 'Rectangle (R)',
      icon: <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    },
    {
      id: 'circle',
      label: 'Circle (C)',
      icon: <circle cx="12" cy="12" r="10" />
    },
    {
      id: 'text',
      label: 'Text (T)',
      icon: <path d="M4 6h16M4 12h16M4 18h7" />
    }
  ];

  const brushes: { id: BrushType; label: string; previewClass: string }[] = [
    { id: 'pen', label: 'Ink Pen', previewClass: 'rounded-full' },
    { id: 'pencil', label: 'Pencil', previewClass: 'bg-gray-400 opacity-80' },
    { id: 'marker', label: 'Marker', previewClass: 'rounded-sm opacity-60' },
    { id: 'highlighter', label: 'Highlighter', previewClass: 'rounded-none opacity-40 h-3' },
    { id: 'chalk', label: 'Chalk', previewClass: 'border-dashed border-2' },
    { id: 'spray', label: 'Spray', previewClass: 'blur-[1px]' },
  ];

  const colors = [
    '#000000', '#ffffff', '#ef4444', '#f97316', '#f59e0b', 
    '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', 
    '#d946ef', '#f43f5e'
  ];

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-[300px] shrink-0 z-20 shadow-sm">
      {/* Canvas Size Section */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Artboard</h2>
        <select 
          value={canvasPreset.name}
          onChange={(e) => {
            const selected = presets.find(p => p.name === e.target.value);
            if (selected) onSelectCanvasPreset(selected);
          }}
          className="w-full text-sm border-gray-200 rounded-lg p-2 bg-white focus:ring-2 focus:ring-brand-500 outline-none border"
        >
          {presets.map(p => (
            <option key={p.name} value={p.name}>{p.label} ({p.width}x{p.height})</option>
          ))}
        </select>
      </div>

      <div className="p-4 border-b border-gray-100">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Tools</h2>
        <div className="grid grid-cols-3 gap-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              title={tool.label}
              className={`aspect-square rounded-xl flex items-center justify-center transition-all duration-200
                ${activeTool === tool.id 
                  ? 'bg-brand-600 text-white shadow-md scale-105' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {tool.icon}
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-b border-gray-100 flex-1 overflow-y-auto custom-scrollbar">
        {activeTool === 'brush' && (
          <div className="mb-6">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Brushes</h2>
            <div className="grid grid-cols-3 gap-2">
              {brushes.map((b) => (
                <button
                  key={b.id}
                  onClick={() => onUpdateSettings({ ...settings, brushType: b.id })}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all
                    ${settings.brushType === b.id 
                      ? 'border-brand-500 bg-brand-50 text-brand-700' 
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                >
                  <div className={`w-4 h-4 bg-current mb-1 ${b.previewClass}`}></div>
                  <span className="text-[10px] font-medium">{b.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Properties</h2>
        
        {/* Color Picker */}
        <div className="mb-6">
            <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Stroke Color</label>
                <span className="text-xs font-mono text-gray-400">{settings.color}</span>
            </div>
            <div className="grid grid-cols-6 gap-2 mb-3">
            {colors.map(c => (
                <button
                    key={c}
                    onClick={() => onUpdateSettings({ ...settings, color: c })}
                    className={`w-8 h-8 rounded-full border border-gray-200 shadow-sm transition-transform hover:scale-110 ${settings.color === c ? 'ring-2 ring-offset-2 ring-brand-500' : ''}`}
                    style={{ backgroundColor: c }}
                />
            ))}
            </div>
            <input 
                type="color" 
                value={settings.color}
                onChange={(e) => onUpdateSettings({ ...settings, color: e.target.value })}
                className="w-full h-10 rounded-lg border border-gray-200 cursor-pointer"
            />
        </div>

        {/* Size Slider */}
        <div className="mb-6">
            <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Size</label>
                <span className="text-xs font-medium text-gray-500">{settings.strokeWidth}px</span>
            </div>
            <input 
                type="range" 
                min="1" 
                max="100" 
                value={settings.strokeWidth}
                onChange={(e) => onUpdateSettings({ ...settings, strokeWidth: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
        </div>
        
        {/* Opacity Slider */}
        <div className="mb-6">
            <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Opacity</label>
                <span className="text-xs font-medium text-gray-500">{Math.round(settings.opacity * 100)}%</span>
            </div>
            <input 
                type="range" 
                min="0.1" 
                max="1" 
                step="0.1"
                value={settings.opacity}
                onChange={(e) => onUpdateSettings({ ...settings, opacity: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
        </div>

        {/* Fill Toggle */}
        <div className="mb-6">
             <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div className={`w-5 h-5 rounded border flex items-center justify-center ${settings.fill !== 'none' ? 'bg-brand-600 border-brand-600' : 'border-gray-300 bg-white'}`}>
                    {settings.fill !== 'none' && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <input 
                    type="checkbox" 
                    className="hidden"
                    checked={settings.fill !== 'none'}
                    onChange={(e) => onUpdateSettings({ ...settings, fill: e.target.checked ? settings.color : 'none' })}
                />
                <span className="text-sm font-medium text-gray-700">Fill Shape</span>
             </label>
        </div>

        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs text-blue-700 leading-relaxed">
                <strong>Tip:</strong> Use <strong>Eraser</strong> to mask areas. Select tools let you move existing shapes.
            </p>
        </div>
      </div>
    </div>
  );
};