import React from "react";
import {
  Palette,
  Layout,
  Moon,
  Sun,
  Check,
  RotateCcw,
  Sparkles,
  X,
  Sliders,
  CheckCircle2,
  Paintbrush,
} from "lucide-react";
import {
  CustomThemeSettings,
  LayoutMode,
  ThemeMode,
  AccentColor,
  BackgroundTint,
} from "../types";
import { DEFAULT_THEME } from "../utils/storage";
import { soundFx } from "../utils/audio";

// Import AI Generated Mockup Images
import sidebarMockup from "../assets/images/sidebar_layout_mockup_1787091663517.jpg";
import topbarMockup from "../assets/images/topbar_layout_mockup_1787091673970.jpg";
import splitMockup from "../assets/images/split_layout_mockup_1787091685316.jpg";
import minimalMockup from "../assets/images/minimal_layout_mockup_1787091695488.jpg";

interface LayoutThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  theme: CustomThemeSettings;
  onUpdateTheme: (theme: CustomThemeSettings) => void;
}

const LAYOUT_OPTIONS: {
  id: LayoutMode;
  title: string;
  subtitle: string;
  image: string;
  tag: string;
}[] = [
  {
    id: "sidebar",
    title: "Sidebar Dashboard",
    subtitle: "Categorized left navigation panel with quick glance stats and drawer",
    image: sidebarMockup,
    tag: "Recommended",
  },
  {
    id: "topbar",
    title: "Top Navigation Bar",
    subtitle: "Horizontal pill tabs on top with full-width content workspace",
    image: topbarMockup,
    tag: "Streamlined",
  },
  {
    id: "split",
    title: "Split Dual-Pane Workspace",
    subtitle: "Tasks and grocery checklist on left, active AI tool on right",
    image: splitMockup,
    tag: "Multitasker",
  },
  {
    id: "minimal",
    title: "Minimalist Focus Mode",
    subtitle: "Clean distraction-free card deck with floating action triggers",
    image: minimalMockup,
    tag: "Focused",
  },
];

const ACCENT_COLORS: { id: AccentColor; label: string; bgClass: string; hex: string }[] = [
  { id: "blue", label: "Electric Blue", bgClass: "bg-blue-600", hex: "#2563eb" },
  { id: "indigo", label: "Vibrant Indigo", bgClass: "bg-indigo-600", hex: "#4f46e5" },
  { id: "emerald", label: "Emerald Green", bgClass: "bg-emerald-600", hex: "#059669" },
  { id: "purple", label: "Royal Purple", bgClass: "bg-purple-600", hex: "#9333ea" },
  { id: "rose", label: "Rose Pink", bgClass: "bg-rose-600", hex: "#e11d48" },
  { id: "amber", label: "Golden Amber", bgClass: "bg-amber-600", hex: "#d97706" },
  { id: "cyan", label: "Cyan Teal", bgClass: "bg-cyan-600", hex: "#0891b2" },
  { id: "orange", label: "Sunset Orange", bgClass: "bg-orange-600", hex: "#ea580c" },
];

const BG_TINT_OPTIONS: { id: BackgroundTint; label: string; desc: string; previewClass: string }[] = [
  {
    id: "pure-white",
    label: "Pure Crisp White",
    desc: "#ffffff 100% bright clean white canvas and cards",
    previewClass: "bg-white border-slate-300 ring-1 ring-slate-200 shadow-2xs",
  },
  {
    id: "default",
    label: "Classic Slate Light",
    desc: "#f8fafc soft daylight background",
    previewClass: "bg-[#f8fafc] border-slate-300",
  },
  {
    id: "pure-black",
    label: "Pure Pitch Black (OLED)",
    desc: "#000000 true black for maximum contrast and battery efficiency",
    previewClass: "bg-black border-slate-700",
  },
  {
    id: "deep-charcoal",
    label: "Deep Charcoal",
    desc: "#0b0f19 rich dark graphite",
    previewClass: "bg-[#0b0f19] border-slate-700",
  },
  {
    id: "midnight-navy",
    label: "Midnight Navy",
    desc: "#030712 cool midnight tone",
    previewClass: "bg-[#030712] border-slate-700",
  },
  {
    id: "warm-slate",
    label: "Warm Slate / Dark Zinc",
    desc: "#18181b balanced neutral dark",
    previewClass: "bg-[#18181b] border-slate-700",
  },
];

const CATEGORY_LISTS = [
  { id: "Groceries", label: "Groceries List", defaultColor: "#10b981" },
  { id: "Daily", label: "Daily Errands List", defaultColor: "#3b82f6" },
  { id: "Home", label: "Home & Chores List", defaultColor: "#f59e0b" },
  { id: "Work", label: "Work List", defaultColor: "#6366f1" },
  { id: "Personal", label: "Personal List", defaultColor: "#ec4899" },
];

const PRESET_SWATCHES = [
  "#ef4444", "#f97316", "#f59e0b", "#10b981", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#64748b"
];

