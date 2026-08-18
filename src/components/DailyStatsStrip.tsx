import React from "react";
import {
  CheckSquare,
  Calendar,
  ShieldCheck,
  Pill,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { TaskItem, ReminderItem, AllergyItem, MedicationItem, CustomThemeSettings } from "../types";

interface DailyStatsStripProps {
  tasks: TaskItem[];
  reminders: ReminderItem[];
  allergies: AllergyItem[];
  medications: MedicationItem[];
  onSelectTab: (tabId: string) => void;
  activeTab: string;
  theme?: CustomThemeSettings;
}

export const DailyStatsStrip: React.FC<DailyStatsStripProps> = ({
  tasks,
  reminders,
  allergies,
  medications,
  onSelectTab,
  activeTab,
  theme,
}) => {
  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const pendingReminders = reminders.filter((r) => !r.completed).length;
  const takenMeds = medications.filter((m) => m.takenToday).length;
  const totalMeds = medications.length;
  const allergyCount = allergies.length;

  const isDark = theme?.theme === "dark" || theme?.theme === "black";
  const isBlack = theme?.theme === "black";

  const now = new Date();
  const dateFormatted = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const getGreeting = () => {
    const hour = now.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div id="daily-glance-strip" className="space-y-3">
      {/* Top Greeting & Date Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              isDark ? "text-slate-400" : "text-slate-700"
            }`}
          >
            {getGreeting()} • {dateFormatted}
          </span>
        </div>

        <div className={`flex items-center gap-2 text-xs ${isDark ? "text-slate-400" : "text-slate-700"}`}>
          <span className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
            {pendingTasks} {pendingTasks === 1 ? "task" : "tasks"} pending
          </span>
          <span>•</span>
          <span className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
            {totalMeds > 0 ? `${takenMeds}/${totalMeds} meds taken` : "No meds scheduled"}
          </span>
        </div>
      </div>

      {/* 4-Card Glance Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Tasks Card */}
        <button
          type="button"
          onClick={() => onSelectTab("tasks")}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === "tasks"
              ? "bg-blue-600 text-white border-blue-600 shadow-xs"
              : isBlack
              ? "bg-black border-slate-800 hover:border-blue-500/50 text-white"
              : isDark
              ? "bg-slate-900 border-slate-800 hover:border-blue-500/50 text-white"
              : "bg-white border-slate-200/80 hover:border-blue-300 text-slate-900 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                activeTab === "tasks"
                  ? "bg-white/20 text-white"
                  : isDark
                  ? "bg-blue-950/60 text-blue-400 border border-blue-800/60"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
            </div>
            <span
              className={`text-xs font-black ${
                activeTab === "tasks" ? "text-white" : isDark ? "text-blue-400" : "text-blue-700"
              }`}
            >
              {pendingTasks} Due
            </span>
          </div>
          <div className="text-xs font-bold truncate">Grocery & Tasks</div>
          <p
            className={`text-[10px] truncate ${
              activeTab === "tasks" ? "text-blue-100" : isDark ? "text-slate-400" : "text-slate-700"
            }`}
          >
            {tasks.length} total items
          </p>
        </button>

        {/* Reminders Card */}
        <button
          type="button"
          onClick={() => onSelectTab("reminders")}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === "reminders"
              ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
              : isBlack
              ? "bg-black border-slate-800 hover:border-indigo-500/50 text-white"
              : isDark
              ? "bg-slate-900 border-slate-800 hover:border-indigo-500/50 text-white"
              : "bg-white border-slate-200/80 hover:border-indigo-300 text-slate-900 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                activeTab === "reminders"
                  ? "bg-white/20 text-white"
                  : isDark
                  ? "bg-indigo-950/60 text-indigo-400 border border-indigo-800/60"
                  : "bg-indigo-100 text-indigo-700"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <span
              className={`text-xs font-black ${
                activeTab === "reminders" ? "text-white" : isDark ? "text-indigo-400" : "text-indigo-700"
              }`}
            >
              {pendingReminders} Upcoming
            </span>
          </div>
          <div className="text-xs font-bold truncate">Reminders</div>
          <p
            className={`text-[10px] truncate ${
              activeTab === "reminders" ? "text-indigo-100" : isDark ? "text-slate-400" : "text-slate-700"
            }`}
          >
            Schedules & alerts
          </p>
        </button>

        {/* Meds Adherence Card */}
        <button
          type="button"
          onClick={() => onSelectTab("meds")}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === "meds"
              ? "bg-purple-600 text-white border-purple-600 shadow-xs"
              : isBlack
              ? "bg-black border-slate-800 hover:border-purple-500/50 text-white"
              : isDark
              ? "bg-slate-900 border-slate-800 hover:border-purple-500/50 text-white"
              : "bg-white border-slate-200/80 hover:border-purple-300 text-slate-900 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                activeTab === "meds"
                  ? "bg-white/20 text-white"
                  : isDark
                  ? "bg-purple-950/60 text-purple-400 border border-purple-800/60"
                  : "bg-purple-100 text-purple-700"
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
            </div>
            <span
              className={`text-xs font-black ${
                activeTab === "meds" ? "text-white" : isDark ? "text-purple-400" : "text-purple-700"
              }`}
            >
              {totalMeds > 0 ? `${Math.round((takenMeds / totalMeds) * 100)}%` : "0%"}
            </span>
          </div>
          <div className="text-xs font-bold truncate">Medication Routine</div>
          <p
            className={`text-[10px] truncate ${
              activeTab === "meds" ? "text-purple-100" : isDark ? "text-slate-400" : "text-slate-700"
            }`}
          >
            {takenMeds}/{totalMeds} taken today
          </p>
        </button>

        {/* Allergy Shield Card */}
        <button
          type="button"
          onClick={() => onSelectTab("allergies")}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === "allergies"
              ? "bg-amber-600 text-white border-amber-600 shadow-xs"
              : isBlack
              ? "bg-black border-slate-800 hover:border-amber-500/50 text-white"
              : isDark
              ? "bg-slate-900 border-slate-800 hover:border-amber-500/50 text-white"
              : "bg-white border-slate-200/80 hover:border-amber-300 text-slate-900 shadow-2xs"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                activeTab === "allergies"
                  ? "bg-white/20 text-white"
                  : isDark
                  ? "bg-amber-950/60 text-amber-400 border border-amber-800/60"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <span
              className={`text-xs font-black ${
                activeTab === "allergies" ? "text-white" : isDark ? "text-amber-400" : "text-amber-800"
              }`}
            >
              {allergyCount} Active
            </span>
          </div>
          <div className="text-xs font-bold truncate">Allergy Shield</div>
          <p
            className={`text-[10px] truncate ${
              activeTab === "allergies" ? "text-amber-100" : isDark ? "text-slate-400" : "text-slate-700"
            }`}
          >
            AI scanner screening
          </p>
        </button>
      </div>
    </div>
  );
};
