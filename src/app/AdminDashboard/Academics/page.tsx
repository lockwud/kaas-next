"use client";

import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { DashboardCard } from "../../../components/DashboardCard";
import { motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";

export default function AcademicsDashboard() {
    const router = useRouter();
    const cards = [
        { title: "Assessments", path: "/AdminDashboard/Academics/Assessments" },
        { title: "Terminal Reports", path: "/AdminDashboard/Academics/Reports" },
        { title: "Class" }, { title: "Sections" }, { title: "Subjects" },
        { title: "Time Table" }, { title: "Attendance" }, { title: "Student Leaves" },
        { title: "Study Materials" }, { title: "Home Work" }, { title: "Notice Board" },
        { title: "Events" }, { title: "Live Classes (Go Pro)" }
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
                {cards.map((card) => (
                    <motion.div key={card.title} variants={itemVariants}>
                        <DashboardCard
                            title={card.title}
                            onView={() => (card.path ? router.push(card.path) : console.log(`View ${card.title}`))}
                            onAdd={() => (card.path ? router.push(card.path) : console.log(`Add ${card.title}`))}
                        />
                    </motion.div>
                ))}
            </motion.div>
        </DashboardLayout>
    );
}
