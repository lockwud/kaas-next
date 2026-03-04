"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Button } from "../../../../components/ui/Button";
import { Table } from "../../../../components/ui/Table";
import { Input } from "../../../../components/ui/Input";
import { motion } from "framer-motion";
import { Calendar, Plus, CheckCircle2, AlertCircle, X, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import Link from "next/link";
import { apiRequest } from "@/lib/api-client";

interface SessionRow {
    id: string;
    session: string;
    startDate: string;
    endDate: string;
    status: "Active" | "Completed" | "Upcoming";
}

export default function AcademicYearPage() {
    const { success, error } = useToast();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isCreating, setIsCreating] = React.useState(false);
    const [sessions, setSessions] = React.useState<SessionRow[]>([]);

    // Modal state
    const [newSession, setNewSession] = React.useState("");
    const [startDate, setStartDate] = React.useState("");
    const [endDate, setEndDate] = React.useState("");

    React.useEffect(() => {
        const load = async () => {
            try {
                const payload = await apiRequest<SessionRow[]>("/settings/academic-year/sessions");
                setSessions(payload);
            } catch (err) {
                error(err instanceof Error ? err.message : "Unable to load academic sessions.");
            } finally {
                setIsLoading(false);
            }
        };

        void load();
    }, [error]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const created = await apiRequest<SessionRow>("/settings/academic-year/sessions", {
                method: "POST",
                body: JSON.stringify({ session: newSession, startDate, endDate }),
            });
            setSessions((current) => [created, ...current]);
            success(`Academic session "${newSession}" has been created.`);
            setIsModalOpen(false);
            setNewSession("");
            setStartDate("");
            setEndDate("");
        } catch (err) {
            error(err instanceof Error ? err.message : "Unable to create session.");
        } finally {
            setIsCreating(false);
        }
    };

    const handleActivate = async (sessionId: string) => {
        try {
            const updated = await apiRequest<SessionRow[]>(`/settings/academic-year/sessions/${sessionId}/activate`, {
                method: "POST",
            });
            setSessions(updated);
            success("Academic session activated.");
        } catch (err) {
            error(err instanceof Error ? err.message : "Unable to activate session.");
        }
    };

    const activeSession = sessions.find((session) => session.status === "Active");

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Link href="/AdminDashboard/Settings" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
                        <ChevronLeft size={14} /> Settings
                    </Link>
                    <span className="text-slate-300">/</span>
                    <span className="font-medium text-slate-900">Academic Year</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Academic Sessions</h1>
                        <p className="text-sm text-slate-500 mt-1">Configure school years and term dates.</p>
                    </div>
                    <Button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                        <Plus size={18} className="mr-2" /> New Session
                    </Button>
                </div>

                {/* Active Session Highlight */}
                <div className="bg-linear-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                            <Calendar size={28} />
                        </div>
                        <div>
                            <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider">Current Active Session</p>
                            <h2 className="text-xl font-bold">{activeSession?.session ?? "No active session"}</h2>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
                        <CheckCircle2 size={16} className="text-emerald-300" />
                        <span className="text-sm font-medium">System Synchronized</span>
                    </div>
                </div>

                {/* Sessions Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <Table
                        columns={[
                            { header: "ID", accessor: "id", className: "font-mono text-xs text-slate-400" },
                            { header: "Session Name", accessor: "session", className: "font-bold text-slate-900" },
                            { header: "Start Date", accessor: "startDate", className: "text-slate-600 text-sm" },
                            { header: "End Date", accessor: "endDate", className: "text-slate-600 text-sm" },
                            {
                                header: "Status", accessor: (row) => (
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${row.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                        row.status === "Upcoming" ? "bg-blue-50 text-blue-700 border-blue-100" :
                                            "bg-slate-50 text-slate-500 border-slate-100"
                                        }`}>
                                        {row.status}
                                    </span>
                                )
                            },
                        ]}
                        data={sessions}
                        loading={isLoading}
                        actions={(row) => (
                            <div className="flex gap-2">
                                <Button variant="ghost" className="h-8 px-2 text-xs text-slate-600">Edit</Button>
                                <Button
                                    variant="ghost"
                                    className="h-8 px-2 text-xs text-emerald-600 font-bold"
                                    onClick={() => handleActivate(row.id)}
                                >
                                    Activate
                                </Button>
                            </div>
                        )}
                    />
                </div>

                {/* Important Note */}
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex gap-3">
                    <AlertCircle className="text-amber-600 shrink-0" size={20} />
                    <p className="text-xs text-amber-800 leading-relaxed italic">
                        <strong>Warning:</strong> Activating a new session will move all current students to their respective promotion status and lock previous session records for editing.
                    </p>
                </div>
            </motion.div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
                    >
                        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
                            <h3 className="text-lg font-semibold text-slate-900">Create New Session</h3>
                            <button onClick={() => setIsModalOpen(false)} className="rounded-full p-1 text-slate-500 hover:bg-slate-200"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <Input label="Session Name" value={newSession} onChange={(e) => setNewSession(e.target.value)} placeholder="e.g. 2025/2026 Academic Year" required />
                            <div className="grid grid-cols-2 gap-4">
                                <Input type="date" label="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                                <Input type="date" label="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800" isLoading={isCreating}>Create Session</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </DashboardLayout>
    );
}
