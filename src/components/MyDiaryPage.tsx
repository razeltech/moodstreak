import React, { useRef, useState, useEffect } from 'react';
import { Mic, MicOff, PenTool, Eraser, Type, Download, Maximize, FileText, PlusSquare, Trash2, GripHorizontal, X, Bold, Italic, Highlighter, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Underline as UnderlineIcon, Trash, Star, Image as ImageIcon, ImagePlus, Sun, Moon, Palette, Smile, Cog, ChevronLeft, ChevronRight, Plus, Save, Check, Hand, ZoomIn, ZoomOut } from 'lucide-react';
import { ReactSketchCanvas, type ReactSketchCanvasRef } from 'react-sketch-canvas';
import { cn } from '../lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import { Rnd } from 'react-rnd';
import { toPng } from 'html-to-image';
import { TiptapEditor } from './TiptapEditor';
import { SCRAPBOOK_THEMES, type ScrapbookTheme } from '../constants/themes';
import { DECORATIVE_STICKERS, type Sticker } from '../constants/stickers';
import { useStore } from '../store/useStore';
import { format, addDays, subDays, differenceInSeconds } from 'date-fns';
import { db } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';

const MOODS = [
  { id: 'neutral', label: 'Neutral 😐', color: '#FFFFFF' },
  { id: 'happy', label: 'Happy 😊', color: '#FEF08A' },
  { id: 'sad', label: 'Sad 😢', color: '#BFDBFE' },
  { id: 'calm', label: 'Calm 😌', color: '#BBF7D0' },
  { id: 'angry', label: 'Angry 😠', color: '#FECACA' },
  { id: 'energetic', label: 'Energetic 🤩', color: '#FED7AA' },
  { id: 'loved', label: 'Loved 🥰', color: '#FBCFE8' },
  { id: 'anxious', label: 'Anxious 😰', color: '#E9D5FF' },
];

// Common paper dimensions at ~96 DPI
const PAGE_SIZES = {
  A4: { width: 794, height: 1123, label: 'A4' },
  Letter: { width: 816, height: 1056, label: 'Letter' },
  A5: { width: 560, height: 794, label: 'A5' },
  B5: { width: 666, height: 945, label: 'B5' },
  Legal: { width: 816, height: 1344, label: 'Legal' },
  Square: { width: 800, height: 800, label: 'Square' },
  Moleskine: { width: 504, height: 828, label: 'Moleskine' },
  IG_Post: { width: 1080, height: 1080, label: 'IG Post (1:1)' },
  IG_Story: { width: 1080, height: 1920, label: 'IG Story / Reel' },
  WA_Status: { width: 1080, height: 1920, label: 'WhatsApp Status' },
  Photo_4x6: { width: 600, height: 900, label: 'Photo 4x6 (Portrait)' },
  Photo_6x4: { width: 900, height: 600, label: 'Photo 6x4 (Landscape)' },
  Photo_5x7: { width: 750, height: 1050, label: 'Photo 5x7 (Portrait)' },
};

const PEN_COLORS = ['#F5A8D3', '#FECACA', '#F9C6FF', '#F6AEC7', '#FDE68A', '#A5B4FC', '#D8B4FE', '#FBCFE8', '#FEE2E2', '#F8F0FC', '#ffffff'];

interface TextBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  hasOutline?: boolean;
  backgroundColor?: string;
}

interface PageSticker {
  id: string;
  stickerId: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

function DraggableTextBox({ 
  box, 
  isDrawingMode, 
  isExporting, 
  onUpdateText, 
  onUpdatePosition,
  onUpdateStyle,
  onFocus,
  onDelete 
}: { 
  box: TextBox, 
  isDrawingMode: boolean, 
  isExporting: boolean, 
  onUpdateText: (val: string) => void, 
  onUpdatePosition: (x: number, y: number, width: number, height: number) => void,
  onUpdateStyle: (style: Partial<TextBox>) => void,
  onFocus: (editor: any) => void,
  onDelete: () => void 
}) {
  const bgStyles = [
    { label: 'Transparent', value: 'transparent' },
    { label: 'White', value: 'rgba(255, 255, 255, 0.8)' },
    { label: 'Soft', value: 'rgba(255, 255, 255, 0.4)' },
    { label: 'Highlight', value: 'rgba(254, 249, 195, 0.6)' },
  ];

  const currentBgIndex = bgStyles.findIndex(s => s.value === (box.backgroundColor || 'transparent'));

  return (
    <Rnd
      size={{ width: box.width, height: box.height }}
      position={{ x: box.x, y: box.y }}
      onDragStop={(e, d) => onUpdatePosition(d.x, d.y, box.width, box.height)}
      onResizeStop={(e, direction, ref, delta, position) => {
        onUpdatePosition(
          position.x,
          position.y,
          parseInt(ref.style.width),
          parseInt(ref.style.height)
        );
      }}
      disableDragging={isDrawingMode || isExporting}
      enableResizing={!isDrawingMode && !isExporting}
      dragHandleClassName="drag-handle"
      className={cn(
        "z-30",
        isDrawingMode && "pointer-events-none",
        isExporting ? "overflow-visible" : "overflow-visible"
      )}
      minWidth={100}
      minHeight={60}
    >
      <div 
        className={cn(
          "w-full h-full relative flex flex-col transition-all duration-200 rounded-sm group", 
          isExporting ? "" : "hover:shadow-2xl focus-within:shadow-2xl",
          box.hasOutline ? "border border-stone-200 bg-white text-stone-900" : "border border-transparent",
          (box.hasOutline || box.backgroundColor !== 'transparent') && "shadow-xl text-stone-900",
          !isExporting && !box.hasOutline && "hover:border-dashed hover:border-stone-300"
        )}
        style={{ backgroundColor: box.backgroundColor || 'transparent' }}
      >
        {/* Washi Tape Effect */}
        {(box.hasOutline || (box.backgroundColor && box.backgroundColor !== 'transparent')) && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-[var(--accent-color)] opacity-60 border border-ink/20 -rotate-2 mix-blend-multiply flex items-center justify-center pointer-events-none z-10">
            <div className="w-full h-px bg-white/20" />
          </div>
        )}

         {!isExporting && !isDrawingMode && (
           <>
            {/* Minimal Drag Handle */}
            <div className="drag-handle h-3 bg-stone-800/[0.03] cursor-move flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <div className="w-8 h-[2px] bg-stone-300 rounded-full" />
             </div>

             {/* Delete Button - Top Right Outside */}
             <button 
               onClick={(e) => { e.stopPropagation(); onDelete(); }}
               className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 shadow-lg z-[60] border-2 border-white"
               title="Delete"
               type="button"
             >
               <X size={14} />
             </button>

             {/* Style Controls - Floating Bar */}
             <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-stone-200 shadow-xl rounded-full px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-all z-[100] scale-90 hover:scale-100 origin-top">
                <button 
                  onClick={() => onUpdateStyle({ hasOutline: !box.hasOutline })}
                  className={cn("p-1.5 rounded-full hover:bg-stone-100 transition-colors", box.hasOutline ? "text-ink bg-stone-100" : "text-stone-400")}
                  title="Toggle Border"
                >
                  <Maximize size={12} />
                </button>
                <div className="w-px h-4 bg-stone-200" />
                <button 
                  onClick={() => {
                    const nextIndex = (currentBgIndex + 1) % bgStyles.length;
                    onUpdateStyle({ backgroundColor: bgStyles[nextIndex].value });
                  }}
                  className="p-1.5 rounded-full hover:bg-stone-100 transition-colors flex items-center justify-center"
                  title="Cycle Background"
                >
                  <div className="w-3.5 h-3.5 rounded-sm border border-stone-300 shadow-inner" style={{ backgroundColor: bgStyles[(currentBgIndex + 1) % bgStyles.length].value }} />
                </button>
             </div>
           </>
         )}

         <div className="flex-1 relative">
           <TiptapEditor 
             value={box.text}
             onChange={onUpdateText}
             onFocus={onFocus}
             placeholder="Type ideas..."
             isExporting={isExporting}
             className="text-lg leading-relaxed p-3 h-full"
           />
         </div>
      </div>
    </Rnd>
  );
}

