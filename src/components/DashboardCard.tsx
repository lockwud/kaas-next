import React from "react";
import { Button } from "./ui/Button";
import { Plus } from "lucide-react";

interface DashboardCardProps {
    title: string;
    icon?: React.ReactNode;
    description?: string;
    onView?: () => void;
    onAdd?: () => void;
    compact?: boolean;
    accentColor?: string; // Tailwind gradient class
}

export function DashboardCard({ title, icon, description, onView, onAdd, compact = false, accentColor = "from-emerald-400 to-teal-500" }: DashboardCardProps) {
    const containerClass = compact
        ? "bg-white rounded-2xl p-4 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.07),0_8px_16px_-2px_rgba(0,0,0,0.04)] border border-slate-100/50 flex flex-col justify-between min-h-40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group relative overflow-hidden"
        : "bg-white rounded-2xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100/50 flex flex-col justify-between h-44 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden";

    const buttonClass = compact ? "flex-1 rounded-xl text-xs h-8" : "flex-1 rounded-xl text-xs h-10";

    return (
        <div className={containerClass}>
            {/* Decorative top gradient line */}
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-slate-800 group-hover:text-emerald-700 transition-colors truncate ${compact ? "text-sm" : "text-base"}`}>{title}</h3>
                    {description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{description}</p>}
                </div>
                {icon ? (
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors shrink-0">
                        {icon}
                    </div>
                ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors shrink-0">
                        <div className="w-4 h-4 rounded-full border-2 border-current opacity-70" />
                    </div>
                )}
            </div>

            <div className={`flex gap-2 ${compact ? "mt-3" : "mt-4"}`}>
                <Button
                    variant="primary"
                    className={`${buttonClass} bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-200`}
                    onClick={onView}
                >
                    View
                </Button>
                <Button
                    variant="outline"
                    className={`${buttonClass} border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100 hover:border-emerald-300 font-medium`}
                    onClick={onAdd}
                >
                    <Plus size={compact ? 12 : 14} className={compact ? "mr-1" : "mr-1.5"} /> Add
                </Button>
            </div>
        </div>
    );
}
