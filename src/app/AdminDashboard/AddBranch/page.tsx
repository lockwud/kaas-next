"use client";

import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";
import { motion, Variants } from "framer-motion";

export default function AddBranch() {
    const containerVariants: Variants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: "easeOut" }
        },
    };

    return (
        <DashboardLayout>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
            >
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-lg font-semibold text-gray-900">Add New Branch</h2>
                </div>

                <form className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">

                    {/* Left Column */}
                    <div className="space-y-6">
                        <Input label="Billing Name" placeholder="Enter billing name" />
                        <Input label="Organization Website" placeholder="www.example.com" />
                        <Select
                            label="Time-zone"
                            options={[
                                { value: "utc", label: "UTC" },
                                { value: "est", label: "EST" },
                                { value: "ist", label: "IST" }
                            ]}
                        />
                        <Input label="Email" type="email" placeholder="admin@school.com" />
                        <Input label="Contact number" placeholder="+91 9876543210" />
                        <Input label="Registration Number" placeholder="REG-12345" />
                        <Input label="Organization Code" placeholder="ORG-001" />

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Upload Files</label>
                            <div className="flex items-center gap-4">
                                <button type="button" className="px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 hover:bg-gray-200 transition-colors">
                                    Choose Media
                                </button>
                                <span className="text-xs text-gray-400">No file chosen</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Address</label>
                            <textarea
                                className="w-full min-h-[120px] rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
                                placeholder="Enter full address"
                            ></textarea>
                        </div>
                        <Select
                            label="State"
                            options={[
                                { value: "delhi", label: "Delhi" },
                                { value: "maharashtra", label: "Maharashtra" }
                            ]}
                        />
                        <Select
                            label="District"
                            options={[
                                { value: "new-delhi", label: "New Delhi" },
                                { value: "pune", label: "Pune" }
                            ]}
                        />
                        <Select
                            label="Country"
                            options={[
                                { value: "india", label: "India" },
                                { value: "usa", label: "USA" }
                            ]}
                        />
                        <Input label="Pincode" placeholder="110001" />
                        <Input label="Tax Number" placeholder="TAX-8899" />
                        <Input label="GST Info" placeholder="GSTIN..." />
                    </div>

                    {/* Bottom Actions */}
                    <div className="lg:col-span-2 flex justify-end pt-8 mt-4 border-t border-gray-100">
                        <Button className="w-40 rounded-full">
                            Save
                        </Button>
                    </div>

                </form>
            </motion.div>
        </DashboardLayout>
    );
}
