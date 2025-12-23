import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Editor } from './components/Editor';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { Library } from './components/Library';
import { AIPanel } from './components/AIPanel';
import { ContextMenu } from './components/ContextMenu';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { downloadSVG, downloadPNG } from './utils/export';
import { ToolType, DrawingSettings, CanvasPreset, Language, Artboard } from './types';
import { saveProject, loadProject } from './utils/storage';
import { useHistory } from './hooks/useHistory';
import { translations } from './utils/translations';
import { useAuth } from './contexts/AuthContext';

const PRESETS: CanvasPreset[] = [
  { name: 'default', width: 800, height: 600, label: 'Default' },
  { name: 'square', width: 800, height: 800, label: 'Square' },
  { name: 'hd', width: 1920, height: 1080, label: 'Full HD' },
  { name: 'a4', width: 595, height: 842, label: 'A4' },
  { name: 'mobile', width: 375, height: 812, label: 'Mobile' },
  { name: 'icon', width: 512, height: 512, label: 'Icon' },
];

const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="white"/>
  <circle cx="400" cy="300" r="100" fill="#3b82f6" />
</svg>`;

const createNewArtboard = (index: number): Artboard => ({
    id: crypto.randomUUID(),
    name: `Untitled ${index}`,
    content: DEFAULT_SVG,
    presetName: 'default',
    createdAt: Date.now()
});

const App: React.FC = () => {
  // Language State - Default to 'zh' (Chinese)
  const [lang, setLang] = useState<Language>('zh');
  const t = translations[lang];
  
  // Auth Logic
  const { isAuthenticated, user, checkExportLimit, recordExportUsage, remainingGuestExports } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Artboard State
  const [artboards, setArtboards] = useState<Artboard[]>([]);
  const [activeArtboardId, setActiveArtboardId] = useState<string>('');

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

  // Initial Load
  useEffect(() => {
    const saved = loadProject();
    if (saved && saved.length > 0) {
        setArtboards(saved);
        setActiveArtboardId(saved[0].id);
        resetState(saved[0].content);
        
        // Restore preset
        const preset = PRESETS.find(p => p.name === saved[0].presetName) || PRESETS[0];
        setCurrentPreset(preset);
    } else {
        // Initialize with default
        const initial = createNewArtboard(1);
        setArtboards([initial]);
        setActiveArtboardId(initial.id);
        resetState(initial.content);
    }
  }, [resetState]);

  // Sync active drawing to artboard list state
  useEffect(() => {
    if (!activeArtboardId) return;

    setArtboards(prev => prev.map(b => {
        if (b.id === activeArtboardId) {
            // Only update if content changed to avoid unnecessary churn, though simple equality check is cheap for strings
            if (b.content !== svgCode || b.presetName !== currentPreset.name) {
                return { ...b, content: svgCode, presetName: currentPreset.name };
            }
        }
        return b;
    }));
  }, [svgCode, currentPreset.name, activeArtboardId]);

  // Save to storage when artboards change
  useEffect(() => {
    if (artboards.length === 0) return;
    const timer = setTimeout(() => {
        const success = saveProject(artboards);
        if (success) setLastSaved(new Date());
    }, 1000); // Debounce save
    return () => clearTimeout(timer);
  }, [artboards]);

  // Keyboard Shortcuts (Undo/Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Input elements should handle their own keys
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

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

  // Artboard Actions
  const handleAddArtboard = () => {
      const newBoard = createNewArtboard(artboards.length + 1);
      setArtboards(prev => [...prev, newBoard]);
      handleSwitchArtboard(newBoard.id, newBoard); // Switch to it
  };

  const handleSwitchArtboard = useCallback((id: string, directBoard?: Artboard) => {
      const target = directBoard || artboards.find(b => b.id === id);
      if (target) {
          setActiveArtboardId(target.id);
          resetState(target.content);
          const preset = PRESETS.find(p => p.name === target.presetName) || PRESETS[0];
          setCurrentPreset(preset);
      }
  }, [artboards, resetState]);

  const handleDeleteArtboard = (id: string) => {
      if (artboards.length <= 1) return; // Prevent deleting last one
      
      const newBoards = artboards.filter(b => b.id !== id);
      setArtboards(newBoards);
      
      if (id === activeArtboardId) {
          // Switch to the first available
          handleSwitchArtboard(newBoards[0].id, newBoards[0]);
      }
  };

  const handleRenameArtboard = (id: string, newName: string) => {
    setArtboards(prev => prev.map(b => 
      b.id === id ? { ...b, name: newName } : b
    ));
  };

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
    if (!checkExportLimit()) {
        alert(translations[lang].limits.guestExportLimit);
        setIsAuthModalOpen(true);
        return;
    }
    const activeBoard = artboards.find(b => b.id === activeArtboardId);
    const name = activeBoard ? activeBoard.name.replace(/\s+/g, '-').toLowerCase() : 'orion-x';
    downloadSVG(svgCode, `${name}-${Date.now()}.svg`);
    recordExportUsage();
  };

  const handleDownloadPNG = () => {
    if (!checkExportLimit()) {
        alert(translations[lang].limits.guestExportLimit);
        setIsAuthModalOpen(true);
        setIsExportMenuOpen(false);
        return;
    }
    const scale = exportQuality === 'hd' ? 2 : 1;
    const finalSize = exportSize * scale;
    const activeBoard = artboards.find(b => b.id === activeArtboardId);
    const name = activeBoard ? activeBoard.name.replace(/\s+/g, '-').toLowerCase() : 'orion-x';
    const filename = `${name}-${exportSize}x${exportSize}-${exportQuality}-${Date.now()}.png`;
    downloadPNG(svgCode, finalSize, finalSize, filename);
    recordExportUsage();
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
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        lang={lang} 
      />

      <UserProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        lang={lang}
      />

      <ContextMenu 
        {...contextMenu} 
        onClose={() => setContextMenu({ ...contextMenu, visible: false })}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onClear={handleClearCanvas}
        t={t}
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

          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30 hidden md:flex shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
            </svg>
          </div>
          <div className="flex flex-col justify-center hidden md:flex">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 leading-none">
              Orion X
            </h1>
            <span className="text-xs text-gray-500 font-medium tracking-wide mt-1">
                {t.tagline}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
           
           {/* Auth Button */}
           {isAuthenticated && user ? (
               <div className="flex items-center gap-2 mr-2">
                   <button 
                       onClick={() => setIsProfileModalOpen(true)}
                       className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors group"
                   >
                       <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold border border-brand-200">
                           {user.displayName.charAt(0).toUpperCase()}
                       </div>
                       <span className="text-xs font-bold text-gray-700 group-hover:text-gray-900">{user.displayName}</span>
                   </button>
               </div>
           ) : (
               <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="mr-2 px-3 py-1.5 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
               >
                   {translations[lang].auth.login}
               </button>
           )}

           {/* Language Toggle */}
           <button 
             onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
             className="px-2 py-1 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-600 rounded uppercase tracking-wider transition-colors"
           >
             {lang === 'en' ? '中文' : 'EN'}
           </button>

           {/* History Controls */}
           <div className="flex items-center bg-gray-100 rounded-lg p-1">
             <button 
                onClick={undo}
                disabled={!canUndo}
                className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
                title={`${t.undo} (Ctrl+Z)`}
             >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
             </button>
             <button 
                onClick={redo}
                disabled={!canRedo}
                className="p-1.5 rounded-md hover:bg-white hover:shadow-sm text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all"
                title={`${t.redo} (Ctrl+Y)`}
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
                className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative group"
            >
                {t.exportSvg}
                {!isAuthenticated && (
                    <span className="absolute -bottom-6 right-0 text-[10px] text-gray-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        {remainingGuestExports} left
                    </span>
                )}
            </button>
            
            <div className="relative" ref={exportMenuRef}>
                <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors shadow-sm
                    ${isExportMenuOpen 
                    ? 'bg-brand-50 border-brand-200 text-brand-700' 
                    : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'}`}
                >
                <span className="hidden md:inline">{t.exportPng}</span>
                <span className="md:hidden">Export</span>
                <svg className={`w-4 h-4 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                </button>

                {isExportMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl p-5 flex flex-col gap-5 z-50">
                    <div>
                    <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">{t.sizeLabel}</label>
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
                    <label className="text-xs font-bold text-gray-400 mb-2 block uppercase tracking-wider">{t.qualityLabel}</label>
                    <div className="flex flex-col gap-2">
                        <button 
                        onClick={() => setExportQuality('standard')}
                        className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg border transition-all text-left
                            ${exportQuality === 'standard' 
                            ? 'bg-brand-50 border-brand-500 text-brand-700' 
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                        >
                        <span>{t.qualityStandard}</span>
                        <span className="text-gray-400">@1x</span>
                        </button>
                        <button 
                        onClick={() => setExportQuality('hd')}
                        className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg border transition-all text-left
                            ${exportQuality === 'hd' 
                            ? 'bg-brand-50 border-brand-500 text-brand-700' 
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                        >
                        <span>{t.qualityHd}</span>
                        <span className="text-brand-600 font-bold">@2x</span>
                        </button>
                    </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                         {!isAuthenticated && (
                             <div className="mb-2 text-xs text-center text-gray-500">
                                 {translations[lang].limits.remainingExports} <span className="font-bold text-gray-800">{remainingGuestExports}</span>
                             </div>
                         )}
                        <button
                            onClick={handleDownloadPNG}
                            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-lg shadow-md transition-all active:scale-95"
                        >
                            {t.exportImage}
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
                    t={t}
                    artboards={artboards}
                    activeArtboardId={activeArtboardId}
                    onSwitchArtboard={handleSwitchArtboard}
                    onAddArtboard={handleAddArtboard}
                    onDeleteArtboard={handleDeleteArtboard}
                    onRenameArtboard={handleRenameArtboard}
                />
                <Library onInsert={handleLibraryInsert} t={t} />
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
                <Editor code={svgCode} onChange={setSvgCode} t={t} />
            </div>
            <AIPanel 
                currentCode={svgCode} 
                onCodeGenerated={setSvgCode} 
                t={t} 
                lang={lang}
            />
            </div>
        )}
      </main>
    </div>
  );
};

export default App;