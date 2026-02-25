"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Table } from "../../../../components/ui/Table";
import { motion } from "framer-motion";

export default function TimeTablePage() {
    const columns: any[] = [
        { header: "Class", accessor: "className" },
        { header: "Day", accessor: "day" },
        { header: "Period", accessor: "period" },
        { header: "Subject", accessor: "subject" },
        { header: "Teacher", accessor: "teacher" },
    ];

    const data: any[] = [
        { id: "1", className: "JSS 2A", day: "Monday", period: "1st Period", subject: "Mathematics", teacher: "Mr. Appiah" },
        { id: "2", className: "JSS 2A", day: "Monday", period: "2nd Period", subject: "Science", teacher: "Mrs. Amankwah" },
    ];

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Academic Time Table</h2>
                    <p className="text-gray-500 text-sm mt-1">View and manage schedules for all classes.</p>
                </div>
                <Table columns={columns} data={data} />
            </motion.div>
        </DashboardLayout>
    );
}
