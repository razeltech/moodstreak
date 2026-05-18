# Audio to Text (Speech Recognition) Setup Guide

This guide explains how to implement real-time speech-to-text (STT) functionality in a React application using the native **Web Speech API**. This implementation is used in the current project to allow users to dictate their journal entries.

## 1. Overview
The Web Speech API provides two distinct areas: **SpeechSynthesis** (Text-to-Speech) and **SpeechRecognition** (Asynchronous Speech Recognition). We use the latter to transcribe live microphone input into text.

### Key Benefits:
- **Free**: Uses the browser's built-in engine (often Google's or Apple's).
- **Real-time**: Provides interim results as words are spoken.
- **Privacy**: No audio data is stored on our servers (unless explicitly sent to a backend).

---

## 2. Prerequisites & Support
- **Browser Support**: Primarily Chrome, Edge, and Safari. Firefox does not support this API by default without flags.
- **HTTP/HTTPS**: Chromium browsers require HTTPS (or localhost) to grant microphone access.
- **Permissions**: The user must click "Allow" when the browser requests microphone access.

---

## 3. Implementation Logic

### State Management
You need state to track if the listener is active and to handle the current text buffer.

```tsx
const [isListening, setIsListening] = useState(false);
const [text, setText] = useState('');
const baseContentRef = useRef(''); // Used to append new transcripts to existing text
```

### The Toggle Function
This function initializes the `SpeechRecognition` instance, sets up listeners, and starts/stops the process.

```tsx
const toggleVoice = () => {
  // Check for browser support
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Speech recognition is not supported in this browser.');
    return;
  }

  if (isListening) {
    setIsListening(false);
    // Note: The 'onend' event will handle actual stopping
  } else {
    setIsListening(true);
    baseContentRef.current = text; // Snapshot current text to ensure we append correctly

    // @ts-ignore (Web Speech API types are often missing or vendor-prefixed)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;     // Continue listening even when user pauses
    recognition.interimResults = true; // Show text as user speaks (not just at the end)
    
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      // Update UI with existing text + new final words + interim results (grayed/indicator)
      setText(baseContentRef.current + ' ' + finalTranscript + (interimTranscript ? interimTranscript + '...' : ''));
      
      if (finalTranscript) {
        baseContentRef.current += ' ' + finalTranscript;
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  }
};
```

---

## 4. UI components
Use a button to trigger the toggle, with visual feedback (pulsing icon) when active.

```tsx
<button 
  onClick={toggleVoice} 
  className={`p-2 rounded-lg ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-stone-400 hover:bg-stone-100'}`}
>
  {isListening ? <Mic size={16} /> : <MicOff size={16} />}
</button>
```

---

## 5. Common Pitfalls
1. **Auto-Stop**: Some browsers stop the recognition if the user is silent for too long. Ensure `onend` correctly updates the `isListening` state.
2. **Grammar/Accents**: These vary by browser engine. Native Web Speech is usually tuned to the OS primary language.
3. **Mobile Issues**: On iOS/Android, microphone access inside iframes or webviews can be restrictive. Ensure `metadata.json` includes `microphone` in `requestFramePermissions`.

---
*Created for: MoodStreak / Journaling App*