export const LayoutThemeCustomizer: React.FC<LayoutThemeCustomizerProps> = ({
  isOpen,
  onClose,
  theme,
  onUpdateTheme,
}) => {
  if (!isOpen) return null;

  const isDark = theme.theme === "dark" || theme.theme === "black";

  const handleSelectLayout = (layoutId: LayoutMode) => {
    onUpdateTheme({ ...theme, layout: layoutId });
    soundFx.playChime("pop");
  };

  const handleSelectThemeMode = (mode: ThemeMode) => {
    let bgTint: BackgroundTint = theme.bgTint;
    if (mode === "black") {
      bgTint = "pure-black";
    } else if (mode === "dark" && (bgTint === "default" || bgTint === "pure-white")) {
      bgTint = "deep-charcoal";
    } else if (mode === "light") {
      bgTint = bgTint === "pure-white" ? "pure-white" : "default";
    }
    onUpdateTheme({ ...theme, theme: mode, bgTint });
    soundFx.playChime("pop");
  };

  const handleSelectBgTint = (bg: BackgroundTint) => {
    const nextThemeMode: ThemeMode = (bg === "default" || bg === "pure-white") ? "light" : bg === "pure-black" ? "black" : "dark";
    onUpdateTheme({ ...theme, bgTint: bg, theme: nextThemeMode });
    soundFx.playChime("pop");
  };

  const handleSelectAccent = (accent: AccentColor) => {
    const swatch = ACCENT_COLORS.find((a) => a.id === accent)?.hex || "#2563eb";
    onUpdateTheme({ ...theme, accent, iconTint: swatch });
    soundFx.playChime("pop");
  };

  const handleCategoryColorChange = (catId: string, color: string) => {
    onUpdateTheme({
      ...theme,
      categoryColors: {
        ...theme.categoryColors,
        [catId]: color,
      },
    });
  };

  const handleReset = () => {
    onUpdateTheme(DEFAULT_THEME);
    soundFx.playChime("pop");
  };

  return (
    <div
      id="layout-customizer-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl transition-all ${
          isDark
            ? "bg-slate-900 border-slate-700 text-white"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Header */}
        <div
          className={`p-5 sm:p-6 border-b flex items-center justify-between sticky top-0 z-10 backdrop-blur-md ${
            isDark ? "bg-slate-900/90 border-slate-800" : "bg-white/90 border-slate-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black">
                Customize Layout & Visual Aesthetics
              </h2>
              <p className="text-xs text-slate-700">
                Choose AI-rendered layout styles, OLED black mode, and individual list & icon colors
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isDark
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
              title="Reset to defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>

            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors ${
                isDark ? "hover:bg-slate-800 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-500"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-7 space-y-8">
          {/* SECTION 1: AI Layout Selection with Generated Mockups */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Layout className="w-4 h-4 text-blue-500" />
                  <span>Choose Your Preferred Application Layout</span>
                </h3>
                <p className="text-xs text-slate-700">
                  Select a layout below to reconfigure the entire workspace structure instantly
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {LAYOUT_OPTIONS.map((opt) => {
                const isSelected = theme.layout === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectLayout(opt.id)}
                    className={`group relative rounded-2xl border-2 overflow-hidden cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-500 ring-4 ring-blue-500/20 shadow-lg scale-[1.01]"
                        : isDark
                        ? "border-slate-800 hover:border-slate-600 bg-slate-800/40"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                    }`}
                  >
                    {/* Image Mockup Preview */}
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                      <img
                        src={opt.image}
                        alt={opt.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Tag pill */}
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                        {opt.tag}
                      </span>

                      {isSelected && (
                        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-600 text-white flex items-center gap-1 shadow-md">
                          <Check className="w-3 h-3" />
                          <span>Active Layout</span>
                        </div>
                      )}
                    </div>

                    {/* Layout Info footer */}
                    <div className="p-3.5">
                      <h4 className="text-xs font-bold flex items-center justify-between">
                        <span>{opt.title}</span>
                        {isSelected && <span className="text-blue-500 font-bold text-[11px]">Selected</span>}
                      </h4>
                      <p className="text-[11px] text-slate-700 mt-1 leading-snug">
                        {opt.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: Dark Mode & Pure OLED Black Background */}
          <div className="space-y-4 pt-4 border-t border-slate-200/50 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Moon className="w-4 h-4 text-purple-500" />
                <span>Theme Mode & OLED Pure Black Canvas</span>
              </h3>
              <p className="text-xs text-slate-700">
                Switch between Light, Dark Slate, or Pure #000000 OLED Pitch Black for deep contrast
              </p>
            </div>

            {/* Quick 3-Mode Selector */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleSelectThemeMode("light")}
                className={`p-3.5 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                  theme.theme === "light"
                    ? "border-blue-500 bg-blue-50/20 text-blue-600 font-bold"
                    : isDark
                    ? "border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                }`}
              >
                <Sun className="w-5 h-5 mx-auto mb-1.5 text-amber-500" />
                <span className="text-xs font-bold block">Light Mode</span>
                <span className="text-[10px] text-slate-700">Clean & crisp</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectThemeMode("dark")}
                className={`p-3.5 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                  theme.theme === "dark"
                    ? "border-purple-500 bg-purple-500/10 text-purple-400 font-bold"
                    : isDark
                    ? "border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                }`}
              >
                <Moon className="w-5 h-5 mx-auto mb-1.5 text-purple-400" />
                <span className="text-xs font-bold block">Dark Slate</span>
                <span className="text-[10px] text-slate-700">Graphite neutral</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectThemeMode("black")}
                className={`p-3.5 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                  theme.theme === "black"
                    ? "border-emerald-500 bg-black text-emerald-400 font-bold ring-2 ring-emerald-500/20"
                    : isDark
                    ? "border-slate-800 bg-black text-slate-300 hover:border-slate-700"
                    : "border-slate-200 bg-slate-900 text-slate-100 hover:border-slate-300"
                }`}
              >
                <Sparkles className="w-5 h-5 mx-auto mb-1.5 text-emerald-400" />
                <span className="text-xs font-bold block">Pure OLED Black</span>
                <span className="text-[10px] text-emerald-400 font-semibold">#000000 Pitch Black</span>
              </button>
            </div>

            {/* Granular Background Tint Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Specific Background Canvas Tint
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {BG_TINT_OPTIONS.map((bg) => {
                  const isSelected = theme.bgTint === bg.id;
                  return (
                    <div
                      key={bg.id}
                      onClick={() => handleSelectBgTint(bg.id)}
                      className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-500/5"
                          : isDark
                          ? "border-slate-800 hover:border-slate-700 bg-slate-800/30"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg border shrink-0 ${bg.previewClass}`} />
                      <div className="min-w-0">
                        <span className="text-xs font-bold block truncate">{bg.label}</span>
                        <span className="text-[10px] text-slate-700 block truncate">{bg.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 3: Accent Palette & Global Icon Tint */}
          <div className="space-y-3 pt-4 border-t border-slate-200/50 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Paintbrush className="w-4 h-4 text-indigo-500" />
                <span>Primary Accent & Icon Glow Color</span>
              </h3>
              <p className="text-xs text-slate-700">
                Sets the highlight color for active buttons, badges, checkboxes, and interactive controls
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ACCENT_COLORS.map((color) => {
                const isSelected = theme.accent === color.id;
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => handleSelectAccent(color.id)}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-500/10 font-bold"
                        : isDark
                        ? "border-slate-800 hover:border-slate-700 bg-slate-800/40"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full shrink-0 ${color.bgClass} flex items-center justify-center text-white`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs font-semibold">{color.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: Individual Category / List Color Customization */}
          <div className="space-y-4 pt-4 border-t border-slate-200/50 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-500" />
                <span>Custom Colors for Individual Lists & Categories</span>
              </h3>
              <p className="text-xs text-slate-700">
                Assign distinct custom colors to groceries, daily errands, home chores, work, and personal tasks
              </p>
            </div>

            <div className="space-y-3">
              {CATEGORY_LISTS.map((cat) => {
                const currentColor = theme.categoryColors[cat.id] || cat.defaultColor;
                return (
                  <div
                    key={cat.id}
                    className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isDark ? "bg-slate-800/30 border-slate-800" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-xl shadow-xs shrink-0 flex items-center justify-center text-white font-bold text-xs"
                        style={{ backgroundColor: currentColor }}
                      >
                        ✓
                      </div>
                      <div>
                        <span className="text-xs font-bold block">{cat.label}</span>
                        <span className="text-[10px] text-slate-700 font-mono">{currentColor}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {PRESET_SWATCHES.map((swatch) => (
                        <button
                          key={swatch}
                          type="button"
                          onClick={() => handleCategoryColorChange(cat.id, swatch)}
                          className={`w-6 h-6 rounded-lg transition-transform hover:scale-110 cursor-pointer ${
                            currentColor.toLowerCase() === swatch.toLowerCase()
                              ? "ring-2 ring-offset-2 ring-blue-500 scale-110"
                              : ""
                          }`}
                          style={{ backgroundColor: swatch }}
                          title={swatch}
                        />
                      ))}

                      {/* Custom Native Color Input */}
                      <label
                        className="relative w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer flex items-center justify-center hover:scale-105"
                        title="Pick custom color"
                      >
                        <input
                          type="color"
                          value={currentColor}
                          onChange={(e) => handleCategoryColorChange(cat.id, e.target.value)}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        />
                        <Paintbrush className="w-3.5 h-3.5 text-slate-400" />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-4 sm:p-5 border-t flex items-center justify-between sticky bottom-0 z-10 backdrop-blur-md ${
            isDark ? "bg-slate-900/95 border-slate-800" : "bg-white/95 border-slate-100"
          }`}
        >
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Theme and layout preferences are saved automatically</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
