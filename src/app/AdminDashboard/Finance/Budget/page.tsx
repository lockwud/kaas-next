"use client";

import DashboardLayout from "@/components/DashboardLayout";

export default function BudgetPlanningPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Budget Planning</h1>
                    <p className="text-gray-600 mt-2">Plan and manage school budgets</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-500">Budget planning functionality coming soon...</p>
                </div>
            </div>
        </DashboardLayout>
    );
}
