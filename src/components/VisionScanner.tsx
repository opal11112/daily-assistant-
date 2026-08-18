import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Leaf,
  Pill,
  Sparkles,
  Volume2,
  Image as ImageIcon,
  Check,
  Zap,
  Info,
} from "lucide-react";
import { AllergyItem, VisionScanResult } from "../types";
import { speakText, soundFx } from "../utils/audio";

interface VisionScannerProps {
  allergies: AllergyItem[];
  ttsEnabled: boolean;
  onAddTask?: (title: string, category: string) => void;
}

type ScanMode = "general" | "money" | "food" | "meds" | "plant_wildlife" | "clean";

export const VisionScanner: React.FC<VisionScannerProps> = ({
  allergies,
  ttsEnabled,
  onAddTask,
}) => {
  const [mode, setMode] = useState<ScanMode>("general");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<VisionScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("environment");
  const [actionDoneMsg, setActionDoneMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera when unmounting
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setErrorMsg(null);
    try {
      if (streamRef.current) {
        stopCamera();
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
      soundFx.playChime("pop");
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Camera access was not granted or is unavailable on this device. You can upload an image file instead.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === "environment" ? "user" : "environment";
    setCameraFacing(nextFacing);
    if (isCameraActive) {
      stopCamera();
      setTimeout(startCamera, 100);
    }
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setImagePreview(dataUrl);
    stopCamera();
    soundFx.playChime("pop");
    analyzeImage(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreview(dataUrl);
      soundFx.playChime("pop");
      analyzeImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64Img: string) => {
    setIsScanning(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const response = await fetch("/api/vision-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Img,
          mode,
          allergies,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to analyze image");
      }

      const scanData: VisionScanResult = await response.json();
      setResult(scanData);
      soundFx.playChime("success");

      if (ttsEnabled && scanData.spokenSummary) {
        speakText(scanData.spokenSummary);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Error analyzing image. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleQuickAddGrocery = (title: string) => {
    if (onAddTask) {
      onAddTask(title, "Groceries");
      setActionDoneMsg(`Added "${title}" to your grocery list!`);
      soundFx.playChime("success");
      setTimeout(() => setActionDoneMsg(null), 3000);
    }
  };

  return (
    <div id="vision-scanner-container" className="space-y-6">
      {/* Category Mode Selector Tabs */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-2 px-1">
          Scan Category Mode
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { id: "general", label: "Auto-Detect", icon: Sparkles, color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800" },
            { id: "money", label: "Money & Bills", icon: DollarSign, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800" },
            { id: "food", label: "Food & Allergens", icon: CheckCircle2, color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800" },
            { id: "plant_wildlife", label: "Plants & Pets", icon: Leaf, color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/60 border-green-200 dark:border-green-800" },
            { id: "meds", label: "Medications", icon: Pill, color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800" },
            { id: "clean", label: "Cleaning Advice", icon: Zap, color: "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-800" },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = mode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setMode(item.id as ScanMode)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? `${item.color} shadow-xs ring-2 ring-blue-500/20 font-bold`
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Camera / Upload Viewport Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Camera & Vision Safety Scanner
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-400">
                Scan currency, food labels, plants, meds, or dirty surfaces
              </p>
            </div>
          </div>

          {allergies.length > 0 && (
            <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{allergies.length} Allergies Monitored</span>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {/* Live Camera View or Preview or Placeholder */}
          <div className="relative w-full aspect-16/9 max-h-80 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center text-white border border-slate-800">
            {isCameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : imagePreview ? (
              <img
                src={imagePreview}
                alt="Captured visual"
                className="w-full h-full object-contain bg-slate-950"
              />
            ) : (
              <div className="text-center p-6 text-slate-400">
                <Camera className="w-12 h-12 mx-auto mb-2 opacity-50 text-slate-500" />
                <p className="text-sm font-medium text-slate-300">Point Camera or Upload Photo</p>
                <p className="text-xs text-slate-500 mt-1">
                  Position currency, nutrition ingredients, or pills in frame
                </p>
              </div>
            )}

            {/* Scanning Overlay */}
            {isScanning && (
              <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4">
                <RefreshCw className="w-10 h-10 text-blue-400 animate-spin mb-3" />
                <p className="text-sm font-bold">AI Scanner Analyzing Image...</p>
                <p className="text-xs text-slate-300 mt-1 text-center">
                  Extracting text, checking allergen safety & evaluating contents
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Success Toast */}
          {actionDoneMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{actionDoneMsg}</span>
            </div>
          )}

          {/* Camera & Upload Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {!isCameraActive ? (
              <button
                onClick={startCamera}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Open Live Camera</span>
              </button>
            ) : (
              <>
                <button
                  onClick={captureFrame}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-transform active:scale-95 animate-pulse cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Capture & Analyze</span>
                </button>
                <button
                  onClick={toggleCameraFacing}
                  className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Flip</span>
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Upload Photo</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>
      </div>

      {/* Analysis Results View */}
      {result && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-300 transition-colors">
          {/* Safety Header Banner */}
          <div
            className={`p-4 sm:p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              result.safetyStatus === "DANGER"
                ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200"
                : result.safetyStatus === "CAUTION"
                ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200"
                : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200"
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/80 dark:bg-black/40 border border-current shadow-2xs">
                  {result.safetyStatus}
                </span>
                <h3 className="text-base font-bold">{result.title}</h3>
              </div>
              <p className="text-xs mt-1 font-medium">{result.safetyAssessment}</p>
            </div>

            {/* Read aloud button */}
            {result.spokenSummary && (
              <button
                onClick={() => speakText(result.spokenSummary)}
                className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 shrink-0"
              >
                <Volume2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Hear Voice Report</span>
              </button>
            )}
          </div>

          <div className="p-4 sm:p-6 space-y-5">
            {/* Allergen Alerts Warning Block */}
            {result.allergenMatches && result.allergenMatches.length > 0 && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>ALLERGY WARNING: Matched Profile Sensitivities!</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.allergenMatches.map((allergen, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-lg bg-rose-600 text-white text-xs font-black shadow-xs"
                    >
                      ⚠️ {allergen}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Money Calculation Display */}
            {result.totalMoneyAmount && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-950 dark:text-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Total Currency Identified
                  </span>
                  <div className="text-2xl font-black text-emerald-800 dark:text-emerald-300">
                    {result.totalMoneyAmount}
                  </div>
                </div>
                <DollarSign className="w-10 h-10 text-emerald-600/30 dark:text-emerald-400/30" />
              </div>
            )}

            {/* Summary narrative */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-1">
                Visual Assessment
              </h4>
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                {result.summary}
              </p>
            </div>

            {/* Key Ingredients / Details */}
            {result.keyDetails && result.keyDetails.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Identified Key Details & Ingredients
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.keyDetails.map((detail, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between gap-2"
                    >
                      <span className="truncate">{detail}</span>
                      {onAddTask && (
                        <button
                          onClick={() => handleQuickAddGrocery(detail)}
                          className="text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 rounded-md shrink-0 transition-colors"
                        >
                          + List
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Action Steps */}
            {result.actionSteps && result.actionSteps.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Recommended Safety & Care Steps
                </h4>
                <ul className="space-y-2">
                  {result.actionSteps.map((step, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2.5 p-2 rounded-lg bg-slate-50/50 dark:bg-slate-800/30"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
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
