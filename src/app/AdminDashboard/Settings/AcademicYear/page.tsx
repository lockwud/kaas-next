"use client";

import DashboardLayout from "@/components/DashboardLayout";

export default function AcademicYearPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Academic Year</h1>
                    <p className="text-gray-600 mt-2">Configure terms, semesters, and sessions</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-500">Academic year configuration coming soon...</p>
                </div>
            </div>
        </DashboardLayout>
    );
}
