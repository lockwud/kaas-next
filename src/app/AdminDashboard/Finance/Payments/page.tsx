"use client";

import DashboardLayout from "@/components/DashboardLayout";

export default function PaymentsPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
                    <p className="text-gray-600 mt-2">Record and track fee payments</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-500">Payment tracking functionality coming soon...</p>
                </div>
            </div>
        </DashboardLayout>
    );
}
