"use client";

import React from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { AlertTriangle, BookOpen, CalendarDays, CheckCircle2, ClipboardList, Filter, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion, Variants } from "framer-motion";
import { assessments, getStudentName, reports, students, uploadJobs, users } from "../../lib/school-data";

export default function AdminDashboard() {
  const enrollmentByClass = Object.entries(
    students.reduce<Record<string, number>>((acc, student) => {
      acc[student.className] = (acc[student.className] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([className, count]) => ({ className, count }));

  const reportChannelData = [
    { name: "WhatsApp", count: reports.filter((report) => report.deliveryChannels.includes("whatsapp")).length },
    { name: "Email", count: reports.filter((report) => report.deliveryChannels.includes("email")).length },
    { name: "PDF", count: reports.filter((report) => report.deliveryChannels.includes("pdf_download")).length },
  ];

  const recentlyAdmittedStudents = [...students].slice(-3).reverse();

  const latestReports = [...reports].sort((a, b) => b.generatedAt.localeCompare(a.generatedAt)).slice(0, 3);

  const processingUploads = uploadJobs.filter((job) => job.status === "processing").length;
  const failedUploads = uploadJobs.filter((job) => job.status === "failed").length;
  const admittedApprovals = students.length;

  const avgScore = reports.length
    ? Math.round(reports.reduce((sum, report) => sum + report.scorePercent, 0) / reports.length)
    : 0;

  const cards = [
    { title: "Students", value: students.length, icon: <Users size={16} className="text-emerald-600" /> },
    { title: "Staff Users", value: users.length, icon: <BookOpen size={16} className="text-sky-600" /> },
    { title: "Assessments", value: assessments.length, icon: <ClipboardList size={16} className="text-indigo-600" /> },
    { title: "Reports Ready", value: reports.length, icon: <CheckCircle2 size={16} className="text-rose-600" /> },
  ];

  const pieColors = ["#22C55E", "#3B82F6", "#F59E0B"];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  };

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="h-[calc(100vh-9rem)] flex flex-col gap-4 overflow-hidden max-w-7xl mx-auto"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Dashboard</h2>
            <p className="text-xs text-slate-500">Academic operations overview</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="rounded-full border border-slate-200 bg-white px-1.5 py-1 flex items-center gap-1 shadow-sm">
              <button className="px-3 py-1.5 rounded-full text-slate-700 hover:bg-slate-100">Today</button>
              <button className="px-3 py-1.5 rounded-full text-slate-700 hover:bg-slate-100">This Week</button>
              <button className="px-3 py-1.5 rounded-full text-slate-700 hover:bg-slate-100">This Month</button>
              <button className="px-3 py-1.5 rounded-full text-slate-700 hover:bg-slate-100">All Time</button>
              <button className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-600 flex items-center justify-center">
                <CalendarDays size={14} />
              </button>
            </div>
            <button className="px-4 py-2 rounded-xl bg-slate-900 text-white flex items-center gap-1.5">
              <Filter size={13} />
              Filter
            </button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {cards.map((card) => (
            <div key={card.title} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">{card.title}</p>
                {card.icon}
              </div>
              <p className="text-2xl font-semibold text-slate-900 mt-1">{card.value}</p>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 flex-1 min-h-0">
          <motion.div variants={itemVariants} className="xl:col-span-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Student Management Overview</h3>
              <span className="text-xs text-slate-500">Using school records</span>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
              <MiniMetric label="Admissions Queue" value={uploadJobs.length} tone="emerald" />
              <MiniMetric label="Assessments Planned" value={assessments.length} tone="sky" />
              <MiniMetric label="Reports Processing" value={processingUploads} tone="amber" />
              <MiniMetric label="Approvals" value={admittedApprovals} tone="indigo" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-0">
              <div className="rounded-xl border border-slate-200 p-3 flex flex-col min-h-0">
                <p className="text-xs font-medium text-slate-700 mb-2">Enrollment by Class</p>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={enrollmentByClass}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="className" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 11 }} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0" }} />
                      <Bar dataKey="count" name="Students" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs font-medium text-slate-700 mb-2">Newly Admitted Students</p>
                <div className="space-y-2">
                  {recentlyAdmittedStudents.map((student) => (
                    <div key={student.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                      <p className="text-sm font-medium text-slate-800">{student.fullName}</p>
                      <p className="text-[11px] text-slate-500">
                        {student.className} {student.section} • {student.admissionNo}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="xl:col-span-4 grid grid-rows-2 gap-4 min-h-0">
            <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Report Delivery Channels</h3>
                <span className="text-xs text-slate-500">{reports.length} reports</span>
              </div>
              <div className="h-[200px] mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={reportChannelData} dataKey="count" nameKey="name" innerRadius={46} outerRadius={66} paddingAngle={3}>
                      {reportChannelData.map((entry, index) => (
                        <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2 text-[11px]">
                {reportChannelData.map((entry, index) => (
                  <div key={entry.name} className="rounded-md border border-slate-200 px-2 py-1 text-slate-600">
                    <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: pieColors[index % pieColors.length] }} />
                    {entry.name}: {entry.count}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">School Alerts</h3>
              <div className="space-y-2">
                <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-amber-900">Admissions in Review</p>
                    <p className="text-[11px] text-amber-700">{processingUploads} records pending validation</p>
                  </div>
                  <AlertTriangle size={14} className="text-amber-700 mt-0.5" />
                </div>
                <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-rose-900">Data Issues</p>
                    <p className="text-[11px] text-rose-700">{failedUploads} records need correction</p>
                  </div>
                  <AlertTriangle size={14} className="text-rose-700 mt-0.5" />
                </div>
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
                  <p className="text-xs font-medium text-emerald-900">Average Performance</p>
                  <p className="text-[11px] text-emerald-700">{avgScore}% from latest terminal reports</p>
                </div>
                <div className="rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-2">
                  <p className="text-xs font-medium text-indigo-900">Admissions Approved</p>
                  <p className="text-[11px] text-indigo-700">{admittedApprovals} students admitted</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-xs font-medium text-slate-700 mb-2">Latest Reports</p>
                <div className="space-y-2">
                  {latestReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between text-xs">
                      <span className="text-slate-700">{getStudentName(report.studentId)}</span>
                      <span className="font-semibold text-slate-900">{report.grade}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

function MiniMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "sky" | "amber" | "indigo";
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700",
    sky: "bg-sky-50 text-sky-700",
    amber: "bg-amber-50 text-amber-700",
    indigo: "bg-indigo-50 text-indigo-700",
  } as const;

  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <p className="text-[11px] text-slate-500">{label}</p>
      <div className="flex items-center justify-between mt-1">
        <p className="text-xl font-semibold text-slate-900">{value}</p>
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${tones[tone]}`}>Live</span>
      </div>
    </div>
  );
}
