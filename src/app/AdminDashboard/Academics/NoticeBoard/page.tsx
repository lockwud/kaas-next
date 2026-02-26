"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { motion } from "framer-motion";

export default function NoticeBoardPage() {
    const notices = [
        { id: "1", title: "Mid-Term Examination", date: "2024-03-15", content: "The mid-term exams will commence on March 15th." },
        { id: "2", title: "School Holiday", date: "2024-03-06", content: "Independence Day holiday on March 6th." },
    ];

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Notice Board</h2>
                    <p className="text-gray-500 text-sm mt-1">Post and view school announcements.</p>
                </div>
                <div className="space-y-4">
                    {notices.map((notice) => (
                        <div key={notice.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start">
                                <h3 className="font-semibold text-lg text-gray-900">{notice.title}</h3>
                                <span className="text-xs text-gray-500 font-medium">{notice.date}</span>
                            </div>
                            <p className="mt-2 text-gray-600 text-sm">{notice.content}</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </DashboardLayout>
    );
}
