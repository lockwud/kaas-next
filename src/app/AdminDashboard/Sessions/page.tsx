"use client";

import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Table } from "../../../components/ui/Table";
import { Search, Plus, Trash2, Edit2 } from "lucide-react";
import { motion, Variants } from "framer-motion";

export default function SessionsPage() {
    type SessionRow = {
        id: number;
        name: string;
        startDate: string;
        endDate: string;
    };

    const sessions: SessionRow[] = [
        { id: 1, name: "Academic Year 2025-26", startDate: "01-04-2025", endDate: "31-03-2026" },
        { id: 2, name: "Academic Year 2024-25", startDate: "01-04-2024", endDate: "31-03-2025" },
        { id: 3, name: "Summer Session 2025", startDate: "01-06-2025", endDate: "30-06-2025" },
        { id: 4, name: "Winter Session 2025", startDate: "01-12-2025", endDate: "31-12-2025" },
    ];

    const columns: { header: string; accessor: keyof SessionRow; className?: string }[] = [
        { header: "Sl No.", accessor: "id", className: "w-16" },
        { header: "Sessions", accessor: "name" },
        { header: "Start Date", accessor: "startDate" },
        { header: "End Date", accessor: "endDate" },
    ];

    const containerVariants: Variants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    return (
        <DashboardLayout>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select
                        options={[{ value: "all", label: "All Sessions" }]}
                        className="bg-white"
                        label="Filter Session"
                    />
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input placeholder="Search Sessions" className="pl-10" />
                    </div>
                </div>

                {/* Add New Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-end gap-4">
                    <div className="flex-1 w-full">
                        <Input label="Sessions" placeholder="Enter Sessions Level" />
                    </div>
                    <div className="flex-1 w-full">
                        <Input label="Start Date" type="date" />
                    </div>
                    <div className="flex-1 w-full">
                        <Input label="End Date" type="date" />
                    </div>
                    <Button className="rounded-full bg-green-600 text-white hover:bg-green-700 whitespace-nowrap">
                        <Plus className="mr-2 h-4 w-4" /> ADD NEW SESSIONS
                    </Button>
                </div>

                {/* Table */}
                <Table
                    columns={columns}
                    data={sessions}
                    actions={() => (
                        <div className="flex gap-2 justify-end">
                            <button className="text-yellow-500 hover:text-yellow-600"><Edit2 size={16} /></button>
                            <button className="text-red-500 hover:text-red-600"><Trash2 size={16} /></button>
                        </div>
                    )}
                />

            </motion.div>
        </DashboardLayout>
    );
}
