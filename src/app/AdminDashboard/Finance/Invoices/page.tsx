"use client";

import DashboardLayout from "@/components/DashboardLayout";

export default function InvoicesPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
                    <p className="text-gray-600 mt-2">Generate and manage student invoices</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-500">Invoice generation and management coming soon...</p>
                </div>
            </div>
        </DashboardLayout>
    );
}
