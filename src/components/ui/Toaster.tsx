"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useToast } from "@/hooks/useToast";

export function Toaster() {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed bottom-4 left-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none sm:bottom-6 sm:left-auto sm:right-6">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 32, scale: 0.98 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 12, scale: 0.98, transition: { duration: 0.2 } }}
                        layout
                        className="pointer-events-auto"
                    >
                        <div
                            role="status"
                            aria-live="polite"
                            className={`relative overflow-hidden flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-md min-w-0 max-w-md w-full sm:min-w-[320px] ${toast.type === "success"
                                ? "bg-emerald-50/90 border-emerald-200/70 text-emerald-900"
                                : toast.type === "error"
                                    ? "bg-rose-50/90 border-rose-200/70 text-rose-900"
                                    : "bg-sky-50/90 border-sky-200/70 text-sky-900"
                                }`}
                        >
                            <div
                                className={`absolute inset-y-0 left-0 w-1.5 ${toast.type === "success"
                                    ? "bg-emerald-500"
                                    : toast.type === "error"
                                        ? "bg-rose-500"
                                        : "bg-sky-500"
                                    }`}
                            />
                            <div className={`shrink-0 ml-1 ${toast.type === "success"
                                ? "text-emerald-600"
                                : toast.type === "error"
                                    ? "text-rose-600"
                                    : "text-sky-600"
                                }`}>
                                {toast.type === "success" && <CheckCircle2 size={20} />}
                                {toast.type === "error" && <AlertCircle size={20} />}
                                {toast.type === "info" && <Info size={20} />}
                            </div>

                            <div className="flex-1 text-sm font-medium">
                                {toast.message}
                            </div>

                            <button
                                onClick={() => removeToast(toast.id)}
                                className="shrink-0 p-1 rounded-full transition-colors text-slate-500/80 hover:text-slate-700 hover:bg-white/70"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
