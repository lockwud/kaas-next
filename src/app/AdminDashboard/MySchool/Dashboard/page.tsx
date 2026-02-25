"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  FileEdit,
  Database,
  ChevronRight,
  TrendingUp,
  LayoutDashboard,
  Calendar
} from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import Link from "next/link";
import { students, users } from "../../../../lib/school-data";

export default function MySchoolDashboard() {
  const setupModules = [
    {
      title: "Classes",
      count: "12 Groups",
      icon: <BookOpen />,
      color: "bg-blue-500",
      path: "/AdminDashboard/Academics/Sections",
      desc: "Manage grade levels, sections and streams."
    },
    {
      title: "Assessments",
      count: "24 Pending",
      icon: <ClipboardCheck />,
      color: "bg-emerald-500",
      path: "/AdminDashboard/Academics/Assessments",
      desc: "Input grades and manage terminal exams."
    },
    {
      title: "Terminal Reports",
      count: "85% Done",
      icon: <FileEdit />,
      color: "bg-indigo-500",
      path: "/AdminDashboard/Academics/Reports",
      desc: "Generate and print end-of-term comments."
    },
    {
      title: "Data Center",
      count: "2.4GB Sync",
      icon: <Database />,
      color: "bg-amber-500",
      path: "/AdminDashboard/Settings/Backup",
      desc: "Export school records and sync archives."
    }
  ];

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My School Management</h1>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-500" />
              School setup is active and synchronized.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="text-xs h-9 bg-white border-slate-200">
              <Calendar size={14} className="mr-2" /> Academic Calendar
            </Button>
            <Button className="text-xs h-9 bg-slate-900 text-white hover:bg-slate-800">
              <LayoutDashboard size={14} className="mr-2" /> Full Overview
            </Button>
          </div>
        </div>

        {/* Top Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Total Faculty"
            value={users.filter(u => u.role !== 'student' && u.role !== 'proprietor').length}
            subtitle="+2 New this month"
            icon={<Users size={20} />}
            color="emerald"
          />
          <MetricCard
            title="Active Students"
            value={students.length}
            subtitle="89% Attendance today"
            icon={<GraduationCap size={20} />}
            color="blue"
          />
          <MetricCard
            title="Average GPA"
            value="3.2"
            subtitle="0.4% improvement"
            icon={<TrendingUp size={20} />}
            color="indigo"
          />
        </div>

        {/* Workflow Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {setupModules.map((module, idx) => (
            <Link key={idx} href={module.path}>
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-lg hover:border-emerald-200 transition-all cursor-pointer group h-full flex flex-col"
              >
                <div className={`h-12 w-12 rounded-xl ${module.color} text-white flex items-center justify-center mb-4 shadow-md`}>
                  {React.cloneElement(module.icon as React.ReactElement<any>, { size: 24 })}
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors uppercase tracking-tight text-xs">{module.title}</h3>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-2xl font-black text-slate-800 mb-2">{module.count}</p>
                <p className="text-xs text-slate-500 leading-relaxed mt-auto">
                  {module.desc}
                </p>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Data Sync Status */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
          <div className="relative z-10">
            <h4 className="font-bold flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Cloud Synchronization
            </h4>
            <p className="text-xs text-slate-400 mt-2">
              Last backup was successful today at 04:22 AM. All academic records are secured.
            </p>
          </div>
          <div className="flex gap-3 relative z-10 w-full md:w-auto">
            <Button variant="ghost" className="flex-1 md:flex-none text-white hover:bg-white/10 text-xs border border-white/20">View Records</Button>
            <Button className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6">Access Data Center</Button>
          </div>
          <Database size={120} className="absolute -right-6 -bottom-6 text-white/5 group-hover:scale-110 transition-transform" />
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

function MetricCard({ title, value, subtitle, icon, color }: any) {
  const colors: any = {
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100"
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center gap-5">
      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-3xl font-black text-slate-900 my-0.5">{value}</h3>
        <p className="text-[11px] text-slate-500 font-medium italic">{subtitle}</p>
      </div>
    </div>
  );
}

function CheckCircle({ size, className }: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
