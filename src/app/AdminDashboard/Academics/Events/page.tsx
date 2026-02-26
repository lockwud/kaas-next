"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { motion } from "framer-motion";

export default function EventsPage() {
    const events = [
        { id: "1", title: "Sports Day", date: "2024-03-10", location: "Main Field", description: "Annual inter-house sports competition." },
        { id: "2", title: "Science Fair", date: "2024-03-20", location: "School Hall", description: "Showcasing student projects and inventions." },
    ];

    return (
        <DashboardLayout>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">School Events</h2>
                    <p className="text-gray-500 text-sm mt-1">Stay updated with upcoming school activities and events.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    {events.map((event) => (
                        <div key={event.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="font-bold text-lg text-gray-900">{event.title}</h3>
                            <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 font-medium">
                                <span>{event.date}</span>
                                <span>•</span>
                                <span>{event.location}</span>
                            </div>
                            <p className="mt-3 text-gray-600 text-sm">{event.description}</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </DashboardLayout>
    );
}
