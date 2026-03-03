"use client";

import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Upload, FileSpreadsheet, X, CheckCircle2, Clock3, AlertCircle, RefreshCw, Eye } from "lucide-react";
import { uploadJobs, uploadTemplates, users } from "../../../lib/school-data";
import { DataUploadJob } from "../../../types/school";

const STATUS_STYLE: Record<string, { badge: string; icon: React.ReactNode }> = {
  completed: { badge: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 size={12} /> },
  processing: { badge: "bg-blue-100 text-blue-700", icon: <RefreshCw size={12} className="animate-spin" /> },
  pending: { badge: "bg-amber-100 text-amber-700", icon: <Clock3 size={12} /> },
  failed: { badge: "bg-rose-100 text-rose-700", icon: <AlertCircle size={12} /> },
};

export default function DataCenterPage() {
  const [selectedTemplate, setSelectedTemplate] = React.useState(uploadTemplates[0]?.id ?? "");
  const [jobs, setJobs] = React.useState<DataUploadJob[]>(uploadJobs);
  const [viewJob, setViewJob] = React.useState<DataUploadJob | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const template = uploadTemplates.find(t => t.id === selectedTemplate);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Simulate an upload being queued
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const newJob: DataUploadJob = {
      id: `job_${Date.now()}`,
      templateId: selectedTemplate,
      fileName: file.name,
      branchId: "branch_main",
      status: "pending",
      uploadedAt: new Date().toISOString(),
      uploadedBy: "u_02",
      totalRows: 0,
      successfulRows: 0,
      failedRows: 0,
    };
    setJobs(prev => [newJob, ...prev]);
  };

  const allRows = jobs.map(job => ({
    job,
    template: uploadTemplates.find(t => t.id === job.templateId)?.name ?? "Unknown",
    uploadedByName: users.find(u => u.id === job.uploadedBy)?.fullName ?? "Unknown",
  }));

  const completedJobs = jobs.filter(j => j.status === "completed").length;
  const totalRows = jobs.reduce((a, j) => a + j.totalRows, 0);
  const successRows = jobs.reduce((a, j) => a + j.successfulRows, 0);

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Data Center</h2>
          <p className="text-slate-500 text-sm mt-1">Bulk import data using Excel templates and monitor all upload jobs.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Jobs", value: jobs.length, color: "bg-slate-50 text-slate-700" },
            { label: "Completed", value: completedJobs, color: "bg-emerald-50 text-emerald-700" },
            { label: "Total Rows", value: totalRows, color: "bg-blue-50 text-blue-700" },
            { label: "Success Rows", value: successRows, color: "bg-violet-50 text-violet-700" },
          ].map(st => (
            <div key={st.label} className={`${st.color} rounded-xl p-4`}>
              <p className="text-2xl font-black">{st.value}</p>
              <p className="text-xs font-medium opacity-70 mt-0.5">{st.label}</p>
            </div>
          ))}
        </div>

        {/* Upload zone */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/60">
            <h3 className="text-sm font-bold text-slate-800">Upload New Data</h3>
            <p className="text-xs text-slate-500 mt-0.5">Select a template, download the sample file, fill it in, then upload.</p>
          </div>
          <div className="p-6 space-y-5">
            {/* Template selector */}
            <div className="grid md:grid-cols-2 gap-4">
              {uploadTemplates.map(t => (
                <button key={t.id} type="button" onClick={() => setSelectedTemplate(t.id)}
                  className={`text-left p-4 rounded-xl border transition-all ${selectedTemplate === t.id ? "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-400" : "border-slate-200 hover:border-slate-300 bg-white"}`}>
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet size={20} className={selectedTemplate === t.id ? "text-emerald-600" : "text-slate-400"} />
                    <div>
                      <p className={`text-sm font-bold ${selectedTemplate === t.id ? "text-emerald-700" : "text-slate-800"}`}>{t.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Columns: {t.requiredColumns.slice(0, 3).join(", ")}{t.requiredColumns.length > 3 ? ` +${t.requiredColumns.length - 3} more` : ""}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Required columns preview */}
            {template && (
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-600 mb-2">Required Columns for <span className="text-emerald-700">{template.name}</span></p>
                <div className="flex flex-wrap gap-2">
                  {template.requiredColumns.map(col => (
                    <span key={col} className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-700">{col}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${isDragging ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-slate-50/50 hover:border-slate-300"}`}
            >
              <Upload size={28} className={`mx-auto mb-3 ${isDragging ? "text-emerald-500" : "text-slate-300"}`} />
              <p className="text-sm font-semibold text-slate-700">Drop your Excel file here</p>
              <p className="text-xs text-slate-400 mt-1">or click to browse — .xlsx, .csv supported</p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 justify-end">
              <button type="button" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                <Download size={15} /> Download Template
              </button>
              <button type="button" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white shadow-sm transition-colors">
                <Upload size={15} /> Upload Excel
              </button>
            </div>
          </div>
        </div>

        {/* Upload Jobs */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/60 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Upload History</h3>
            <span className="text-xs text-slate-500">{jobs.length} job{jobs.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#0F172A] text-white text-[11px] font-semibold uppercase tracking-wide">
                  <th className="px-4 py-3">Template</th>
                  <th className="px-4 py-3">File Name</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Rows</th>
                  <th className="px-4 py-3">Uploaded By</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">View</th>
                </tr>
              </thead>
              <tbody>
                {allRows.map(({ job, template: tplName, uploadedByName }, i) => {
                  const s = STATUS_STYLE[job.status] ?? { badge: "bg-slate-100 text-slate-500", icon: null };
                  return (
                    <tr key={job.id} className={`border-t border-slate-100 hover:bg-slate-50/60 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/30"}`}>
                      <td className="px-4 py-3 font-medium text-slate-800">{tplName}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs max-w-[180px] truncate">{job.fileName}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.badge}`}>
                          {s.icon} {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {job.totalRows > 0 ? (
                          <span>{job.successfulRows}/{job.totalRows} <span className="text-slate-400">({job.failedRows > 0 ? `${job.failedRows} failed` : "all ok"})</span></span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{uploadedByName}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{job.uploadedAt?.slice(0, 10) ?? "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setViewJob(job)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"><Eye size={14} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Job Detail Modal */}
      <AnimatePresence>
        {viewJob && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4" onClick={() => setViewJob(null)}>
            <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12 }} className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Upload Job Details</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{viewJob.id}</p>
                </div>
                <button onClick={() => setViewJob(null)} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"><X size={16} /></button>
              </div>
              <div className="p-6 space-y-3 text-sm">
                {[
                  ["File Name", viewJob.fileName],
                  ["Template", uploadTemplates.find(t => t.id === viewJob.templateId)?.name ?? "Unknown"],
                  ["Status", viewJob.status],
                  ["Uploaded At", viewJob.uploadedAt?.slice(0, 19).replace("T", " ") ?? "—"],
                  ["Uploaded By", users.find(u => u.id === viewJob.uploadedBy)?.fullName ?? "Unknown"],
                  ["Total Rows", String(viewJob.totalRows)],
                  ["Successful Rows", String(viewJob.successfulRows)],
                  ["Failed Rows", String(viewJob.failedRows)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 border-b border-slate-100 pb-2 last:border-0">
                    <span className="text-slate-500 text-xs font-semibold">{label}</span>
                    <span className="font-semibold text-slate-800 text-right">{value}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
                <button onClick={() => setViewJob(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
