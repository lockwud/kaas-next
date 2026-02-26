"use client";

import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { Button } from "../../../components/ui/Button";
import { Table } from "../../../components/ui/Table";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Plus, Receipt, Info, Check, ShieldCheck, Zap, X, ArrowUpRight, Download, Filter } from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface TransactionRow {
    id: string;
    description: string;
    amount: string;
    date: string;
    status: "Paid" | "Pending" | "Failed";
}

export default function BillingPage() {
    const { success } = useToast();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);
    const [isSubModalOpen, setIsSubModalOpen] = React.useState(false);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = React.useState(false);

    // Modal state
    const [cardName, setCardName] = React.useState("");
    const [cardNumber, setCardNumber] = React.useState("");
    const [expiry, setExpiry] = React.useState("");
    const [cvv, setCvv] = React.useState("");

    const transactions: TransactionRow[] = [
        { id: "INV-2024-001", description: "Standard Subscription (Annual)", amount: "$1,200.00", date: "Jan 15, 2024", status: "Paid" },
        { id: "INV-2024-002", description: "SMS Package (5,000 credits)", amount: "$50.00", date: "Feb 02, 2024", status: "Paid" },
        { id: "INV-2024-003", description: "Cloud Storage Extension (50GB)", amount: "$25.00", date: "Mar 10, 2024", status: "Pending" },
    ];

    const handleSubmitPayment = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Adding payment method:", { cardName, cardNumber, expiry, cvv });
        success("Payment method has been added successfully.");
        setIsPaymentModalOpen(false);
    };

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
                {/* Billing Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Zap size={120} />
                        </div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                                <Zap size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Premium Plan</h2>
                                <p className="text-sm text-slate-500">Your school is currently on the most advanced plan.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-4">
                            <PlanDetail label="Renewal Date" value="Jan 15, 2025" />
                            <PlanDetail label="Billing Cycle" value="Annual" />
                            <PlanDetail label="Total Users" value="Unlimited" />
                            <PlanDetail label="Storage" value="500 GB" />
                        </div>
                        <div className="mt-8 flex gap-3">
                            <Button onClick={() => setIsSubModalOpen(true)} className="bg-slate-900 text-white hover:bg-slate-800 font-bold px-6 shadow-lg">Manage Subscription</Button>
                            <Button onClick={() => setIsInvoiceModalOpen(true)} variant="outline" className="text-slate-600 border-slate-200 font-bold px-6">View Invoices</Button>
                        </div>
                    </div>

                    <div className="lg:col-span-1 bg-linear-to-br from-emerald-600 to-emerald-700 rounded-2xl p-8 text-white shadow-lg relative">
                        <ShieldCheck className="absolute bottom-4 right-4 opacity-20" size={80} />
                        <h3 className="text-lg font-bold mb-2">Automatic Billing</h3>
                        <p className="text-sm text-emerald-100 mb-6 leading-relaxed">
                            Your next payment of <span className="font-bold underlineDecoration-emerald-300 decoration-2">$1,200.00</span> will be automatically charged on <span className="font-bold">Jan 15, 2025</span>.
                        </p>
                        <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/20 backdrop-blur-sm">
                            <div className="h-8 w-10 bg-white/20 rounded-md flex items-center justify-center text-[10px] font-bold">VISA</div>
                            <div className="text-xs">
                                <p className="font-bold">Visa ending in 4242</p>
                                <p className="opacity-70">Expires 12/26</p>
                            </div>
                            <Check size={16} className="ml-auto text-emerald-300" />
                        </div>
                    </div>
                </div>

                {/* Payment Methods & History */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* History */}
                    <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Receipt className="text-slate-400" size={20} />
                                <h3 className="font-bold text-slate-900">Recent Billing History</h3>
                            </div>
                            <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-50">Export PDF</Button>
                        </div>
                        <Table
                            columns={[
                                { header: "Invoice ID", accessor: "id", className: "font-mono text-[10px] font-bold text-slate-400" },
                                { header: "Description", accessor: "description", className: "font-bold text-slate-900 text-xs" },
                                { header: "Amount", accessor: "amount", className: "font-black text-slate-900 text-right text-xs" },
                                { header: "Date", accessor: "date", className: "text-slate-500 text-[10px] font-bold text-right" },
                                {
                                    header: "Status", accessor: (row) => (
                                        <div className="flex justify-end">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${row.status === "Paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                                                row.status === "Pending" ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-red-50 text-red-700 border border-red-100"
                                                }`}>
                                                {row.status}
                                            </span>
                                        </div>
                                    )
                                },
                            ]}
                            data={transactions}
                            actions={() => <Button variant="ghost" className="text-slate-400 italic text-[10px]"><Download size={14} /></Button>}
                        />
                    </div>

                    {/* Quick Management */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <CreditCard size={18} className="text-slate-400" /> Payment Methods
                            </h3>
                            <div className="space-y-3">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-5 bg-slate-200 rounded text-[8px] flex items-center justify-center font-bold text-slate-400 uppercase">Visa</div>
                                        <span className="text-sm font-bold text-slate-700">**** 4242</span>
                                    </div>
                                    <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider">Default</span>
                                </div>
                                <Button onClick={() => setIsPaymentModalOpen(true)} variant="outline" className="w-full h-11 border-dashed border-2 hover:bg-slate-50 border-slate-200 text-slate-500 font-bold text-xs transition-all">
                                    <Plus size={16} className="mr-2" /> Add New Card
                                </Button>
                            </div>
                        </div>
                        <div className="bg-slate-900 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                            <Zap size={80} className="absolute -right-4 -bottom-4 text-white/5 group-hover:scale-110 transition-transform" />
                            <h4 className="text-white font-bold text-sm">Need a custom plan?</h4>
                            <p className="text-slate-400 text-xs mt-2 leading-relaxed">Contact our sales team for personalized enterprise quotes and bulk licensing discounts.</p>
                            <Button className="mt-4 w-full bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs h-9">Talk to Sales</Button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Payment Modal */}
            <AnimatePresence>
                {isPaymentModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
                        >
                            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
                                <h3 className="text-lg font-bold text-slate-900">Add Payment Method</h3>
                                <button onClick={() => setIsPaymentModalOpen(false)} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-200 transition-colors"><X size={18} /></button>
                            </div>
                            <form onSubmit={handleSubmitPayment} className="p-6 space-y-4">
                                <Input label="Name on Card" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Full name as on card" required />
                                <Input label="Card Number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="0000 0000 0000 0000" required />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Expiry Date" value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM / YY" required />
                                    <Input label="CVV" value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="123" required />
                                </div>
                                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                                    <Button type="button" variant="outline" onClick={() => setIsPaymentModalOpen(false)}>Cancel</Button>
                                    <Button type="submit" className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold px-8 shadow-emerald-200 shadow-lg">Save Card</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Manage Subscription Modal */}
            <AnimatePresence>
                {isSubModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
                        >
                            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                                        <Zap size={18} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">Manage Subscription</h3>
                                </div>
                                <button onClick={() => setIsSubModalOpen(false)} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-200"><X size={18} /></button>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                    <PricingCard name="Starter" price="$49" active={false} />
                                    <PricingCard name="Professional" price="$99" active={false} />
                                    <PricingCard name="Premium" price="$1,200/yr" active={true} />
                                </div>
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <h4 className="font-bold text-slate-900 mb-3">Billing Cycle & Period</h4>
                                    <div className="flex items-center gap-8">
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-black uppercase">Current Period Ends</p>
                                            <p className="text-sm font-bold text-slate-700">Jan 15, 2025 (Renewing)</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-black uppercase">Plan Limit</p>
                                            <p className="text-sm font-bold text-slate-700">Unlimited Students & Staff</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-end gap-3">
                                    <Button variant="outline" onClick={() => setIsSubModalOpen(false)} className="font-bold">Close</Button>
                                    <Button className="bg-slate-900 text-white hover:bg-slate-800 font-bold px-8">Upgrade / Change Plan</Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* View Invoices Modal */}
            <AnimatePresence>
                {isInvoiceModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
                        >
                            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                                        <Receipt size={18} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">Your Invoices</h3>
                                </div>
                                <button onClick={() => setIsInvoiceModalOpen(false)} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-200"><X size={18} /></button>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative flex-1">
                                        <Filter className="absolute left-3 top-3 text-slate-400" size={16} />
                                        <Input placeholder="Filter by year or status..." className="pl-10 h-10 border-slate-200" />
                                    </div>
                                    <Button variant="outline" className="h-10 text-xs font-bold border-slate-200">Export All CSV</Button>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto rounded-xl border border-slate-100">
                                    <Table
                                        columns={[
                                            { header: "Date", accessor: "date", className: "text-slate-500 font-bold text-xs" },
                                            { header: "ID", accessor: "id", className: "font-mono text-xs text-slate-400" },
                                            { header: "Description", accessor: "description", className: "font-bold text-slate-900 text-xs" },
                                            { header: "Amount", accessor: "amount", className: "font-black text-slate-900 text-xs" },
                                            {
                                                header: "Status", accessor: (row) => (
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${row.status === "Paid" ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"}`}>{row.status}</span>
                                                )
                                            }
                                        ]}
                                        data={transactions}
                                        actions={() => <Button variant="ghost" className="text-emerald-600 hover:bg-emerald-50 font-bold text-xs"><Download size={14} className="mr-2" /> PDF</Button>}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}

function PlanDetail({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{label}</p>
            <p className="text-sm font-black text-slate-800 mt-1">{value}</p>
        </div>
    );
}

function PricingCard({ name, price, active }: { name: string; price: string; active: boolean }) {
    return (
        <div className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${active ? "border-slate-900 bg-slate-50 shadow-md" : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"}`}>
            <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{name}</p>
                {active && <div className="h-4 w-4 bg-slate-900 rounded-full flex items-center justify-center"><Check size={10} className="text-white" /></div>}
            </div>
            <p className="text-2xl font-black text-slate-900">{price}</p>
            <p className="text-[10px] text-slate-500 mt-1 font-medium italic">{active ? "Your current plan" : "Available upgrade"}</p>
        </div>
    );
}
