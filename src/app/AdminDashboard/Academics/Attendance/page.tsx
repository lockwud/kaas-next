"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Table } from "../../../../components/ui/Table";
import { motion } from "framer-motion";

export default function AttendancePage() {
    const columns: any[] = [
        { header: "Student Name", accessor: "studentName" },
        { header: "Class", accessor: "className" },
        { header: "Date", accessor: "date" },
        { header: "Status", accessor: "status" },
    ];

    const data: any[] = [
        { id: "1", studentName: "John Doe", className: "JSS 2A", date: "2024-02-24", status: "Present" },
        { id: "2", studentName: "Jane Smith", className: "JSS 2A", date: "2024-02-24", status: "Absent" },
    ];

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Attendance Tracking</h2>
                    <p className="text-gray-500 text-sm mt-1">Track and manage student daily attendance.</p>
                </div>
                <Table columns={columns} data={data} />
            </motion.div>
        </DashboardLayout>
    );
}
