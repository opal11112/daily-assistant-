import React from "react";
import {
  Camera,
  CheckSquare,
  Calendar,
  ShieldAlert,
  Pill,
  Utensils,
  Sparkles,
  Heart,
  Mic,
  X,
  Palette,
  Moon,
  Sun,
} from "lucide-react";
import { soundFx } from "../utils/audio";
import { CustomThemeSettings } from "../types";

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  taskCount: number;
  reminderCount: number;
  allergyCount: number;
  medsRemainingCount: number;
  onOpenVoiceModal: () => void;
  onOpenThemeModal: () => void;
  theme: CustomThemeSettings;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  taskCount,
  reminderCount,
  allergyCount,
  medsRemainingCount,
  onOpenVoiceModal,
  onOpenThemeModal,
  theme,
}) => {
  const isDark = theme.theme === "dark" || theme.theme === "black";
  const isBlack = theme.theme === "black";

  const navSections = [
    {
      heading: "ESSENTIAL TOOLS",
      items: [
        {
          id: "scanner",
          label: "Camera Scanner",
          sublabel: "Money, food, meds & safety",
          icon: Camera,
          badge: "Vision AI",
          badgeColor: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
        },
        {
          id: "tasks",
          label: "Grocery & Tasks",
          sublabel: "Drag-and-drop priorities",
          icon: CheckSquare,
          count: taskCount,
        },
        {
          id: "reminders",
          label: "Reminders & Timeline",
          sublabel: "Schedules & alarms",
          icon: Calendar,
          count: reminderCount,
        },
      ],
    },
    {
      heading: "HEALTH & WELLNESS",
      items: [
        {
          id: "allergies",
          label: "Allergy Shield",
          sublabel: "Active scanner cross-check",
          icon: ShieldAlert,
          count: allergyCount,
          countColor: isDark
            ? "bg-amber-950/60 text-amber-300 border border-amber-800"
            : "bg-amber-100 text-amber-900 border border-amber-200",
        },
        {
          id: "meds",
          label: "Medication Tracker",
          sublabel: "Day & night dosing",
          icon: Pill,
          count: medsRemainingCount,
          countColor: isDark
            ? "bg-purple-950/60 text-purple-300 border border-purple-800"
            : "bg-purple-100 text-purple-900 border border-purple-200",
        },
        {
          id: "cycle",
          label: "Cycle Wellness",
          sublabel: "Phase & nutrition guidance",
          icon: Heart,
        },
      ],
    },
    {
      heading: "AI ASSISTANTS",
      items: [
        {
          id: "recipes",
          label: "AI Recipe Assistant",
          sublabel: "Safe meals & step timers",
          icon: Utensils,
          badge: "Cooking",
          badgeColor: isDark
            ? "bg-orange-950/60 text-orange-400 border border-orange-800"
            : "bg-orange-100 text-orange-800",
        },
        {
          id: "cleaning",
          label: "Cleaning Advisor",
          sublabel: "Chemical safety & soaks",
          icon: Sparkles,
          badge: "Safety",
          badgeColor: isDark
            ? "bg-cyan-950/60 text-cyan-400 border border-cyan-800"
            : "bg-cyan-100 text-cyan-800",
        },
      ],
    },
  ];

  const handleItemClick = (id: string) => {
    onSelectTab(id);
    onCloseMobile();
    soundFx.playChime("pop");
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        id="app-main-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 border-r flex flex-col transition-all duration-300 lg:static lg:translate-x-0 ${
          isBlack
            ? "bg-black border-slate-800 text-white"
            : isDark
            ? "bg-slate-900 border-slate-800 text-white"
            : "bg-white border-slate-200/80 text-slate-900"
        } ${isOpenMobile ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}
      >
        {/* Brand Header */}
        <div
          className={`p-5 border-b flex items-center justify-between ${
            isDark ? "border-slate-800" : "border-slate-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight leading-tight">
                  Daily AI Assistant
                </span>
              </div>
              <p className={`text-[11px] font-medium ${isDark ? "text-slate-400" : "text-slate-700"}`}>
                Tasks, Vision & Routine
              </p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className={`lg:hidden p-1.5 rounded-lg ${
              isDark ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Voice Trigger Banner in Sidebar */}
        <div className="p-3.5 mx-3 mt-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-blue-200" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Hands-Free Voice
              </span>
            </div>
            <span className="text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">
              Ready
            </span>
          </div>
          <p className="text-[11px] text-blue-100 leading-relaxed mb-2.5">
            Add groceries, set reminders, check ingredients, or ask for meal recipes.
          </p>
          <button
            onClick={onOpenVoiceModal}
            className="w-full py-2 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-98 cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Launch Voice Assistant</span>
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-5 no-scrollbar">
          {navSections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <span
                className={`px-3 text-[10px] font-extrabold uppercase tracking-wider block mb-1.5 ${
                  isDark ? "text-slate-400" : "text-slate-700"
                }`}
              >
                {sec.heading}
              </span>
              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isSelected = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group ${
                        isSelected
                          ? isDark
                            ? "bg-blue-600 text-white shadow-xs font-semibold"
                            : "bg-slate-900 text-white shadow-xs font-semibold"
                          : isDark
                          ? "text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? isDark
                                ? "bg-blue-700 text-white"
                                : "bg-slate-800 text-blue-400"
                              : isDark
                              ? "bg-slate-800/80 text-slate-400 group-hover:text-blue-400 border border-slate-700"
                              : "bg-slate-100 text-slate-600 group-hover:bg-white group-hover:text-blue-600 border border-slate-200/60"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs truncate block">
                            {item.label}
                          </span>
                          <span
                            className={`text-[10px] truncate block ${
                              isSelected
                                ? isDark ? "text-blue-100" : "text-slate-400"
                                : isDark ? "text-slate-400" : "text-slate-400"
                            }`}
                          >
                            {item.sublabel}
                          </span>
                        </div>
                      </div>

                      {/* Count / Badge Indicator */}
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {item.count !== undefined && item.count > 0 && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isSelected
                                ? "bg-black/30 text-white"
                                : item.countColor ||
                                  (isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700")
                            }`}
                          >
                            {item.count}
                          </span>
                        )}

                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold tracking-tight uppercase ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : item.badgeColor || "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer with Layout & Theme trigger */}
        <div
          className={`p-3.5 border-t space-y-2 ${
            isDark ? "border-slate-800 bg-slate-950/60" : "border-slate-100 bg-slate-50/70"
          }`}
        >
          <button
            onClick={onOpenThemeModal}
            className={`w-full py-2 px-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
              isDark
                ? "bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-blue-500" />
              <span>Layout & Colors</span>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${
                theme.theme === "black"
                  ? "bg-emerald-500/20 text-emerald-400 font-bold"
                  : isDark
                  ? "bg-slate-700 text-slate-300"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {theme.theme === "black" ? "OLED Black" : theme.theme}
            </span>
          </button>

          <div className="flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className={`text-[11px] font-semibold ${isDark ? "text-slate-400" : "text-slate-700"}`}>
                System Online
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-700">v2.5 AI</span>
          </div>
        </div>
      </aside>
    </>
  );
};
