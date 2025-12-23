import React, { useState, useRef, useEffect } from 'react';
import { Editor } from './components/Editor';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { Library } from './components/Library';
import { AIPanel } from './components/AIPanel';
import { ContextMenu } from './components/ContextMenu';
import { downloadSVG, downloadPNG } from './utils/export';
import { ToolType, DrawingSettings, CanvasPreset } from './types';
import { saveProject, loadProject } from './utils/storage';
import { useHistory } from './hooks/useHistory';

const PRESETS: CanvasPreset[] = [
  { name: 'default', width: 800, height: 600, label: 'Default (4:3)' },
  { name: 'square', width: 800, height: 800, label: 'Square (1:1)' },
  { name: 'hd', width: 1920, height: 1080, label: 'Full HD (16:9)' },
  { name: 'a4', width: 595, height: 842, label: 'A4 Paper' },
  { name: 'mobile', width: 375, height: 812, label: 'Mobile Screen' },
  { name: 'icon', width: 512, height: 512, label: 'Icon (512px)' },
];

const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="white"/>
  <circle cx="400" cy="300" r="100" fill="#3b82f6" />
</svg>`;

const App: React.FC = () => {
  // Use custom history hook instead of simple useState
  const { 
    state: svgCode, 
    setState: setSvgCode, 
    undo, 
    redo, 
    canUndo, 
    canRedo, 
    resetState 
  } = useHistory(DEFAULT_SVG);

  const [activeTool, setActiveTool] = useState<ToolType>('brush');
  const [currentPreset, setCurrentPreset] = useState<CanvasPreset>(PRESETS[0]);
  const [drawingSettings, setDrawingSettings] = useState<DrawingSettings>({
    color: '#111827',
    strokeWidth: 4,
    opacity: 1,
    fill: 'none',
    brushType: 'pen'
  });

  // Panel Visibility State (Default to collapsed on tablet/mobile < 1024px)
  const [showLeftPanel, setShowLeftPanel] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);
  const [showRightPanel, setShowRightPanel] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number }>({
    visible: false, x: 0, y: 0
  });

  // Auto-save Status
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load on mount
  useEffect(() => {
    const saved = loadProject();
    if (saved) {
        // Reset history to the loaded state
        resetState(saved);
    }
    
    // Resize handler to adjust layout on orientation change
    const handleResize = () => {
       if (window.innerWidth < 1024) {
           // Optional: auto-collapse on resize to small, but usually better to let user decide after init
       }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [resetState]);

  // Save on change
  useEffect(() => {
    const timer = setTimeout(() => {
        const success = saveProject(svgCode);
        if (success) setLastSaved(new Date());
    }, 1000); // Debounce save
    return () => clearTimeout(timer);
  }, [svgCode]);

  // Keyboard Shortcuts (Undo/Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          if (canRedo) redo();
        } else {
          if (canUndo) undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        if (canRedo) redo();
      } else if (e.key === 'v') setActiveTool('select');
      else if (e.key === 'b') setActiveTool('brush');
      else if (e.key === 'e') setActiveTool('eraser');
      else if (e.key === 'r') setActiveTool('rect');
      else if (e.key === 'c') setActiveTool('circle');
      else if (e.key === 't') setActiveTool('text');
      // Panel Toggles
      else if ((e.ctrlKey || e.metaKey) && e.key === '[') setShowLeftPanel(prev => !prev);
      else if ((e.ctrlKey || e.metaKey) && e.key === ']') setShowRightPanel(prev => !prev);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  // Export UI State
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [exportSize, setExportSize] = useState<512 | 1024>(1024);
  const [exportQuality, setExportQuality] = useState<'standard' | 'hd'>('standard');
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownloadSVG = () => {
    downloadSVG(svgCode, `orion-x-${Date.now()}.svg`);
  };

  const handleDownloadPNG = () => {
    const scale = exportQuality === 'hd' ? 2 : 1;
    const finalSize = exportSize * scale;
    const filename = `orion-x-${exportSize}x${exportSize}-${exportQuality}-${Date.now()}.png`;
    downloadPNG(svgCode, finalSize, finalSize, filename);
    setIsExportMenuOpen(false);
  };

  const handleLibraryInsert = (snippet: string) => {
      const closingTagIndex = svgCode.lastIndexOf('</svg>');
      if (closingTagIndex !== -1) {
          const newCode = svgCode.slice(0, closingTagIndex) + snippet + svgCode.slice(closingTagIndex);
          setSvgCode(newCode);
      }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY
    });
  };

  const handleClearCanvas = () => {
      setSvgCode(DEFAULT_SVG);
  };

  return (
    <div className="flex flex-col h-screen bg-white text-gray-900">
      <ContextMenu 
        {...contextMenu} 
        onClose={() => setContextMenu({ ...contextMenu, visible: false })}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onClear={handleClearCanvas}
      />

      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-30 shadow-sm transition-all">
        <div className="flex items-center gap-3">
            {/* Left Panel Toggle */}
            <button 
                onClick={() => setShowLeftPanel(!showLeftPanel)}
                className={`p-2 rounded-lg transition-colors ${showLeftPanel ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
                title="Toggle Tools (Ctrl + [)"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
            </button>

          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30 hidden md:flex">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 hidden md:block">
              Orion X
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
           {/* History Controls */}
           <div className="flex items-center bg-gray-100 rounded-lg p-1">
             <button 
                onClick={undo}
                disabled={!canUndo}
                className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
                title="Undo (Ctrl+Z)"
             >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
             </button>
             <button 
                onClick={redo}
                disabled={!canRedo}
                className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
                title="Redo (Ctrl+Y)"
             >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                </svg>
             </button>
           </div>

          <div className="h-6 w-px bg-gray-200 mx-2 hidden md:block"></div>

          <div className="flex items-center gap-2">
            <button
                onClick={handleDownloadSVG}
                className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
                Export SVG
            </button>
            
            <div className="relative" ref={exportMenuRef}>
                <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors shadow-sm
                    ${isExportMenuOpen 
                    ? 'bg-brand-50 border-brand-200 text-brand-700' 
                    : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'}`}
                >
                <span className="hidden md:inline">Export PNG</span>
                <span className="md:hidden">Export</span>
                <svg className={`w-4 h-4 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                </button>

                {isExportMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl p-5 flex flex-col gap-5 z-50">
                    <div>
                    <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">Size</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button 
                        onClick={() => setExportSize(512)}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all
                            ${exportSize === 512 
                            ? 'bg-brand-50 border-brand-500 text-brand-700' 
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                        >
                        512px
                        </button>
                        <button 
                        onClick={() => setExportSize(1024)}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all
                            ${exportSize === 1024 
                            ? 'bg-brand-50 border-brand-500 text-brand-700' 
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                        >
                        1024px
                        </button>
                    </div>
                    </div>

                    <div>
                    <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">Quality</label>
                    <div className="flex flex-col gap-2">
                        <button 
                        onClick={() => setExportQuality('standard')}
                        className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg border transition-all text-left
                            ${exportQuality === 'standard' 
                            ? 'bg-brand-50 border-brand-500 text-brand-700' 
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                        >
                        <span>Standard Resolution</span>
                        <span className="text-gray-400">@1x</span>
                        </button>
                        <button 
                        onClick={() => setExportQuality('hd')}
                        className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg border transition-all text-left
                            ${exportQuality === 'hd' 
                            ? 'bg-brand-50 border-brand-500 text-brand-700' 
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                        >
                        <span>High Definition (Retina)</span>
                        <span className="text-brand-600 font-bold">@2x</span>
                        </button>
                    </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                        <button
                            onClick={handleDownloadPNG}
                            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-lg shadow-md transition-all active:scale-95"
                        >
                            Download Image
                        </button>
                    </div>
                </div>
                )}
            </div>
            
             {/* Right Panel Toggle */}
             <button 
                onClick={() => setShowRightPanel(!showRightPanel)}
                className={`p-2 rounded-lg transition-colors ml-2 ${showRightPanel ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
                title="Toggle Code/AI (Ctrl + ])"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Tools (Left) */}
        {showLeftPanel && (
            <>
                <Toolbar 
                    activeTool={activeTool} 
                    onSelectTool={setActiveTool} 
                    settings={drawingSettings}
                    onUpdateSettings={setDrawingSettings}
                    canvasPreset={currentPreset}
                    onSelectCanvasPreset={setCurrentPreset}
                    presets={PRESETS}
                />
                <Library onInsert={handleLibraryInsert} />
            </>
        )}

        {/* Canvas (Center) */}
        <div className="flex-1 bg-gray-50 relative flex flex-col min-w-0">
          <Canvas 
            code={svgCode} 
            onChange={setSvgCode} 
            activeTool={activeTool} 
            settings={drawingSettings}
            preset={currentPreset}
            onContextMenu={handleContextMenu}
          />
        </div>

        {/* Code (Right) */}
        {showRightPanel && (
            <div className="w-[350px] flex flex-col bg-white border-l border-gray-200 shadow-xl z-20 shrink-0">
            <div className="flex-1 overflow-hidden relative">
                <Editor code={svgCode} onChange={setSvgCode} />
            </div>
            <AIPanel currentCode={svgCode} onCodeGenerated={setSvgCode} />
            </div>
        )}
      </main>
    </div>
  );
};

export default App;