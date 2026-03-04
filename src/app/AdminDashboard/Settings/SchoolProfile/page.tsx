"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { motion } from "framer-motion";
import { School, Upload, Save, ChevronLeft, Globe, MapPin, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import Link from "next/link";
import { apiRequest } from "@/lib/api-client";

export default function SchoolProfilePage() {
    const { success, error } = useToast();
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [name, setName] = React.useState("Ghana International Excellence School");
    const [shortName, setShortName] = React.useState("GIES");
    const [email, setEmail] = React.useState("info@gies.edu.gh");
    const [phone, setPhone] = React.useState("+233 24 000 0000");
    const [website, setWebsite] = React.useState("https://gies.edu.gh");
    const [address, setAddress] = React.useState("123 Education Loop, Accra, Ghana");
    const [motto, setMotto] = React.useState("Excellence in every step of learning.");

    React.useEffect(() => {
        const load = async () => {
            try {
                const payload = await apiRequest<{
                    school?: { name?: string; email?: string; phone?: string; address?: string };
                    custom?: { shortName?: string; website?: string; motto?: string };
                }>("/settings/school-profile");

                setName(payload.school?.name ?? "Ghana International Excellence School");
                setShortName(payload.custom?.shortName ?? "GIES");
                setEmail(payload.school?.email ?? "info@gies.edu.gh");
                setPhone(payload.school?.phone ?? "+233 24 000 0000");
                setWebsite(payload.custom?.website ?? "https://gies.edu.gh");
                setAddress(payload.school?.address ?? "123 Education Loop, Accra, Ghana");
                setMotto(payload.custom?.motto ?? "Excellence in every step of learning.");
            } catch (err) {
                error(err instanceof Error ? err.message : "Unable to load school profile.");
            } finally {
                setIsLoading(false);
            }
        };

        void load();
    }, [error]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await apiRequest("/settings/school-profile", {
                method: "PATCH",
                body: JSON.stringify({ shortName, website, motto, address, phone, email }),
            });
            success("School profile updated successfully.");
        } catch (err) {
            error(err instanceof Error ? err.message : "Unable to save school profile.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Link href="/AdminDashboard/Settings" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
                        <ChevronLeft size={14} /> Settings
                    </Link>
                    <span className="text-slate-300">/</span>
                    <span className="font-medium text-slate-900">School Profile</span>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">School Profile</h1>
                        <p className="text-sm text-slate-500 mt-1">Update your institution profile information and branding.</p>
                    </div>
                    <Button onClick={handleSave} className="bg-slate-900 text-white hover:bg-slate-800" isLoading={isSaving} disabled={isLoading}>
                        <Save size={18} className="mr-2" /> Save Changes
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Branding / Logo Section */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-4">Branding</h3>
                            <div className="flex flex-col items-center gap-6">
                                <div className="h-32 w-32 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center relative group overflow-hidden">
                                    <School className="text-slate-300" size={48} />
                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white">
                                        <Upload size={24} />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <Button variant="outline" className="text-xs h-9">Change Logo</Button>
                                    <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-tight">PNG or JPG. Max 2MB.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                            <h4 className="font-bold text-emerald-900 text-sm mb-2">Primary Color</h4>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-emerald-600 shadow-sm border border-emerald-500/20"></div>
                                <code className="text-xs font-mono text-emerald-700">#059669</code>
                                <Button variant="ghost" className="h-8 px-2 text-xs text-emerald-600">Change</Button>
                            </div>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <MapPin size={18} className="text-emerald-600" /> General Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <Input label="School Full Name" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
                                </div>
                                <Input label="Short Name / Acronym" value={shortName} onChange={(e) => setShortName(e.target.value)} disabled={isLoading} />
                                <Input label="Official Email" icon={<Mail size={16} />} value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
                                <Input label="Contact Phone" icon={<Phone size={16} />} value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isLoading} />
                                <Input label="Website URL" icon={<Globe size={16} />} value={website} onChange={(e) => setWebsite(e.target.value)} disabled={isLoading} />
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-slate-700 mb-2 block">Physical Address</label>
                                    <textarea
                                        className="w-full min-h-24 rounded-xl border border-slate-200 p-4 text-sm focus:ring-2 focus:ring-emerald-600 outline-none transition-all"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">School Motto</h4>
                                <p className="text-xs text-slate-500 mt-0.5 italic">{`"${motto}"`}</p>
                            </div>
                            <Button
                                variant="ghost"
                                className="text-xs text-slate-600"
                                disabled={isLoading}
                                onClick={() => {
                                    const next = window.prompt("Update school motto", motto);
                                    if (next !== null && next.trim()) {
                                        setMotto(next.trim());
                                    }
                                }}
                            >
                                Update Motto
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </DashboardLayout>
    );
}
