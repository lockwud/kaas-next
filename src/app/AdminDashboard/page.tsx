"use client";

import React from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Users, DollarSign, BookOpen, UserCheck } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import { motion, Variants } from "framer-motion";

export default function AdminDashboard() {
    // Mock Data
    const stats = [
        { title: "Total Students", value: "2,543", icon: <Users size={24} className="text-white" />, color: "bg-blue-500" },
        { title: "Total Teachers", value: "128", icon: <BookOpen size={24} className="text-white" />, color: "bg-purple-500" },
        { title: "Parents", value: "1,890", icon: <UserCheck size={24} className="text-white" />, color: "bg-orange-500" },
        { title: "Total Earnings", value: "$45,231", icon: <DollarSign size={24} className="text-white" />, color: "bg-green-500" },
    ];

    const feeData = [
        { name: "Jan", income: 4000, expense: 2400 },
        { name: "Feb", income: 3000, expense: 1398 },
        { name: "Mar", income: 2000, expense: 9800 },
        { name: "Apr", income: 2780, expense: 3908 },
        { name: "May", income: 1890, expense: 4800 },
        { name: "Jun", income: 2390, expense: 3800 },
        { name: "Jul", income: 3490, expense: 4300 },
    ];

    const attendanceData = [
        { name: "Present", value: 850 },
        { name: "Absent", value: 120 },
        { name: "Late", value: 30 },
    ];

    const COLORS = ['#16A34A', '#EF4444', '#F59E0B']; // Green, Red, Amber

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <DashboardLayout>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-8"
            >
                {/* Welcome Section */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
                    <p className="text-gray-500">Welcome back, here's what's happening at your school today.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow"
                        >
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</h3>
                            </div>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color} shadow-lg shadow-gray-200`}>
                                {stat.icon}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Bar Chart */}
                    <motion.div variants={itemVariants} className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-6">Fee Collection & Expenses</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={feeData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="income" name="Income" fill="#16A34A" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expense" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Pie Chart */}
                    <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-6">Today's Attendance</h3>
                        <div className="h-60 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={attendanceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {attendanceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] text-center">
                                <span className="text-2xl font-bold text-gray-800">97%</span>
                                <p className="text-xs text-gray-500">Present</p>
                            </div>
                        </div>
                        <div className="mt-4 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2 text-gray-600"><div className="w-2 h-2 rounded-full bg-green-600"></div> Present</span>
                                <span className="font-semibold text-gray-900">850</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2 text-gray-600"><div className="w-2 h-2 rounded-full bg-red-500"></div> Absent</span>
                                <span className="font-semibold text-gray-900">120</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

            </motion.div>
        </DashboardLayout>
    );
}
