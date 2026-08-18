import React from "react";
import { Timer, X, Play, Pause, AlertCircle } from "lucide-react";
import { ActiveTimer } from "../types";

interface TimerFloatingWidgetProps {
  timers: ActiveTimer[];
  onDismissTimer: (id: string) => void;
  onToggleTimer: (id: string) => void;
}

export const TimerFloatingWidget: React.FC<TimerFloatingWidgetProps> = ({
  timers,
  onDismissTimer,
  onToggleTimer,
}) => {
  if (timers.length === 0) return null;

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      id="timer-floating-widget"
      className="fixed bottom-4 right-4 z-40 flex flex-col gap-2 max-w-xs w-full pointer-events-none"
    >
      {timers.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-700 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-4 duration-300"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                t.remainingSeconds === 0
                  ? "bg-rose-500 text-white animate-bounce"
                  : t.isRunning
                  ? "bg-blue-600 text-white animate-pulse"
                  : "bg-slate-700 text-slate-300"
              }`}
            >
              <Timer className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs text-slate-300 truncate block">
                {t.label}
              </span>
              <span
                className={`text-sm font-black font-mono tracking-tight ${
                  t.remainingSeconds === 0 ? "text-rose-400" : "text-white"
                }`}
              >
                {t.remainingSeconds === 0 ? "DONE!" : formatTimer(t.remainingSeconds)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onDismissTimer(t.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Dismiss timer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
