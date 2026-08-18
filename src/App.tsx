import React, { useState, useEffect } from "react";
import {
  TaskItem,
  ReminderItem,
  AllergyItem,
  MedicationItem,
  MenstrualCycleData,
  AudioSettings,
  ActiveTimer,
  CustomThemeSettings,
  LayoutMode,
} from "./types";
import { storage, DEFAULT_THEME } from "./utils/storage";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { DailyStatsStrip } from "./components/DailyStatsStrip";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { LayoutThemeCustomizer } from "./components/LayoutThemeCustomizer";
import { VoiceAssistantModal } from "./components/VoiceAssistantModal";
import { VisionScanner } from "./components/VisionScanner";
import { TaskList } from "./components/TaskList";
import { ReminderSchedule } from "./components/ReminderSchedule";
import { AllergyProfile } from "./components/AllergyProfile";
import { MedicationTracker } from "./components/MedicationTracker";
import { RecipeAssistant } from "./components/RecipeAssistant";
import { CleaningAssistant } from "./components/CleaningAssistant";
import { CycleTracker } from "./components/CycleTracker";
import { TimerFloatingWidget } from "./components/TimerFloatingWidget";
import { soundFx, speakText } from "./utils/audio";
import {
  Camera,
  CheckSquare,
  Calendar,
  ShieldAlert,
  Pill,
  Utensils,
  Sparkles,
  Heart,
  Palette,
  Columns,
  Maximize2,
  Mic,
} from "lucide-react";

