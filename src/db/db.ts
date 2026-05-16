import Dexie, { type EntityTable } from 'dexie';

export interface Entry {
  id?: string;
  date: string; // YYYY-MM-DD format for easy querying
  title: string;
  content: string;
  wordCount?: number;
  writingTime?: number; // seconds spent in active writing
  status?: 'draft' | 'final';
  mood?: string;
  moodColor?: string;
  moods?: Array<{ mood: string, moodColor: string, timestamp: number }>;
  isFavorite?: boolean;
  doodleData?: string; // Serialized sketch data
  photos?: Array<{ id: string, url: string, x: number, y: number, scale: number, rotation: number, zIndex?: number }>;
  stickers?: Array<{ id: string, type?: string, x: number, y: number, scale?: number, rotation?: number, stickerId?: string, zIndex?: number, width?: number, height?: number }>;
  textBlocks?: Array<{ id: string, text: string, x: number, y: number, scale: number, rotation: number, color?: string, fontSize?: string, isBold?: boolean, isItalic?: boolean, isUnderline?: boolean, zIndex?: number }>;
  textBoxes?: Array<{ id: string, text: string, x: number, y: number, width: number, height: number, fontSize?: string, color?: string, textAlign?: string }>;
  importedImages?: Array<{ id: string, src: string, x: number, y: number, width: number, height: number }>;
  backgroundImage?: string | null;
  backgroundOpacity?: number;
  activeThemeId?: string;
  pageType?: string;
  pageSize?: string;
  theme?: string;
  font?: string;
  createdAt: number;
  updatedAt: number;
}

export interface PlannerTask {
  id: string;
  date: string;
  text: string;
  completed: boolean;
  order: number;
  dueDate?: string; // optional ISO string or YYYY-MM-DD
  priority?: 'high' | 'medium' | 'low';
  tags?: string[];
  subTasks?: Array<{ id: string; text: string; completed: boolean }>;
  linkedEntryId?: string; // Link to a journal entry
}

export interface Settings {
  id?: number; // singleton with id 1
  activeTheme: string;
  uiTheme?: string;
  activeFont: string;
  paperStyle: string; // 'ruled', 'grid', 'dotted', 'plain'
  fontSize: string;
  userName?: string;
  onboarded?: boolean;
  pageWidth?: number;
  pageHeight?: number;
  accentColor?: string;
  coverId?: string;
  diaryName?: string;
  pinHash?: string;
  dailyWordGoal?: number;
  pageSizeId?: string;
}

export interface WeightLog {
  id: string;
  date: string;
  weight: number;
  unit: 'kg' | 'lbs';
  notes?: string;
}

export interface CycleLog {
  id: string;
  date: string;
  flow: 'none' | 'light' | 'medium' | 'heavy';
  symptoms: string[];
  mood: string;
  notes?: string;
}

export interface ExpenseLog {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
}

export interface InsuranceLog {
  id: string;
  provider: string;
  policyName: string;
  policyNumber: string;
  expiryDate: string;
  premium: number;
  type: string;
  notes?: string;
}

export interface RecurringPayment {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // Day of month or specific date
  frequency: 'monthly' | 'yearly' | 'weekly';
  type: 'Insurance' | 'Credit Card' | 'Subscription' | 'Utility' | 'Other';
  notes?: string;
}

class MoodStreakDB extends Dexie {
  entries!: EntityTable<Entry, 'id'>;
  settings!: EntityTable<Settings, 'id'>;
  tasks!: EntityTable<PlannerTask, 'id'>;
  weightLogs!: EntityTable<WeightLog, 'id'>;
  cycleLogs!: EntityTable<CycleLog, 'id'>;
  expenseLogs!: EntityTable<ExpenseLog, 'id'>;
  insuranceLogs!: EntityTable<InsuranceLog, 'id'>;
  recurringPayments!: EntityTable<RecurringPayment, 'id'>;

  constructor() {
    super('FreshDiaryDB_v1');
    this.version(1).stores({
      entries: 'id, date, moodColor', // Indexed columns
      settings: 'id',
      tasks: 'id, date',
      weightLogs: 'id, date',
      cycleLogs: 'id, date',
      expenseLogs: 'id, date, category',
      insuranceLogs: 'id, provider, expiryDate',
      recurringPayments: 'id, type, dueDate'
    });
  }
}

export const db = new MoodStreakDB();

// Initialize default settings if not exists
db.on('populate', () => {
  db.settings.add({
    id: 1,
    activeTheme: 'japanese-toon',
    activeFont: 'font-caveat',
    paperStyle: 'ruled',
    fontSize: 'text-lg',
    userName: '',
    onboarded: false,
    pageWidth: 800,
    pageHeight: 600,
    pageSizeId: 'A4',
  });
});
