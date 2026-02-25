"use client";

import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { Button } from "../../../components/ui/Button";
import { motion } from "framer-motion";
import { Settings, Calendar, Database, Share2, Bell, Building, Shield, Users, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function SettingsHubPage() {
    const settingsGroups = [
        {
            title: "Core Configuration",
            items: [
                { icon: <Calendar />, label: "Academic Year", desc: "Manage terms and sessions", path: "/AdminDashboard/Settings/AcademicYear" },
                { icon: <Building />, label: "School Profile", desc: "Basic info and branding", path: "/AdminDashboard/Settings/SchoolProfile" },
            ]
        },
        {
            title: "Security & Access",
            items: [
                { icon: <Users />, label: "User Roles", desc: "Permissions and team access", path: "/AdminDashboard/Settings/UserRoles" },
                { icon: <Shield />, label: "Security", desc: "Login methods and audit logs", path: "/AdminDashboard/Settings/Security" },
            ]
        },
        {
            title: "Integrations & Data",
            items: [
                { icon: <Share2 />, label: "Integrations", desc: "Connect with WhatsApp, Email", path: "/AdminDashboard/Settings/Integration" },
                { icon: <Database />, label: "Backup", desc: "Export and restore school data", path: "/AdminDashboard/Settings/Backup" },
            ]
        },
        {
            title: "Communication",
            items: [
                { icon: <Bell />, label: "Notifications", desc: "SMS and Push settings", path: "/AdminDashboard/Settings/Notifications" },
            ]
        }
    ];

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 pb-20">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                        <Settings size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Settings</h1>
                        <p className="text-slate-500 text-sm mt-1">Configure your school management platform to suit your needs.</p>
                    </div>
                </div>

                {/* Settings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                    {settingsGroups.map((group, gIdx) => (
                        <div key={gIdx} className="space-y-4">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2 ml-1">
                                {group.title}
                            </h2>
                            <div className="grid grid-cols-1 gap-3">
                                {group.items.map((item, iIdx) => (
                                    <Link key={iIdx} href={item.path}>
                                        <div className="group bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 flex items-center justify-center transition-colors">
                                                    {React.cloneElement(item.icon as any, { size: 24 })}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-800 group-hover:text-emerald-900 transition-colors">{item.label}</h3>
                                                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                                                </div>
                                            </div>
                                            <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition-all translate-x-0 group-hover:translate-x-1" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Help Footer */}
                <div className="p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
                    <p className="text-sm text-slate-600 font-medium italic">
                        "Need help configuring your school? Check our <span className="text-emerald-600 underline cursor-pointer">Help Center</span> or contact support."
                    </p>
                </div>
            </motion.div>
        </DashboardLayout>
    );
}
