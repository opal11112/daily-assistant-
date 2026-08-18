import {
  TaskItem,
  ReminderItem,
  AllergyItem,
  MedicationItem,
  MenstrualCycleData,
  AudioSettings,
  ActiveTimer,
  CustomThemeSettings,
} from "../types";

const KEYS = {
  TASKS: "daily_assistant_tasks",
  REMINDERS: "daily_assistant_reminders",
  ALLERGIES: "daily_assistant_allergies",
  MEDICATIONS: "daily_assistant_meds",
  CYCLE: "daily_assistant_cycle",
  SETTINGS: "daily_assistant_settings",
  TIMERS: "daily_assistant_timers",
  THEME: "daily_assistant_custom_theme",
};

const DEFAULT_TASKS: TaskItem[] = [
  {
    id: "t-1",
    title: "Organic Almond Milk",
    category: "Groceries",
    completed: false,
    createdAt: Date.now() - 3600000 * 2,
    priority: "medium",
  },
  {
    id: "t-2",
    title: "Avocados & Fresh Basil",
    category: "Groceries",
    completed: false,
    createdAt: Date.now() - 3600000,
    priority: "low",
  },
  {
    id: "t-3",
    title: "Drop off dry cleaning",
    category: "Daily",
    completed: false,
    createdAt: Date.now() - 3600000 * 4,
    priority: "high",
  },
  {
    id: "t-4",
    title: "Hydrate and take afternoon stretch break",
    category: "Personal",
    completed: true,
    createdAt: Date.now() - 3600000 * 6,
    priority: "low",
  },
];

const DEFAULT_REMINDERS: ReminderItem[] = [
  {
    id: "r-1",
    title: "Team Planning & Weekly Sync",
    date: new Date().toISOString().split("T")[0],
    time: "15:30",
    completed: false,
    priority: "high",
    repeat: "weekly",
  },
  {
    id: "r-2",
    title: "Check oven preheat for dinner",
    date: new Date().toISOString().split("T")[0],
    time: "18:00",
    completed: false,
    priority: "normal",
    repeat: "none",
  },
];

const DEFAULT_ALLERGIES: AllergyItem[] = [
  {
    id: "a-1",
    name: "Peanuts & Tree Nuts",
    severity: "Severe",
    category: "Food",
    notes: "Requires auto-injector / strict avoidance of cross-contact",
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    id: "a-2",
    name: "Shellfish (Crustaceans)",
    severity: "Moderate",
    category: "Food",
    notes: "Shrimp, lobster, crab",
    createdAt: Date.now() - 86400000 * 5,
  },
];

const DEFAULT_MEDS: MedicationItem[] = [
  {
    id: "m-1",
    name: "Vitamin D3 + K2",
    dosage: "2000 IU",
    timing: "Day",
    reminderTime: "08:30",
    instructions: "Take with breakfast",
    takenToday: true,
    lastTakenDate: new Date().toISOString().split("T")[0],
  },
  {
    id: "m-2",
    name: "Magnesium Glycinate",
    dosage: "200 mg",
    timing: "Night",
    reminderTime: "21:30",
    instructions: "Promotes restful sleep",
    takenToday: false,
  },
];

const DEFAULT_CYCLE: MenstrualCycleData = {
  lastPeriodStart: new Date(Date.now() - 86400000 * 14).toISOString().split("T")[0],
  cycleLengthDays: 28,
  periodDurationDays: 5,
  history: [
    {
      startDate: new Date(Date.now() - 86400000 * 42).toISOString().split("T")[0],
      notes: "Regular cycle",
    },
    {
      startDate: new Date(Date.now() - 86400000 * 14).toISOString().split("T")[0],
      notes: "Mild cramps on day 1",
    },
  ],
  symptomsToday: ["Energetic", "Good focus"],
  moodToday: "Focused & Positive",
};

const DEFAULT_SETTINGS: AudioSettings = {
  ttsEnabled: true,
  speechRate: 1.0,
  soundEffects: true,
};

export const DEFAULT_THEME: CustomThemeSettings = {
  layout: "sidebar",
  theme: "dark",
  accent: "blue",
  bgTint: "pure-black",
  categoryColors: {
    Groceries: "#10b981",
    Daily: "#3b82f6",
    Work: "#6366f1",
    Home: "#f59e0b",
    Personal: "#ec4899",
  },
  iconTint: "#3b82f6",
};

export const storage = {
  getTasks: (): TaskItem[] => {
    try {
      const data = localStorage.getItem(KEYS.TASKS);
      return data ? JSON.parse(data) : DEFAULT_TASKS;
    } catch {
      return DEFAULT_TASKS;
    }
  },
  saveTasks: (tasks: TaskItem[]) => {
    try {
      localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
    } catch {}
  },

  getReminders: (): ReminderItem[] => {
    try {
      const data = localStorage.getItem(KEYS.REMINDERS);
      return data ? JSON.parse(data) : DEFAULT_REMINDERS;
    } catch {
      return DEFAULT_REMINDERS;
    }
  },
  saveReminders: (reminders: ReminderItem[]) => {
    try {
      localStorage.setItem(KEYS.REMINDERS, JSON.stringify(reminders));
    } catch {}
  },

  getAllergies: (): AllergyItem[] => {
    try {
      const data = localStorage.getItem(KEYS.ALLERGIES);
      return data ? JSON.parse(data) : DEFAULT_ALLERGIES;
    } catch {
      return DEFAULT_ALLERGIES;
    }
  },
  saveAllergies: (allergies: AllergyItem[]) => {
    try {
      localStorage.setItem(KEYS.ALLERGIES, JSON.stringify(allergies));
    } catch {}
  },

  getMedications: (): MedicationItem[] => {
    try {
      const data = localStorage.getItem(KEYS.MEDICATIONS);
      const list: MedicationItem[] = data ? JSON.parse(data) : DEFAULT_MEDS;
      const today = new Date().toISOString().split("T")[0];
      return list.map((m) => ({
        ...m,
        takenToday: m.lastTakenDate === today ? m.takenToday : false,
      }));
    } catch {
      return DEFAULT_MEDS;
    }
  },
  saveMedications: (meds: MedicationItem[]) => {
    try {
      localStorage.setItem(KEYS.MEDICATIONS, JSON.stringify(meds));
    } catch {}
  },

  getCycleData: (): MenstrualCycleData => {
    try {
      const data = localStorage.getItem(KEYS.CYCLE);
      return data ? JSON.parse(data) : DEFAULT_CYCLE;
    } catch {
      return DEFAULT_CYCLE;
    }
  },
  saveCycleData: (data: MenstrualCycleData) => {
    try {
      localStorage.setItem(KEYS.CYCLE, JSON.stringify(data));
    } catch {}
  },

  getSettings: (): AudioSettings => {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      return data ? JSON.parse(data) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },
  saveSettings: (settings: AudioSettings) => {
    try {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch {}
  },

  getTimers: (): ActiveTimer[] => {
    try {
      const data = localStorage.getItem(KEYS.TIMERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveTimers: (timers: ActiveTimer[]) => {
    try {
      localStorage.setItem(KEYS.TIMERS, JSON.stringify(timers));
    } catch {}
  },

  getTheme: (): CustomThemeSettings => {
    try {
      const data = localStorage.getItem(KEYS.THEME);
      return data ? { ...DEFAULT_THEME, ...JSON.parse(data) } : DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  },
  saveTheme: (theme: CustomThemeSettings) => {
    try {
      localStorage.setItem(KEYS.THEME, JSON.stringify(theme));
    } catch {}
  },
};