export default function App() {
  const [tasks, setTasks] = useState<TaskItem[]>(() => storage.getTasks());
  const [reminders, setReminders] = useState<ReminderItem[]>(() => storage.getReminders());
  const [allergies, setAllergies] = useState<AllergyItem[]>(() => storage.getAllergies());
  const [medications, setMedications] = useState<MedicationItem[]>(() => storage.getMedications());
  const [cycleData, setCycleData] = useState<MenstrualCycleData>(() => storage.getCycleData());
  const [settings, setSettings] = useState<AudioSettings>(() => storage.getSettings());
  const [timers, setTimers] = useState<ActiveTimer[]>(() => storage.getTimers());
  const [theme, setTheme] = useState<CustomThemeSettings>(() => storage.getTheme());

  const [activeTab, setActiveTab] = useState<string>("tasks");
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  // Sync state to local storage
  useEffect(() => {
    storage.saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    storage.saveReminders(reminders);
  }, [reminders]);

  useEffect(() => {
    storage.saveAllergies(allergies);
  }, [allergies]);

  useEffect(() => {
    storage.saveMedications(medications);
  }, [medications]);

  useEffect(() => {
    storage.saveCycleData(cycleData);
  }, [cycleData]);

  useEffect(() => {
    storage.saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    storage.saveTimers(timers);
  }, [timers]);

  useEffect(() => {
    storage.saveTheme(theme);
  }, [theme]);

  // Background countdown for active floating timers
  useEffect(() => {
    const hasRunningTimer = timers.some((t) => t.isRunning && t.remainingSeconds > 0);
    if (!hasRunningTimer) return;

    const interval = setInterval(() => {
      setTimers((prev) =>
        prev.map((t) => {
          if (!t.isRunning || t.remainingSeconds <= 0) return t;
          const nextSec = t.remainingSeconds - 1;
          if (nextSec === 0) {
            soundFx.playChime("timer-alarm");
            if (settings.ttsEnabled) {
              speakText(`Timer complete: ${t.label}!`);
            }
            return { ...t, remainingSeconds: 0, isRunning: false };
          }
          return { ...t, remainingSeconds: nextSec };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [timers, settings.ttsEnabled]);

  // Handlers for cross-component interactions
  const handleAddTask = (partialTask: Partial<TaskItem>) => {
    const newTask: TaskItem = {
      id: `t-${Date.now()}`,
      title: partialTask.title || "New Task",
      category: partialTask.category || "Groceries",
      completed: false,
      createdAt: Date.now(),
      priority: partialTask.priority || "medium",
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleAddReminder = (partialReminder: Partial<ReminderItem>) => {
    const newReminder: ReminderItem = {
      id: `r-${Date.now()}`,
      title: partialReminder.title || "New Reminder",
      date: partialReminder.date || new Date().toISOString().split("T")[0],
      time: partialReminder.time || "12:00",
      completed: false,
      priority: partialReminder.priority || "normal",
      repeat: partialReminder.repeat || "none",
    };
    setReminders((prev) => [...prev, newReminder]);
  };

  const handleAddMedication = (partialMed: Partial<MedicationItem>) => {
    const newMed: MedicationItem = {
      id: `m-${Date.now()}`,
      name: partialMed.name || "New Medication",
      dosage: partialMed.dosage || "1 dose",
      timing: partialMed.timing || "Day",
      reminderTime: partialMed.reminderTime,
      instructions: partialMed.instructions,
      takenToday: false,
    };
    setMedications((prev) => [...prev, newMed]);
  };

  const handleAddAllergy = (partialAllergy: Partial<AllergyItem>) => {
    const newAllergy: AllergyItem = {
      id: `a-${Date.now()}`,
      name: partialAllergy.name || "New Allergy",
      severity: partialAllergy.severity || "Severe",
      category: partialAllergy.category || "Food",
      notes: partialAllergy.notes,
      createdAt: Date.now(),
    };
    setAllergies((prev) => [...prev, newAllergy]);
  };

  const handleRegisterTimer = (newTimer: ActiveTimer) => {
    setTimers((prev) => [...prev.filter((t) => t.remainingSeconds > 0), newTimer]);
  };

  const handleDismissTimer = (id: string) => {
    setTimers((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isRunning: !t.isRunning } : t))
    );
  };

  const pendingTaskCount = tasks.filter((t) => !t.completed).length;
  const pendingReminderCount = reminders.filter((r) => !r.completed).length;
  const medsRemainingCount = medications.filter((m) => !m.takenToday).length;

  const isDark = theme.theme === "dark" || theme.theme === "black";
  const isPureBlack = theme.theme === "black";

  // Dynamic Background style based on user custom preference
  const getBgClass = () => {
    switch (theme.bgTint) {
      case "pure-white":
        return "bg-white text-slate-900";
      case "pure-black":
        return "bg-black text-slate-100";
      case "deep-charcoal":
        return "bg-[#0b0f19] text-slate-100";
      case "midnight-navy":
        return "bg-[#030712] text-slate-100";
      case "warm-slate":
        return "bg-[#18181b] text-slate-100";
      case "default":
      default:
        return isDark ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-900";
    }
  };

  const topNavTabs = [
    { id: "tasks", label: "Grocery & Tasks", icon: CheckSquare, count: pendingTaskCount },
    { id: "scanner", label: "Vision Scanner", icon: Camera },
    { id: "reminders", label: "Reminders", icon: Calendar, count: pendingReminderCount },
    { id: "allergies", label: "Allergy Shield", icon: ShieldAlert, count: allergies.length },
    { id: "meds", label: "Medication Routine", icon: Pill, count: medsRemainingCount },
    { id: "recipes", label: "Recipe Assistant", icon: Utensils },
    { id: "cleaning", label: "Cleaning Advisor", icon: Sparkles },
    { id: "cycle", label: "Cycle Wellness", icon: Heart },
  ];

  // Render the active component
  const renderActiveComponent = (tabToRender: string = activeTab) => {
    switch (tabToRender) {
      case "scanner":
        return (
          <VisionScanner
            allergies={allergies}
            ttsEnabled={settings.ttsEnabled}
            onAddTask={(title, category) =>
              handleAddTask({ title, category: category as any })
            }
          />
        );
      case "tasks":
        return (
          <TaskList
            tasks={tasks}
            onUpdateTasks={setTasks}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            theme={theme}
          />
        );
      case "reminders":
        return (
          <ReminderSchedule
            reminders={reminders}
            onUpdateReminders={setReminders}
          />
        );
      case "allergies":
        return (
          <AllergyProfile
            allergies={allergies}
            onUpdateAllergies={setAllergies}
          />
        );
      case "meds":
        return (
          <MedicationTracker
            medications={medications}
            onUpdateMedications={setMedications}
          />
        );
      case "recipes":
        return (
          <RecipeAssistant
            allergies={allergies}
            ttsEnabled={settings.ttsEnabled}
            onAddTask={(title, category) =>
              handleAddTask({ title, category: category as any })
            }
            onRegisterTimer={handleRegisterTimer}
          />
        );
      case "cleaning":
        return (
          <CleaningAssistant
            ttsEnabled={settings.ttsEnabled}
            onRegisterTimer={handleRegisterTimer}
          />
        );
      case "cycle":
        return (
          <CycleTracker
            cycleData={cycleData}
            onUpdateCycleData={setCycleData}
            ttsEnabled={settings.ttsEnabled}
          />
        );
      default:
        return (
          <TaskList
            tasks={tasks}
            onUpdateTasks={setTasks}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            theme={theme}
          />
        );
    }
  };

  return (
    <div
      id="daily-ai-task-assistant-root"
      className={`min-h-screen transition-colors duration-200 font-sans antialiased flex ${getBgClass()}`}
    >
      {/* 1. SIDEBAR DASHBOARD LAYOUT */}
      {theme.layout === "sidebar" && (
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isOpenMobile={isSidebarOpenMobile}
          onCloseMobile={() => setIsSidebarOpenMobile(false)}
          taskCount={pendingTaskCount}
          reminderCount={pendingReminderCount}
          allergyCount={allergies.length}
          medsRemainingCount={medsRemainingCount}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          onOpenThemeModal={() => setIsThemeModalOpen(true)}
          theme={theme}
        />
      )}

      {/* Main Container Column */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        {/* Top Header */}
        <Header
          settings={settings}
          onUpdateSettings={setSettings}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
          onOpenThemeModal={() => setIsThemeModalOpen(true)}
          allergies={allergies}
          onSelectTab={setActiveTab}
          activeTab={activeTab}
          onToggleSidebar={() => setIsSidebarOpenMobile((prev) => !prev)}
          theme={theme}
        />

        {/* 2. TOPBAR LAYOUT HORIZONTAL STRIP (if Topbar layout active) */}
        {theme.layout === "topbar" && (
          <div
            className={`border-b sticky top-[57px] z-20 overflow-x-auto no-scrollbar backdrop-blur-md ${
              isPureBlack
                ? "bg-black/90 border-slate-800"
                : isDark
                ? "bg-slate-900/90 border-slate-800"
                : "bg-white/90 border-slate-200"
            }`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-2">
              {topNavTabs.map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      soundFx.playChime("pop");
                    }}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-xs"
                        : isDark
                        ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                          isSelected ? "bg-black/30 text-white" : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Dynamic Workspace Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6">
          {/* Daily Quick Glance Strip */}
          <DailyStatsStrip
            tasks={tasks}
            reminders={reminders}
            allergies={allergies}
            medications={medications}
            onSelectTab={setActiveTab}
            activeTab={activeTab}
            theme={theme}
          />

          {/* 3. SPLIT DUAL-PANE WORKSPACE LAYOUT */}
          {theme.layout === "split" ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Constant Groceries & Task Checklist */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    📋 Active Checklist & Groceries
                  </span>
                  <span className="text-xs text-blue-500 font-semibold">
                    {pendingTaskCount} pending
                  </span>
                </div>
                <TaskList
                  tasks={tasks}
                  onUpdateTasks={setTasks}
                  onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
                  theme={theme}
                />
              </div>

              {/* Right Column: Active Secondary AI Tool / Scanner / Recipe / Meds */}
              <div className="lg:col-span-7 space-y-3">
                {/* Secondary Tool Selector Strip */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {topNavTabs
                    .filter((t) => t.id !== "tasks")
                    .map((tab) => {
                      const Icon = tab.icon;
                      const isSelected = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            soundFx.playChime("pop");
                          }}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                            isSelected
                              ? "bg-blue-600 text-white shadow-xs"
                              : isDark
                              ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                          }`}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5" />
                            {tab.label}
                          </span>
                        </button>
                      );
                    })}
                </div>

                {/* Right Tool Content */}
                <div>
                  {renderActiveComponent(activeTab === "tasks" ? "scanner" : activeTab)}
                </div>
              </div>
            </div>
          ) : (
            /* STANDARD SINGLE/EXPANDED VIEW (Sidebar, Topbar, or Minimalist) */
            <div
              id="tab-content-area"
              className={`transition-opacity duration-200 ${
                theme.layout === "minimal" ? "max-w-3xl mx-auto" : ""
              }`}
            >
              {renderActiveComponent()}
            </div>
          )}
        </main>
      </div>

      {/* Floating Timer Dock */}
      <TimerFloatingWidget
        timers={timers}
        onDismissTimer={handleDismissTimer}
        onToggleTimer={handleToggleTimer}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenSidebar={() => setIsSidebarOpenMobile(true)}
        taskCount={pendingTaskCount}
      />

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        ttsEnabled={settings.ttsEnabled}
        allergies={allergies}
        onAddTask={handleAddTask}
        onAddReminder={handleAddReminder}
        onAddMedication={handleAddMedication}
        onAddAllergy={handleAddAllergy}
        onSwitchTab={(tabId) => {
          setActiveTab(tabId);
          setIsVoiceModalOpen(false);
        }}
      />

      {/* Layout & Theme Customizer Modal */}
      <LayoutThemeCustomizer
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        theme={theme}
        onUpdateTheme={setTheme}
      />
    </div>
  );
}
