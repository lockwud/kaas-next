"use client";

import DashboardLayout from "@/components/DashboardLayout";

export default function StaffDirectoryPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Staff Directory</h1>
                    <p className="text-gray-600 mt-2">View and manage all staff members</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-500">Staff directory coming soon...</p>
                </div>
            </div>
        </DashboardLayout>
    );
}
