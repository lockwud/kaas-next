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

export default function Guardian() {
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
      <div className="absolute top-0 left-0 w-full h-[500px] bg-radial-gradient from-emerald-50/40 via-transparent to-transparent pointer-events-none -z-10" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="h-full flex flex-col gap-6 overflow-hidden max-w-7xl mx-auto py-6"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard</h2>
            <p className="text-sm font-medium text-slate-500">Academic operations overview</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-md p-1.5 flex items-center gap-1 shadow-sm">
              {["Today", "This Week", "This Month", "All Time"].map((tab) => (
                <button
                  key={tab}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${tab === "Today" ? "bg-slate-900 text-white shadow-md shadow-slate-200" : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                  {tab}
                </button>
              ))}
              <div className="w-px h-8 bg-slate-200 mx-1" />
              <button className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors">
                <CalendarDays size={16} />
              </button>
            </div>
            <button className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white flex items-center gap-2 text-xs font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
              <Filter size={14} />
              Filter
            </button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {cards.map((card, idx) => (
            <div
              key={card.title}
              className="group relative rounded-3xl border border-slate-200/50 bg-white/80 p-5 shadow-sm backdrop-blur-xl hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 ring-1 ring-slate-900/5 hover:ring-emerald-500/20 overflow-hidden"
            >
              {/* Decorative gradient corner */}
              <div className={`absolute -top-12 -right-12 w-24 h-24 blur-3xl rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-500 ${idx === 0 ? "bg-emerald-400" : idx === 1 ? "bg-sky-400" : idx === 2 ? "bg-indigo-400" : "bg-rose-400"
                }`} />

              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-2xl ${idx === 0 ? "bg-emerald-50 text-emerald-600" :
                  idx === 1 ? "bg-sky-50 text-sky-600" :
                    idx === 2 ? "bg-indigo-50 text-indigo-600" :
                      "bg-rose-50 text-rose-600"
                  }`}>
                  {React.cloneElement(card.icon as React.ReactElement<{ size: number }>, { size: 20 })}
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{card.title}</p>
                  <p className="text-3xl font-black text-slate-900 mt-1">{card.value.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100" />
                  ))}
                </div>
                <span className="text-[10px] text-slate-500 font-medium">+12% this week</span>
              </div>
            </div>
          ))}
        </motion.div>

        <div className="">
          <motion.div variants={itemVariants} className="xl:col-span-8 rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-md p-6 shadow-sm flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Student Management Overview</h3>
                <p className="text-xs text-slate-500 font-medium">Real-time enrollment and admission analytics</p>
              </div>
              <button className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                View Full Analytics
              </button>
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
                <div className="flex-1 min-h-[250px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={enrollmentByClass} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0EA5E9" stopOpacity={1} />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity={1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis
                        dataKey="className"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748B", fontSize: 11, fontWeight: 600 }}
                        dy={10}
                      />
                      <YAxis
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748B", fontSize: 11, fontWeight: 600 }}
                        dx={-10}
                      />
                      <Tooltip
                        cursor={{ fill: '#F8FAFC', radius: 8 }}
                        contentStyle={{
                          borderRadius: '16px',
                          border: 'none',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          padding: '12px'
                        }}
                      />
                      <Bar dataKey="count" name="Students" fill="url(#barGradient)" radius={[8, 8, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/60 bg-white/50 p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-widest">Newly Admitted Students</p>
                  <button className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-tight">View All</button>
                </div>
                <div className="space-y-3">
                  {recentlyAdmittedStudents.map((student) => (
                    <div key={student.id} className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-white/50 p-3 hover:bg-white hover:shadow-md hover:shadow-slate-200/50 transition-all duration-300">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs ring-2 ring-white shadow-sm group-hover:from-emerald-100 group-hover:to-emerald-50 group-hover:text-emerald-600 transition-all">
                        {student.fullName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 leading-tight">{student.fullName}</p>
                        <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                          {student.className} {student.section} • <span className="text-emerald-600 font-bold">{student.admissionNo}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reports & School alerts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <motion.div variants={itemVariants} className="rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-md p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Report Delivery</h3>
                <p className="text-xs text-slate-500 font-medium tracking-tight">Channel distribution for {reports.length} reports</p>
              </div>
              <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase ring-1 ring-emerald-100">Active</div>
            </div>
            <div className="h-[280px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportChannelData}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    stroke="none"
                  >
                    {reportChannelData.map((entry, index) => (
                      <Cell key={entry.name} fill={pieColors[index % pieColors.length]} className="focus:outline-none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      padding: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-3xl font-black text-slate-900">{reports.length}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reports</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-6">
              {reportChannelData.map((entry, index) => (
                <div key={entry.name} className="flex flex-col gap-1 rounded-2xl border border-slate-100 bg-white/50 p-3 transition-all hover:shadow-md">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full shadow-sm" style={{ background: pieColors[index % pieColors.length] }} />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{entry.name}</span>
                  </div>
                  <p className="text-lg font-black text-slate-900 px-3.5">{entry.count}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-md p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Intelligence & Alerts</h3>
                <p className="text-xs text-slate-500 font-medium tracking-tight">AI-powered system health monitoring</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="rounded-2xl bg-amber-50/50 border border-amber-100 p-4 transition-all hover:bg-amber-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                    <AlertTriangle size={16} />
                  </div>
                  <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Review</span>
                </div>
                <p className="text-2xl font-black text-slate-900">{processingUploads}</p>
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-tight mt-1">Pending Admissions</p>
              </div>
              <div className="rounded-2xl bg-rose-50/50 border border-rose-100 p-4 transition-all hover:bg-rose-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                    <AlertTriangle size={16} />
                  </div>
                  <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest">Critical</span>
                </div>
                <p className="text-2xl font-black text-slate-900">{failedUploads}</p>
                <p className="text-[10px] font-bold text-rose-600 uppercase tracking-tight mt-1">Correction Required</p>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                  <span className="text-xs font-black">{avgScore}%</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Average Performance</p>
                  <p className="text-xs text-emerald-600 font-semibold tracking-tight">Across all latest terminal reports</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white/50 p-4">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">Latest Performance Feed</p>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Today</span>
                </div>
                <div className="space-y-4">
                  {latestReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between text-sm group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                          {getStudentName(report.studentId).split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{getStudentName(report.studentId)}</span>
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-xs font-black ring-1 ${report.grade === 'A' ? 'bg-emerald-50 text-emerald-600 ring-emerald-100' :
                        report.grade === 'B' ? 'bg-sky-50 text-sky-600 ring-sky-100' :
                          'bg-amber-50 text-amber-600 ring-amber-100'
                        }`}>
                        {report.grade}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
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
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-700 border-emerald-100/50",
    sky: "from-sky-500/20 to-sky-500/5 text-sky-700 border-sky-100/50",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-700 border-amber-100/50",
    indigo: "from-indigo-500/20 to-indigo-500/5 text-indigo-700 border-indigo-100/50",
  } as const;

  return (
    <div className={`rounded-2xl border bg-linear-to-br transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 p-4 ${tones[tone]}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{label}</p>
      <div className="flex items-center justify-between mt-2">
        <p className="text-2xl font-black text-slate-900">{value}</p>
        <div className="flex items-center gap-1.5 bg-white/50 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/20">
          <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          <span className="text-[10px] font-bold uppercase">Live</span>
        </div>
      </div>
    </div>
  );
}
