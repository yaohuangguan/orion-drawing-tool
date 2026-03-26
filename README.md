# Orion X SVG Generator

Orion X is a powerful, professional SVG creation tool and image generator built with React and powered by Google Gemini AI. It combines traditional vector drawing tools with advanced AI capabilities to help users create stunning graphics directly in the browser.

## Features

### 🎨 Professional Drawing Tools
- **Vector Tools**: Brush, Eraser, Rectangle, Circle, Text, and Select tools.
- **Advanced Brushes**: 
  - **Ink Pen**: Solid, crisp lines.
  - **Pencil**: Textured, slightly opaque sketching lines.
  - **Marker**: Broad, semi-transparent strokes.
  - **Highlighter**: Transparent overlay for emphasizing areas.
  - **Chalk**: Rough, textured edges using SVG filters.
  - **Spray**: Diffused, particulate effect using SVG turbulence filters.
- **Customizable Properties**: Adjust stroke color, width, opacity, and fill.

### 🤖 AI-Powered Generation
- **Text-to-SVG**: Integrated with **Google Gemini 3 Pro** to generate vector graphics from natural language prompts.
- **Context Aware**: The AI understands the current state of your canvas and can modify existing SVG code based on your requests.
- **Thinking Mode**: Utilizes high-budget thinking tokens for complex visual reasoning tasks.

### 📐 Canvas & Layout
- **Artboard Presets**: Switch between standard sizes like HD (1920x1080), Square (1:1), A4, Mobile, and Icon sizes.
- **Tablet Optimization**: Responsive interface with collapsible sidebars (Left/Right panels) to maximize drawing space on smaller screens.
- **Responsive ViewBox**: The drawing area adjusts dynamically to your selected preset.

### 🛠️ Workflow Enhancements
- **Undo/Redo**: Full history stack support with keyboard shortcuts (`Ctrl+Z`, `Ctrl+Y`).
- **Context Menu**: Right-click to access quick actions.
- **Library**: Drag-and-drop commonly used assets (Icons, Shapes).
- **Live Code Editor**: View and edit the raw SVG source code in real-time.

### 💾 Export
- **SVG**: Download clean, optimized SVG files.
- **PNG**: Export high-resolution raster images (Standard @1x and HD Retina @2x).

## Shortcuts

| Action | Shortcut |
|--------|----------|
| Undo | `Ctrl + Z` |
| Redo | `Ctrl + Y` or `Ctrl + Shift + Z` |
| Toggle Left Panel | `Ctrl + [` |
| Toggle Right Panel | `Ctrl + ]` |
| Select Tool | `V` |
| Brush Tool | `B` |
| Eraser Tool | `E` |
| Rectangle Tool | `R` |
| Circle Tool | `C` |
| Text Tool | `T` |

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS / Vanilla CSS
- **AI**: VectorVerse Backend API (Gemini 3 Flash)
- **State Management**: Custom React Hooks

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Backend Service**:
   The application connects to the production VectorVerse API for AI generation. No local Gemini API key is required.

---
*Created with VectorVerse*
