import React from "react";

export function PageLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-52 rounded-lg bg-slate-200" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="h-28 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="h-4 w-20 rounded bg-slate-200" />
          <div className="mt-3 h-7 w-24 rounded bg-slate-200" />
        </div>
        <div className="h-28 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="h-4 w-20 rounded bg-slate-200" />
          <div className="mt-3 h-7 w-24 rounded bg-slate-200" />
        </div>
        <div className="h-28 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="h-4 w-20 rounded bg-slate-200" />
          <div className="mt-3 h-7 w-24 rounded bg-slate-200" />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <div className="h-4 w-44 rounded bg-slate-200" />
        </div>
        <div className="space-y-3 p-4">
          <div className="h-10 rounded bg-slate-200" />
          <div className="h-10 rounded bg-slate-200" />
          <div className="h-10 rounded bg-slate-200" />
          <div className="h-10 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
