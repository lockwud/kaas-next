"use client";

import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { Button } from "../../../components/ui/Button";
import { motion } from "framer-motion";
import { Settings, Calendar, Database, Share2, Bell, Building, Shield, Users, ChevronRight, PenLine, Type, ImageUp, Eraser, Save, X } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/useToast";
import { loadSignatureProfile, saveSignatureProfile, SignatureMethod } from "../../../lib/signature-storage";

export default function SettingsHubPage() {
    const { success, error } = useToast();
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const isDrawingRef = React.useRef(false);
    const [isSignatureModalOpen, setIsSignatureModalOpen] = React.useState(false);
    const [activeSignatureMethod, setActiveSignatureMethod] = React.useState<SignatureMethod>("draw");
    const [drawnSignatureDataUrl, setDrawnSignatureDataUrl] = React.useState("");
    const [initialsValue, setInitialsValue] = React.useState("");
    const [initialsSignatureDataUrl, setInitialsSignatureDataUrl] = React.useState("");
    const [uploadedSignatureDataUrl, setUploadedSignatureDataUrl] = React.useState("");

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

    React.useEffect(() => {
        const loaded = loadSignatureProfile();
        if (!loaded) {
            return;
        }

        setActiveSignatureMethod(loaded.method);
        if (loaded.method === "draw") {
            setDrawnSignatureDataUrl(loaded.dataUrl);
        }
        if (loaded.method === "initials") {
            setInitialsSignatureDataUrl(loaded.dataUrl);
            setInitialsValue(loaded.initialsText ?? "");
        }
        if (loaded.method === "image") {
            setUploadedSignatureDataUrl(loaded.dataUrl);
        }
    }, []);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return;
        }

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#0F172A";
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        if (drawnSignatureDataUrl) {
            const img = new Image();
            img.onload = () => {
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = drawnSignatureDataUrl;
        }
    }, [drawnSignatureDataUrl]);

    const getCanvasPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return null;
        }
        const rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
    };

    const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        const ctx = canvas.getContext("2d");
        const point = getCanvasPoint(event);
        if (!ctx || !point) {
            return;
        }

        isDrawingRef.current = true;
        canvas.setPointerCapture(event.pointerId);
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
    };

    const continueDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawingRef.current) {
            return;
        }
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        const ctx = canvas.getContext("2d");
        const point = getCanvasPoint(event);
        if (!ctx || !point) {
            return;
        }

        ctx.lineTo(point.x, point.y);
        ctx.stroke();
    };

    const endDrawing = () => {
        if (!isDrawingRef.current) {
            return;
        }
        isDrawingRef.current = false;
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        setDrawnSignatureDataUrl(canvas.toDataURL("image/png"));
    };

    const clearDrawing = () => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            return;
        }

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setDrawnSignatureDataUrl("");
    };

    const buildInitialsPreview = () => {
        const trimmed = initialsValue.trim();
        if (!trimmed) {
            error("Enter initials before generating a signature.");
            return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = 520;
        canvas.height = 180;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            error("Could not generate initials signature right now.");
            return;
        }

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#0F172A";
        ctx.font = "700 92px cursive";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(trimmed.toUpperCase().slice(0, 6), canvas.width / 2, canvas.height / 2);
        setInitialsSignatureDataUrl(canvas.toDataURL("image/png"));
    };

    const handleSignatureImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            error("Please choose an image file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const result = typeof reader.result === "string" ? reader.result : "";
            if (!result) {
                error("Could not read selected image.");
                return;
            }
            setUploadedSignatureDataUrl(result);
        };
        reader.readAsDataURL(file);
    };

    const resolveSelectedSignature = () => {
        if (activeSignatureMethod === "draw") {
            return drawnSignatureDataUrl;
        }
        if (activeSignatureMethod === "initials") {
            return initialsSignatureDataUrl;
        }
        return uploadedSignatureDataUrl;
    };

    const handleSaveSignature = () => {
        const selectedDataUrl = resolveSelectedSignature();
        if (!selectedDataUrl) {
            error("Add a signature using the selected method before saving.");
            return;
        }

        saveSignatureProfile({
            method: activeSignatureMethod,
            dataUrl: selectedDataUrl,
            initialsText: activeSignatureMethod === "initials" ? initialsValue.trim() : undefined,
            updatedAt: new Date().toISOString(),
        });

        success("Signature profile saved and ready for reuse.");
    };

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

                <div className="max-w-md">
                    <button
                        type="button"
                        onClick={() => setIsSignatureModalOpen(true)}
                        className="group w-full bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all text-left flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-11 w-11 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 flex items-center justify-center transition-colors">
                                <PenLine size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 group-hover:text-emerald-900 transition-colors">Signature Setup</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Draw, initials, or image upload</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition-all translate-x-0 group-hover:translate-x-1" />
                    </button>
                </div>

                {/* Help Footer */}
                <div className="p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
                    <p className="text-sm text-slate-600 font-medium italic">
                        "Need help configuring your school? Check our <span className="text-emerald-600 underline cursor-pointer">Help Center</span> or contact support."
                    </p>
                </div>
            </motion.div>

            {isSignatureModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
                    >
                        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">Signature Setup</h3>
                                <p className="text-xs text-slate-500">Create one reusable signature.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsSignatureModalOpen(false)}
                                className="rounded-full p-1 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
                                aria-label="Close signature setup"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="space-y-4 px-5 py-4">
                            <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1">
                                <button
                                    type="button"
                                    onClick={() => setActiveSignatureMethod("draw")}
                                    className={`flex items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-medium ${activeSignatureMethod === "draw" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
                                >
                                    <PenLine size={12} />
                                    Draw
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveSignatureMethod("initials")}
                                    className={`flex items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-medium ${activeSignatureMethod === "initials" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
                                >
                                    <Type size={12} />
                                    Initials
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveSignatureMethod("image")}
                                    className={`flex items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-medium ${activeSignatureMethod === "image" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
                                >
                                    <ImageUp size={12} />
                                    Image
                                </button>
                            </div>

                            {activeSignatureMethod === "draw" && (
                                <div className="space-y-2">
                                    <canvas
                                        ref={canvasRef}
                                        width={380}
                                        height={130}
                                        onPointerDown={startDrawing}
                                        onPointerMove={continueDrawing}
                                        onPointerUp={endDrawing}
                                        onPointerLeave={endDrawing}
                                        className="w-full max-w-[380px] rounded-xl border border-slate-300 bg-white touch-none"
                                    />
                                    <Button type="button" variant="outline" className="h-8 px-3 text-xs" onClick={clearDrawing}>
                                        <Eraser size={12} className="mr-1" /> Clear
                                    </Button>
                                </div>
                            )}

                            {activeSignatureMethod === "initials" && (
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={initialsValue}
                                            onChange={(event) => setInitialsValue(event.target.value)}
                                            placeholder="e.g. AK"
                                            className="h-9 flex-1 rounded-lg border border-slate-300 px-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                        />
                                        <Button type="button" variant="outline" className="h-9 px-3 text-xs" onClick={buildInitialsPreview}>
                                            Generate
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {activeSignatureMethod === "image" && (
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleSignatureImageUpload}
                                    className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-xs file:font-medium file:text-emerald-700 hover:file:bg-emerald-100"
                                />
                            )}

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <p className="text-xs font-semibold text-slate-700">Preview</p>
                                <div className="mt-2 rounded-lg border border-slate-200 bg-white p-2 min-h-[90px] flex items-center justify-center">
                                    {resolveSelectedSignature() ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={resolveSelectedSignature()} alt="Signature preview" className="max-h-16 object-contain" />
                                    ) : (
                                        <p className="text-xs text-slate-400">No signature yet.</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                                <Button type="button" variant="outline" className="h-9 px-3 text-xs" onClick={() => setIsSignatureModalOpen(false)}>
                                    Close
                                </Button>
                                <Button type="button" className="h-9 px-4 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSaveSignature}>
                                    <Save size={12} className="mr-1" /> Save Signature
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </DashboardLayout>
    );
}
