"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Button } from "../../../../components/ui/Button";
import { motion } from "framer-motion";
import { Video } from "lucide-react";

export default function LiveClassesPage() {
    const sessions = [
        { id: "1", title: "Mathematics - Calculus", teacher: "Mr. Appiah", startTime: "10:00 AM", status: "Ongoing" },
        { id: "2", title: "Biology - Genetics", teacher: "Mrs. Amankwah", startTime: "12:00 PM", status: "Upcoming" },
    ];

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-indigo-700">Live Classes (Go Pro)</h2>
                    <p className="text-gray-500 text-sm mt-1">Host and join virtual classes in real-time.</p>
                </div>
                <div className="space-y-4">
                    {sessions.map((session) => (
                        <div key={session.id} className="bg-white p-5 rounded-xl border border-indigo-50 shadow-sm flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{session.title}</h3>
                                <p className="text-sm text-gray-500">Teacher: {session.teacher} | Starts: {session.startTime}</p>
                                <span className={`inline-block mt-2 px-2 py-1 text-[10px] font-bold rounded-full ${session.status === "Ongoing" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                                    {session.status}
                                </span>
                            </div>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
                                <Video size={16} />
                                {session.status === "Ongoing" ? "Join Class" : "Prepare Room"}
                            </Button>
                        </div>
                    ))}
                </div>
            </motion.div>
        </DashboardLayout>
    );
}
