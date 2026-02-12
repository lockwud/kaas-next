"use client";

import React from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { BookOpen, Building2, ClipboardList, DollarSign, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion, Variants } from "framer-motion";
import { assessments, branches, reports, students, users } from "../../lib/school-data";

export default function AdminDashboard() {
  const stats = [
    { title: "Branches", value: branches.length, icon: <Building2 size={24} className="text-white" />, color: "bg-sky-600" },
    { title: "Students", value: students.length, icon: <Users size={24} className="text-white" />, color: "bg-emerald-600" },
    { title: "Staff Users", value: users.length, icon: <BookOpen size={24} className="text-white" />, color: "bg-orange-500" },
    { title: "Assessments", value: assessments.length, icon: <ClipboardList size={24} className="text-white" />, color: "bg-violet-600" },
    {
      title: "Report Deliveries",
      value: reports.reduce((count, report) => count + report.deliveryChannels.length, 0),
      icon: <DollarSign size={24} className="text-white" />,
      color: "bg-rose-500",
    },
  ];

  const reportChannelData = [
    {
      name: "WhatsApp",
      count: reports.filter((report) => report.deliveryChannels.includes("whatsapp")).length,
    },
    {
      name: "Email",
      count: reports.filter((report) => report.deliveryChannels.includes("email")).length,
    },
    {
      name: "PDF Download",
      count: reports.filter((report) => report.deliveryChannels.includes("pdf_download")).length,
    },
  ];

  const branchPopulation = branches.map((branch) => ({
    name: branch.name,
    students: students.filter((student) => student.branchId === branch.id).length,
  }));

  const COLORS = ["#16A34A", "#2563EB", "#F59E0B"];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <DashboardLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-gray-500">Single-school setup with branch-aware controls</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map((stat) => (
            <motion.div
              key={stat.title}
              variants={itemVariants}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
            >
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</h3>
              </div>
              <div className={`w-11 h-11 rounded-full flex items-center justify-center ${stat.color}`}>{stat.icon}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Students by Branch</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchPopulation}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6B7280" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7280" }} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "none" }} />
                  <Bar dataKey="students" name="Students" fill="#16A34A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Report Delivery Channels</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={reportChannelData} dataKey="count" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={3}>
                    {reportChannelData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={24} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
