import React, { useState } from "react";
import {
  Sparkles,
  Search,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Timer,
  Volume2,
  Zap,
  Info,
} from "lucide-react";
import { CleaningGuideResult, ActiveTimer } from "../types";
import { speakText, soundFx } from "../utils/audio";

interface CleaningAssistantProps {
  ttsEnabled: boolean;
  onRegisterTimer?: (timer: ActiveTimer) => void;
}

const COMMON_CLEANING_PRESETS = [
  { label: "Red Wine on Carpet", query: "How to remove red wine from wool or synthetic carpet without bleaching" },
  { label: "Burnt Grease on Pan", query: "How to clean tough burnt black grease from stainless steel cookware" },
  { label: "Hard Water / Limescale", query: "How to remove stubborn hard water stains and mineral buildup on glass shower doors" },
  { label: "Greasy Oven Racks", query: "Safe method to deep clean greasy oven racks and baked-on food" },
  { label: "Coffee on White Cotton", query: "How to get dried coffee stain out of a white cotton shirt" },
  { label: "Mildew on Tile Grout", query: "How to remove bathroom mildew and mold from silicone and tile grout" },
];

export const CleaningAssistant: React.FC<CleaningAssistantProps> = ({
  ttsEnabled,
  onRegisterTimer,
}) => {
  const [query, setQuery] = useState("");
  const [surface, setSurface] = useState("");
  const [stain, setStain] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [guide, setGuide] = useState<CleaningGuideResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFetchGuide = async (customQuery?: string) => {
    const targetQuery = customQuery || query || (stain ? `${stain} on ${surface}` : "");
    if (!targetQuery.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);
    setGuide(null);

    try {
      const res = await fetch("/api/cleaning-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: targetQuery,
          surface,
          stain,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.data) {
        throw new Error(json.error || "Failed to generate cleaning guide");
      }

      setGuide(json.data);
      soundFx.playChime("success");

      if (ttsEnabled && json.data.spokenSummary) {
        speakText(json.data.spokenSummary);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to retrieve cleaning instructions.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartDwellTimer = (minutes: number, stepName: string) => {
    if (onRegisterTimer && minutes > 0) {
      onRegisterTimer({
        id: `t-${Date.now()}`,
        label: `Soaking: ${stepName}`,
        totalSeconds: minutes * 60,
        remainingSeconds: minutes * 60,
        isRunning: true,
        source: "cleaning",
      });
      soundFx.playChime("pop");
      if (ttsEnabled) {
        speakText(`Started ${minutes} minute dwell soak timer.`);
      }
    }
  };

  return (
    <div id="cleaning-assistant-container" className="space-y-6">
      {/* Search & Surface Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Stain & Household Cleaning Assistant
              </h2>
              <p className="text-xs text-slate-700">
                Safe chemical combinations, product recommendations & step-by-step procedures
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-slate-50 space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleFetchGuide();
            }}
            className="space-y-3"
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  id="cleaningQuery"
                  placeholder="What do you want to clean? (e.g. Red wine on couch, grease on stovetop)..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-cyan-500 text-slate-800"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95 shrink-0 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>{isLoading ? "Consulting..." : "Get Cleaning Advice"}</span>
              </button>
            </div>

            {/* Quick Common Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-xs font-semibold text-slate-700 mr-1 self-center">
                Popular Scenarios:
              </span>
              {COMMON_CLEANING_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(preset.query);
                    handleFetchGuide(preset.query);
                  }}
                  className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-cyan-50 hover:text-cyan-900 border border-slate-200 rounded-lg text-slate-700 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </form>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700">
              {errorMsg}
            </div>
          )}
        </div>
      </div>

      {/* Guide Results Presentation */}
      {guide && (
        <div
          id="cleanResult"
          className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden animate-in fade-in duration-300 space-y-6"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-cyan-200/60 flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-cyan-700 uppercase tracking-wider">
                Cleaning Plan for: {guide.targetSurface}
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                {guide.title}
              </h3>
            </div>

            <button
              onClick={() => speakText(guide.spokenSummary)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-cyan-600 shadow-xs text-xs font-semibold"
            >
              <Volume2 className="w-4 h-4 text-cyan-600" />
              <span>Read Guide</span>
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {/* NEVER DO / DANGEROUS CHEMICAL WARNING BANNER */}
            {guide.warningNeverDo && guide.warningNeverDo.length > 0 && (
              <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                  <h4 className="text-sm font-black uppercase tracking-wide text-rose-900">
                    ⚠️ CRITICAL SAFETY WARNINGS: WHAT TO NEVER DO
                  </h4>
                </div>
                <ul className="space-y-1 text-xs text-rose-900 pl-6 list-disc">
                  {guide.warningNeverDo.map((w, idx) => (
                    <li key={idx} className="font-semibold leading-relaxed">
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Products / Ingredients */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Recommended Safe Products & Solutions</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {guide.recommendedProducts.map((prod, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-emerald-950 font-medium flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>{prod}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step by Step Protocol */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Step-by-Step Procedure
              </h4>
              <div className="space-y-3">
                {guide.steps.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-cyan-300 transition-all flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-cyan-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {step.stepNumber}
                      </span>
                      <div>
                        <p className="text-sm text-slate-900 font-medium leading-relaxed">
                          {step.instruction}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => speakText(`Step ${step.stepNumber}. ${step.instruction}`)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 transition-colors"
                        title="Read step"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      {step.dwellTimeMinutes && step.dwellTimeMinutes > 0 && (
                        <button
                          onClick={() =>
                            handleStartDwellTimer(
                              step.dwellTimeMinutes!,
                              `Soak: ${step.instruction.slice(0, 24)}...`
                            )
                          }
                          className="px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 text-xs font-bold flex items-center gap-1"
                        >
                          <Timer className="w-3.5 h-3.5" />
                          <span>{step.dwellTimeMinutes}m Soak Timer</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Tips */}
            {guide.proTips && guide.proTips.length > 0 && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-cyan-600" />
                  <span>Pro Cleaner Tips</span>
                </h5>
                <ul className="space-y-1 text-xs text-slate-700">
                  {guide.proTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan-500">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
