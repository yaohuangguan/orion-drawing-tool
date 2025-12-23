/**
 * Utilities for manipulating SVG DOM and strings
 */

export const createSVGElement = (type: string): SVGElement => {
  return document.createElementNS('http://www.w3.org/2000/svg', type);
};

export const getMousePosition = (evt: React.MouseEvent | MouseEvent, svg: SVGSVGElement) => {
  const CTM = svg.getScreenCTM();
  if (!CTM) return { x: 0, y: 0 };
  return {
    x: (evt.clientX - CTM.e) / CTM.a,
    y: (evt.clientY - CTM.f) / CTM.d
  };
};

export const serializeSVG = (svgNode: Node): string => {
  const serializer = new XMLSerializer();
  let str = serializer.serializeToString(svgNode);
  // Clean up some browser-added namespaces if they get messy, 
  // though XMLSerializer usually handles it well.
  return str;
};

export const extractSVGBody = (svgString: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) return svgString; // Return original if parse fails
  return doc.documentElement.innerHTML;
};
