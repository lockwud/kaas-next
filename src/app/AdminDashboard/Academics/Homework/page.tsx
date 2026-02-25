"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Table } from "../../../../components/ui/Table";
import { motion } from "framer-motion";

export default function HomeworkPage() {
    const columns: any[] = [
        { header: "Title", accessor: "title" },
        { header: "Subject", accessor: "subject" },
        { header: "Class", accessor: "className" },
        { header: "Deadline", accessor: "deadline" },
        { header: "Status", accessor: "status" },
    ];

    const data: any[] = [
        { id: "1", title: "Trigonometry Problems", subject: "Mathematics", className: "JSS 3", deadline: "2024-03-01", status: "Open" },
        { id: "2", title: "Biology Diagram", subject: "Science", className: "JSS 2", deadline: "2024-03-02", status: "Open" },
    ];

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Assign Homework</h2>
                    <p className="text-gray-500 text-sm mt-1">Assign and track homework for all classes.</p>
                </div>
                <Table columns={columns} data={data} />
            </motion.div>
        </DashboardLayout>
    );
}
