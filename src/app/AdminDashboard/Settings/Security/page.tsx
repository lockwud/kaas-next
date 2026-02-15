"use client";

import DashboardLayout from "@/components/DashboardLayout";

export default function SecurityPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
                    <p className="text-gray-600 mt-2">Security settings and access control</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-500">Security settings coming soon...</p>
                </div>
            </div>
        </DashboardLayout>
    );
}