const STICKER_MAP = new Map(DECORATIVE_STICKERS.map(s => [s.id, s.component]));

const DAILY_DIARY_QUOTES = [
  "Pour your heart out...",
  "What's on your mind today?",
  "Every thought is a seed.",
  "Your feelings are valid.",
  "Write to release, write to heal.",
  "Breathe in, write out.",
  "A blank page is a new beginning.",
  "Document the little moments.",
];

const FONT_FAMILIES = [
  { name: 'Default', value: '' },
  { name: 'Inter (Sans)', value: '"Inter", sans-serif' },
  { name: 'Poppins (Sans)', value: '"Poppins", sans-serif' },
  { name: 'Montserrat (Sans)', value: '"Montserrat", sans-serif' },
  { name: 'Nunito (Sans)', value: '"Nunito", sans-serif' },
  { name: 'Roboto (Sans)', value: '"Roboto", sans-serif' },
  { name: 'Raleway (Sans)', value: '"Raleway", sans-serif' },
  { name: 'Outfit (Display)', value: '"Outfit", sans-serif' },
  { name: 'Oswald (Strong)', value: '"Oswald", sans-serif' },
  { name: 'Orbitron (Sci-Fi)', value: '"Orbitron", sans-serif' },
  { name: 'Playfair (Serif)', value: '"Playfair Display", serif' },
  { name: 'Lora (Serif)', value: '"Lora", serif' },
  { name: 'Merriweather (Serif)', value: '"Merriweather", serif' },
  { name: 'Cinzel (Classical)', value: '"Cinzel", serif' },
  
  // Cursive & Calligraphy
  { name: 'Dancing Script', value: '"Dancing Script", cursive' },
  { name: 'Satisfy', value: '"Satisfy", cursive' },
  { name: 'Pacifico', value: '"Pacifico", cursive' },
  { name: 'Sacramento', value: '"Sacramento", cursive' },
  { name: 'Great Vibes', value: '"Great Vibes", cursive' },
  { name: 'Alex Brush', value: '"Alex Brush", cursive' },
  { name: 'Pinyon Script', value: '"Pinyon Script", cursive' },
  { name: 'Rochester', value: '"Rochester", cursive' },
  
  // Diary & Hand
  { name: 'Caveat (Hand)', value: '"Caveat", cursive' },
  { name: 'Indie Flower', value: '"Indie Flower", cursive' },
  { name: 'Kalam (Hand)', value: '"Kalam", cursive' },
  { name: 'Permanent Marker', value: '"Permanent Marker", cursive' },
  { name: 'Handlee', value: '"Handlee", cursive' },
  { name: 'Coming Soon', value: '"Coming Soon", cursive' },
  { name: 'Architects Daughter', value: '"Architects Daughter", cursive' },
  { name: 'Patrick Hand', value: '"Patrick Hand", cursive' },
  { name: 'Amatic SC', value: '"Amatic SC", cursive' },
  { name: 'Gloria Hallelujah', value: '"Gloria Hallelujah", cursive' },
  
  // Japanese Styles
  { name: 'Noto Sans JP', value: '"Noto Sans JP", sans-serif' },
  { name: 'Noto Serif JP', value: '"Noto Serif JP", serif' },
  { name: 'Zen Kaku Gothic', value: '"Zen Kaku Gothic New", sans-serif' },
  
  { name: 'JetBrains Mono', value: '"JetBrains Mono", monospace' },
];

