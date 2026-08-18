import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  X,
  Sparkles,
  Check,
  Send,
  Loader2,
  Calendar,
  Pill,
  ShieldAlert,
  Utensils,
  Sparkle,
  ShoppingBag,
} from "lucide-react";
import { soundFx, speakText } from "../utils/audio";
import { AllergyItem, TaskItem, ReminderItem, MedicationItem } from "../types";

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  ttsEnabled: boolean;
  allergies: AllergyItem[];
  onAddTask: (task: Partial<TaskItem>) => void;
  onAddReminder: (reminder: Partial<ReminderItem>) => void;
  onAddMedication: (med: Partial<MedicationItem>) => void;
  onAddAllergy: (allergy: Partial<AllergyItem>) => void;
  onSwitchTab: (tabId: string) => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  ttsEnabled,
  allergies,
  onAddTask,
  onAddReminder,
  onAddMedication,
  onAddAllergy,
  onSwitchTab,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [responseMsg, setResponseMsg] = useState<string | null>(null);
  const [actionDone, setActionDone] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      stopListening();
      setTranscript("");
      setResponseMsg(null);
      setActionDone(null);
      setErrorMsg(null);
      return;
    }

    // Auto-start listening on modal open
    startListening();

    return () => {
      stopListening();
    };
  }, [isOpen]);

  const startListening = () => {
    setErrorMsg(null);
    setResponseMsg(null);
    setActionDone(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg("Speech recognition is not supported in this browser. You can type commands below.");
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        soundFx.playChime("mic-on");
      };

      recognition.onresult = (event: any) => {
        let current = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          current += event.results[i][0].transcript;
        }
        setTranscript(current);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error !== "no-speech") {
          setErrorMsg(`Voice input error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        soundFx.playChime("mic-off");
        // If we have captured text, submit it
        setTranscript((prev) => {
          if (prev.trim()) {
            handleProcessCommand(prev.trim());
          }
          return prev;
        });
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn("Failed to start speech recognition:", err);
      setErrorMsg("Microphone permission denied or unavailable.");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const handleProcessCommand = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    setIsProcessing(true);
    setErrorMsg(null);
    setResponseMsg("Analyzing spoken command with Gemini...");

    try {
      const allergyNames = allergies.map((a) => a.name);
      const res = await fetch("/api/voice-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ speechText: text, allergies: allergyNames }),
      });

      const json = await res.json();
      if (!res.ok || !json.data && !json.intent) {
        throw new Error(json.error || "Failed to process command");
      }

      const result = json.data || json;
      const { intent, payload, spokenResponse } = result;

      setResponseMsg(spokenResponse || "Command executed.");
      soundFx.playChime("success");

      if (ttsEnabled && spokenResponse) {
        speakText(spokenResponse);
      }

      // Execute matched intent
      if (intent === "add_task" && payload?.title) {
        onAddTask({
          title: payload.title,
          category: payload.category || "Groceries",
          priority: "medium",
        });
        setActionDone(`Added "${payload.title}" to ${payload.category || "Groceries"} list.`);
      } else if (intent === "add_reminder" && payload?.title) {
        onAddReminder({
          title: payload.title,
          date: payload.date || new Date().toISOString().split("T")[0],
          time: payload.time || "12:00",
          priority: "normal",
        });
        setActionDone(`Scheduled reminder: "${payload.title}"`);
      } else if (intent === "add_medication" && payload?.name) {
        onAddMedication({
          name: payload.name,
          dosage: payload.dosage || "1 dose",
          timing: (payload.timeOfDay as any) || "Day",
          reminderTime: payload.reminderTime || "09:00",
        });
        setActionDone(`Logged medication: ${payload.name} (${payload.dosage || ""})`);
      } else if (intent === "add_allergy" && payload?.allergyName) {
        onAddAllergy({
          name: payload.allergyName,
          severity: (payload.severity as any) || "Severe",
          category: "Food",
        });
        setActionDone(`Registered allergy: ${payload.allergyName}`);
      } else if (intent === "recipe_query") {
        onSwitchTab("recipes");
        setActionDone("Switched to Recipe & Cooking Assistant.");
      } else if (intent === "clean_query") {
        onSwitchTab("cleaning");
        setActionDone("Switched to Cleaning Assistant.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to parse command.");
      // Fallback simple task addition if AI fails
      onAddTask({ title: text, category: "Groceries" });
      setResponseMsg(`Added "${text}" directly to your task list.`);
      if (ttsEnabled) {
        speakText(`Added ${text} to your list.`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const query = manualInput.trim();
    setManualInput("");
    setTranscript(query);
    handleProcessCommand(query);
  };

  if (!isOpen) return null;

  return (
    <div
      id="voice-assistant-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="voice-assistant-modal"
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Hands-Free Voice Assistant</h3>
              <p className="text-xs text-slate-400">Speak naturally to manage daily tasks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 flex flex-col items-center text-center space-y-5">
          {/* Waveform / Mic Animation */}
          <div className="relative">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 ring-8 ring-emerald-100 animate-pulse"
                  : isProcessing
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/40 ring-8 ring-blue-100"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
              }`}
              onClick={() => {
                if (isListening) {
                  stopListening();
                } else {
                  startListening();
                }
              }}
            >
              {isProcessing ? (
                <Loader2 className="w-10 h-10 animate-spin" />
              ) : isListening ? (
                <Mic className="w-10 h-10 animate-bounce" />
              ) : (
                <MicOff className="w-10 h-10 text-slate-500" />
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-900">
              {isListening
                ? "Listening... Speak your command now"
                : isProcessing
                ? "Processing with Gemini AI..."
                : "Tap the microphone to speak"}
            </p>
            {transcript && (
              <div className="mt-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium italic">
                "{transcript}"
              </div>
            )}
          </div>

          {/* Response Box */}
          {responseMsg && (
            <div className="w-full p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-xl text-left">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 mb-1">
                <Sparkle className="w-3.5 h-3.5" />
                <span>Assistant Response</span>
              </div>
              <p className="text-sm text-slate-800">{responseMsg}</p>
            </div>
          )}

          {/* Action Success Alert */}
          {actionDone && (
            <div className="w-full p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionDone}</span>
            </div>
          )}

          {errorMsg && (
            <div className="w-full p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* Suggested Prompts Pill Cloud */}
          <div className="w-full text-left pt-2 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Try Saying:
            </p>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleProcessCommand("Add oat milk and organic bananas to grocery list")}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 rounded-lg text-slate-700 transition-colors flex items-center gap-1"
              >
                <ShoppingBag className="w-3 h-3 text-slate-600" />
                "Add oat milk to grocery list"
              </button>
              <button
                type="button"
                onClick={() => handleProcessCommand("Remind me to call the doctor tomorrow at 3pm")}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 rounded-lg text-slate-700 transition-colors flex items-center gap-1"
              >
                <Calendar className="w-3 h-3 text-slate-600" />
                "Remind me to call doctor at 3pm"
              </button>
              <button
                type="button"
                onClick={() => handleProcessCommand("I need to take 50mg Zinc every morning")}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 rounded-lg text-slate-700 transition-colors flex items-center gap-1"
              >
                <Pill className="w-3 h-3 text-slate-600" />
                "Add Zinc 50mg morning"
              </button>
              <button
                type="button"
                onClick={() => handleProcessCommand("Add gluten and soy to my allergy profile")}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 rounded-lg text-slate-700 transition-colors flex items-center gap-1"
              >
                <ShieldAlert className="w-3 h-3 text-slate-600" />
                "Add gluten to my allergies"
              </button>
              <button
                type="button"
                onClick={() => handleProcessCommand("What is a quick dinner recipe for salmon?")}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 rounded-lg text-slate-700 transition-colors flex items-center gap-1"
              >
                <Utensils className="w-3 h-3 text-slate-600" />
                "Quick salmon dinner recipe"
              </button>
            </div>
          </div>

          {/* Text input fallback */}
          <form onSubmit={handleManualSubmit} className="w-full flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Or type a command..."
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!manualInput.trim() || isProcessing}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
