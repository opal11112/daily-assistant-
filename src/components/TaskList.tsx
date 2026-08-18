import React, { useState } from "react";
import {
  CheckSquare,
  Plus,
  Trash2,
  ShoppingBag,
  Clock,
  Briefcase,
  Home,
  User,
  Filter,
  CheckCircle2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from "lucide-react";
import { TaskItem, TaskCategory, CustomThemeSettings } from "../types";
import { soundFx } from "../utils/audio";

interface TaskListProps {
  tasks: TaskItem[];
  onUpdateTasks: (tasks: TaskItem[]) => void;
  onOpenVoiceModal?: () => void;
  theme?: CustomThemeSettings;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onUpdateTasks,
  onOpenVoiceModal,
  theme,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<TaskCategory>("Groceries");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");

  // Drag & drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after">("before");

  const isDark = theme?.theme === "dark" || theme?.theme === "black";
  const isPureBlack = theme?.theme === "black";

  const categories: { id: string; label: string; icon: any }[] = [
    { id: "All", label: "All Items", icon: Filter },
    { id: "Groceries", label: "Groceries", icon: ShoppingBag },
    { id: "Daily", label: "Daily Errands", icon: Clock },
    { id: "Home", label: "Home & Chores", icon: Home },
    { id: "Work", label: "Work", icon: Briefcase },
    { id: "Personal", label: "Personal", icon: User },
  ];

  const getCategoryColor = (cat: string) => {
    if (theme?.categoryColors && theme.categoryColors[cat]) {
      return theme.categoryColors[cat];
    }
    switch (cat) {
      case "Groceries":
        return "#10b981";
      case "Daily":
        return "#3b82f6";
      case "Home":
        return "#f59e0b";
      case "Work":
        return "#6366f1";
      case "Personal":
        return "#ec4899";
      default:
        return "#64748b";
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: TaskItem = {
      id: `t-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      completed: false,
      createdAt: Date.now(),
      priority: newPriority,
    };

    onUpdateTasks([newTask, ...tasks]);
    setNewTitle("");
    soundFx.playChime("pop");
  };

  const toggleTask = (id: string) => {
    const next = tasks.map((t) => {
      if (t.id === id) {
        const nextCompleted = !t.completed;
        if (nextCompleted) {
          soundFx.playChime("success");
        } else {
          soundFx.playChime("pop");
        }
        return { ...t, completed: nextCompleted };
      }
      return t;
    });
    onUpdateTasks(next);
  };

  const deleteTask = (id: string) => {
    onUpdateTasks(tasks.filter((t) => t.id !== id));
    soundFx.playChime("pop");
  };

  const clearCompleted = () => {
    onUpdateTasks(tasks.filter((t) => !t.completed));
    soundFx.playChime("pop");
  };

  const filteredTasks = tasks.filter((t) => {
    if (selectedCategory === "All") return true;
    return t.category === selectedCategory;
  });

  const completedCount = filteredTasks.filter((t) => t.completed).length;
  const progressPercent = filteredTasks.length > 0
    ? Math.round((completedCount / filteredTasks.length) * 100)
    : 0;

  // Reorder task helper
  const reorderTasks = (sourceId: string, targetId: string, position: "before" | "after") => {
    if (sourceId === targetId) return;

    const newTasks = [...tasks];
    const sourceIdx = newTasks.findIndex((t) => t.id === sourceId);
    if (sourceIdx === -1) return;

    const [draggedItem] = newTasks.splice(sourceIdx, 1);
    const targetIdx = newTasks.findIndex((t) => t.id === targetId);
    if (targetIdx === -1) return;

    const insertIdx = position === "after" ? targetIdx + 1 : targetIdx;
    newTasks.splice(insertIdx, 0, draggedItem);

    onUpdateTasks(newTasks);
    soundFx.playChime("pop");
  };

  const moveTaskDelta = (taskId: string, direction: "up" | "down") => {
    const currentIndex = filteredTasks.findIndex((t) => t.id === taskId);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= filteredTasks.length) return;

    const targetId = filteredTasks[targetIndex].id;
    reorderTasks(taskId, targetId, direction === "up" ? "before" : "after");
  };

  // Drag Event Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (id !== draggedTaskId) {
      setDragOverTaskId(id);
      const rect = e.currentTarget.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      setDropPosition(e.clientY < midY ? "before" : "after");
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const currentTarget = e.currentTarget;
    if (!currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverTaskId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedTaskId && draggedTaskId !== targetId) {
      reorderTasks(draggedTaskId, targetId, dropPosition);
    }
    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };

  return (
    <div id="tasks-grocery-container" className="space-y-5">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          const count = cat.id === "All"
            ? tasks.length
            : tasks.filter((t) => t.category === cat.id).length;
          const customCatColor = cat.id !== "All" ? getCategoryColor(cat.id) : undefined;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? "text-white shadow-xs"
                  : isDark
                  ? "bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
              style={{
                backgroundColor: isSelected ? (customCatColor || "#2563eb") : undefined,
              }}
            >
              <Icon
                className="w-3.5 h-3.5"
                style={{ color: !isSelected && customCatColor ? customCatColor : undefined }}
              />
              <span>{cat.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isSelected
                    ? "bg-black/25 text-white"
                    : isDark
                    ? "bg-slate-800 text-slate-400"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Task List Card */}
      <div
        className={`rounded-2xl border shadow-xs overflow-hidden transition-colors ${
          isPureBlack
            ? "bg-black border-slate-800 shadow-none"
            : isDark
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-slate-200/80"
        }`}
      >
        {/* Header with Progress Bar */}
        <div
          className={`p-4 sm:p-5 border-b ${
            isDark ? "border-slate-800/80 bg-slate-900/40" : "border-slate-100 bg-white"
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                style={{
                  backgroundColor:
                    selectedCategory !== "All" ? getCategoryColor(selectedCategory) : "#2563eb",
                }}
              >
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2
                    className={`text-sm font-bold ${
                      isDark ? "text-slate-100" : "text-slate-900"
                    }`}
                  >
                    {selectedCategory === "All" ? "Grocery & Task List" : `${selectedCategory} Items`}
                  </h2>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-md hidden sm:inline-block ${
                      isDark
                        ? "bg-slate-800 text-slate-400 border border-slate-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    Drag handle to reorder
                  </span>
                </div>
                <p className="text-xs text-slate-700">
                  {completedCount} of {filteredTasks.length} completed ({progressPercent}%)
                </p>
              </div>
            </div>

            {completedCount > 0 && (
              <button
                onClick={clearCompleted}
                className="text-xs text-slate-700 hover:text-rose-500 font-medium px-2.5 py-1 rounded-lg hover:bg-rose-500/10 transition-colors"
              >
                Clear completed
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div
            className={`w-full rounded-full h-1.5 overflow-hidden mt-3 ${
              isDark ? "bg-slate-800" : "bg-slate-100"
            }`}
          >
            <div
              className="h-full transition-all duration-300 rounded-full"
              style={{
                width: `${progressPercent}%`,
                backgroundColor:
                  selectedCategory !== "All" ? getCategoryColor(selectedCategory) : "#2563eb",
              }}
            />
          </div>
        </div>

        {/* Add Task Input Form */}
        <form
          onSubmit={handleAddTask}
          className={`p-4 border-b ${
            isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-100"
          }`}
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              id="taskInput"
              placeholder="Add an item or task (e.g. Organic Almond Milk, Clean filters)..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className={`flex-1 px-3.5 py-2 text-sm rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all ${
                isDark
                  ? "bg-slate-900 border border-slate-700 text-white placeholder-slate-500"
                  : "bg-white border border-slate-200 text-slate-800 placeholder-slate-400"
              }`}
            />
            <div className="flex items-center gap-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as TaskCategory)}
                className={`px-3 py-2 text-xs font-medium rounded-xl focus:outline-hidden ${
                  isDark
                    ? "bg-slate-900 border border-slate-700 text-slate-200"
                    : "bg-white border border-slate-200 text-slate-700"
                }`}
              >
                <option value="Groceries">🛒 Groceries</option>
                <option value="Daily">⏰ Daily</option>
                <option value="Home">🏠 Home</option>
                <option value="Work">💼 Work</option>
                <option value="Personal">👤 Personal</option>
              </select>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>
          </div>
        </form>

        {/* List Items with Drag and Drop */}
        <div
          className={`divide-y ${isDark ? "divide-slate-800/80" : "divide-slate-100"}`}
          onDragLeave={handleDragLeave}
        >
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-500" />
              <p className="text-sm font-medium text-slate-400">No tasks in this category</p>
              <p className="text-xs text-slate-700 mt-1">
                Type an item above or use the voice assistant to speak commands
              </p>
            </div>
          ) : (
            filteredTasks.map((task, index) => {
              const isBeingDragged = draggedTaskId === task.id;
              const isDragTarget = dragOverTaskId === task.id;
              const catColor = getCategoryColor(task.category);

              return (
                <div
                  key={task.id}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragOver={(e) => handleDragOver(e, task.id)}
                  onDrop={(e) => handleDrop(e, task.id)}
                  onDragEnd={handleDragEnd}
                  className={`relative p-3.5 sm:px-5 flex items-center justify-between gap-3 group transition-all select-none ${
                    isBeingDragged
                      ? "opacity-40 bg-blue-500/10 scale-[0.99] border-dashed border-2 border-blue-400"
                      : task.completed
                      ? isDark ? "bg-slate-950/40" : "bg-slate-50/70"
                      : isDark ? "hover:bg-slate-800/40" : "hover:bg-slate-50/50"
                  }`}
                >
                  {/* Visual Drop Insertion Indicators */}
                  {isDragTarget && dropPosition === "before" && (
                    <div className="absolute -top-1 left-0 right-0 h-1 bg-blue-500 rounded-full z-10 shadow-xs" />
                  )}
                  {isDragTarget && dropPosition === "after" && (
                    <div className="absolute -bottom-1 left-0 right-0 h-1 bg-blue-500 rounded-full z-10 shadow-xs" />
                  )}

                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    {/* Drag Handle */}
                    <div
                      className={`cursor-grab active:cursor-grabbing p-1 rounded-md transition-colors shrink-0 ${
                        isDark
                          ? "text-slate-600 hover:text-slate-300 hover:bg-slate-800"
                          : "text-slate-300 hover:text-slate-500 hover:bg-slate-200/60"
                      }`}
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="w-5 h-5 rounded-md border-slate-400 text-blue-600 focus:ring-blue-500 cursor-pointer transition-colors shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      <span
                        className={`text-sm font-medium block truncate ${
                          task.completed
                            ? "line-through text-slate-500"
                            : isDark ? "text-slate-100" : "text-slate-800"
                        }`}
                      >
                        {task.title}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md border text-white shadow-2xs"
                          style={{
                            backgroundColor: catColor,
                            borderColor: catColor,
                          }}
                        >
                          {task.category}
                        </span>
                        {task.priority === "high" && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/30">
                            High Priority
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions (Reorder buttons for accessible / mobile control + Delete) */}
                  <div className="flex items-center gap-1">
                    {/* Quick Move Up / Move Down buttons */}
                    <div className="flex items-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => moveTaskDelta(task.id, "up")}
                        disabled={index === 0}
                        className={`p-1 disabled:opacity-20 rounded-md transition-colors ${
                          isDark
                            ? "text-slate-500 hover:text-slate-200 hover:bg-slate-800"
                            : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        }`}
                        title="Move up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveTaskDelta(task.id, "down")}
                        disabled={index === filteredTasks.length - 1}
                        className={`p-1 disabled:opacity-20 rounded-md transition-colors ${
                          isDark
                            ? "text-slate-500 hover:text-slate-200 hover:bg-slate-800"
                            : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        }`}
                        title="Move down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
