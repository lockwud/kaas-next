"use client";

import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/useToast";
import { UserCircle, Shield, Mail, Phone, MapPin, Camera, Key, History, Lock, X, Smartphone, Globe, Check } from "lucide-react";

export default function ProfilesPage() {
    const { success } = useToast();
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    const [isSecurityModalOpen, setIsSecurityModalOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);

    // Profile State - load from localStorage or use defaults
    const [fullName, setFullName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [phone, setPhone] = React.useState("");
    const [address, setAddress] = React.useState("");
    const [schoolId, setSchoolId] = React.useState("");
    const [role, setRole] = React.useState("");

    // Load user data from localStorage on mount
    React.useEffect(() => {
        const loadUserData = () => {
            try {
                const storedName = localStorage.getItem("kaas_user_name");
                const storedEmail = localStorage.getItem("kaas_user_email");
                const storedRole = localStorage.getItem("kaas_user_role");
                const storedSchoolId = localStorage.getItem("kaas_school_id");
                const storedPhone = localStorage.getItem("kaas_user_phone") || "";
                const storedAddress = localStorage.getItem("kaas_user_address") || "";

                setFullName(storedName || "User");
                setEmail(storedEmail || "");
                setRole(storedRole || "Administrator");
                setSchoolId(storedSchoolId || "N/A");
                setPhone(storedPhone);
                setAddress(storedAddress);
            } catch (error) {
                console.error("Error loading user data:", error);
                // Set defaults if localStorage fails
                setFullName("User");
                setEmail("");
                setRole("Administrator");
            } finally {
                setIsLoading(false);
            }
        };

        loadUserData();
    }, []);

    const activities = [
        { id: 1, action: "Logged in", device: "Chrome / Windows 11", time: "2 hours ago" },
        { id: 2, action: "Updated School Grade System", device: "Safari / Mac OS", time: "Yesterday, 4:20 PM" },
        { id: 3, action: "Changed Password", device: "Chrome / Windows 11", time: "3 days ago" },
    ];

    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        // Save profile data to localStorage
        try {
            localStorage.setItem("kaas_user_name", fullName);
            localStorage.setItem("kaas_user_email", email);
            localStorage.setItem("kaas_user_phone", phone);
            localStorage.setItem("kaas_user_address", address);
        } catch (error) {
            console.error("Error saving profile data:", error);
        }
        console.log("Updating profile:", { fullName, email, phone, address });
        success("Profile has been updated successfully.");
        setIsEditModalOpen(false);
    };

    return (
        <DashboardLayout loading={isLoading}><motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6 pb-12">
                {/* Profile Header */}
                <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 opacity-5"></div>
                    <div className="relative z-10">
                        <div className="relative inline-block">
                            <div className="h-32 w-32 rounded-full border-4 border-white shadow-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                                <UserCircle size={100} className="text-slate-300" />
                            </div>
                            <button title="Change profile picture" className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white shadow-lg hover:bg-emerald-700 transition-colors">
                                <Camera size={16} />
                            </button>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 mt-4 tracking-tight">{fullName}</h1>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-1 bg-emerald-50 px-3 py-1 rounded-full inline-block">{role || "Super Administrator"}</p>
                        <p className="text-xs text-slate-400 mt-2 font-medium italic">School ID: {schoolId || "N/A"}</p>
                        <div className="mt-8 flex justify-center gap-3">
                            <Button onClick={() => setIsEditModalOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white px-8 h-11 font-bold shadow-lg">Edit Profile</Button>
                            <Button onClick={() => setIsSecurityModalOpen(true)} variant="outline" className="border-slate-200 text-slate-600 h-11 font-bold px-8">Security Settings</Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Details */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <UserCircle size={20} className="text-slate-400" /> Personal Identity
                        </h2>
                        <div className="space-y-6">
                            <ProfileInfoItem icon={<Mail size={16} />} label="Professional Email" value={email} />
                            <ProfileInfoItem icon={<Phone size={16} />} label="Mobile Contact" value={phone} />
                            <ProfileInfoItem icon={<MapPin size={16} />} label="Residential Address" value={address} />
                            <ProfileInfoItem icon={<Shield size={16} />} label="Organizational Role" value="Proprietor / IT Head" />
                        </div>
                    </div>

                    {/* Security & Access */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Lock size={20} className="text-slate-400" /> Account Security
                                </h2>
                                <button onClick={() => setIsSecurityModalOpen(true)} className="text-[10px] font-black text-emerald-600 hover:underline uppercase tracking-widest transition-all">Manage All</button>
                            </div>
                            <div className="space-y-3">
                                <SecurityActionItem
                                    icon={<Key size={16} />}
                                    label="Access Password"
                                    desc="Last changed 3 months ago"
                                    onClick={() => setIsSecurityModalOpen(true)}
                                    color="orange"
                                />
                                <SecurityActionItem
                                    icon={<Shield size={16} />}
                                    label="2-Factor Auth"
                                    desc="Currently disabled"
                                    onClick={() => setIsSecurityModalOpen(true)}
                                    color="indigo"
                                    badge="DISABLED"
                                />
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <History size={20} className="text-slate-400" /> Audit Logs
                            </h2>
                            <div className="space-y-5">
                                {activities.map((act) => (
                                    <div key={act.id} className="flex gap-4 relative">
                                        <div className="h-full w-0.5 bg-slate-100 absolute left-2 top-8 rounded-full"></div>
                                        <div className="h-4 w-4 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-1">
                                            <div className="h-1.5 w-1.5 rounded-full bg-slate-400"></div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{act.action}</p>
                                            <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-wide">{act.device} • <span className="text-slate-500 font-bold">{act.time}</span></p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
                        >
                            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
                                <h3 className="text-lg font-bold text-slate-900">Edit Profile</h3>
                                <button title="Close" onClick={() => setIsEditModalOpen(false)} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-200 transition-colors"><X size={18} /></button>
                            </div>
                            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                                <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                                <Input label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Home Address</label>
                                    <textarea
                                        placeholder="Enter your home address"
                                        className="w-full min-h-24 rounded-xl border border-slate-200 p-4 text-sm focus:ring-2 focus:ring-emerald-600 outline-none transition-all font-medium"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                                    <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                                    <Button type="submit" className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold px-10 shadow-lg shadow-emerald-200/50">Save Profiles</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Security Settings Modal */}
            <AnimatePresence>
                {isSecurityModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
                        >
                            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">Account Security</h3>
                                    <p className="text-xs text-slate-500">Manage password, 2FA, and active sessions.</p>
                                </div>
                                <button
                                    onClick={() => setIsSecurityModalOpen(false)}
                                    className="rounded-full p-1 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
                                    aria-label="Close modal"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="space-y-5 px-6 py-5">
                                {/* Password Change */}
                                <div className="rounded-xl border border-slate-200 p-4">
                                    <div className="mb-3 flex items-center gap-2 text-slate-800">
                                        <Key size={16} />
                                        <p className="text-sm font-semibold">Password Update</p>
                                    </div>
                                    <Input label="Current Password" type="password" />
                                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <Input label="New Password" type="password" />
                                        <Input label="Verify Password" type="password" />
                                    </div>
                                    <Button className="mt-4 w-full bg-slate-900 text-white font-semibold hover:bg-slate-800">
                                        Refresh Security Key
                                    </Button>
                                </div>

                                {/* 2FA Toggle */}
                                <div className="rounded-xl border border-slate-200 p-4">
                                    <div className="mb-3 flex items-center gap-2 text-slate-800">
                                        <Shield size={16} />
                                        <p className="text-sm font-semibold">Two-Factor Authentication</p>
                                    </div>
                                    <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                                        <div className="flex gap-4">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
                                            <Smartphone size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-indigo-900">2-Factor Authentication</p>
                                                <p className="text-xs text-indigo-700">Add an extra layer of security to your account.</p>
                                            </div>
                                        </div>
                                        <button title="Toggle 2FA" className="relative h-6 w-11 rounded-full bg-slate-300 transition-colors">
                                            <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white" />
                                        </button>
                                    </div>
                                </div>

                                {/* Active Sessions */}
                                <div className="rounded-xl border border-slate-200 p-4">
                                    <div className="mb-3 flex items-center gap-2 text-slate-800">
                                        <History size={16} />
                                        <p className="text-sm font-semibold">Active Authorization Sessions</p>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-xs p-3 border border-slate-100 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <Globe size={14} className="text-slate-400" />
                                                <span className="font-bold text-slate-700">Accra, GH • Chrome on Windows</span>
                                            </div>
                                            <span className="font-black text-emerald-600 uppercase tracking-tighter">Current</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                                            <div className="flex items-center gap-3">
                                                <Smartphone size={14} className="text-slate-400" />
                                                <span className="font-bold text-slate-700">Kumasi, GH • iOS App</span>
                                            </div>
                                            <button className="text-red-500 font-bold hover:underline">Revoke</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                                    <Button variant="outline" onClick={() => setIsSecurityModalOpen(false)}>
                                        Dismiss
                                    </Button>
                                    <Button className="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold px-8">
                                        <Check size={16} className="mr-2" /> Save
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}

function ProfileInfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-start gap-4">
            <div className="h-9 w-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 border border-slate-100">{icon}</div>
            <div>
                <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest leading-none">{label}</p>
                <p className="text-sm font-bold text-slate-800 mt-1.5">{value}</p>
            </div>
        </div>
    );
}

type SecurityActionItemProps = {
    icon: React.ReactNode;
    label: string;
    desc: string;
    onClick: () => void;
    color: "orange" | "indigo";
    badge?: string;
};

function SecurityActionItem({ icon, label, desc, onClick, color, badge }: SecurityActionItemProps) {
    const colors: Record<"orange" | "indigo", string> = {
        orange: "bg-orange-50 text-orange-600 border-orange-100 hover:border-orange-200",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 hover:border-indigo-200"
    };

    return (
        <button onClick={onClick} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${colors[color]}`}>
            <div className="flex items-center gap-4">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-white`}>{icon}</div>
                <div className="text-left">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">{label}</span>
                        {badge && <span className="text-[8px] bg-slate-900 text-white px-1.5 py-0.5 rounded font-black tracking-tighter">{badge}</span>}
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium italic mt-0.5">{desc}</p>
                </div>
            </div>
            <ArrowRight size={14} className="text-slate-300" />
        </button>
    );
}

function ArrowRight({ size, className }: { size: number; className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
    );
}
