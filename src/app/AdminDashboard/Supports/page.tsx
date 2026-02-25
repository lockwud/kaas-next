"use client";

import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { Button } from "../../../components/ui/Button";
import { Table } from "../../../components/ui/Table";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { motion, AnimatePresence } from "framer-motion";
import { LifeBuoy, Plus, Search, MessageSquare, History, CheckCircle2, Clock, X, Send, User, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface TicketRow {
    id: string;
    subject: string;
    category: string;
    priority: "Low" | "Medium" | "High";
    status: "Open" | "In Progress" | "Resolved" | "Closed";
    lastUpdate: string;
    description?: string;
}

export default function SupportsPage() {
    const { success } = useToast();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
    const [selectedTicket, setSelectedTicket] = React.useState<TicketRow | null>(null);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [filterStatus, setFilterStatus] = React.useState("all");

    // Modal form state
    const [subject, setSubject] = React.useState("");
    const [category, setCategory] = React.useState("technical");
    const [priority, setPriority] = React.useState("Medium");
    const [description, setDescription] = React.useState("");

    const tickets: TicketRow[] = [
        {
            id: "TK-101",
            subject: "Unable to upload student CSV",
            category: "Technical",
            priority: "High",
            status: "Open",
            lastUpdate: "2024-03-20 10:30 AM",
            description: "I keep getting a 'format error' even though the CSV is based on the template. Please help!"
        },
        { id: "TK-102", subject: "Request for new feature: Multi-currency", category: "Feature Request", priority: "Low", status: "Resolved", lastUpdate: "2024-03-18 02:15 PM" },
        { id: "TK-103", subject: "Clarification on billing cycle", category: "Billing", priority: "Medium", status: "In Progress", lastUpdate: "2024-03-19 11:45 AM" },
    ];

    const filteredTickets = tickets.filter(t =>
        (filterStatus === "all" || t.status === filterStatus) &&
        (t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Creating ticket:", { subject, category, priority, description });
        success(`Support ticket "${subject}" has been created.`);
        setIsModalOpen(false);
        setSubject("");
        setDescription("");
    };

    const handleViewTicket = (ticket: TicketRow) => {
        setSelectedTicket(ticket);
        setIsViewModalOpen(true);
    };

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* Header Section */}
                <div className="rounded-2xl border border-slate-200 bg-slate-900 p-8 text-white shadow-xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="rounded-2xl bg-slate-800 p-3 ring-1 ring-slate-700">
                                <LifeBuoy className="text-emerald-400" size={32} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Help & Support</h1>
                                <p className="text-slate-400 text-sm mt-1">Get assistance, report issues, or track your support history.</p>
                            </div>
                        </div>
                        <Button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-12 px-6 shadow-lg">
                            <Plus size={18} className="mr-2" /> New Ticket
                        </Button>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard icon={<MessageSquare size={18} />} label="Total Tickets" value={tickets.length.toString()} color="slate" />
                    <StatCard icon={<Clock size={18} />} label="Pending" value={tickets.filter(t => t.status !== "Resolved").length.toString()} color="amber" />
                    <StatCard icon={<CheckCircle2 size={18} />} label="Resolved" value={tickets.filter(t => t.status === "Resolved").length.toString()} color="emerald" />
                </div>

                {/* Filters & Table Section */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                            <Input
                                placeholder="Search by ticket ID or subject..."
                                className="pl-10 h-11"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <Select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                options={[
                                    { value: "all", label: "All Status" },
                                    { value: "Open", label: "Open" },
                                    { value: "In Progress", label: "In Progress" },
                                    { value: "Resolved", label: "Resolved" },
                                ]}
                            />
                        </div>
                    </div>

                    <Table
                        columns={[
                            { header: "Ticket ID", accessor: "id", className: "font-mono font-medium text-slate-600" },
                            {
                                header: "Subject", accessor: (row) => (
                                    <div>
                                        <p className="font-semibold text-slate-900">{row.subject}</p>
                                        <p className="text-xs text-slate-500">{row.category}</p>
                                    </div>
                                )
                            },
                            {
                                header: "Priority", accessor: (row) => (
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${row.priority === "High" ? "bg-red-50 text-red-700" :
                                        row.priority === "Medium" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"
                                        }`}>
                                        {row.priority}
                                    </span>
                                )
                            },
                            {
                                header: "Status", accessor: (row) => (
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${row.status === "Resolved" ? "bg-emerald-100 text-emerald-700" :
                                        row.status === "Open" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                                        }`}>
                                        {row.status}
                                    </span>
                                )
                            },
                            { header: "Last Update", accessor: "lastUpdate", className: "text-slate-500 text-xs" },
                        ]}
                        data={filteredTickets}
                        actions={(row) => <Button variant="ghost" onClick={() => handleViewTicket(row)} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-bold">View</Button>}
                    />
                </div>
            </motion.div>

            {/* Create Ticket Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
                        >
                            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
                                <h3 className="text-lg font-bold text-slate-900">New Support Ticket</h3>
                                <button onClick={() => setIsModalOpen(false)} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-200"><X size={18} /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Main issue summary" required />
                                <div className="grid grid-cols-2 gap-4">
                                    <Select
                                        label="Category"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        options={[
                                            { value: "technical", label: "Technical" },
                                            { value: "billing", label: "Billing" },
                                            { value: "feature", label: "Feature Request" },
                                            { value: "account", label: "Account Setup" },
                                        ]}
                                    />
                                    <Select
                                        label="Priority"
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                        options={[
                                            { value: "Low", label: "Low" },
                                            { value: "Medium", label: "Medium" },
                                            { value: "High", label: "High" },
                                        ]}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Detailed Description</label>
                                    <textarea
                                        className="w-full min-h-32 rounded-lg border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-emerald-600 outline-none transition-all"
                                        placeholder="Please describe your issue in detail..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800 font-bold px-8">Submit Ticket</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* View Ticket Modal */}
            <AnimatePresence>
                {isViewModalOpen && selectedTicket && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
                        >
                            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                                        <MessageSquare size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900">{selectedTicket.id}</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{selectedTicket.category}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsViewModalOpen(false)} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-200 transition-colors">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="flex flex-col h-[500px]">
                                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                                    {/* Subject & Status */}
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                                        <div className="flex items-center justify-between mb-2">
                                            <h2 className="text-lg font-bold text-slate-900">{selectedTicket.subject}</h2>
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${selectedTicket.status === "Resolved" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                                                }`}>
                                                {selectedTicket.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed">
                                            {selectedTicket.description || "The user didn't provide a detailed description for this ticket."}
                                        </p>
                                    </div>

                                    {/* Mock Conversation */}
                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                                <User size={14} className="text-slate-500" />
                                            </div>
                                            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-xs max-w-[80%]">
                                                <p className="text-xs text-slate-800 leading-relaxed font-medium">Hello, I'm following up on this issue. Any updates?</p>
                                                <p className="text-[10px] text-slate-400 mt-2 font-bold">YOU • 2 HOURS AGO</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 flex-row-reverse">
                                            <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                                                <ShieldCheck size={14} className="text-white" />
                                            </div>
                                            <div className="bg-emerald-600 p-4 rounded-2xl rounded-tr-none text-white shadow-emerald-200 shadow-md max-w-[80%]">
                                                <p className="text-xs leading-relaxed font-medium">Hi! We're currently investigating the CSV parser. It seems there's an issue with headers containing special characters. We'll have a fix soon!</p>
                                                <p className="text-[10px] text-emerald-100 mt-2 font-bold uppercase tracking-wider">SUPPORT TEAM • 45 MINS AGO</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Reply Box */}
                                <div className="p-4 border-t border-slate-100 bg-white">
                                    <div className="flex gap-2">
                                        <Input placeholder="Type your message..." className="flex-1 bg-slate-50 border-none" />
                                        <Button className="bg-slate-900 text-white rounded-xl w-11 h-11 transition-all hover:bg-slate-800 shrink-0">
                                            <Send size={18} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: "slate" | "amber" | "emerald" }) {
    const bgColors = {
        slate: "bg-slate-50 text-slate-600",
        amber: "bg-amber-50 text-amber-600",
        emerald: "bg-emerald-50 text-emerald-600",
    };
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
                <div className={`rounded-xl p-2.5 ${bgColors[color]}`}>{icon}</div>
                <div>
                    <p className="text-[10px] font-black uppercase trackin text-slate-400">{label}</p>
                    <p className="text-2xl font-black text-slate-900 mt-0.5">{value}</p>
                </div>
            </div>
        </div>
    );
}
