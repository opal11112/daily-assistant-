import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Bell,
  CheckCircle2,
  AlertCircle,
  Repeat,
} from "lucide-react";
import { ReminderItem } from "../types";
import { soundFx } from "../utils/audio";

interface ReminderScheduleProps {
  reminders: ReminderItem[];
  onUpdateReminders: (reminders: ReminderItem[]) => void;
}

export const ReminderSchedule: React.FC<ReminderScheduleProps> = ({
  reminders,
  onUpdateReminders,
}) => {
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newTime, setNewTime] = useState("12:00");
  const [newPriority, setNewPriority] = useState<"normal" | "high">("normal");
  const [newRepeat, setNewRepeat] = useState<"none" | "daily" | "weekly">("none");

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;

    const newReminder: ReminderItem = {
      id: `r-${Date.now()}`,
      title: newTitle.trim(),
      date: newDate,
      time: newTime || "12:00",
      completed: false,
      priority: newPriority,
      repeat: newRepeat,
    };

    onUpdateReminders([...reminders, newReminder]);
    setNewTitle("");
    soundFx.playChime("pop");
  };

  const toggleReminder = (id: string) => {
    const next = reminders.map((r) => {
      if (r.id === id) {
        const nextState = !r.completed;
        if (nextState) {
          soundFx.playChime("success");
        }
        return { ...r, completed: nextState };
      }
      return r;
    });
    onUpdateReminders(next);
  };

  const deleteReminder = (id: string) => {
    onUpdateReminders(reminders.filter((r) => r.id !== id));
    soundFx.playChime("pop");
  };

  const sortedReminders = [...reminders].sort((a, b) => {
    const dateA = `${a.date} ${a.time}`;
    const dateB = `${b.date} ${b.time}`;
    return dateA.localeCompare(dateB);
  });

  return (
    <div id="reminders-container" className="space-y-5">
      {/* Schedule Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Reminders & Daily Schedule
                </h2>
                <p className="text-xs text-slate-700 dark:text-slate-400">
                  {reminders.filter((r) => !r.completed).length} upcoming alerts
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Reminder Form */}
        <form onSubmit={handleAddReminder} className="p-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <input
              type="text"
              placeholder="Reminder description (e.g. Doctor appointment, Turn off oven)..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="sm:col-span-6 px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white placeholder-slate-400"
            />
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="sm:col-span-2 px-2.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200"
            />
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="sm:col-span-2 px-2.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200"
            />
            <button
              type="submit"
              className="sm:col-span-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Set</span>
            </button>
          </div>

          <div className="flex items-center gap-3 mt-2.5 text-xs text-slate-700 dark:text-slate-400">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={newPriority === "high"}
                onChange={(e) => setNewPriority(e.target.checked ? "high" : "normal")}
                className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-semibold text-rose-500">Urgent Priority</span>
            </label>

            <div className="flex items-center gap-1">
              <Repeat className="w-3.5 h-3.5 text-slate-400" />
              <span>Repeat:</span>
              <select
                value={newRepeat}
                onChange={(e) => setNewRepeat(e.target.value as any)}
                className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
              >
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>
        </form>

        {/* Reminders List */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {sortedReminders.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-500" />
              <p className="text-sm font-medium text-slate-400">No scheduled reminders</p>
              <p className="text-xs text-slate-700 mt-1">
                Add an alert above or say "Remind me at 4pm to..."
              </p>
            </div>
          ) : (
            sortedReminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`p-3.5 sm:px-5 flex items-center justify-between gap-3 group transition-colors ${
                  reminder.completed
                    ? "bg-slate-50/70 dark:bg-slate-950/40"
                    : "hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={reminder.completed}
                    onChange={() => toggleReminder(reminder.id)}
                    className="w-5 h-5 rounded-md border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div className="min-w-0 flex-1">
                    <span
                      className={`text-sm font-medium block truncate ${
                        reminder.completed
                          ? "line-through text-slate-400 dark:text-slate-600"
                          : "text-slate-800 dark:text-slate-100"
                      }`}
                    >
                      {reminder.title}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-700 dark:text-slate-400">
                      <span className="flex items-center gap-1 font-semibold">
                        <Clock className="w-3 h-3 text-indigo-500" />
                        {reminder.date} at {reminder.time}
                      </span>
                      {reminder.repeat && reminder.repeat !== "none" && (
                        <span className="px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold border border-indigo-200 dark:border-indigo-800">
                          {reminder.repeat}
                        </span>
                      )}
                      {reminder.priority === "high" && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 text-[10px] font-bold border border-rose-200 dark:border-rose-800">
                          Urgent
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteReminder(reminder.id)}
                  className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