export function MyDiaryPage() {
  const { currentDate, setCurrentDate, setSaving, isFocusMode, setFocusMode } = useStore();
  const formattedDate = format(currentDate, 'yyyy-MM-dd');
  const activeQuote = DAILY_DIARY_QUOTES[currentDate.getDate() % DAILY_DIARY_QUOTES.length];

  const settings = useLiveQuery(() => db.settings.get(1));
  const allMoods = React.useMemo(() => [...MOODS, ...(settings?.customMoods || [])], [settings?.customMoods]);
  const entryList = useLiveQuery(() => db.entries.where('date').equals(formattedDate).toArray(), [formattedDate]);
  const allEntries = useLiveQuery(() => db.entries.toArray()) || [];
  
  // Calculate relative page number based on sorted dates
  const pageNumber = React.useMemo(() => {
    const sortedDates = [...new Set(allEntries.map(e => e.date))].sort();
    const currentIndex = sortedDates.indexOf(formattedDate);
    return currentIndex === -1 ? sortedDates.length + 1 : currentIndex + 1;
  }, [allEntries, formattedDate]);

  const entry = entryList?.[0];
  const isLoadedRef = useRef<string | null>(null);

  const [pageTitle, setPageTitle] = useState('Dear Diary');
  const [activeTheme, setActiveTheme] = useState<ScrapbookTheme>(SCRAPBOOK_THEMES[0]);
  const [mood, setMood] = useState(allMoods[0]);
  const [customColor, setCustomColor] = useState(allMoods[0]?.color);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [pageSize, setPageSize] = useState<keyof typeof PAGE_SIZES>('A4');
  const [pageType, setPageType] = useState<'blank' | 'ruled' | 'grid' | 'dotted'>('ruled');
  const [pageFont, setPageFont] = useState('');
  
  const [status, setStatus] = useState<'draft' | 'final'>('draft');
  const [writingTime, setWritingTime] = useState(0);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  const [isDrawingMode, setDrawingMode] = useState(false);
  const [activeTool, setActiveTool] = useState<'pan' | 'type' | 'pen' | 'eraser'>('type');
  const [penColor, setPenColor] = useState(PEN_COLORS[0]);
  const [strokeWidth, setStrokeWidth] = useState(3);

  const [activeEditor, setActiveEditor] = useState<any>(null);

  const [isListening, setIsListening] = useState(false);
  const [speechLang, setSpeechLang] = useState('en-US');
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const [text, setText] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [stickers, setStickers] = useState<PageSticker[]>([]);
  const [showStickers, setShowStickers] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [showMoods, setShowMoods] = useState(false);
  const [showPageConfig, setShowPageConfig] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundOpacity, setBackgroundOpacity] = useState(1);
  const [importedImages, setImportedImages] = useState<{ id: string, src: string, x: number, y: number, width: number, height: number }[]>([]);

  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const baseContentRef = useRef('');
  const pageRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);

  const currentSize = PAGE_SIZES[pageSize];

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Responsive scale: start with fit to screen, but allow changing
  const [pageScale, setPageScale] = useState(1);
  const [isFitToScreen, setIsFitToScreen] = useState(true);

  useEffect(() => {
    if (!isFitToScreen) return;
    const computeScale = () => {
      const vw = window.innerWidth;
      if (vw >= 768) {
        setPageScale(1);
      } else {
        // Add padding
        const availableWidth = vw - 32;
        const scale = Math.min(1, availableWidth / currentSize.width);
        setPageScale(parseFloat(scale.toFixed(3)));
      }
    };
    computeScale();
    window.addEventListener('resize', computeScale);
    return () => window.removeEventListener('resize', computeScale);
  }, [currentSize.width, isFitToScreen]);

  const handleZoomIn = () => {
    setIsFitToScreen(false);
    setPageScale(s => Math.min(3, s + 0.1));
  };

  const handleZoomOut = () => {
    setIsFitToScreen(false);
    setPageScale(s => Math.max(0.3, s - 0.1));
  };

  const handleFitScreen = () => {
    setIsFitToScreen(true);
  };

  // Calculate word count
  const wordCount = React.useMemo(() => {
    const fullText = (pageTitle + ' ' + text + ' ' + textBoxes.map(b => b.text).join(' ')).replace(/<[^>]*>/g, ' ');
    return fullText.trim().split(/\s+/).filter(Boolean).length;
  }, [pageTitle, text, textBoxes]);

  // Track writing session
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastActivity < 20000) { // Active if moved in last 20s
        setWritingTime(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lastActivity]);

  const recordActivity = () => setLastActivity(Date.now());

  // Focus mode ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFocusMode(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [setFocusMode]);

  // Load entry data when it changes
  useEffect(() => {
    if (entryList === undefined) return;
    
    if (entry && isLoadedRef.current !== formattedDate) {
      setPageTitle(entry.title || 'Dear Diary');
      if (entry.content) setText(entry.content);
      if (entry.mood && entry.moodColor) {
        setMood(allMoods.find(m => m.id === entry.mood) || allMoods[0]);
      }
      if (entry.activeThemeId) {
        setActiveTheme(SCRAPBOOK_THEMES.find(t => t.id === entry.activeThemeId) || SCRAPBOOK_THEMES[0]);
      }
      setPageType((entry.pageType as 'blank' | 'ruled' | 'grid' | 'dotted') || 'ruled');
      setPageSize((entry.pageSize as keyof typeof PAGE_SIZES) || 'A4');
      setPageFont(entry.font || '');
      setTextBoxes((entry.textBoxes as any) || []);
      setStickers((entry.stickers as any) || []);
      setImportedImages(entry.importedImages || []);
      setBackgroundImage(entry.backgroundImage || null);
      setBackgroundOpacity(entry.backgroundOpacity ?? 1);
      setStatus(entry.status || 'draft');
      setWritingTime(entry.writingTime || 0);

      if (entry.doodleData && canvasRef.current) {
        try {
          canvasRef.current.clearCanvas();
          canvasRef.current.loadPaths(JSON.parse(entry.doodleData));
        } catch(e) {}
      }
      isLoadedRef.current = formattedDate;
    } else if (!entry && isLoadedRef.current !== formattedDate && settings !== undefined) {
      setPageTitle('Dear Diary');
      setText('');
      setPageFont('');
      setTextBoxes([]);
      setStickers([]);
      setImportedImages([]);
      setBackgroundImage(null);
      setBackgroundOpacity(1);
      setActiveTheme(SCRAPBOOK_THEMES[0]);
      setMood(allMoods[0]);
      setPageSize((settings?.pageSizeId as keyof typeof PAGE_SIZES) || 'A4');
      setPageType((settings?.paperStyle as any) || 'ruled');
      if (canvasRef.current) canvasRef.current.clearCanvas();
      isLoadedRef.current = formattedDate;
    }
  }, [entryList, formattedDate, settings]);

  const saveEntry = async () => {
    try {
      setSaveStatus('saving');
      setSaving(true);
      let doodleData = '';
      if (canvasRef.current) {
        try {
          const paths = await canvasRef.current.exportPaths();
          if (paths && paths.length > 0) {
             doodleData = JSON.stringify(paths);
          }
        } catch (e) {}
      }

      await db.entries.put({
        id: entry?.id || Date.now().toString(),
        date: formattedDate,
        title: pageTitle,
        content: text,
        wordCount,
        writingTime,
        status,
        mood: mood.id,
        moodColor: mood.color,
        activeThemeId: activeTheme.id,
        pageType,
        pageSize,
        font: pageFont,
        textBoxes,
        stickers,
        importedImages,
        backgroundImage,
        backgroundOpacity,
        doodleData,
        createdAt: entry?.createdAt || Date.now(),
        updatedAt: Date.now(),
      });
      
      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
        setSaving(false);
      }, 1500);
    } catch (error) {
      console.error("Save error:", error);
      setSaveStatus('error');
      setSaving(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const addSticker = (stickerId: string) => {
    setStickers([...stickers, {
      id: Date.now().toString(),
      stickerId,
      x: 100,
      y: 100,
      width: 100,
      height: 100
    }]);
    setShowStickers(false);
  };

  const handleBackgroundImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImportImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImportedImages([...importedImages, {
          id: Date.now().toString(),
          src: reader.result as string,
          x: 50,
          y: 50,
          width: 200,
          height: 200
        }]);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (isListeningRef.current && recognitionRef.current) {
      if (recognitionRef.current.lang !== speechLang) {
        recognitionRef.current.stop();
        isListeningRef.current = false;
        setIsListening(false);
        // Automatically restart with new language after a brief delay
        setTimeout(() => {
            toggleVoice();
        }, 300);
      }
    }
  }, [speechLang]);

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListeningRef.current) {
      isListeningRef.current = false;
      setIsListening(false);
      recognitionRef.current?.stop();
    } else {
      isListeningRef.current = true;
      setIsListening(true);
      baseContentRef.current = text;
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = speechLang;
      recognition.continuous = true;
      recognition.interimResults = true;
      
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
        
        setText(baseContentRef.current + ' ' + finalTranscript + (interimTranscript ? interimTranscript + '...' : ''));
        
        if (finalTranscript) {
          baseContentRef.current += ' ' + finalTranscript;
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error === 'not-allowed') {
          isListeningRef.current = false;
          setIsListening(false);
        }
      };
      
      recognition.onend = () => {
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch(err) {
            isListeningRef.current = false;
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      try {
        recognition.start();
      } catch(err) {}
    }
  };

  const getBackgroundStyle = () => {
    let style: any = {};
    const borderColor = isDarkMode ? '#3f3f46' : '#e4e4e7';
    switch (pageType) {
      case 'ruled':
        style.backgroundImage = `linear-gradient(transparent 95%, ${borderColor} 100%)`;
        style.backgroundSize = '100% 32px';
        break;
      case 'grid':
        style.backgroundImage = `linear-gradient(${borderColor} 1px, transparent 1px), linear-gradient(90deg, ${borderColor} 1px, transparent 1px)`;
        style.backgroundSize = '32px 32px';
        break;
      case 'dotted':
        style.backgroundImage = `radial-gradient(${borderColor} 2.5px, transparent 2.5px)`;
        style.backgroundSize = '32px 32px';
        break;
      case 'blank':
      default:
        break;
    }
    return style;
  };

  const addTextBox = () => {
    setDrawingMode(false);
    setActiveTool('type');
    setTextBoxes([...textBoxes, {
      id: Date.now().toString(),
      x: 100,
      y: 100,
      width: 250,
      height: 120,
      text: '',
      hasOutline: false,
      backgroundColor: 'transparent'
    }]);
  };

  const clearCanvas = () => {
    canvasRef.current?.clearCanvas();
    // Re-initialize the active tool to ensure it doesn't get stuck
    setTimeout(() => {
      if (activeTool === 'eraser') {
        canvasRef.current?.eraseMode(true);
      } else {
        canvasRef.current?.eraseMode(false);
      }
    }, 10);
  };

  const downloadPage = async () => {
    if (!pageRef.current) return;
    
    setIsExporting(true);
    // Wait for the UI to hide placeholders and borders
    await new Promise(r => setTimeout(r, 150));

    try {
      const dataUrl = await toPng(pageRef.current, {
        pixelRatio: 4, // 4k resolution scale
        backgroundColor: activeTheme.colors.surface
      });
      const link = document.createElement('a');
      link.download = `Diary_Page_${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("Failed to generate image", e);
      alert("Failed to generate the image. Please try another color or reload the page.");
    } finally {
      setIsExporting(false);
    }
  };

  const getRootBgColor = () => {
    if (mood.id === 'neutral' && customColor === '#FFFFFF') {
      return isDarkMode ? '#0b0c10' : '#f8fafc';
    }
    return customColor;
  };

  return (
    <div 
      className={cn("h-full min-h-[500px] flex flex-col transition-colors font-sans rounded-2xl overflow-visible", isDarkMode ? "text-stone-100" : "text-stone-900")}
      style={{ backgroundColor: getRootBgColor() }}
    >
      {/* Top Toolbar */}
      <div className={cn("border-b p-3 flex flex-col gap-3 shadow-sm sticky top-0 z-50 overflow-visible transition-colors", isDarkMode ? "bg-[#111216] border-stone-800" : "bg-white border-stone-200")}>
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 sm:px-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <button onClick={() => setIsDarkMode(p => !p)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  {isDarkMode ? <Moon size={14} className="text-stone-400" /> : <Sun size={14} className="text-amber-500" />}
                  <span className="text-xs font-bold text-ink/60 uppercase tracking-widest sm:hidden">Diary</span>
                </button>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <button 
                  onClick={() => setCurrentDate(subDays(currentDate, 1))}
                  className="p-1 rounded-md hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-600"
                  title="Previous Day"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-[10px] font-black uppercase tracking-tighter text-stone-500 min-w-[70px] text-center">
                  {format(currentDate, 'MMM do')}
                </span>
                <button 
                  onClick={() => setCurrentDate(addDays(currentDate, 1))}
                  className="p-1 rounded-md hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-600"
                  title="Next Day"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="relative group/tt">
              <button 
                onClick={() => setCurrentDate(new Date())}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl border transition-all shadow-sm",
                  format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                    ? "bg-white border-[var(--accent-color)] text-[var(--accent-color)] shadow-inner"
                    : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                )}
              >
                <Plus size={18} />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-ink text-white text-[10px] font-bold rounded shadow-xl opacity-0 group-hover/tt:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[120]">
                Today's Diary
              </div>
            </div>

            <div className={cn("hidden sm:block w-px h-8 transition-colors mx-1", isDarkMode ? "bg-stone-800" : "bg-stone-200")} />

            <div className="relative group/tt">
              <button 
                onClick={saveEntry}
                disabled={saveStatus === 'saving'}
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-xl transition-all shadow-sm border",
                  saveStatus === 'saved' ? "bg-green-500 text-white border-green-600" : 
                  saveStatus === 'saving' ? "bg-stone-100 text-stone-400 border-stone-200" :
                  "text-white border-transparent hover:brightness-90 active:scale-95"
                )}
                style={{ backgroundColor: saveStatus === 'idle' ? 'var(--accent-color)' : undefined }}
              >
                {saveStatus === 'saving' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 
                 saveStatus === 'saved' ? <Check size={18} /> : <Save size={18} />}
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-ink text-white text-[10px] font-bold rounded shadow-xl opacity-0 group-hover/tt:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[120]">
                {saveStatus === 'saved' ? 'Saved' : 'Save Progress'}
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Bento Grid Toolbar */}
        <div className={cn("rounded-2xl border bg-opacity-50 backdrop-blur-sm shadow-sm w-full overflow-x-auto touch-pan-x custom-scrollbar pb-1 overflow-visible", 
          isDarkMode ? "bg-stone-900/50 border-stone-800" : "bg-stone-50/50 border-stone-200")}>
          <div className="flex flex-nowrap items-center justify-start sm:justify-between gap-2 p-1.5 min-w-max w-full">
            {/* Group 1: Core Tools */}
            <div className="flex flex-wrap items-center gap-0.5 justify-center bg-white/40 p-1 rounded-xl border border-white/20 shrink-0">
              <div className="relative group/tt">
                <button 
                  onClick={() => { setDrawingMode(false); setActiveTool('pan'); }}
                  className={cn("p-2 rounded-lg transition-all", activeTool === 'pan' ? (isDarkMode ? "bg-stone-100 text-stone-900" : "bg-stone-800 text-white") : "text-stone-400 hover:bg-stone-100")}
                >
                  <Hand size={16} />
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-ink text-white text-[10px] font-bold rounded shadow-xl opacity-0 group-hover/tt:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[120]">Pan / Move</div>
              </div>

              <div className="relative group/tt">
                <button 
                  onClick={() => { setDrawingMode(false); setActiveTool('type'); }}
                  className={cn("p-2 rounded-lg transition-all", activeTool === 'type' ? (isDarkMode ? "bg-stone-100 text-stone-900" : "bg-stone-800 text-white") : "text-stone-400 hover:bg-stone-100")}
                >
                  <Type size={16} />
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-ink text-white text-[10px] font-bold rounded shadow-xl opacity-0 group-hover/tt:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[120]">Type Tool</div>
              </div>
              
              <div className="relative group/tt">
                <button 
                  onClick={() => { 
                    setDrawingMode(true); 
                    canvasRef.current?.eraseMode(false); 
                    setActiveTool('pen'); 
                  }}
                  className={cn("p-2 rounded-lg transition-all", (activeTool === 'pen' && isDrawingMode) ? (isDarkMode ? "bg-stone-100 text-stone-900" : "bg-stone-800 text-white") : "text-stone-400 hover:bg-stone-100")}
                >
                  <PenTool size={16} />
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-ink text-white text-[10px] font-bold rounded shadow-xl opacity-0 group-hover/tt:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[120]">Pen Tool</div>
              </div>

              <div className="relative group/tt">
                <button 
                  onClick={() => { 
                    setDrawingMode(true); 
                    canvasRef.current?.eraseMode(true); 
                    setActiveTool('eraser');
                  }}
                  className={cn("p-2 rounded-lg transition-all", (activeTool === 'eraser' && isDrawingMode) ? (isDarkMode ? "bg-stone-100 text-stone-900" : "bg-stone-800 text-white") : "text-stone-400 hover:bg-stone-100")}
                >
                  <Eraser size={16} />
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-ink text-white text-[10px] font-bold rounded shadow-xl opacity-0 group-hover/tt:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[120]">Eraser</div>
              </div>

              {/* Stroke / Eraser Size Slider */}
              {isDrawingMode && (
                <div className="flex items-center gap-2 ml-2 mr-1">
                  <input 
                    type="range" 
                    min="1" 
                    max={activeTool === 'eraser' ? 30 : 15} 
                    value={strokeWidth} 
                    onPointerDown={e => e.stopPropagation()}
                    onChange={e => setStrokeWidth(parseInt(e.target.value))} 
                    className="w-16 sm:w-20 h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-700"
                    title={`${activeTool === 'eraser' ? 'Eraser' : 'Pen'} Size`}
                  />
                  <div className="w-6 h-6 flex items-center justify-center shrink-0 relative">
                     {activeTool === 'eraser' ? (
                       <div className="rounded-full border-2 border-stone-400 bg-white" style={{ width: Math.max(4, strokeWidth * 0.8), height: Math.max(4, strokeWidth * 0.8) }} />
                     ) : (
                       <div className="rounded-full bg-stone-800" style={{ width: Math.max(2, strokeWidth), height: Math.max(2, strokeWidth) }} />
                     )}
                  </div>
                </div>
              )}
            </div>

            {/* Group 2: Elements */}
            <div className="flex flex-wrap items-center gap-0.5 justify-center bg-white/40 p-1 rounded-xl border border-white/20 shrink-0">
              <div className="relative group/tt">
                <button onClick={() => setShowStickers(p => !p)} className={cn("p-2 rounded-lg transition-all", showStickers ? "text-white" : "text-stone-400 hover:bg-stone-100")} 
                        style={{ backgroundColor: showStickers ? 'var(--accent-color)' : undefined }}>
                  <Smile size={16} />
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-ink text-white text-[10px] font-bold rounded shadow-xl opacity-0 group-hover/tt:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[120]">Stickers</div>
                
                <AnimatePresence>
                  {showStickers && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className={cn("absolute top-[calc(100%+10px)] left-0 sm:left-auto sm:right-0 mt-2 shadow-2xl rounded-2xl p-4 z-[100] w-[280px] h-[350px] overflow-y-auto border", isDarkMode ? "bg-[#111216] border-stone-800" : "bg-white border-stone-200")}
                    >
                      <h3 className="text-xs font-bold uppercase tracking-widest mb-3 opacity-60">Stickers</h3>
                      <div className="grid grid-cols-4 gap-2">
                        {DECORATIVE_STICKERS.map(s => (
                          <button
                            key={s.id}
                            onClick={() => addSticker(s.id)}
                            className={cn("aspect-square p-2 rounded-lg transition-all flex items-center justify-center", isDarkMode ? "bg-stone-800 hover:bg-stone-700" : "bg-stone-50 hover:bg-stone-100")}
                          >
                            {s.component}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative group/tt">
                <button 
                  onClick={addTextBox}
                  className="p-2 rounded-lg text-stone-400 hover:bg-stone-100"
                >
                  <PlusSquare size={16} />
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-ink text-white text-[10px] font-bold rounded shadow-xl opacity-0 group-hover/tt:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[120]">New Note</div>
              </div>

              <div className="relative group/tt">
                <label className="cursor-pointer p-2 rounded-lg text-stone-400 hover:bg-stone-100 flex items-center justify-center">
                  <ImagePlus size={16} />
                  <input type="file" accept="image/*" onChange={handleImportImage} className="hidden" />
                </label>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-ink text-white text-[10px] font-bold rounded shadow-xl opacity-0 group-hover/tt:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[120]">Photo</div>
              </div>
              
              <div className="relative group/tt">
                <div className="flex bg-white/40 rounded-lg p-0.5" style={{ backgroundColor: showVoiceMenu ? 'var(--accent-color)' : undefined }}>
                  <button onClick={toggleVoice} className={cn("p-2 rounded-lg transition-all", isListening ? "bg-red-500 text-white animate-pulse" : (showVoiceMenu ? "text-white" : "text-stone-400 hover:bg-stone-100"))}>
                    {isListening ? <Mic size={16} /> : <MicOff size={16} />}
                  </button>
                  <button onClick={() => setShowVoiceMenu(!showVoiceMenu)} className={cn("px-1 flex flex-col items-center justify-center rounded-lg transition-all text-[8px] font-black uppercase text-stone-400 hover:bg-stone-100", showVoiceMenu && "text-white hover:bg-white/20")}>
                     {speechLang.split('-')[0]}
                  </button>
                </div>
                {!showVoiceMenu && <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-ink text-white text-[10px] font-bold rounded shadow-xl opacity-0 group-hover/tt:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[120]">Voice & Lang</div>}
                
                <AnimatePresence>
                  {showVoiceMenu && (
                    <motion.div 
                      className={cn("absolute top-full left-1/2 -translate-x-1/2 mt-2 shadow-2xl rounded-2xl p-2 z-[100] w-[140px] border flex flex-col gap-1", isDarkMode ? "bg-[#111216] border-stone-800" : "bg-white border-stone-200")}
                    >
                       <h3 className="text-[10px] uppercase font-bold text-stone-400 mb-1 ml-2 tracking-widest mt-1">Language</h3>
                       {[
                         {code: 'en-US', label: 'English'},
                         {code: 'es-ES', label: 'Español'},
                         {code: 'fr-FR', label: 'Français'},
                         {code: 'de-DE', label: 'Deutsch'},
                         {code: 'it-IT', label: 'Italiano'},
                         {code: 'ja-JP', label: '日本語'},
                         {code: 'hi-IN', label: 'Hindi'},
                         {code: 'te-IN', label: 'Telugu'}
                       ].map(lang => (
                         <button 
                            key={lang.code}
                            onClick={() => { setSpeechLang(lang.code); setShowVoiceMenu(false); }}
                            className={cn("text-left text-sm px-3 py-2 rounded-lg transition-colors", speechLang === lang.code ? "bg-stone-100 text-stone-900 font-bold" : "text-stone-500 hover:bg-stone-50")}
                         >
                           {lang.label}
                         </button>
                       ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Group 3: Settings */}
            <div className="flex flex-wrap items-center gap-0.5 justify-center sm:justify-center bg-white/40 p-1 rounded-xl border border-white/20 shrink-0">
              <div className="relative group/tt">
                <button 
                  onClick={() => { setShowMoods(!showMoods); setShowThemes(false); setShowPageConfig(false); }}
                  className={cn("p-2 rounded-lg transition-all", showMoods ? "bg-stone-800 text-white" : "text-stone-400 hover:bg-stone-100")}
                >
                  <span className="text-[14px] leading-none">{mood.label.split(' ')[1]}</span>
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-ink text-white text-[10px] font-bold rounded shadow-xl opacity-0 group-hover/tt:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[120]">Mood</div>
                
                <AnimatePresence>
                  {showMoods && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={cn("absolute top-full left-0 mt-2 shadow-2xl rounded-2xl p-4 z-[100] w-[240px] border grid grid-cols-5 gap-1", isDarkMode ? "bg-[#111216] border-stone-800" : "bg-white border-stone-200")}
                    >
                      {allMoods.map(m => (
                        <button
                          key={m.id}
                          onClick={() => { setMood(m); setCustomColor(m.color); setShowMoods(false); }}
                          className="text-xl p-2 rounded-lg hover:bg-stone-100 transition-transform active:scale-90"
                          title={m.label}
                        >
                          {m.label.split(' ')[1]}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative group/tt">
                <button 
                  onClick={() => { setShowThemes(!showThemes); setShowMoods(false); setShowPageConfig(false); }}
                  className={cn("p-2 rounded-lg transition-all", showThemes ? "bg-stone-800 text-white" : "text-stone-400 hover:bg-stone-100")}
                >
                  <Palette size={16} />
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-ink text-white text-[10px] font-bold rounded shadow-xl opacity-0 group-hover/tt:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[120]">Themes</div>
                
                <AnimatePresence>
                  {showThemes && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={cn("absolute top-full left-0 sm:left-auto sm:right-0 mt-2 shadow-2xl rounded-2xl p-3 z-[100] w-[200px] border flex flex-col gap-1", isDarkMode ? "bg-[#111216] border-stone-800" : "bg-white border-stone-200")}
                    >
                      {SCRAPBOOK_THEMES.map(theme => (
                        <button
                          key={theme.id}
                          onClick={() => { setActiveTheme(theme); setShowThemes(false); }}
                          className={cn("flex items-center gap-2 p-2 rounded-lg text-xs font-bold transition-all border text-left", activeTheme.id === theme.id ? "bg-stone-800 border-stone-700 text-white" : "border-transparent hover:bg-stone-50")}
                        >
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.surface }} />
                          <span className="truncate">{theme.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative group/tt">
                <button 
                  onClick={() => { setShowPageConfig(!showPageConfig); setShowThemes(false); setShowMoods(false); }}
                  className={cn("p-2 rounded-lg transition-all", showPageConfig ? "bg-stone-800 text-white" : "text-stone-400 hover:bg-stone-100")}
                >
                  <Cog size={16} />
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-ink text-white text-[10px] font-bold rounded shadow-xl opacity-0 group-hover/tt:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[120]">Settings</div>
                
                <AnimatePresence>
                  {showPageConfig && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={cn("absolute top-full right-0 mt-2 shadow-2xl rounded-2xl p-4 z-[100] w-56 border flex flex-col gap-4", isDarkMode ? "bg-[#111216] border-stone-800" : "bg-white border-stone-200")}
                    >
                      <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-50">Grid Layout</h3>
                        <div className="flex flex-wrap gap-1">
                          {['blank', 'ruled', 'grid', 'dotted'].map(t => (
                            <button key={t} onClick={() => setPageType(t as any)} className={cn("px-2 py-1 rounded text-[10px] font-bold border capitalize", pageType === t ? "bg-stone-800 text-white border-stone-800" : "border-stone-200")}>{t}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-50">Canvas Size</h3>
                        <select value={pageSize} onChange={(e) => setPageSize(e.target.value as any)} className="w-full text-xs font-bold bg-stone-50 border border-stone-200 p-1 rounded">
                          {Object.keys(PAGE_SIZES).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative group/tt">
                <button 
                  onClick={downloadPage} 
                  className="p-2 rounded-lg text-stone-400 hover:bg-stone-100 transition-all"
                >
                  <Download size={16} />
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-ink text-white text-[10px] font-bold rounded shadow-xl opacity-0 group-hover/tt:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[120]">Export</div>
              </div>

              <div className="relative group/tt">
                <button 
                  onClick={clearCanvas}
                  className="p-2 rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  <Trash size={16} />
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-ink text-white text-[10px] font-bold rounded shadow-xl opacity-0 group-hover/tt:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[120]">Clear</div>
              </div>
            </div>

            {/* Group 4: Zoom Controls */}
            <div className="flex flex-wrap items-center gap-0.5 justify-center sm:justify-center bg-white/40 p-1 rounded-xl border border-white/20 shrink-0">
              <div className="relative group/tt">
                <button 
                  onClick={handleZoomOut} 
                  className="p-2 rounded-lg text-stone-400 hover:bg-stone-100 transition-all font-mono text-[10px]"
                >
                  <ZoomOut size={16} />
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-ink text-white text-[10px] font-bold rounded shadow-xl opacity-0 group-hover/tt:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[120]">Zoom Out</div>
              </div>

              <div className="relative group/tt">
                <button 
                  onClick={handleFitScreen} 
                  className={cn("px-2 py-1.5 rounded-lg transition-all font-mono text-[10px] uppercase font-black tracking-widest", isFitToScreen ? "bg-stone-800 text-white" : "text-stone-400 hover:bg-stone-100")}
                >
                  {Math.round(pageScale * 100)}%
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-ink text-white text-[10px] font-bold rounded shadow-xl opacity-0 group-hover/tt:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[120]">Fit Screen</div>
              </div>

              <div className="relative group/tt">
                <button 
                  onClick={handleZoomIn} 
                  className="p-2 rounded-lg text-stone-400 hover:bg-stone-100 transition-all font-mono text-[10px]"
                >
                  <ZoomIn size={16} />
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-ink text-white text-[10px] font-bold rounded shadow-xl opacity-0 group-hover/tt:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[120]">Zoom In</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contextual Toolbar Row */}
      <AnimatePresence>
        {(activeEditor || backgroundImage || activeTool === 'pen') && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="bg-white/95 text-stone-800 backdrop-blur-md border-b border-stone-200 px-4 pt-2 pb-3 flex items-center justify-center gap-6 sticky top-[115px] z-40 shadow-sm overflow-x-auto touch-pan-x w-full custom-scrollbar"
          >
<div className="flex items-center flex-nowrap w-max min-w-0 gap-6">
               
               {/* Pen Tool Settings */}
               {activeTool === 'pen' && (
                 <div className="flex flex-nowrap items-center gap-4 pr-6 border-r border-stone-200 last:border-0 last:pr-0">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider hidden sm:block shrink-0">Pen</span>
                    <div className="flex gap-1 items-center overflow-x-auto custom-scrollbar py-1 shrink-0">
                      {PEN_COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => { setPenColor(c); setActiveTool('pen'); setDrawingMode(true); }}
                          className={cn(
                            "w-5 h-5 shrink-0 rounded-full border transition-all hover:scale-110 shadow-sm",
                            penColor === c ? "ring-2 ring-offset-2 ring-stone-800" : "border-stone-200"
                          )}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <label className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-2 py-1 shadow-sm">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider hidden sm:inline">Color</span>
                        <input
                          type="color"
                          value={penColor}
                          onChange={(e) => { setPenColor(e.target.value); setActiveTool('pen'); setDrawingMode(true); }}
                          className="w-8 h-8 p-0 border-0 rounded-full cursor-pointer"
                          title="Choose a custom pen color"
                        />
                      </label>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold text-stone-400">SIZE</span>
                      <input 
                        type="range" min="1" max="25" value={strokeWidth} 
                        onChange={(e) => setStrokeWidth(Number(e.target.value))}
                        className="w-full max-w-[220px] sm:w-28 accent-stone-700 h-1 cursor-pointer"
                      />
                    </div>
                 </div>
               )}

               {/* Background Image Settings */}
               {backgroundImage && (
                 <div className="flex flex-wrap items-center gap-4 pr-6 border-r border-stone-200 last:border-0 last:pr-0 shrink-0">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider hidden sm:block">Background</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-stone-400">Opacity</span>
                      <input 
                        type="range" min="0" max="1" step="0.1" value={backgroundOpacity}
                        onChange={(e) => setBackgroundOpacity(Number(e.target.value))}
                        className="w-full max-w-[220px] sm:w-28 accent-stone-700 h-1 cursor-pointer"
                        title="Adjust Background Opacity"
                      />
                      <span className="text-[10px] font-medium text-stone-500 w-6">{Math.round(backgroundOpacity * 100)}%</span>
                    </div>
                    
                    <button 
                      onClick={() => setBackgroundImage(null)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors flex items-center gap-1.5"
                      title="Remove Background"
                    >
                      <Trash2 size={14} />
                      <span className="font-bold text-[10px] uppercase hidden sm:block">Delete</span>
                    </button>
                 </div>
               )}

               {/* Text Formatting Settings */}
               {activeEditor && (
                 <div className="flex flex-nowrap items-center gap-2 shrink-0 pr-6 border-r border-stone-200 last:border-0 last:pr-0">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider hidden lg:block mr-1">Text</span>
                    
                    <div className="flex flex-nowrap items-center gap-0.5 bg-white p-1 rounded-xl border border-stone-200 shadow-sm shrink-0">
                      <button
                        onClick={() => activeEditor.chain().focus().toggleBold().run()}
                        className={cn("p-1.5 rounded-lg hover:bg-stone-50 transition-all", activeEditor.isActive('bold') && "bg-stone-100 text-black shadow-inner")}
                      >
                        <Bold size={16} />
                      </button>
                      <button
                        onClick={() => activeEditor.chain().focus().toggleItalic().run()}
                        className={cn("p-1.5 rounded-lg hover:bg-stone-50 transition-all", activeEditor.isActive('italic') && "bg-stone-100 text-black shadow-inner")}
                      >
                        <Italic size={16} />
                      </button>
                      <button
                        onClick={() => activeEditor.chain().focus().toggleUnderline().run()}
                        className={cn("p-1.5 rounded-lg hover:bg-stone-50 transition-all", activeEditor.isActive('underline') && "bg-stone-100 text-black shadow-inner")}
                      >
                        <UnderlineIcon size={16} />
                      </button>
                      <button
                        onClick={() => activeEditor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()}
                        className={cn("p-1.5 rounded-lg hover:bg-stone-50 transition-all", activeEditor.isActive('highlight') && "bg-yellow-100 text-black shadow-inner")}
                      >
                        <Highlighter size={16} />
                      </button>
                    </div>

                    <div className="flex flex-nowrap items-center gap-0.5 bg-white p-1 rounded-xl border border-stone-200 shadow-sm shrink-0">
                      <button onClick={() => activeEditor.chain().focus().setTextAlign('left').run()} className="p-1.5 rounded-lg hover:bg-stone-50"><AlignLeft size={16} /></button>
                      <button onClick={() => activeEditor.chain().focus().setTextAlign('center').run()} className="p-1.5 rounded-lg hover:bg-stone-50"><AlignCenter size={16} /></button>
                      <button onClick={() => activeEditor.chain().focus().setTextAlign('right').run()} className="p-1.5 rounded-lg hover:bg-stone-50"><AlignRight size={16} /></button>
                      <button onClick={() => activeEditor.chain().focus().setTextAlign('justify').run()} className="p-1.5 rounded-lg hover:bg-stone-50"><AlignJustify size={16} /></button>
                    </div>

                    <div className="flex flex-nowrap items-center gap-0.5 bg-white p-1 rounded-xl border border-stone-200 shadow-sm shrink-0">
                      <button onClick={() => activeEditor.chain().focus().toggleBulletList().run()} className="p-1.5 rounded-lg hover:bg-stone-50"><List size={16} /></button>
                      <button onClick={() => activeEditor.chain().focus().toggleOrderedList().run()} className="p-1.5 rounded-lg hover:bg-stone-50"><ListOrdered size={16} /></button>
                    </div>

                    <div className="flex flex-nowrap items-center gap-1.5 bg-white p-1 rounded-xl border border-stone-200 shadow-sm shrink-0">
                      <select
                        className="text-[10px] bg-transparent border-0 font-bold p-1 pr-4 focus:ring-0 cursor-pointer max-w-[80px] sm:max-w-[120px] truncate"
                        onChange={(e) => activeEditor.chain().focus().setFontFamily(e.target.value).run()}
                        value={activeEditor.getAttributes('textStyle').fontFamily || ''}
                        title="Font Family"
                      >
                        {FONT_FAMILIES.map(f => <option key={f.name} value={f.value}>{f.name}</option>)}
                      </select>
                      <div className="w-px h-4 bg-stone-200" />
                      <select
                        className="text-[10px] bg-transparent border-0 font-bold p-1 pr-4 focus:ring-0 cursor-pointer"
                        onChange={(e) => activeEditor.chain().focus().setFontSize(e.target.value).run()}
                        value={activeEditor.getAttributes('textStyle').fontSize || ''}
                        title="Font Size"
                      >
                        <option value="">Size</option>
                        {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 56, 64, 72, 84, 96].map(s => <option key={s} value={`${s}px`}>{s}</option>)}
                      </select>
                      <input
                        type="color"
                        onInput={e => activeEditor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
                        value={activeEditor.getAttributes('textStyle').color || '#000000'}
                        className="w-6 h-6 p-0 border-0 rounded cursor-pointer shrink-0"
                        title="Text Color"
                      />
                    </div>

                    <button 
                      onClick={() => setActiveEditor(null)}
                      className="ml-2 p-1.5 shrink-0 rounded-lg hover:bg-stone-100 text-stone-400"
                      title="Hide Toolbar"
                    >
                      <X size={16} />
                    </button>
                 </div>
               )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Workspace */}
      <div className={cn("flex-1 min-h-0 min-w-0 overflow-auto p-4 sm:p-8 pb-32 sm:pb-8 transition-colors bg-stone-200/30 touch-auto sm:scroll-smooth custom-scrollbar")} style={{ WebkitOverflowScrolling: 'touch' }}>
        <div
          className="flex justify-start sm:justify-center items-start min-w-max"
          style={{
            minHeight: '100%',
          }}
        >
          <motion.div 
            ref={pageRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative shadow-2xl border flex flex-col shrink-0 overflow-hidden rounded-sm mx-auto sm:mx-0"
            style={{ 
               width: currentSize.width, 
               height: currentSize.height, 
               backgroundColor: activeTheme.colors.surface, 
               borderColor: activeTheme.colors.border,
               fontFamily: activeTheme.fonts.body,
               color: activeTheme.colors.text,
               transformOrigin: 'top left',
               transform: `scale(${pageScale})`,
               marginBottom: currentSize.height * (pageScale - 1)
            }}
          >
          {/* Active Theme Base Pattern / Texture */}
          <div className="absolute inset-0 pointer-events-none z-0 opacity-80 mix-blend-overlay" style={activeTheme.visuals.backgroundStyle} />
          
          <activeTheme.visuals.PageOverlay />

          {/* Header */}
          <div className="h-16 flex items-center justify-between px-8 z-20 shrink-0 border-b relative" style={{ borderColor: activeTheme.colors.border }}>
             <activeTheme.visuals.HeaderDecor />
             <div className="font-bold text-xl italic opacity-100 z-10 font-playfair capitalize">
               MoodStreak {mood.id !== 'neutral' && <span>: {mood.id}</span>}
             </div>
             <div className="font-sans text-xs font-bold uppercase tracking-widest opacity-80 z-10">
               {format(currentDate, 'EEEE, MMMM d, yyyy')}
             </div>
          </div>
          
          <div className="flex-1 relative z-10 w-full h-full">
             
             {/* Background Image Layer */}
             <div 
               className="absolute inset-0 pointer-events-none"
               style={{ 
                 backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 opacity: backgroundOpacity
               }}
             />

             {/* Page Pattern Background layer */}
             <div 
               className="absolute inset-0 pointer-events-none opacity-40 z-0"
               style={getBackgroundStyle()}
             />

             <div className="flex flex-col h-full relative z-10">
               {/* Title Row */}
               <div className="px-8 pt-8 pb-2 relative z-20">
                 <input
                   value={pageTitle}
                   onChange={(e) => setPageTitle(e.target.value)}
                   className={cn(
                     "bg-transparent border-none outline-none font-bold text-4xl w-full focus:ring-0 placeholder:opacity-30 transition-all",
                     isDrawingMode ? "pointer-events-none opacity-60" : "pointer-events-auto"
                   )}
                   placeholder="Dear Diary,"
                   style={{ 
                     fontFamily: pageFont || activeTheme.fonts.heading,
                     color: activeTheme.colors.text
                   }}
                 />
                 <div className="h-1 w-24 rounded-full mt-1 opacity-30" style={{ backgroundColor: 'var(--accent-color)' }} />
               </div>
               
               {/* Text Area */}
               <div 
                 className={cn("flex-1 z-10 relative px-8 py-4 cursor-text", isDrawingMode ? "pointer-events-none opacity-60" : "pointer-events-auto opacity-100")}
                 style={{ fontFamily: pageFont || 'inherit' }}
               >
                 <TiptapEditor 
                    value={text}
                    onChange={setText}
                    onFocus={(editor) => setActiveEditor(editor)}
                    placeholder="Write your thoughts here..."
                    isExporting={isExporting}
                    className="text-xl h-full leading-relaxed"
                 />
               </div>
             </div>

              {/* Draggable Text Boxes */}
              {textBoxes.map((box) => (
                <DraggableTextBox
                  key={box.id}
                  box={box}
                  isDrawingMode={isDrawingMode}
                  isExporting={isExporting}
                  onUpdateText={(val) => setTextBoxes(boxes => boxes.map(b => b.id === box.id ? { ...b, text: val } : b))}
                  onUpdatePosition={(x, y, w, h) => setTextBoxes(boxes => boxes.map(b => b.id === box.id ? { ...b, x, y, width: w, height: h } : b))}
                  onUpdateStyle={(style) => setTextBoxes(boxes => boxes.map(b => b.id === box.id ? { ...b, ...style } : b))}
                  onFocus={(editor) => setActiveEditor(editor)}
                  onDelete={() => setTextBoxes(boxes => boxes.filter(b => b.id !== box.id))}
                />
              ))}

             {/* Imported Images */}
             {importedImages.map((img) => (
                <Rnd
                  key={img.id}
                  size={{ width: img.width, height: img.height }}
                  position={{ x: img.x, y: img.y }}
                  onDragStop={(e, d) => setImportedImages(imgs => imgs.map(i => i.id === img.id ? { ...i, x: d.x, y: d.y } : i))}
                  onResizeStop={(e, direction, ref, delta, position) => {
                    setImportedImages(imgs => imgs.map(i => i.id === img.id ? { ...i, x: position.x, y: position.y, width: parseInt(ref.style.width), height: parseInt(ref.style.height) } : i))
                  }}
                  disableDragging={isDrawingMode || isExporting}
                  enableResizing={!isDrawingMode && !isExporting}
                  className="z-25 group"
                >
                  {/* Delete button - always visible on mobile, hover on desktop */}
                  {!isExporting && !isDrawingMode && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setImportedImages(imgs => imgs.filter(i => i.id !== img.id)); }}
                      className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition-all hover:scale-110 active:scale-95 shadow-lg z-[60] border-2 border-white"
                      title="Delete"
                      type="button"
                    >
                      <X size={14} />
                    </button>
                  )}
                  
                  {/* Die-cut sticker effect */}
                  <div 
                    className="w-full h-full pointer-events-none transition-all group-hover:scale-[1.02]"
                    style={{ 
                      filter: 'drop-shadow(2px 0px 0px white) drop-shadow(-2px 0px 0px white) drop-shadow(0px 2px 0px white) drop-shadow(0px -2px 0px white) drop-shadow(1px 1px 0px white) drop-shadow(-1px -1px 0px white) drop-shadow(0 6px 8px rgba(0,0,0,0.2))' 
                    }}
                  >
                    <img src={img.src} className="w-full h-full object-contain pointer-events-auto" alt="imported" />
                  </div>
                </Rnd>
             ))}

             {/* Stickers */}
             {stickers.map((st) => {
                const StickerComp = STICKER_MAP.get(st.stickerId);
                if (!StickerComp) return null;
                return (
                  <Rnd
                    key={st.id}
                    size={{ width: st.width || 100, height: st.height || 100 }}
                    position={{ x: st.x, y: st.y }}
                    onDragStop={(e, d) => setStickers(s => s.map(i => i.id === st.id ? { ...i, x: d.x, y: d.y } : i))}
                    onResizeStop={(e, direction, ref, delta, position) => {
                      setStickers(s => s.map(i => i.id === st.id ? { ...i, x: position.x, y: position.y, width: parseInt(ref.style.width), height: parseInt(ref.style.height) } : i))
                    }}
                    disableDragging={isDrawingMode || isExporting}
                    enableResizing={!isDrawingMode && !isExporting}
                    className="z-30 group"
                  >
                    {!isExporting && !isDrawingMode && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setStickers(s => s.filter(i => i.id !== st.id)); }}
                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition-all hover:scale-110 active:scale-95 shadow-lg z-[60] border-2 border-white"
                        title="Delete"
                        type="button"
                      >
                        <X size={14} />
                      </button>
                    )}
                    <div className="w-full h-full pointer-events-none drop-shadow-md flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>div]:w-full [&>div]:h-full">
                      {StickerComp}
                    </div>
                  </Rnd>
                );
             })}

             {/* Sketch Canvas */}
             <div className={cn(
                "absolute inset-0 z-20 [&_svg]:!cursor-inherit",
                !isDrawingMode ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100"
             )}
             style={{
                cursor: isDrawingMode 
                    ? `url('data:image/svg+xml;utf8,<svg width="${Object.is(activeTool, 'eraser') ? strokeWidth * 4 : Math.max(8, strokeWidth)}" height="${Object.is(activeTool, 'eraser') ? strokeWidth * 4 : Math.max(8, strokeWidth)}" viewBox="0 0 ${Object.is(activeTool, 'eraser') ? strokeWidth * 4 : Math.max(8, strokeWidth)} ${Object.is(activeTool, 'eraser') ? strokeWidth * 4 : Math.max(8, strokeWidth)}" xmlns="http://www.w3.org/2000/svg"><circle cx="${(Object.is(activeTool, 'eraser') ? strokeWidth * 4 : Math.max(8, strokeWidth))/2}" cy="${(Object.is(activeTool, 'eraser') ? strokeWidth * 4 : Math.max(8, strokeWidth))/2}" r="${(Object.is(activeTool, 'eraser') ? strokeWidth * 4 : Math.max(8, strokeWidth))/2 - 1}" fill="${Object.is(activeTool, 'eraser') ? 'none' : penColor.replace('#', '%23')}" stroke="${Object.is(activeTool, 'eraser') ? 'black' : penColor.replace('#', '%23')}" stroke-width="1"/></svg>') ${(Object.is(activeTool, 'eraser') ? strokeWidth * 4 : Math.max(8, strokeWidth))/2} ${(Object.is(activeTool, 'eraser') ? strokeWidth * 4 : Math.max(8, strokeWidth))/2}, crosshair`
                    : undefined
             }}>
                <ReactSketchCanvas
                    ref={canvasRef}
                    strokeWidth={strokeWidth}
                    eraserWidth={strokeWidth * 4}
                    strokeColor={penColor}
                    canvasColor="transparent"
                    className="w-full h-full border-none"
                    style={{ border: 'none' }}
                />
             </div>
          </div>

          {/* Minimal footer inside canvas � visible only during export */}
          {isExporting && (
            <div className="h-10 flex items-center justify-between px-8 z-30 shrink-0 border-t relative" style={{ borderColor: activeTheme.colors.border }}>
               <div className="font-sans text-[9px] font-bold uppercase tracking-widest opacity-40">MoodStreak</div>
               <div className="font-mono text-[9px] font-bold opacity-40">p.{pageNumber}</div>
            </div>
          )}
        </motion.div>
      </div>
    </div>

    {/* Mobile-friendly Footer � outside scaled canvas, always full-size */}
    {!isExporting && (
      <div className={cn(
        "shrink-0 border-t px-3 sm:px-6 pt-2 pb-24 sm:pb-2 flex items-center justify-between gap-2 z-50 transition-colors",
        isDarkMode ? "bg-[#111216] border-stone-800 text-stone-300" : "bg-white border-stone-200 text-stone-800"
      )}>
        <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
          <div className="flex flex-col leading-tight">
            <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Session</span>
            <span className="text-[11px] font-mono font-bold">{Math.floor(writingTime / 60)}m {writingTime % 60}s</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Words</span>
            <span className="text-[11px] font-bold">{wordCount}</span>
          </div>
          <button
            onClick={() => setStatus(prev => prev === 'draft' ? 'final' : 'draft')}
            className={cn(
              "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border transition-all",
              status === 'final' ? "bg-green-100 text-green-700 border-green-200" : "bg-stone-50 text-stone-400 border-stone-200"
            )}
          >
            {status === 'final' ? '? Final' : 'Draft'}
          </button>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setFocusMode(!isFocusMode)}
            className={cn(
              "flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl border transition-all text-[9px] sm:text-[10px] font-black uppercase",
              isFocusMode ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
            )}
          >
            <Maximize size={10} />
            <span className="hidden sm:inline ml-1">{isFocusMode ? 'Exit Zen' : 'Zen'}</span>
          </button>
          <button
            onClick={downloadPage}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl border transition-all text-[9px] sm:text-[10px] font-black uppercase bg-white text-stone-600 border-stone-200 hover:bg-stone-50 active:scale-95"
            title="Download Page as High-Res PNG"
          >
            <Download size={10} />
            <span className="hidden sm:inline ml-1">Export</span>
          </button>
        </div>
      </div>
    )}
    </div>
  );
}
