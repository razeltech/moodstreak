# Technical Specifications: Creative Features

This document details the implementation of the advanced creative features in MoodStreak: **Digital Ink (Hand-drawing)** and **Voice-to-Text (ASR)**.

## 1. Digital Ink (Hand-drawing)

The drawing functionality is powered by `react-sketch-canvas`. It allows for smooth, SVG-based digital inking.

### Implementation Details:
- **Component**: `ReactSketchCanvas`
- **Storage**: The drawing data is exported as an SVG string and stored in the `drawings` field of each diary entry in IndexedDB.
- **Scaling**: The canvas dimensions are dynamically linked to the `pageWidth` and `pageHeight` settings.
- **Eraser Mode**: Toggled via the `isEraser` state, which changes the `canvasProps.eraserWidth`.

### Code Reference (JournalPage.tsx):
```tsx
<ReactSketchCanvas
  ref={canvasRef}
  strokeWidth={4}
  strokeColor={brushColor}
  eraserWidth={20}
  canvasColor="transparent"
  style={{ border: 'none' }}
  className="absolute inset-0 z-10"
/>
```

## 2. Voice-to-Text (Speech Recognition)

MoodStreak uses the native **Web Speech API** for mic-to-text. This is a browser-native API that is private, fast, and **100% free**.

### Why Web Speech API?
- **Cost**: $0.00. No API keys or cloud subscriptions needed.
- **Privacy**: Processing happens on the user's device.
- **Offline Support**: Partially available depending on the browser's engine.

### Implementation Details:
- **Interface**: `window.SpeechRecognition` (or `window.webkitSpeechRecognition`).
- **Mode**: `continuous: true` and `interimResults: true`.
- **Handling Results**: The current transcript is appended to the existing diary content in real-time.

### Usage in Code:
```tsx
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.onresult = (event) => {
  const transcript = Array.from(event.results)
    .map(result => result[0])
    .map(result => result.transcript)
    .join('');
  setContent(prev => prev + ' ' + transcript);
};
```

## 3. Draggable elements & Scaling

To solve the issue of selection boxes not matching element sizes across different scales, we use a **Nested Inversion** strategy:
1. The **Outer Wrapper** handles `x`, `y`, `rotate`, and `scale`.
2. The **Content** is placed inside the scaled wrapper naturally.
3. The **UI Handles** (buttons) are inside an `absolute inset-0` div that has an **inverted scale** (`1/scale`). This ensures buttons stay a consistent size regardless of how much the sticker or photo is enlarged.

---
*Refer to `QUICK_REFERENCE.md` for full architecture details.*
