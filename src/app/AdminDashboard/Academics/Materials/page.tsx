"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Table } from "../../../../components/ui/Table";
import { motion } from "framer-motion";

export default function MaterialsPage() {
    const columns: any[] = [
        { header: "Material Title", accessor: "title" },
        { header: "Subject", accessor: "subject" },
        { header: "Class", accessor: "className" },
        { header: "Date Added", accessor: "dateAdded" },
    ];

    const data: any[] = [
        { id: "1", title: "Algebra Basics.pdf", subject: "Mathematics", className: "JSS 2", dateAdded: "2024-02-20" },
        { id: "2", title: "Photosynthesis.mp4", subject: "Science", className: "JSS 1", dateAdded: "2024-02-21" },
    ];

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Study Materials</h2>
                    <p className="text-gray-500 text-sm mt-1">Repository for educational resources and study aids.</p>
                </div>
                <Table columns={columns} data={data} />
            </motion.div>
        </DashboardLayout>
    );
}
