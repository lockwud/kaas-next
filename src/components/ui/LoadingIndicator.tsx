import React from "react";

interface OrbitLoaderProps {
  size?: number;
  className?: string;
}

export function OrbitLoader({ size = 56, className = "" }: OrbitLoaderProps) {
  const dimension = `${size}px`;

  return (
    <div className={`relative ${className}`} style={{ width: dimension, height: dimension }} aria-hidden="true">
      <div className="absolute inset-1 rounded-full border border-emerald-200/70" />
      <div className="absolute inset-0 animate-orbit">
        <div className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
      </div>
    </div>
  );
}

interface LoadingOverlayProps {
  show: boolean;
  label?: string;
}

export function LoadingOverlay({ show, label = "Loading" }: LoadingOverlayProps) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-[2px] cursor-wait">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-emerald-100 bg-white/90 px-6 py-5 shadow-lg shadow-emerald-500/10">
        <OrbitLoader />
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">{label}</p>
      </div>
    </div>
  );
}
