"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Button } from "../../../../components/ui/Button";
import { Select } from "../../../../components/ui/Select";
import { Table } from "../../../../components/ui/Table";
import { motion } from "framer-motion";
import { branches, getBranchName, getStudentName, reports } from "../../../../lib/school-data";
import { Mail, MessageCircle, FileDown } from "lucide-react";

interface ReportRow {
  id: string;
  branch: string;
  student: string;
  className: string;
  term: string;
  scorePercent: string;
  grade: string;
  channels: string;
}

export default function ReportsPage() {
  const [selectedBranch, setSelectedBranch] = React.useState("all");

  const rows: ReportRow[] = reports
    .filter((report) => (selectedBranch === "all" ? true : report.branchId === selectedBranch))
    .map((report) => ({
      id: report.id,
      branch: getBranchName(report.branchId),
      student: getStudentName(report.studentId),
      className: report.className,
      term: report.term.replace("_", " "),
      scorePercent: `${report.scorePercent}%`,
      grade: report.grade,
      channels: report.deliveryChannels.join(", "),
    }));

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Terminal Report Center</h2>
          <p className="text-gray-500 text-sm mt-1">
            Generate term reports and deliver through WhatsApp, email, or direct PDF download.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 grid md:grid-cols-5 gap-4 items-end">
          <Select
            label="Branch"
            value={selectedBranch}
            onChange={(event) => setSelectedBranch(event.target.value)}
            options={[{ value: "all", label: "All Branches" }, ...branches.map((branch) => ({ value: branch.id, label: branch.name }))]}
          />
          <Select
            label="Term"
            options={[
              { value: "first_term", label: "First Term" },
              { value: "second_term", label: "Second Term" },
              { value: "third_term", label: "Third Term" },
            ]}
          />
          <Button className="w-full">
            <MessageCircle size={15} className="mr-1" /> Send WhatsApp
          </Button>
          <Button className="w-full" variant="outline">
            <Mail size={15} className="mr-1" /> Send Email
          </Button>
          <Button className="w-full" variant="outline">
            <FileDown size={15} className="mr-1" /> Download PDF
          </Button>
        </div>

        <Table
          columns={[
            { header: "Branch", accessor: "branch" },
            { header: "Student", accessor: "student" },
            { header: "Class", accessor: "className" },
            { header: "Term", accessor: "term" },
            { header: "Score", accessor: "scorePercent" },
            { header: "Grade", accessor: "grade" },
            { header: "Channels", accessor: "channels" },
          ]}
          data={rows}
        />
      </motion.div>
    </DashboardLayout>
  );
}
