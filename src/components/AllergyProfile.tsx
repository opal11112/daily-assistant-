import React, { useState } from "react";
import {
  ShieldAlert,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldCheck,
} from "lucide-react";
import { AllergyItem, AllergySeverity, AllergyCategory } from "../types";
import { soundFx } from "../utils/audio";

interface AllergyProfileProps {
  allergies: AllergyItem[];
  onUpdateAllergies: (allergies: AllergyItem[]) => void;
}

export const AllergyProfile: React.FC<AllergyProfileProps> = ({
  allergies,
  onUpdateAllergies,
}) => {
  const [newName, setNewName] = useState("");
  const [newSeverity, setNewSeverity] = useState<AllergySeverity>("Severe");
  const [newCategory, setNewCategory] = useState<AllergyCategory>("Food");
  const [newNotes, setNewNotes] = useState("");

  const handleAddAllergy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newAllergy: AllergyItem = {
      id: `a-${Date.now()}`,
      name: newName.trim(),
      severity: newSeverity,
      category: newCategory,
      notes: newNotes.trim() || undefined,
      createdAt: Date.now(),
    };

    onUpdateAllergies([...allergies, newAllergy]);
    setNewName("");
    setNewNotes("");
    soundFx.playChime("pop");
  };

  const deleteAllergy = (id: string) => {
    onUpdateAllergies(allergies.filter((a) => a.id !== id));
    soundFx.playChime("pop");
  };

  const getSeverityBadgeClass = (severity: AllergySeverity) => {
    switch (severity) {
      case "Anaphylaxis":
        return "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800";
      case "Severe":
        return "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800";
      case "Moderate":
        return "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800";
      case "Mild":
        return "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800";
    }
  };

  return (
    <div id="allergies-container" className="space-y-5">
      {/* Allergy Shield Main Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Allergy & Sensitivity Profile
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-400">
                {allergies.length} allergens monitored by Vision Scanner & Recipe Chef
              </p>
            </div>
          </div>
        </div>

        {/* Informational Banner */}
        <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Active Safety Shield:</strong> Every camera scan of food labels and recipe ingredient list is automatically checked against these allergens to prevent accidental exposure.
          </p>
        </div>

        {/* Add Allergy Form */}
        <form onSubmit={handleAddAllergy} className="p-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
            <input
              type="text"
              placeholder="Allergen name (e.g. Peanuts, Penicillin, Latex)..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="sm:col-span-4 px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-white placeholder-slate-400"
            />
            <select
              value={newSeverity}
              onChange={(e) => setNewSeverity(e.target.value as AllergySeverity)}
              className="sm:col-span-3 px-2.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200"
            >
              <option value="Anaphylaxis">🚨 Anaphylaxis (Critical)</option>
              <option value="Severe">🔴 Severe Reaction</option>
              <option value="Moderate">🟡 Moderate Sensitivity</option>
              <option value="Mild">🔵 Mild Intolerance</option>
            </select>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as AllergyCategory)}
              className="sm:col-span-3 px-2.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200"
            >
              <option value="Food">🥗 Food & Nutrition</option>
              <option value="Medication">💊 Medication / Drug</option>
              <option value="Environmental">🌿 Environmental / Pollen</option>
              <option value="Contact">🧤 Contact / Topical</option>
            </select>
            <button
              type="submit"
              className="sm:col-span-2 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Allergen</span>
            </button>
          </div>
        </form>

        {/* Allergy List */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {allergies.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <ShieldCheck className="w-10 h-10 mx-auto mb-2 opacity-40 text-emerald-500" />
              <p className="text-sm font-medium text-slate-400">No allergies recorded</p>
              <p className="text-xs text-slate-700 mt-1">
                Add food or medication sensitivities above to activate safety screenings
              </p>
            </div>
          ) : (
            allergies.map((allergy) => (
              <div
                key={allergy.id}
                className="p-3.5 sm:px-5 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800 dark:text-white truncate">
                        {allergy.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getSeverityBadgeClass(
                          allergy.severity
                        )}`}
                      >
                        {allergy.severity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-400 mt-0.5">
                      <span>Category: {allergy.category}</span>
                      {allergy.notes && <span>• {allergy.notes}</span>}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteAllergy(allergy.id)}
                  className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg transition-colors"
                  title="Remove allergen"
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
