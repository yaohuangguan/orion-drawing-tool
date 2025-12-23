import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ToolType, DrawingSettings, CanvasPreset } from '../types';
import { createSVGElement, getMousePosition, serializeSVG } from '../utils/svg-manipulation';

interface CanvasProps {
  code: string;
  onChange: (newCode: string) => void;
  activeTool: ToolType;
  settings: DrawingSettings;
  preset: CanvasPreset;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export const Canvas: React.FC<CanvasProps> = ({ code, onChange, activeTool, settings, preset, onContextMenu }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  
  // Interaction State
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<SVGElement | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [selection, setSelection] = useState<SVGElement | null>(null);

  // Inject Filters into SVG
  const injectFilters = (svg: SVGSVGElement) => {
      let defs = svg.querySelector('defs');
      if (!defs) {
          defs = createSVGElement('defs') as SVGDefsElement;
          svg.insertBefore(defs, svg.firstChild);
      }

      // Check if filters already exist
      if (!defs.querySelector('#filter-chalk')) {
          const chalkFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
          chalkFilter.setAttribute('id', 'filter-chalk');
          chalkFilter.innerHTML = `
              <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          `;
          defs.appendChild(chalkFilter);
      }

      if (!defs.querySelector('#filter-spray')) {
          const sprayFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
          sprayFilter.setAttribute('id', 'filter-spray');
          sprayFilter.innerHTML = `
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="10" />
              <feGaussianBlur stdDeviation="0.5" />
          `;
          defs.appendChild(sprayFilter);
      }
  };

  // Sync internal SVG with prop code
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Parse the code string into a document
    const parser = new DOMParser();
    const doc = parser.parseFromString(code, 'image/svg+xml');
    const newSvg = doc.documentElement as unknown as SVGSVGElement;

    if (newSvg.nodeName === 'parsererror') {
      return; 
    }

    // Force viewBox update based on preset if it's vastly different or missing
    // We prioritize the preset, but if the SVG already has a viewbox, we might want to respect it
    // However, the requirement is to resize the artboard.
    newSvg.setAttribute('viewBox', `0 0 ${preset.width} ${preset.height}`);
    
    if (!newSvg.getAttribute('xmlns')) {
        newSvg.setAttribute('xmlns', "http://www.w3.org/2000/svg");
    }

    // Ensure Defs
    injectFilters(newSvg);

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(newSvg);
    svgRef.current = newSvg;
    
  }, [code, preset]);

  // Handle preset change separately to update existing SVG reference if code doesn't change
  useEffect(() => {
      if (svgRef.current) {
          svgRef.current.setAttribute('viewBox', `0 0 ${preset.width} ${preset.height}`);
          // Don't trigger onChange here to avoid infinite loops, updateOutput handles it on interaction
      }
  }, [preset]);

  const updateOutput = useCallback(() => {
    if (svgRef.current) {
        const newCode = serializeSVG(svgRef.current);
        if (newCode !== code) {
            onChange(newCode);
        }
    }
  }, [onChange, code]);


  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent drawing on right click (button 2)
    if (e.button !== 0 || !svgRef.current) return;
    
    const pos = getMousePosition(e, svgRef.current);
    setStartPos(pos);
    setIsDrawing(true);

    if (activeTool === 'select') {
      const target = e.target as SVGElement;
      if (target !== svgRef.current && target.tagName !== 'defs') {
        setSelection(target);
        setCurrentElement(target);
      } else {
        setSelection(null);
        setCurrentElement(null);
      }
      return;
    }

    // Drawing Logic
    let newEl: SVGElement | null = null;
    
    // Determine effective style
    const isEraser = activeTool === 'eraser';
    const effectiveColor = isEraser ? '#ffffff' : settings.color;
    
    // Fill
    const effectiveFill = activeTool === 'rect' || activeTool === 'circle' ? settings.fill : 'none';

    if (activeTool === 'rect') {
      newEl = createSVGElement('rect');
      newEl.setAttribute('x', pos.x.toString());
      newEl.setAttribute('y', pos.y.toString());
      newEl.setAttribute('width', '0');
      newEl.setAttribute('height', '0');
      newEl.setAttribute('fill', effectiveFill);
      newEl.setAttribute('stroke', effectiveColor);
      newEl.setAttribute('stroke-width', settings.strokeWidth.toString());
    } else if (activeTool === 'circle') {
      newEl = createSVGElement('circle');
      newEl.setAttribute('cx', pos.x.toString());
      newEl.setAttribute('cy', pos.y.toString());
      newEl.setAttribute('r', '0');
      newEl.setAttribute('fill', effectiveFill);
      newEl.setAttribute('stroke', effectiveColor);
      newEl.setAttribute('stroke-width', settings.strokeWidth.toString());
    } else if (activeTool === 'brush') {
      newEl = createSVGElement('path');
      newEl.setAttribute('d', `M ${pos.x} ${pos.y}`);
      newEl.setAttribute('fill', 'none');
      newEl.setAttribute('stroke', effectiveColor);
      
      // Brush Styles
      if (settings.brushType === 'pencil') {
          newEl.setAttribute('stroke-width', Math.max(1, settings.strokeWidth / 2).toString());
          newEl.setAttribute('opacity', '0.8');
          newEl.setAttribute('stroke-linecap', 'round');
      } else if (settings.brushType === 'pen') {
          newEl.setAttribute('stroke-width', settings.strokeWidth.toString());
          newEl.setAttribute('stroke-linecap', 'round');
          newEl.setAttribute('opacity', settings.opacity.toString());
      } else if (settings.brushType === 'marker') {
          newEl.setAttribute('stroke-width', (settings.strokeWidth * 2).toString());
          newEl.setAttribute('stroke-linecap', 'square');
          newEl.setAttribute('opacity', '0.5'); // Markers are usually semi-transparent
      } else if (settings.brushType === 'highlighter') {
          newEl.setAttribute('stroke-width', (settings.strokeWidth * 3).toString());
          newEl.setAttribute('stroke-linecap', 'butt');
          newEl.setAttribute('opacity', '0.3');
          // For highlighter, we might want mix-blend-mode if SVG supported it easily in all viewers, 
          // but opacity is the safe bet.
      } else if (settings.brushType === 'chalk') {
          newEl.setAttribute('stroke-width', settings.strokeWidth.toString());
          newEl.setAttribute('stroke-linecap', 'round');
          newEl.setAttribute('filter', 'url(#filter-chalk)');
          newEl.setAttribute('opacity', settings.opacity.toString());
      } else if (settings.brushType === 'spray') {
          newEl.setAttribute('stroke-width', (settings.strokeWidth * 1.5).toString());
          newEl.setAttribute('stroke-linecap', 'round');
          newEl.setAttribute('filter', 'url(#filter-spray)');
          newEl.setAttribute('opacity', settings.opacity.toString());
      }
    } else if (activeTool === 'eraser') {
        newEl = createSVGElement('path');
        newEl.setAttribute('d', `M ${pos.x} ${pos.y}`);
        newEl.setAttribute('fill', 'none');
        newEl.setAttribute('stroke', '#ffffff');
        newEl.setAttribute('stroke-width', (settings.strokeWidth * 2).toString());
        newEl.setAttribute('stroke-linecap', 'round');
    } else if (activeTool === 'text') {
        newEl = createSVGElement('text');
        newEl.setAttribute('x', pos.x.toString());
        newEl.setAttribute('y', pos.y.toString());
        newEl.setAttribute('fill', settings.color);
        newEl.setAttribute('font-size', (settings.strokeWidth * 10).toString()); 
        newEl.textContent = 'Text Layer';
    }

    if (newEl) {
      svgRef.current.appendChild(newEl);
      setCurrentElement(newEl);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !svgRef.current) return;
    const pos = getMousePosition(e, svgRef.current);

    if (activeTool === 'select' && currentElement) {
        // Move Logic
        const dx = pos.x - startPos.x;
        const dy = pos.y - startPos.y;
        
        const tagName = currentElement.tagName;
        if (tagName === 'rect' || tagName === 'text' || tagName === 'image') {
            const x = parseFloat(currentElement.getAttribute('x') || '0');
            const y = parseFloat(currentElement.getAttribute('y') || '0');
            currentElement.setAttribute('x', (x + dx).toString());
            currentElement.setAttribute('y', (y + dy).toString());
            setStartPos(pos);
        } else if (tagName === 'circle' || tagName === 'ellipse') {
            const cx = parseFloat(currentElement.getAttribute('cx') || '0');
            const cy = parseFloat(currentElement.getAttribute('cy') || '0');
            currentElement.setAttribute('cx', (cx + dx).toString());
            currentElement.setAttribute('cy', (cy + dy).toString());
            setStartPos(pos);
        } 
    } else if (currentElement) {
        // Creation Logic
        if (activeTool === 'rect') {
            const w = Math.abs(pos.x - startPos.x);
            const h = Math.abs(pos.y - startPos.y);
            const x = Math.min(pos.x, startPos.x);
            const y = Math.min(pos.y, startPos.y);
            currentElement.setAttribute('x', x.toString());
            currentElement.setAttribute('y', y.toString());
            currentElement.setAttribute('width', w.toString());
            currentElement.setAttribute('height', h.toString());
        } else if (activeTool === 'circle') {
            const r = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2));
            currentElement.setAttribute('r', r.toString());
        } else if (activeTool === 'brush' || activeTool === 'eraser') {
            const d = currentElement.getAttribute('d') || '';
            currentElement.setAttribute('d', `${d} L ${pos.x} ${pos.y}`);
        }
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
        setIsDrawing(false);
        if (activeTool !== 'select') {
            setCurrentElement(null);
        }
        updateOutput();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!svgRef.current) return;
    
    const snippet = e.dataTransfer.getData('application/vectorverse-snippet');
    if (snippet) {
        const pos = getMousePosition(e, svgRef.current);
        const parser = new DOMParser();
        const doc = parser.parseFromString(`<svg>${snippet}</svg>`, 'image/svg+xml');
        const children = Array.from(doc.documentElement.childNodes);
        
        children.forEach(child => {
            if (child instanceof SVGElement) {
                // Heuristic positioning
                if (child.hasAttribute('cx')) child.setAttribute('cx', pos.x.toString());
                if (child.hasAttribute('x')) child.setAttribute('x', pos.x.toString());
                if (child.hasAttribute('cy')) child.setAttribute('cy', pos.y.toString());
                if (child.hasAttribute('y')) child.setAttribute('y', pos.y.toString());
                svgRef.current?.appendChild(child);
            }
        });
        updateOutput();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      if (onContextMenu) {
          onContextMenu(e);
      }
  }

  return (
    <div className="flex-1 h-full bg-gray-100 flex items-center justify-center p-8 overflow-hidden relative"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={handleContextMenu}
    >
      {/* Background Dots */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{
            backgroundImage: 'radial-gradient(#9ca3af 1px, transparent 1px)',
            backgroundSize: '24px 24px'
        }}
      ></div>

      <div 
        className={`relative shadow-xl bg-white rounded-md overflow-hidden transition-all duration-300 ease-in-out ${activeTool !== 'select' ? 'cursor-crosshair' : 'cursor-default'}`}
        style={{ 
            maxWidth: '100%', 
            maxHeight: '100%',
            aspectRatio: `${preset.width}/${preset.height}`,
            width: preset.width > 800 ? '100%' : `${preset.width}px`,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div 
            ref={containerRef}
            className="w-full h-full"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        />
      </div>
    </div>
  );
};