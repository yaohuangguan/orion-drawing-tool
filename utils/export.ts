export const downloadSVG = (svgContent: string, filename: string = 'image.svg') => {
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadPNG = (svgContent: string, width: number, height: number, filename: string = 'image.png') => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Create an image from the SVG
  const img = new Image();
  const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    canvas.width = width;
    canvas.height = height;
    if (ctx) {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
    }
    
    const pngUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  img.src = url;
};

/**
 * Basic SVG cleanup to ensure it displays reasonably well if AI returns markdown
 */
export const cleanSVGCode = (code: string): string => {
  let cleaned = code.trim();
  // Remove markdown code blocks if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(svg|xml)?\n/, '').replace(/```$/, '');
  }
  return cleaned.trim();
};