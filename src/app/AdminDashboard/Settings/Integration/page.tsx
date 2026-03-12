"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { motion } from "framer-motion";
import { Puzzle, MessageSquare, Phone, CreditCard, ChevronLeft, Check, ExternalLink, Settings2, X } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import Link from "next/link";
import { apiRequest } from "@/lib/api-client";

interface IntegrationCardProps {
    title: string;
    description: string;
    icon: React.ReactElement<{ size?: number }>;
    status: "connected" | "disconnected";
    onConfigure: () => void;
}

type IntegrationService = {
    key: string;
    name: string;
    enabled: boolean;
    status: "connected" | "disconnected";
    config?: Record<string, unknown>;
};

export default function IntegrationSettingsPage() {
    const { success, error } = useToast();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [activeService, setActiveService] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [services, setServices] = React.useState<IntegrationService[]>([]);
    const [apiSecret, setApiSecret] = React.useState("");
    const [webhookUrl, setWebhookUrl] = React.useState("");

    const handleConfigure = (service: string) => {
        setActiveService(service);
        setIsModalOpen(true);
    };

    React.useEffect(() => {
        const load = async () => {
            try {
                const payload = await apiRequest<{ services?: IntegrationService[] }>("/settings/integrations");
                setServices(payload.services ?? []);
            } catch (err) {
                error(err instanceof Error ? err.message : "Unable to load integrations.");
            } finally {
                setIsLoading(false);
            }
        };

        void load();
    }, [error]);

    const serviceConfigMap = React.useMemo<Record<string, { description: string; icon: React.ReactElement<{ size?: number }> }>>(
        () => ({
            whatsapp: {
                description: "Send automated attendance and fee alerts directly to parents via WhatsApp.",
                icon: <MessageSquare className="text-emerald-500" />,
            },
            bulk_sms: {
                description: "Reliable SMS notifications for emergencies, holidays, and announcements.",
                icon: <Phone className="text-blue-500" />,
            },
            payments: {
                description: "Allow parents to pay school fees online using Mobile Money or Card.",
                icon: <CreditCard className="text-indigo-500" />,
            },
            google_drive: {
                description: "Automatic backups of student documents and academic records.",
                icon: <Puzzle className="text-amber-500" />,
            },
        }),
        [],
    );

    const saveConfig = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const nextServices = services.map((service) =>
            service.name === activeService
                ? {
                    ...service,
                    status: "connected" as const,
                    enabled: true,
                    config: {
                        ...(service.config ?? {}),
                        apiSecret,
                        webhookUrl,
                    },
                }
                : service,
        );

        setIsSaving(true);
        try {
            await apiRequest("/settings/integrations", {
                method: "PATCH",
                body: JSON.stringify({ services: nextServices }),
            });
            setServices(nextServices);
            success(`${activeService} configuration saved.`);
            setIsModalOpen(false);
            setApiSecret("");
            setWebhookUrl("");
        } catch (err) {
            error(err instanceof Error ? err.message : "Unable to save integration configuration.");
        } finally {
            setIsSaving(false);
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
                    <span className="font-medium text-slate-900">Integrations</span>
                </div>

                <div>
                    <h1 className="text-2xl font-bold text-slate-900">3rd Party Integrations</h1>
                    <p className="text-sm text-slate-500 mt-1">Connect your school to external services to extend functionality.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading && Array.from({ length: 4 }).map((_, index) => (
                        <div key={`integration-skeleton-${index}`} className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white" />
                    ))}
                    {!isLoading && services.map((service) => (
                        <IntegrationCard
                            key={service.key}
                            title={service.name}
                            description={serviceConfigMap[service.key]?.description ?? "Configure this service for your school."}
                            icon={serviceConfigMap[service.key]?.icon ?? <Settings2 className="text-slate-400" />}
                            status={service.status}
                            onConfigure={() => handleConfigure(service.name)}
                        />
                    ))}
                </div>

                {/* API Key Section */}
                <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden group">
                    <div className="relative z-10 max-w-2xl">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            Developer API Access
                        </h3>
                        <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                            Generate API keys to integrate custom internal systems or 3rd party apps with your school data.
                            <strong> Please keep your keys secure.</strong>
                        </p>
                        <div className="mt-6 flex flex-wrap gap-4">
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-6">Generate API Key</Button>
                            <Button variant="ghost" className="text-slate-300 hover:text-white flex items-center gap-2">
                                <ExternalLink size={16} /> Documentation
                            </Button>
                        </div>
                    </div>
                    <div className="absolute right-0 top-0 h-full w-1/3 bg-linear-to-l from-emerald-600/10 to-transparent pointer-events-none" />
                </div>
            </motion.div>

            {/* Config Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
                    >
                        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
                            <h3 className="text-lg font-semibold text-slate-900">Configure {activeService}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="rounded-full p-1 text-slate-500 hover:bg-slate-200"><X size={18} /></button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 mb-2">
                                <Settings2 className="text-slate-400" size={20} />
                                <p className="text-xs text-slate-500 leading-relaxed font-medium italic">
                                    Enter your {activeService} API credentials. You can find these in your {activeService} developer dashboard.
                                </p>
                            </div>
                            <Input label="API Key / Secret" type="password" placeholder="sk_test_..." value={apiSecret} onChange={(event) => setApiSecret(event.target.value)} />
                            <Input label="Webhook URL" placeholder="https://your-site.com/api/webhook" value={webhookUrl} onChange={(event) => setWebhookUrl(event.target.value)} />

                            <div className="flex justify-end gap-2 pt-6 border-t border-slate-100">
                                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button
                                    className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold px-8"
                                    onClick={saveConfig}
                                    isLoading={isSaving}
                                    loadingText="Saving..."
                                    blurOnLoading
                                >
                                    Save Configuration
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </DashboardLayout>
    );
}

function IntegrationCard({ title, description, icon, status, onConfigure }: IntegrationCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group">
            <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                    {React.cloneElement(icon, { size: 24 })}
                </div>
                {status === "connected" ? (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                        <Check size={12} strokeWidth={4} /> Connected
                    </div>
                ) : (
                    <div className="px-2 py-1 rounded-full bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        Disconnected
                    </div>
                )}
            </div>
            <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
                {description}
            </p>
            <Button
                onClick={onConfigure}
                variant="outline"
                className="w-full text-xs font-bold py-2 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs"
            >
                Configure Service
            </Button>
        </div>
    );
}
