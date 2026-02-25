"use client";

import React from "react";
import { ToastProvider } from "@/hooks/useToast";
import { Toaster } from "@/components/ui/Toaster";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ToastProvider>
            {children}
            <Toaster />
        </ToastProvider>
    );
}
