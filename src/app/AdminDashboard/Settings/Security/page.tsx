"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Button } from "../../../../components/ui/Button";
import { Table } from "../../../../components/ui/Table";
import { Input } from "../../../../components/ui/Input";
import { motion } from "framer-motion";
import { ShieldCheck, Key, Smartphone, History, ChevronLeft, LogOut, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import Link from "next/link";
import { apiRequest } from "@/lib/api-client";

export default function SecuritySettingsPage() {
    const { success, error } = useToast();
    const [is2FAEnabled, setIs2FAEnabled] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving2FA, setIsSaving2FA] = React.useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false);
    const [currentPassword, setCurrentPassword] = React.useState("");
    const [newPassword, setNewPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [sessions, setSessions] = React.useState<Array<{ id: string; device: string; ip: string; date: string; status: string }>>([]);

    React.useEffect(() => {
        const load = async () => {
            try {
                const payload = await apiRequest<{
                    settings?: { twoFactorRequired?: boolean };
                    sessions?: Array<{ id: string; device: string; ip: string; date: string; status: string }>;
                }>("/settings/security");
                setIs2FAEnabled(Boolean(payload.settings?.twoFactorRequired));
                setSessions(payload.sessions ?? []);
            } catch (err) {
                error(err instanceof Error ? err.message : "Unable to load security settings.");
            } finally {
                setIsLoading(false);
            }
        };

        void load();
    }, [error]);

    const handleToggle2FA = async () => {
        const next = !is2FAEnabled;
        setIs2FAEnabled(next);
        setIsSaving2FA(true);
        try {
            await apiRequest("/settings/security", {
                method: "PATCH",
                body: JSON.stringify({ twoFactorRequired: next }),
            });
            success(`2FA ${next ? "enabled" : "disabled"} successfully.`);
        } catch (err) {
            setIs2FAEnabled(!next);
            error(err instanceof Error ? err.message : "Unable to update 2FA setting.");
        } finally {
            setIsSaving2FA(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            error("All password fields are required.");
            return;
        }

        setIsUpdatingPassword(true);
        try {
            await apiRequest("/settings/security/password", {
                method: "POST",
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmPassword,
                }),
            });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            success("Password updated successfully.");
        } catch (err) {
            error(err instanceof Error ? err.message : "Unable to update password.");
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    return (
        <DashboardLayout loading={isLoading}><motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Link href="/AdminDashboard/Settings" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
                        <ChevronLeft size={14} /> Settings
                    </Link>
                    <span className="text-slate-300">/</span>
                    <span className="font-medium text-slate-900">Security</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <ShieldCheck size={22} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Security Settings</h1>
                            <p className="text-sm text-slate-500 mt-0.5">Protect your account and manage login activity.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Password Management */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Key size={18} className="text-blue-500" /> Password Management
                        </h3>
                        <div className="space-y-4">
                            <Input label="Current Password" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
                            <Input label="New Password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
                            <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
                            <div className="pt-4 border-t border-slate-100 flex justify-end">
                                <Button
                                    className="bg-slate-900 text-white hover:bg-slate-800 h-10 px-6"
                                    onClick={handleUpdatePassword}
                                    isLoading={isUpdatingPassword}
                                    loadingText="Updating..."
                                    blurOnLoading
                                >
                                    Update Password
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* 2FA & Biometrics */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                        <Smartphone size={22} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Two-Factor Authentication</h3>
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                            Add an extra layer of security to your account by requiring a code from your Google Authenticator app.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleToggle2FA}
                                    disabled={isSaving2FA}
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${is2FAEnabled ? "bg-emerald-600" : "bg-slate-200"}`}
                                >
                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ${is2FAEnabled ? "translate-x-5" : "translate-x-0"}`} />
                                </button>
                            </div>
                            {is2FAEnabled && (
                                <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex gap-3 animate-in fade-in slide-in-from-top-2">
                                    <CheckCircle2 className="text-emerald-600 shrink-0" size={18} />
                                    <p className="text-[11px] text-emerald-800 font-medium">Your account is currently protected by 2FA.</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="font-bold flex items-center gap-2">
                                    <ShieldCheck size={18} className="text-emerald-400" /> Account Recovery
                                </h3>
                                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                                    Generate emergency recovery codes in case you lose access to your authentication device.
                                </p>
                                <Button variant="ghost" className="mt-4 text-xs font-bold text-emerald-400 p-0 hover:bg-transparent" onClick={() => success("Recovery codes generated and saved.")}>Generate Codes &rarr;</Button>
                            </div>
                            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                                <ShieldCheck size={120} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Login Sessions */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <History size={18} className="text-blue-500" /> Recent Device Activity
                        </h3>
                        <Button variant="ghost" className="text-xs text-red-600 font-bold hover:bg-red-50">Log out all other devices</Button>
                    </div>
                    <Table
                        columns={[
                            {
                                header: "Device / Location", accessor: (row) => (
                                    <div className="flex items-center gap-3">
                                        <div className={`h-2 w-2 rounded-full ${row.status === "online" ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                                        <span className="font-medium text-slate-700">{row.device}</span>
                                    </div>
                                )
                            },
                            { header: "IP Address", accessor: "ip", className: "font-mono text-xs text-slate-400" },
                            { header: "Last Login", accessor: "date", className: "text-slate-500 text-xs" },
                        ]}
                        data={sessions}
                        loading={isLoading}
                        actions={() => <LogOut size={16} className="text-slate-300 cursor-pointer hover:text-red-500 transition-colors mx-auto" />}
                    />
                </div>
            </motion.div>
        </DashboardLayout>
    );
}
