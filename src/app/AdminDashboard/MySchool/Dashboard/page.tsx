"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { motion } from "framer-motion";

export default function MySchoolDashboard() {
    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
            >
                <h2 className="text-2xl font-bold text-gray-800">My School Management Dashboard</h2>
                <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
                    <p className="text-gray-500">Overview metrics for this specific school branch will appear here.</p>
                </div>
            </motion.div>
        </DashboardLayout>
    );
}
