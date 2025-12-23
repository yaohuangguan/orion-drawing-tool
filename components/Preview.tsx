import React, { useRef, useEffect, useState } from 'react';

interface PreviewProps {
  code: string;
}

export const Preview: React.FC<PreviewProps> = ({ code }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgDimensions, setSvgDimensions] = useState({ width: 512, height: 512 });

  // Simple attempt to extract dimensions for the "checkerboard" sizing, 
  // though the SVG itself will scale to the container.
  useEffect(() => {
    if (containerRef.current) {
      const svgElement = containerRef.current.querySelector('svg');
      if (svgElement) {
        // Just purely visual feedback if we wanted to show dimensions
      }
    }
  }, [code]);

  return (
    <div className="flex-1 h-full bg-gray-950 flex items-center justify-center p-8 overflow-hidden relative">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{
                backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
                backgroundSize: '20px 20px'
            }}
        ></div>

      <div 
        className="relative shadow-2xl checkerboard rounded-sm border border-gray-700 overflow-hidden transition-all duration-300 ease-in-out"
        style={{ 
            maxWidth: '100%', 
            maxHeight: '100%',
            aspectRatio: '1/1', // Default square aspect, but SVG can override
            width: '512px' // Base width
        }}
      >
        <div 
            ref={containerRef}
            className="w-full h-full flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: code }} 
        />
      </div>
    </div>
  );
};