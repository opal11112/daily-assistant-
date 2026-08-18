export type TaskCategory = "Groceries" | "Daily" | "Work" | "Home" | "Personal";

export interface TaskItem {
  id: string;
  title: string;
  category: TaskCategory;
  completed: boolean;
  createdAt: number;
  notes?: string;
  priority?: "low" | "medium" | "high";
  color?: string; // Custom individual item color
}

export interface ReminderItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  completed: boolean;
  priority: "normal" | "high";
  repeat?: "none" | "daily" | "weekly";
}

export type AllergySeverity = "Mild" | "Moderate" | "Severe" | "Anaphylaxis";
export type AllergyCategory = "Food" | "Medication" | "Environmental" | "Contact";

export interface AllergyItem {
  id: string;
  name: string;
  severity: AllergySeverity;
  category: AllergyCategory;
  notes?: string;
  createdAt: number;
}

export type MedicationTiming = "Day" | "Night" | "Both";

export interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  timing: MedicationTiming;
  reminderTime?: string; // HH:MM
  instructions?: string;
  takenToday: boolean;
  lastTakenDate?: string; // YYYY-MM-DD
}

export interface VisionScanResult {
  title: string;
  category: "currency" | "food_nutrition" | "medication" | "plant_wildlife" | "cleaning" | "general";
  summary: string;
  safetyStatus: "SAFE" | "CAUTION" | "DANGER" | "INFORMATIONAL";
  safetyAssessment: string;
  allergenMatches?: string[];
  totalMoneyAmount?: string;
  keyDetails?: string[];
  actionSteps?: string[];
  spokenSummary: string;
  scannedAt: number;
  imagePreview?: string;
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  timerMinutes?: number;
  tips?: string;
}

export interface RecipeIngredient {
  item: string;
  amount: string;
  notes?: string;
}

export interface RecipeResult {
  title: string;
  description: string;
  servings: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  caloriesPerServing?: number;
  difficulty: "Easy" | "Medium" | "Advanced";
  allergySafetyNote: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  chefTips?: string[];
  spokenOverview: string;
}

export interface CleaningGuideResult {
  title: string;
  targetSurface: string;
  recommendedProducts: string[];
  warningNeverDo: string[];
  steps: {
    stepNumber: number;
    instruction: string;
    dwellTimeMinutes?: number;
  }[];
  proTips?: string[];
  spokenSummary: string;
}

export interface ActiveTimer {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  source?: "recipe" | "cleaning" | "manual";
}

export interface MenstrualCycleData {
  lastPeriodStart: string; // YYYY-MM-DD
  cycleLengthDays: number; // e.g. 28
  periodDurationDays: number; // e.g. 5
  history: {
    startDate: string;
    notes?: string;
  }[];
  symptomsToday: string[];
  moodToday: string;
}

export interface AudioSettings {
  ttsEnabled: boolean;
  speechRate: number;
  voiceName?: string;
  soundEffects: boolean;
}

export type LayoutMode = "sidebar" | "topbar" | "split" | "minimal";
export type ThemeMode = "light" | "dark" | "black";
export type AccentColor = "blue" | "indigo" | "emerald" | "purple" | "rose" | "amber" | "cyan" | "orange";
export type BackgroundTint = "default" | "pure-white" | "pure-black" | "deep-charcoal" | "midnight-navy" | "warm-slate";

export interface CategoryColorMap {
  Groceries?: string;
  Daily?: string;
  Work?: string;
  Home?: string;
  Personal?: string;
  [key: string]: string | undefined;
}

export interface CustomThemeSettings {
  layout: LayoutMode;
  theme: ThemeMode;
  accent: AccentColor;
  bgTint: BackgroundTint;
  categoryColors: CategoryColorMap;
  iconTint: string;
}
