"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Button } from "../../../../components/ui/Button";
import { Table } from "../../../../components/ui/Table";
import { motion } from "framer-motion";
import { Bell, Mail, Smartphone, History, ChevronLeft, Settings2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import Link from "next/link";

interface NotificationChannelProps {
    title: string;
    icon: React.ReactNode;
    description: string;
    enabled: boolean;
    onToggle: () => void;
}

export default function NotificationsSettingsPage() {
    const { success } = useToast();
    const [emailEnabled, setEmailEnabled] = React.useState(true);
    const [smsEnabled, setSmsEnabled] = React.useState(false);
    const [pushEnabled, setPushEnabled] = React.useState(true);

    const history = [
        { id: "NT-902", type: "Email", recipient: "All Parents", subject: "Term 2 Fee Reminder", date: "2024-03-20 08:30 AM", status: "Sent" },
        { id: "NT-901", type: "SMS", recipient: "Staff", subject: "Emergency Meeting Notice", date: "2024-03-19 04:15 PM", status: "Sent" },
        { id: "NT-900", type: "Push", recipient: "Grade 10", subject: "Math Quiz Postponed", date: "2024-03-18 10:00 AM", status: "Failed" },
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
                    <span className="font-medium text-slate-900">Notifications</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Bell size={22} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Notification Settings</h1>
                            <p className="text-sm text-slate-500 mt-0.5">Manage communication channels and templates.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Channel Toggles */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Settings2 size={18} className="text-emerald-500" /> Enabled Channels
                        </h3>
                        <div className="space-y-4">
                            <ChannelToggle
                                title="Email Notifications"
                                icon={<Mail size={18} />}
                                description="Daily reports, fee invoices, and official newsletters."
                                enabled={emailEnabled}
                                onToggle={() => { setEmailEnabled(!emailEnabled); success(`Email notifications ${!emailEnabled ? "enabled" : "disabled"}`); }}
                            />
                            <ChannelToggle
                                title="SMS Notifications"
                                icon={<Smartphone size={18} />}
                                description="Urgent alerts, OTPs, and short attendance updates."
                                enabled={smsEnabled}
                                onToggle={() => { setSmsEnabled(!smsEnabled); success(`SMS notifications ${!smsEnabled ? "enabled" : "disabled"}`); }}
                            />
                            <ChannelToggle
                                title="Push Notifications"
                                icon={<Bell size={18} />}
                                description="Live class reminders and instant notice board updates."
                                enabled={pushEnabled}
                                onToggle={() => { setPushEnabled(!pushEnabled); success(`Push notifications ${!pushEnabled ? "enabled" : "disabled"}`); }}
                            />
                        </div>
                    </div>

                    {/* Template Quick Edit */}
                    <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold flex items-center gap-2">
                                    Notice Template Editor
                                </h3>
                                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md uppercase">V2.4</span>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-400 font-medium">Fee Overdue SMS Template</label>
                                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-[11px] font-mono leading-relaxed text-slate-200">
                                        Dear <span className="text-emerald-400">{"{{parent_name}}"}</span>, this is a reminder that <span className="text-emerald-400">{"{{student_name}}"}</span> has an outstanding fee of <span className="text-emerald-400">{"{{amount}}"}</span> for Term 2. Please ignore if paid.
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <Button variant="ghost" className="text-emerald-400 text-xs font-bold hover:bg-emerald-400/10 h-9">Customize All Templates &rarr;</Button>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-105 transition-all">
                            <Mail size={160} />
                        </div>
                    </div>
                </div>

                {/* History */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <History size={18} className="text-emerald-500" /> Communication Log
                        </h3>
                        <Button variant="ghost" className="text-xs text-slate-500 font-bold hover:bg-slate-50">View Full Log</Button>
                    </div>
                    <Table
                        columns={[
                            {
                                header: "Type", accessor: (row) => (
                                    <div className="flex items-center gap-2">
                                        {row.type === "Email" && <Mail size={14} className="text-blue-500" />}
                                        {row.type === "SMS" && <Smartphone size={14} className="text-slate-500" />}
                                        {row.type === "Push" && <Bell size={14} className="text-emerald-500" />}
                                        <span className="font-medium text-slate-700">{row.type}</span>
                                    </div>
                                )
                            },
                            { header: "Recipient", accessor: "recipient", className: "text-slate-600 text-xs" },
                            { header: "Subject / Context", accessor: "subject", className: "font-semibold text-slate-900" },
                            { header: "Date", accessor: "date", className: "text-slate-500 text-xs" },
                            {
                                header: "Status", accessor: (row) => (
                                    <div className="flex items-center justify-center">
                                        {row.status === "Sent" ? <CheckCircle2 size={16} className="text-emerald-500" /> : <AlertTriangle size={16} className="text-red-500" />}
                                    </div>
                                )
                            },
                        ]}
                        data={history}
                    />
                </div>
            </motion.div>
        </DashboardLayout>
    );
}

function ChannelToggle({ title, icon, description, enabled, onToggle }: NotificationChannelProps) {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors group">
            <div className="flex items-start gap-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${enabled ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                    {icon}
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-900 transition-colors">{title}</h4>
                    <p className="text-[11px] text-slate-500 leading-none mt-1">{description}</p>
                </div>
            </div>
            <button
                onClick={onToggle}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${enabled ? "bg-emerald-600" : "bg-slate-200"}`}
            >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ${enabled ? "translate-x-5" : "translate-x-0"}`} />
            </button>
        </div>
    );
}
