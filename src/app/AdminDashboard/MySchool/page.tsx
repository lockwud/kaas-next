"use client";

import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Table } from "../../../components/ui/Table";
import { Search, Plus, Trash2, Edit2, Download, Upload, Filter, Copy } from "lucide-react"; // Import necessary icons
import { motion, Variants } from "framer-motion";

export default function MySchoolPage() {
    // Mock Student Data
    const students = [
        { id: 1, name: "John Tripathi", class: "XI", roll: "27", img: "https://i.pravatar.cc/150?u=1" },
        { id: 2, name: "Maria Garcia", class: "XII", roll: "27", img: "https://i.pravatar.cc/150?u=2" },
        { id: 3, name: "Robert Smith", class: "XII", roll: "27", img: "https://i.pravatar.cc/150?u=3" },
        { id: 4, name: "Lisa Wong", class: "XII", roll: "27", img: "https://i.pravatar.cc/150?u=4" },
        { id: 5, name: "David Chen", class: "XII", roll: "27", img: "https://i.pravatar.cc/150?u=5" },
        { id: 6, name: "Sarah Johnson", class: "XII", roll: "27", img: "https://i.pravatar.cc/150?u=6" },
        { id: 7, name: "Mike Brown", class: "XII", roll: "27", img: "https://i.pravatar.cc/150?u=7" },
        { id: 8, name: "Emily Davis", class: "XII", roll: "27", img: "https://i.pravatar.cc/150?u=8" },
    ];

    const columns: any[] = [
        { header: "Sl No.", accessor: "id", className: "w-16" },
        {
            header: "Name",
            accessor: (row: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden relative">
                        {/* Using img tag for now or next/image if configured */}
                        <img src={row.img} alt={row.name} className="object-cover w-full h-full" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{row.name}</span>
                        <span className="text-xs text-gray-400">Id: 050000321</span>
                    </div>
                </div>
            )
        },
        { header: "Class", accessor: "class" },
        { header: "Roll number", accessor: "roll" },
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
                {/* Search Header */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input placeholder="Search Student" className="pl-10" />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                        <Button variant="outline" className="text-xs h-9 border-gray-200 text-gray-600">
                            <Plus size={14} className="mr-1" /> ADD
                        </Button>
                        <Button variant="outline" className="text-xs h-9 border-gray-200 text-gray-600">
                            SHIFTS
                        </Button>
                        <Button variant="outline" className="text-xs h-9 border-gray-200 text-gray-600">
                            DOWNLOAD
                        </Button>
                        <Button variant="outline" className="text-xs h-9 border-gray-200 text-gray-600">
                            <Upload size={14} className="mr-1" /> IMPORT
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <Table
                    columns={columns}
                    data={students}
                    actions={() => (
                        <div className="flex gap-4 justify-end">
                            <button className="text-amber-400 hover:text-amber-500"><Filter size={16} /></button>
                            <button className="text-amber-400 hover:text-amber-500"><Copy size={16} /></button>
                            <button className="text-amber-400 hover:text-amber-500"><Trash2 size={16} /></button>
                        </div>
                    )}
                />

            </motion.div>
        </DashboardLayout>
    );
}
