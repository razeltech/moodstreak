import { create } from 'zustand';
import { format } from 'date-fns';

type TabType = 'journal' | 'mood-grid' | 'planner' | 'settings' | 'export' | 'dashboard' | 'today' | 'vault';

interface AppState {
  currentDate: Date;
  activeTab: TabType;
  isDrawingMode: boolean;
  isLayoutMode: boolean;
  isFocusMode: boolean;
  isSaving: boolean;
  selectedMood: { emoji: string; color: string; label: string } | null;
  pageWidth: number;
  pageHeight: number;
  // Actions
  setCurrentDate: (date: Date) => void;
  setActiveTab: (tab: TabType) => void;
  setDrawingMode: (isDrawing: boolean) => void;
  setLayoutMode: (isLayout: boolean) => void;
  setFocusMode: (isFocus: boolean) => void;
  setSaving: (saving: boolean) => void;
  setSelectedMood: (mood: { emoji: string; color: string; label: string } | null) => void;
  setPageDimensions: (width: number, height: number) => void;
  getFormattedDate: () => string;
}

export const useStore = create<AppState>((set, get) => ({
  currentDate: new Date(),
  activeTab: 'today',
  isDrawingMode: false,
  isLayoutMode: false,
  isFocusMode: false,
  isSaving: false,
  selectedMood: null,
  pageWidth: 800,
  pageHeight: 600,

  setCurrentDate: (date) => set({ currentDate: date }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setDrawingMode: (isDrawing) => set({ isDrawingMode: isDrawing }),
  setLayoutMode: (isLayout) => set({ isLayoutMode: isLayout }),
  setFocusMode: (isFocus) => set({ isFocusMode: isFocus }),
  setSaving: (saving) => set({ isSaving: saving }),
  setSelectedMood: (mood) => set({ selectedMood: mood }),
  setPageDimensions: (width, height) => set({ pageWidth: width, pageHeight: height }),
  getFormattedDate: () => format(get().currentDate, 'yyyy-MM-dd'),
}));

export const MOODS = [
  { emoji: '🌿', label: 'Calm', color: '#86efac' }, // green-300
  { emoji: '✨', label: 'Happy', color: '#93c5fd' }, // blue-300
  { emoji: '🌧️', label: 'Sad', color: '#c4b5fd' }, // violet-300
  { emoji: '☕', label: 'Productive', color: '#fdba74' }, // orange-300
  { emoji: '🔥', label: 'Angry', color: '#fca5a5' }, // red-300
  { emoji: '⭐', label: 'Excited', color: '#fde047' }, // yellow-300
  { emoji: '☁️', label: 'Tired', color: '#d1d5db' }, // gray-300
];
