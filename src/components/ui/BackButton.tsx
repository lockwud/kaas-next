"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
    label?: string;
    href?: string;
}

export function BackButton({ label = "Back", href }: BackButtonProps) {
    const router = useRouter();

    const handleClick = () => {
        if (href) {
            router.push(href);
        } else {
            router.back();
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors duration-200 group"
        >
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 group-hover:bg-emerald-50 transition-colors duration-200">
                <ArrowLeft size={14} className="text-slate-500 group-hover:text-emerald-600 transition-colors duration-200" />
            </span>
            <span>{label}</span>
        </button>
    );
}
