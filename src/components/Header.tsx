import React from "react";
import {
  Mic,
  Volume2,
  VolumeX,
  ShieldAlert,
  Sparkles,
  Menu,
  Palette,
  Moon,
  Sun,
  Layout,
} from "lucide-react";
import { AudioSettings, AllergyItem, CustomThemeSettings } from "../types";
import { soundFx } from "../utils/audio";

interface HeaderProps {
  settings: AudioSettings;
  onUpdateSettings: (settings: AudioSettings) => void;
  onOpenVoiceModal: () => void;
  onOpenThemeModal: () => void;
  allergies: AllergyItem[];
  onSelectTab: (tabId: string) => void;
  activeTab: string;
  onToggleSidebar?: () => void;
  theme: CustomThemeSettings;
}

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  scanner: {
    title: "AI Vision Safety Scanner",
    subtitle: "Scan money, nutrition labels, medications & plants",
  },
  tasks: {
    title: "Grocery & Task List",
    subtitle: "Organize items with manual drag-and-drop prioritization",
  },
  reminders: {
    title: "Reminders & Daily Schedule",
    subtitle: "Set appointments, recurring alerts & daily timelines",
  },
  allergies: {
    title: "Allergy & Sensitivity Profile",
    subtitle: "Active cross-checking protection on all scans & recipes",
  },
  meds: {
    title: "Medication & Supplement Routine",
    subtitle: "Track daytime & nighttime regimens with daily adherence",
  },
  recipes: {
    title: "AI Recipe & Cooking Assistant",
    subtitle: "Allergy-safe meals with step timers & voice overview",
  },
  cleaning: {
    title: "Household Cleaning Advisor",
    subtitle: "Safe chemical combinations & soak dwell timers",
  },
  cycle: {
    title: "Menstrual Cycle Wellness",
    subtitle: "Period predictions, phase guidance & symptom tracking",
  },
};

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  onOpenVoiceModal,
  onOpenThemeModal,
  allergies,
  onSelectTab,
  activeTab,
  onToggleSidebar,
  theme,
}) => {
  const toggleTts = () => {
    const next = !settings.ttsEnabled;
    onUpdateSettings({ ...settings, ttsEnabled: next });
    if (next && settings.soundEffects) {
      soundFx.playChime("pop");
    }
  };

  const isDark = theme.theme === "dark" || theme.theme === "black";
  const isBlack = theme.theme === "black";

  const activeAllergyCount = allergies.length;
  const currentTabInfo = TAB_TITLES[activeTab] || {
    title: "Daily AI Task Assistant",
    subtitle: "Tasks, Vision, Health & Cooking",
  };

  return (
    <header
      id="app-main-header"
      className={`sticky top-0 z-30 transition-colors border-b shadow-xs backdrop-blur-md ${
        isBlack
          ? "bg-black/90 border-slate-800 text-white"
          : isDark
          ? "bg-slate-900/90 border-slate-800 text-white"
          : "bg-white/90 border-slate-200/80 text-slate-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Mobile Sidebar Toggle + Current Tab Breadcrumb */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className={`lg:hidden p-2 rounded-xl transition-colors ${
                isDark
                  ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Logo icon */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-xs shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black tracking-tight leading-tight">
                {currentTabInfo.title}
              </h1>
            </div>
            <p className={`text-xs hidden sm:block ${isDark ? "text-slate-400" : "text-slate-700"}`}>
              {currentTabInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Active Allergy Shield Badge */}
          {activeAllergyCount > 0 && (
            <button
              id="allergy-shield-header-btn"
              onClick={() => onSelectTab("allergies")}
              title={`${activeAllergyCount} active allergies monitored by AI`}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shadow-2xs ${
                isDark
                  ? "bg-amber-950/40 border border-amber-800/80 text-amber-300 hover:bg-amber-900/40"
                  : "bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100"
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>{activeAllergyCount} Shielded</span>
            </button>
          )}

          {/* Theme & Layout Customizer Button */}
          <button
            id="customize-layout-btn"
            onClick={onOpenThemeModal}
            title="Change layout style, dark mode, OLED black, and list colors"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
              isDark
                ? "bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
                : "bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200"
            }`}
          >
            <Palette className="w-4 h-4 text-blue-500" />
            <span className="hidden md:inline">Layout & Theme</span>
          </button>

          {/* Read Aloud Toggle */}
          <button
            id="tts-toggle-btn"
            onClick={toggleTts}
            aria-label={settings.ttsEnabled ? "Disable Read Aloud" : "Enable Read Aloud"}
            title={settings.ttsEnabled ? "Speech synthesis is ON" : "Speech synthesis is Muted"}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
              settings.ttsEnabled
                ? isDark
                  ? "bg-emerald-950/40 border border-emerald-800 text-emerald-400 hover:bg-emerald-900/40"
                  : "bg-emerald-50 border border-emerald-200 text-emerald-900 hover:bg-emerald-100"
                : isDark
                ? "bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700"
                : "bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200"
            }`}
          >
            {settings.ttsEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-500" />
                <span className="hidden lg:inline">Voice ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span className="hidden lg:inline">Muted</span>
              </>
            )}
          </button>

          {/* Voice Command Trigger */}
          <button
            id="voice-command-header-btn"
            onClick={onOpenVoiceModal}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow-blue-500/25 transition-all active:scale-95 cursor-pointer"
          >
            <Mic className="w-4 h-4" />
            <span className="hidden xs:inline">Speak</span>
          </button>
        </div>
      </div>
    </header>
  );
};
