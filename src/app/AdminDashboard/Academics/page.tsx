"use client";

import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { DashboardCard } from "../../../components/DashboardCard";
import { motion, Variants } from "framer-motion";

export default function AcademicsDashboard() {
    const cards = [
        "Class", "Sections", "Subjects",
        "Time Table", "Attendance", "Student Leaves",
        "Study Materials", "Home Work", "Notice Board",
        "Events", "Live Classes (Go Pro)"
    ];

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-800">Academics</h2>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
                {cards.map((title) => (
                    <motion.div key={title} variants={itemVariants}>
                        <DashboardCard
                            title={title}
                            onView={() => console.log(`View ${title}`)}
                            onAdd={() => console.log(`Add ${title}`)}
                        />
                    </motion.div>
                ))}
            </motion.div>
        </DashboardLayout>
    );
}
