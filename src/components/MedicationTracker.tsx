import React, { useState } from "react";
import {
  Pill,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Sun,
  Moon,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { MedicationItem, MedicationTiming } from "../types";
import { soundFx } from "../utils/audio";

interface MedicationTrackerProps {
  medications: MedicationItem[];
  onUpdateMedications: (meds: MedicationItem[]) => void;
}

export const MedicationTracker: React.FC<MedicationTrackerProps> = ({
  medications,
  onUpdateMedications,
}) => {
  const [newName, setNewName] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newTiming, setNewTiming] = useState<MedicationTiming>("Day");
  const [newReminderTime, setNewReminderTime] = useState("08:00");
  const [newInstructions, setNewInstructions] = useState("");

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newMed: MedicationItem = {
      id: `m-${Date.now()}`,
      name: newName.trim(),
      dosage: newDosage.trim() || "1 dose",
      timing: newTiming,
      reminderTime: newReminderTime || undefined,
      instructions: newInstructions.trim() || undefined,
      takenToday: false,
    };

    onUpdateMedications([...medications, newMed]);
    setNewName("");
    setNewDosage("");
    setNewInstructions("");
    soundFx.playChime("pop");
  };

  const toggleMedication = (id: string) => {
    const today = new Date().toISOString().split("T")[0];
    const next = medications.map((m) => {
      if (m.id === id) {
        const nextTaken = !m.takenToday;
        if (nextTaken) {
          soundFx.playChime("success");
        }
        return {
          ...m,
          takenToday: nextTaken,
          lastTakenDate: nextTaken ? today : m.lastTakenDate,
        };
      }
      return m;
    });
    onUpdateMedications(next);
  };

  const deleteMedication = (id: string) => {
    onUpdateMedications(medications.filter((m) => m.id !== id));
    soundFx.playChime("pop");
  };

  const resetAllDaily = () => {
    onUpdateMedications(medications.map((m) => ({ ...m, takenToday: false })));
    soundFx.playChime("pop");
  };

  const dayMeds = medications.filter((m) => m.timing === "Day" || m.timing === "Both");
  const nightMeds = medications.filter((m) => m.timing === "Night" || m.timing === "Both");

  const takenCount = medications.filter((m) => m.takenToday).length;
  const totalCount = medications.length;
  const complianceRate = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  return (
    <div id="medications-container" className="space-y-5">
      {/* Overview & Progress */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-800">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Medication & Supplement Routine
                </h2>
                <p className="text-xs text-slate-700 dark:text-slate-400">
                  {takenCount} of {totalCount} completed today ({complianceRate}% adherence)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={resetAllDaily}
                className="text-xs text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Reset Day
              </button>
            </div>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden mt-3">
            <div
              className="bg-purple-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${complianceRate}%` }}
            />
          </div>
        </div>

        {/* Add Med Form */}
        <form onSubmit={handleAddMedication} className="p-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <input
              type="text"
              placeholder="Medication name (e.g. Magnesium, Vitamin D)..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="sm:col-span-4 px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-white placeholder-slate-400"
            />
            <input
              type="text"
              placeholder="Dosage (e.g. 200mg, 1 tablet)"
              value={newDosage}
              onChange={(e) => setNewDosage(e.target.value)}
              className="sm:col-span-3 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400"
            />
            <select
              value={newTiming}
              onChange={(e) => setNewTiming(e.target.value as MedicationTiming)}
              className="sm:col-span-2 px-2.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200"
            >
              <option value="Day">☀️ Daytime</option>
              <option value="Night">🌙 Nighttime</option>
              <option value="Both">🔄 Both (2x/day)</option>
            </select>
            <input
              type="time"
              value={newReminderTime}
              onChange={(e) => setNewReminderTime(e.target.value)}
              className="sm:col-span-1 px-1.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200"
            />
            <button
              type="submit"
              className="sm:col-span-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </form>

        {/* List Breakdown: Day & Night */}
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Day Meds */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Sun className="w-4 h-4" />
              <span>Daytime Medications ({dayMeds.length})</span>
            </div>

            <div className="space-y-2">
              {dayMeds.length === 0 ? (
                <div className="p-4 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                  No daytime meds scheduled
                </div>
              ) : (
                dayMeds.map((med) => (
                  <div
                    key={med.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 transition-colors ${
                      med.takenToday
                        ? "bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/60"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={med.takenToday}
                        onChange={() => toggleMedication(med.id)}
                        className="w-5 h-5 rounded-md border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                      <div className="min-w-0">
                        <span
                          className={`text-xs font-bold block truncate ${
                            med.takenToday
                              ? "line-through text-slate-400 dark:text-slate-500"
                              : "text-slate-800 dark:text-white"
                          }`}
                        >
                          {med.name}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-700 dark:text-slate-400">
                          <span className="font-semibold">{med.dosage}</span>
                          {med.reminderTime && <span>• {med.reminderTime}</span>}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteMedication(med.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Night Meds */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <Moon className="w-4 h-4" />
              <span>Nighttime Medications ({nightMeds.length})</span>
            </div>

            <div className="space-y-2">
              {nightMeds.length === 0 ? (
                <div className="p-4 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                  No nighttime meds scheduled
                </div>
              ) : (
                nightMeds.map((med) => (
                  <div
                    key={med.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 transition-colors ${
                      med.takenToday
                        ? "bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/60"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={med.takenToday}
                        onChange={() => toggleMedication(med.id)}
                        className="w-5 h-5 rounded-md border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                      <div className="min-w-0">
                        <span
                          className={`text-xs font-bold block truncate ${
                            med.takenToday
                              ? "line-through text-slate-400 dark:text-slate-500"
                              : "text-slate-800 dark:text-white"
                          }`}
                        >
                          {med.name}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-700 dark:text-slate-400">
                          <span className="font-semibold">{med.dosage}</span>
                          {med.reminderTime && <span>• {med.reminderTime}</span>}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteMedication(med.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
