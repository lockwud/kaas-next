"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useToast } from "@/hooks/useToast";

export function Toaster() {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed bottom-6 right-6 z-100 flex flex-col gap-3 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        layout
                        className="pointer-events-auto"
                    >
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border min-w-[320px] max-w-md ${toast.type === "success"
                            ? "bg-white border-emerald-100 text-emerald-900"
                            : toast.type === "error"
                                ? "bg-white border-rose-100 text-rose-900"
                                : "bg-white border-sky-100 text-sky-900"
                            }`}>
                            <div className={`shrink-0 ${toast.type === "success"
                                ? "text-emerald-500"
                                : toast.type === "error"
                                    ? "text-rose-500"
                                    : "text-sky-500"
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
                                className="shrink-0 p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
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
