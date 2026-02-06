import React from "react";
import { Button } from "./ui/Button";
import { Plus } from "lucide-react";

interface DashboardCardProps {
    title: string;
    onView?: () => void;
    onAdd?: () => void;
}

export function DashboardCard({ title, onView, onAdd }: DashboardCardProps) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100/50 flex flex-col justify-between h-44 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
            {/* Decorative top gradient line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="flex items-start justify-between">
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{title}</h3>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    <div className="w-4 h-4 rounded-full border-2 border-current opacity-70" />
                </div>
            </div>

            <div className="flex gap-3 mt-4">
                <Button
                    variant="primary"
                    className="flex-1 rounded-xl text-xs h-10 bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-200"
                    onClick={onView}
                >
                    View Details
                </Button>
                <Button
                    variant="outline"
                    className="flex-1 rounded-xl text-xs h-10 border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100 hover:border-emerald-300 font-medium"
                    onClick={onAdd}
                >
                    <Plus size={14} className="mr-1.5" /> Add New
                </Button>
            </div>
        </div>
    );
}
