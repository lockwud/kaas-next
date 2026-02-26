"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Table } from "../../../../components/ui/Table";
import { motion } from "framer-motion";

export default function SubjectsPage() {
    const columns: any[] = [
        { header: "Subject Name", accessor: "name" },
        { header: "Code", accessor: "code" },
        { header: "Category", accessor: "category" },
    ];

    const data: any[] = [
        { id: "1", name: "Mathematics", code: "MAT-01", category: "Core" },
        { id: "2", name: "Science", code: "SCI-01", category: "Core" },
        { id: "3", name: "English Language", code: "ENG-01", category: "Core" },
    ];

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Subjects</h2>
                    <p className="text-gray-500 text-sm mt-1">Configure and manage subjects offered in the school.</p>
                </div>
                <Table columns={columns} data={data} />
            </motion.div>
        </DashboardLayout>
    );
}
