import React from "react";
import {
  Camera,
  CheckSquare,
  Calendar,
  Pill,
  Sparkles,
  Utensils,
  ShieldAlert,
  Heart,
  MoreHorizontal,
} from "lucide-react";
import { soundFx } from "../utils/audio";

interface MobileBottomNavProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenVoiceModal: () => void;
  onOpenSidebar: () => void;
  taskCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenVoiceModal,
  onOpenSidebar,
  taskCount,
}) => {
  const primaryButtons = [
    { id: "scanner", label: "Scanner", icon: Camera },
    { id: "tasks", label: "Tasks", icon: CheckSquare, count: taskCount },
    { id: "reminders", label: "Reminders", icon: Calendar },
    { id: "recipes", label: "Recipes", icon: Utensils },
    { id: "meds", label: "Meds", icon: Pill },
  ];

  return (
    <div
      id="mobile-bottom-bar"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around shadow-lg"
    >
      {primaryButtons.map((btn) => {
        const Icon = btn.icon;
        const isSelected = activeTab === btn.id;

        return (
          <button
            key={btn.id}
            type="button"
            onClick={() => {
              onSelectTab(btn.id);
              soundFx.playChime("pop");
            }}
            className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
              isSelected
                ? "text-blue-600 font-bold"
                : "text-slate-500 hover:text-slate-800 font-medium"
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {btn.count !== undefined && btn.count > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-blue-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {btn.count}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{btn.label}</span>
          </button>
        );
      })}

      {/* More / All Categories Drawer Trigger */}
      <button
        type="button"
        onClick={() => {
          onOpenSidebar();
          soundFx.playChime("pop");
        }}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
      >
        <MoreHorizontal className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 tracking-tight">More</span>
      </button>
    </div>
  );
};
