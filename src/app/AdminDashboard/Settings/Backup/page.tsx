"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Button } from "../../../../components/ui/Button";
import { Table } from "../../../../components/ui/Table";
import { motion } from "framer-motion";
import { Database, Download, Cloud, History, ChevronLeft, RefreshCw, FileText, Settings2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import Link from "next/link";

export default function BackupSettingsPage() {
    const { success } = useToast();
    const backups = [
        { id: "B-101", type: "Full Database", size: "45.2 MB", date: "2024-03-20 03:00 AM", status: "Success" },
        { id: "B-100", type: "Media & Documents", size: "128.8 MB", date: "2024-03-19 11:30 PM", status: "Success" },
        { id: "B-099", type: "Incremental Sync", size: "1.2 MB", date: "2024-03-19 06:00 PM", status: "Success" },
    ];

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Link href="/AdminDashboard/Settings" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
                        <ChevronLeft size={14} /> Settings
                    </Link>
                    <span className="text-slate-300">/</span>
                    <span className="font-medium text-slate-900">Backup & Restore</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Database size={22} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Data Backup</h1>
                            <p className="text-sm text-slate-500 mt-0.5">Secure your school data and export information.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="border-slate-200 text-slate-600 bg-white">
                            <Cloud size={16} className="mr-2" /> Storage Settings
                        </Button>
                        <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={() => success("Backup started successfully.")}>
                            <RefreshCw size={16} className="mr-2" /> Run Manual Backup
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Backup Config */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col justify-between self-start">
                        <div>
                            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                                <Settings2 size={18} className="text-amber-500" /> Automated Schedule
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs font-bold text-slate-600 uppercase">Backup Frequency</div>
                                        <div className="text-xs font-bold text-emerald-600">DAILY</div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1 italic">Every day at 03:00 AM</p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs font-bold text-slate-600 uppercase">Retention Period</div>
                                        <div className="text-xs font-bold text-emerald-600">30 DAYS</div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1 italic">Older backups are auto-purged.</p>
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" className="mt-8 text-xs font-bold">Edit Schedule</Button>
                    </div>

                    {/* Export Tools */}
                    <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl lg:col-span-2 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Download size={18} className="text-emerald-400" /> Export School Data
                            </h3>
                            <p className="text-sm text-slate-400 mt-2 mb-8 max-w-lg leading-relaxed">
                                Download a local copy of your entire school management data in common formats for offline analysis or archiving.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <ExportCard icon={<FileText size={20} />} format="EXCEL (.xlsx)" label="Financial Records" />
                                <ExportCard icon={<FileText size={20} />} format="CSV (.csv)" label="Student & Staff Data" />
                                <ExportCard icon={<Database size={20} />} format="SQL Dump (.sql)" label="Full DB Backup" />
                            </div>
                        </div>
                        <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-110 transition-transform">
                            <Download size={140} />
                        </div>
                    </div>
                </div>

                {/* Backup History */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-8 py-5 border-b border-slate-100">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <History size={18} className="text-amber-500" /> Backup Logs
                        </h3>
                    </div>
                    <Table
                        columns={[
                            { header: "Backup ID", accessor: "id", className: "font-mono text-xs text-slate-400" },
                            { header: "Type", accessor: "type", className: "font-bold text-slate-800" },
                            { header: "Archive Size", accessor: "size", className: "text-slate-500 text-xs" },
                            { header: "Created At", accessor: "date", className: "text-slate-500 text-xs" },
                            {
                                header: "Status", accessor: (row) => (
                                    <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase transition-all">
                                        {row.status}
                                    </span>
                                )
                            },
                        ]}
                        data={backups}
                        actions={() => <Download size={16} className="text-slate-300 cursor-pointer hover:text-emerald-600 transition-colors mx-auto" />}
                    />
                </div>
            </motion.div>
        </DashboardLayout>
    );
}

function ExportCard({ icon, format, label }: { icon: React.ReactNode; format: string; label: string }) {
    const { success } = useToast();
    return (
        <div
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group"
            onClick={() => success(`Exporting ${label} in ${format} format...`)}
        >
            <div className="h-8 w-8 rounded-lg bg-slate-700 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">{icon}</div>
            <p className="text-[10px] font-bold text-emerald-500 tracking-wider uppercase mb-1">{format}</p>
            <p className="text-xs font-semibold text-slate-200">{label}</p>
        </div>
    );
}
