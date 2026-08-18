import React, { useState } from "react";
import {
  Heart,
  Calendar,
  Sparkles,
  Volume2,
  CheckCircle2,
  Activity,
  Smile,
  Zap,
  Info,
} from "lucide-react";
import { MenstrualCycleData } from "../types";
import { speakText, soundFx } from "../utils/audio";

interface CycleTrackerProps {
  cycleData: MenstrualCycleData;
  onUpdateCycleData: (data: MenstrualCycleData) => void;
  ttsEnabled: boolean;
}

export const CycleTracker: React.FC<CycleTrackerProps> = ({
  cycleData,
  onUpdateCycleData,
  ttsEnabled,
}) => {
  const [startDate, setStartDate] = useState(cycleData.lastPeriodStart);
  const [cycleLength, setCycleLength] = useState(cycleData.cycleLengthDays);
  const [periodDuration, setPeriodDuration] = useState(cycleData.periodDurationDays || 5);
  const [mood, setMood] = useState(cycleData.moodToday || "Good");
  const [symptoms, setSymptoms] = useState<string[]>(cycleData.symptomsToday || []);
  const [calculationSummary, setCalculationSummary] = useState<string | null>(null);

  const calculateCycleDetails = () => {
    if (!startDate) return null;

    const start = new Date(startDate);
    const today = new Date();

    // Next period calculation
    const nextPeriod = new Date(start);
    nextPeriod.setDate(start.getDate() + cycleLength);

    // Days elapsed in current cycle
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const dayOfCycle = Math.floor(diffTime / (1000 * 60 * 60 * 24)) % cycleLength + 1;

    // Ovulation estimated ~14 days before next period
    const ovulationDay = Math.max(1, cycleLength - 14);
    const ovulationDate = new Date(start);
    ovulationDate.setDate(start.getDate() + ovulationDay);

    // Fertile window (~4 days before ovulation to 1 day after)
    const fertileStart = new Date(ovulationDate);
    fertileStart.setDate(ovulationDate.getDate() - 4);
    const fertileEnd = new Date(ovulationDate);
    fertileEnd.setDate(ovulationDate.getDate() + 1);

    // Phase determination
    let phaseName = "Follicular Phase";
    let phaseColor = "text-blue-600 bg-blue-50 border-blue-200";
    let energyLevel = "High Energy & Creativity";
    let nutritionTip = "Focus on lean proteins, complex carbs, and fermented foods.";

    if (dayOfCycle <= periodDuration) {
      phaseName = "Menstrual Phase";
      phaseColor = "text-rose-600 bg-rose-50 border-rose-200";
      energyLevel = "Lower Energy • Prioritize Rest";
      nutritionTip = "Replenish iron (leafy greens, lentils, dark chocolate) and stay hydrated with warm teas.";
    } else if (dayOfCycle >= ovulationDay - 2 && dayOfCycle <= ovulationDay + 1) {
      phaseName = "Ovulatory Phase";
      phaseColor = "text-purple-600 bg-purple-50 border-purple-200";
      energyLevel = "Peak Energy & Social Focus";
      nutritionTip = "Opt for antioxidant-rich berries, light grains, and anti-inflammatory foods.";
    } else if (dayOfCycle > ovulationDay + 1) {
      phaseName = "Luteal Phase";
      phaseColor = "text-amber-600 bg-amber-50 border-amber-200";
      energyLevel = "Calm, Steady Focus • Winding Down";
      nutritionTip = "Support mood with magnesium-rich pumpkin seeds, avocados, and root vegetables.";
    }

    return {
      dayOfCycle,
      nextPeriodStr: nextPeriod.toDateString(),
      daysUntilNext: Math.max(0, Math.ceil((nextPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))),
      ovulationStr: ovulationDate.toDateString(),
      fertileWindowStr: `${fertileStart.toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${fertileEnd.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`,
      phaseName,
      phaseColor,
      energyLevel,
      nutritionTip,
    };
  };

  const details = calculateCycleDetails();

  const handleSaveAndCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) return;

    const updated: MenstrualCycleData = {
      lastPeriodStart: startDate,
      cycleLengthDays: cycleLength,
      periodDurationDays: periodDuration,
      history: [
        { startDate, notes: `Cycle length ${cycleLength}d` },
        ...(cycleData.history || []).slice(0, 5),
      ],
      symptomsToday: symptoms,
      moodToday: mood,
    };

    onUpdateCycleData(updated);
    soundFx.playChime("success");

    if (details) {
      const summary = `Next predicted cycle starts ${details.nextPeriodStr}. You are currently on Day ${details.dayOfCycle}, in the ${details.phaseName}.`;
      setCalculationSummary(summary);
      if (ttsEnabled) {
        speakText(summary);
      }
    }
  };

  const toggleSymptom = (sym: string) => {
    setSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
    soundFx.playChime("pop");
  };

  return (
    <div id="menstrual-cycle-container" className="space-y-6">
      {/* Current Cycle Phase Highlight Card */}
      {details && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full border mb-1 ${details.phaseColor}`}>
                  {details.phaseName} • Day {details.dayOfCycle} of {cycleLength}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Next Predicted Period: {details.nextPeriodStr}
                </h3>
              </div>
            </div>

            <button
              onClick={() =>
                speakText(
                  `You are in the ${details.phaseName}. Next predicted period is ${details.nextPeriodStr}. Energy recommendation: ${details.energyLevel}.`
                )
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              <Volume2 className="w-4 h-4 text-rose-600" />
              <span>Read Status</span>
            </button>
          </div>

          {/* Phase Guidance Bento */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">
                Fertile Window
              </span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                {details.fertileWindowStr}
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">
                Energy & Activity
              </span>
              <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                {details.energyLevel}
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">
                Cycle Nutrition Tip
              </span>
              <span className="font-medium text-slate-700 mt-0.5 block leading-tight">
                {details.nutritionTip}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Input & Calculator Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Menstrual Cycle Settings & Logging
              </h2>
              <p className="text-xs text-slate-700">
                Log period dates, symptoms, and receive phase health tips
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveAndCalculate} className="p-4 sm:p-5 bg-slate-50 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Last Period Start Date
              </label>
              <input
                type="date"
                id="cycleStartDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Average Cycle Length (Days)
              </label>
              <input
                type="number"
                id="cycleLength"
                min="20"
                max="45"
                value={cycleLength}
                onChange={(e) => setCycleLength(parseInt(e.target.value) || 28)}
                className="w-full px-3.5 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Period Duration (Days)
              </label>
              <input
                type="number"
                min="2"
                max="10"
                value={periodDuration}
                onChange={(e) => setPeriodDuration(parseInt(e.target.value) || 5)}
                className="w-full px-3.5 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Daily Symptoms & Mood Logging */}
          <div className="pt-2">
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              Log Today's Symptoms & Feeling
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Energetic",
                "Calm",
                "Mild Cramps",
                "Bloating",
                "Headache",
                "Fatigued",
                "Craving Sweets",
                "Focused",
                "Sensitive",
              ].map((sym) => {
                const isSelected = symptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => toggleSymptom(sym)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                      isSelected
                        ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-rose-50"
                    }`}
                  >
                    {sym}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-98"
          >
            <Heart className="w-4 h-4" />
            <span>Track & Recalculate Cycle</span>
          </button>
        </form>

        {calculationSummary && (
          <div
            id="cycleResult"
            className="p-4 bg-emerald-50 border-t border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{calculationSummary}</span>
          </div>
        )}
      </div>
    </div>
  );
};
