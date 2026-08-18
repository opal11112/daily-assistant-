import React, { useState, useEffect } from "react";
import {
  Utensils,
  Search,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Plus,
} from "lucide-react";
import { AllergyItem, RecipeResult, ActiveTimer } from "../types";
import { speakText, soundFx } from "../utils/audio";

interface RecipeAssistantProps {
  allergies: AllergyItem[];
  ttsEnabled: boolean;
  onAddTask?: (title: string, category: string) => void;
  onRegisterTimer?: (timer: ActiveTimer) => void;
}

export const RecipeAssistant: React.FC<RecipeAssistantProps> = ({
  allergies,
  ttsEnabled,
  onAddTask,
  onRegisterTimer,
}) => {
  const [query, setQuery] = useState("");
  const [mealType, setMealType] = useState("Any");
  const [isLoading, setIsLoading] = useState(false);
  const [recipe, setRecipe] = useState<RecipeResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Standalone Cooking Timer state
  const [timerMinutes, setTimerMinutes] = useState<number>(10);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerLabel, setTimerLabel] = useState<string>("Cooking Timer");

  // Step-by-step interactive mode
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [checkedIngredients, setCheckedIngredients] = useState<string[]>([]);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            soundFx.playChime("timer-alarm");
            speakText("Cooking timer is complete! Check your food.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (remainingSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, remainingSeconds]);

  const handleStartTimer = (minutes?: number, label = "Cooking Timer") => {
    const mins = minutes || timerMinutes;
    if (mins <= 0) return;
    setRemainingSeconds(mins * 60);
    setTimerLabel(label);
    setIsTimerRunning(true);
    soundFx.playChime("pop");
    if (onRegisterTimer) {
      onRegisterTimer({
        id: `t-${Date.now()}`,
        label,
        totalSeconds: mins * 60,
        remainingSeconds: mins * 60,
        isRunning: true,
        source: "recipe",
      });
    }
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    setRemainingSeconds(0);
    soundFx.playChime("pop");
  };

  const handleFetchRecipe = async (recipeQuery?: string) => {
    const searchTarget = recipeQuery || query;
    if (!searchTarget.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);
    setRecipe(null);
    setActiveStepIndex(0);
    setCompletedSteps([]);
    setCheckedIngredients([]);

    try {
      const allergyNames = allergies.map((a) => a.name);
      const res = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchTarget,
          allergies: allergyNames,
          mealType,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.data) {
        throw new Error(json.error || "Failed to generate recipe");
      }

      setRecipe(json.data);
      soundFx.playChime("success");

      if (ttsEnabled && json.data.spokenOverview) {
        speakText(json.data.spokenOverview);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to generate recipe. Please try another query.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNumber) ? prev.filter((s) => s !== stepNumber) : [...prev, stepNumber]
    );
    soundFx.playChime("pop");
  };

  const toggleIngredient = (item: string) => {
    setCheckedIngredients((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
    soundFx.playChime("pop");
  };

  const formatTimerDisplay = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div id="recipe-assistant-container" className="space-y-6">
      {/* Recipe Query Search Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                AI Recipe & Cooking Assistant
              </h2>
              <p className="text-xs text-slate-700">
                Generate safe recipes tailored to ingredients & active allergies
              </p>
            </div>
          </div>

          {allergies.length > 0 && (
            <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span>Allergy Filter Active</span>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 bg-slate-50 space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleFetchRecipe();
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                id="recipeQuery"
                placeholder="Type dish or ingredients (e.g. Creamy Tuscan Chicken, 15-min pasta)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-slate-800"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <div className="flex gap-2">
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden"
              >
                <option value="Any">Any Meal</option>
                <option value="Dinner">Dinner</option>
                <option value="Lunch">Lunch</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Snack/Dessert">Snack</option>
              </select>

              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95 shrink-0 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isLoading ? "Generating..." : "Get AI Recipe"}</span>
              </button>
            </div>
          </form>

          {/* Quick Idea Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-xs font-semibold text-slate-700 mr-1 self-center">
              Quick Ideas:
            </span>
            {[
              "15-Minute Garlic Olive Oil Pasta",
              "Sheet Pan Lemon Herb Salmon",
              "Mediterranean Quinoa Bowl",
              "Cozy Coconut Lentil Curry",
              "High-Protein Egg White Omelet",
            ].map((idea, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(idea);
                  handleFetchRecipe(idea);
                }}
                className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-orange-50 hover:text-orange-900 border border-slate-200 rounded-lg text-slate-700 transition-colors"
              >
                {idea}
              </button>
            ))}
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700">
              {errorMsg}
            </div>
          )}
        </div>
      </div>

      {/* Standalone Cooking Multi-Timer Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Timer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                ⏲️ Kitchen Cooking Timer
              </h3>
              <p className="text-xs text-slate-700">
                Audible synthesized alarm when time is up
              </p>
            </div>
          </div>

          {isTimerRunning && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 animate-pulse">
              Running
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
          {/* Big Digital Timer Display */}
          <div className="text-center sm:text-left">
            <div
              id="timerDisplay"
              className="text-4xl sm:text-5xl font-black tracking-tight text-blue-600 font-mono"
            >
              {formatTimerDisplay(remainingSeconds)}
            </div>
            <p className="text-xs text-slate-700 mt-0.5 font-medium">
              {timerLabel}
            </p>
          </div>

          <div className="flex-1 w-full space-y-2">
            {/* Quick preset buttons */}
            <div className="flex flex-wrap gap-1.5">
              {[1, 3, 5, 10, 15, 20, 30].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => {
                    setTimerMinutes(mins);
                    handleStartTimer(mins, `${mins}-Min Timer`);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  +{mins}m
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                id="timerMinutes"
                placeholder="Minutes..."
                value={timerMinutes || ""}
                onChange={(e) => setTimerMinutes(parseInt(e.target.value) || 0)}
                className="w-28 px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-800"
              />
              <button
                onClick={() => handleStartTimer()}
                disabled={isTimerRunning || timerMinutes <= 0}
                className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-transform active:scale-95"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Start Timer</span>
              </button>
              {isTimerRunning && (
                <button
                  onClick={handleStopTimer}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-transform active:scale-95"
                >
                  Stop
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Generated Recipe Presentation Card */}
      {recipe && (
        <div
          id="recipeResult"
          className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden animate-in fade-in duration-300"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-b border-orange-200/60">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">
                  AI Chef Recipe ({recipe.difficulty})
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {recipe.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                  {recipe.description}
                </p>
              </div>

              <button
                onClick={() => speakText(recipe.spokenOverview)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-orange-600 shadow-xs text-xs font-semibold"
              >
                <Volume2 className="w-4 h-4 text-orange-600" />
                <span>Read Overview</span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-orange-200/40 text-xs">
              <div className="p-2 bg-white/80 rounded-lg border border-orange-100">
                <span className="text-slate-500 block text-[10px]">Prep Time</span>
                <span className="font-bold text-slate-800">{recipe.prepTimeMinutes} mins</span>
              </div>
              <div className="p-2 bg-white/80 rounded-lg border border-orange-100">
                <span className="text-slate-500 block text-[10px]">Cook Time</span>
                <span className="font-bold text-slate-800">{recipe.cookTimeMinutes} mins</span>
              </div>
              <div className="p-2 bg-white/80 rounded-lg border border-orange-100">
                <span className="text-slate-500 block text-[10px]">Servings</span>
                <span className="font-bold text-slate-800">{recipe.servings}</span>
              </div>
              <div className="p-2 bg-white/80 rounded-lg border border-orange-100">
                <span className="text-slate-500 block text-[10px]">Calories (est.)</span>
                <span className="font-bold text-slate-800">
                  {recipe.caloriesPerServing ? `${recipe.caloriesPerServing} kcal` : "Balanced"}
                </span>
              </div>
            </div>

            {/* Allergy Compliance Verification */}
            {recipe.allergySafetyNote && (
              <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{recipe.allergySafetyNote}</span>
              </div>
            )}
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {/* Ingredients Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span>Ingredients Checklist</span>
                  <span className="text-slate-400 font-normal">
                    ({checkedIngredients.length}/{recipe.ingredients.length} ready)
                  </span>
                </h4>

                {onAddTask && (
                  <button
                    onClick={() => {
                      recipe.ingredients.forEach((ing) => {
                        onAddTask(`${ing.amount} ${ing.item}`, "Groceries");
                      });
                      soundFx.playChime("success");
                    }}
                    className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add all to Groceries</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {recipe.ingredients.map((ing, idx) => {
                  const isChecked = checkedIngredients.includes(ing.item);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleIngredient(ing.item)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-colors ${
                        isChecked
                          ? "bg-slate-50 border-slate-200 text-slate-400 line-through"
                          : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 rounded-sm border-slate-300 text-orange-600 pointer-events-none"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold">{ing.amount}</span> {ing.item}
                        {ing.notes && (
                          <span className="text-slate-400 text-[10px] ml-1">
                            ({ing.notes})
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step-By-Step Cooking Guide */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Step-by-Step Cooking Guide
              </h4>

              <div className="space-y-3">
                {recipe.steps.map((step) => {
                  const isDone = completedSteps.includes(step.stepNumber);
                  return (
                    <div
                      key={step.stepNumber}
                      className={`p-4 rounded-xl border transition-all ${
                        isDone
                          ? "bg-emerald-50/40 border-emerald-200"
                          : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleStep(step.stepNumber)}
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                              isDone
                                ? "bg-emerald-600 text-white"
                                : "bg-orange-600 text-white"
                            }`}
                          >
                            {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.stepNumber}
                          </button>
                          <div>
                            <p
                              className={`text-sm leading-relaxed ${
                                isDone ? "line-through text-slate-400" : "text-slate-900 font-medium"
                              }`}
                            >
                              {step.instruction}
                            </p>
                            {step.tips && (
                              <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-md mt-2">
                                💡 Tip: {step.tips}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Speak Step Button */}
                          <button
                            onClick={() => speakText(`Step ${step.stepNumber}. ${step.instruction}`)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                            title="Read step out loud"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>

                          {/* Quick Set Timer Button if step has timerMinutes */}
                          {step.timerMinutes && step.timerMinutes > 0 && (
                            <button
                              onClick={() =>
                                handleStartTimer(
                                  step.timerMinutes,
                                  `Step ${step.stepNumber}: ${step.instruction.slice(0, 20)}...`
                                )
                              }
                              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1"
                            >
                              <Timer className="w-3.5 h-3.5" />
                              <span>{step.timerMinutes}m Timer</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chef Pro Tips */}
            {recipe.chefTips && recipe.chefTips.length > 0 && (
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1.5">
                <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span>Chef Notes & Safe Cooking Practices</span>
                </h5>
                <ul className="space-y-1 text-xs text-amber-900">
                  {recipe.chefTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-500">•</span>
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
