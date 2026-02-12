"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { motion } from "framer-motion";
import { branches, students, users } from "../../../../lib/school-data";

export default function MySchoolDashboard() {
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-bold text-gray-800">My School Management Dashboard</h2>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Branches</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{branches.length}</p>
          </div>
          <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Users</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{users.length}</p>
          </div>
          <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Students</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{students.length}</p>
          </div>
        </div>

        <div className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm text-sm text-gray-600">
          Branch-aware setup is active. Use `Add Branch`, `Assessments`, `Terminal Reports`, and `Data Center` to manage the full workflow.
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
