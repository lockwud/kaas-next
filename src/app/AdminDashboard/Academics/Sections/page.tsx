"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Table } from "../../../../components/ui/Table";
import { motion } from "framer-motion";

export default function SectionsPage() {
    const columns: any[] = [
        { header: "Section Name", accessor: "name" },
        { header: "Category", accessor: "category" },
        { header: "Capacity", accessor: "capacity" },
        { header: "Status", accessor: "status" },
    ];

    const data: any[] = [
        { id: "1", name: "Section A", category: "Primary", capacity: 40, status: "Active" },
        { id: "2", name: "Section B", category: "Junior High", capacity: 35, status: "Active" },
    ];

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Sections</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage and organize student sections.</p>
                </div>
                <Table columns={columns} data={data} />
            </motion.div>
        </DashboardLayout>
    );
}
