# MoodStreak: Technical Implementation Guide

This document explains the implementation of the core interactive features in the MoodStreak app: **Hand-Drawing (Digital Ink)** and **Mic-to-Text (Speech Recognition)**.

---

## 1. Hand-Drawing (Digital Ink)

The digital ink feature allows users to draw, doodle, and sketch directly onto their journal pages.

### Core Library
We use **`react-sketch-canvas`** for the drawing engine. It provides a SVG-based drawing surface that is performant and supports export/import of paths.

### Implementation Details
The drawing surface is implemented as a layer within the `JournalPage` component.

#### Component Setup
```tsx
import { ReactSketchCanvas, type ReactSketchCanvasRef } from 'react-sketch-canvas';

// Inside JournalPage
const canvasRef = useRef<ReactSketchCanvasRef>(null);

<div className={cn(
  "absolute inset-0 transition-opacity duration-300",
  isDrawingMode ? 'z-50 pointer-events-auto opacity-100' : 'z-0 pointer-events-none opacity-50'
)}>
  <ReactSketchCanvas
    ref={canvasRef}
    strokeWidth={3}
    strokeColor="#1f2937"
    canvasColor="transparent"
    className="!border-none"
  />
</div>
```

#### Layering Logic
- **`isDrawingMode = true`**: The canvas is brought to the front (`z-50`) and receives mouse/touch events (`pointer-events-auto`).
- **`isDrawingMode = false`**: The canvas is pushed behind the text area (`z-0`) and becomes invisible to interactions (`pointer-events-none`), allowing the user to type.

#### Data Persistence
We save and load the drawing paths as a JSON string in the Dexie database.

- **Saving**:
  ```ts
  const paths = await canvasRef.current.exportPaths();
  const doodleData = JSON.stringify(paths);
  // Store doodleData in IndexedDB
  ```

- **Loading**:
  ```ts
  if (entry.doodleData) {
    canvasRef.current.loadPaths(JSON.parse(entry.doodleData));
  }
  ```

---

## 2. Mic-to-Text (Speech Recognition)

The voice-to-text feature allows users to dictate their journal entries using their microphone.

### Core API
We use the native **Web Speech API** (`SpeechRecognition`). This API is supported in modern browsers like Chrome and Edge.

### Implementation Details

#### Initialization
The recognition is started when the user clicks the microphone button.

```tsx
const toggleVoice = () => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Speech recognition is not supported in this browser.');
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  
  recognition.continuous = true;
  recognition.interimResults = true; // Show text as you speak
  
  recognition.onresult = (event) => {
    let finalTranscript = '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    
    // Update the journal content state
    setContent(baseContentRef.current + ' ' + finalTranscript + (interimTranscript ? interimTranscript + '...' : ''));
  };

  recognition.start();
};
```

#### Handling Text Insertion
To ensure a smooth experience:
1.  **Baseline Snap**: When starting, we capture the current text content.
2.  **Interim Feedback**: We show the predicted text with ellipses (`...`) as the user speaks.
3.  **Final Commitment**: Once the API marks a block as "final", we permanently append it to the baseline.

### Browser Permissions
The browser will prompt the user for microphone access the first time they use the feature. The app handles the visual state (`isListening`) to provide feedback while the mic is active.

---

## Combining Features
By layering These features, MoodStreak feels like a physical scrapbook where you can write (Keyboard/Voice) and draw (Pen/Touch) simultaneously on the same digital page.
