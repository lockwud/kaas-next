"use client";

import React from "react";
import DashboardLayout from "../../../../components/DashboardLayout";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { Select } from "../../../../components/ui/Select";
import { Table } from "../../../../components/ui/Table";
import { motion } from "framer-motion";
import { assessments, branches, getBranchName } from "../../../../lib/school-data";

interface AssessmentRow {
  id: string;
  branch: string;
  className: string;
  subject: string;
  term: string;
  maxScore: number;
  assessmentDate: string;
}

export default function AssessmentsPage() {
  const [selectedBranch, setSelectedBranch] = React.useState("all");

  const rows: AssessmentRow[] = assessments
    .filter((assessment) => (selectedBranch === "all" ? true : assessment.branchId === selectedBranch))
    .map((assessment) => ({
      id: assessment.id,
      branch: getBranchName(assessment.branchId),
      className: assessment.className,
      subject: assessment.subject,
      term: assessment.term.replace("_", " "),
      maxScore: assessment.maxScore,
      assessmentDate: assessment.assessmentDate,
    }));

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Assessment Builder</h2>
          <p className="text-gray-500 text-sm mt-1">
            Create branch-scoped assessments and prepare marks for terminal report generation.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 grid md:grid-cols-4 gap-4 items-end">
          <Select
            label="Branch"
            value={selectedBranch}
            onChange={(event) => setSelectedBranch(event.target.value)}
            options={[{ value: "all", label: "All Branches" }, ...branches.map((branch) => ({ value: branch.id, label: branch.name }))]}
          />
          <Input label="Class" placeholder="JSS 2" />
          <Input label="Subject" placeholder="Mathematics" />
          <Button className="w-full">Create Assessment</Button>
        </div>

        <Table
          columns={[
            { header: "Branch", accessor: "branch" },
            { header: "Class", accessor: "className" },
            { header: "Subject", accessor: "subject" },
            { header: "Term", accessor: "term" },
            { header: "Max Score", accessor: "maxScore" },
            { header: "Date", accessor: "assessmentDate" },
          ]}
          data={rows}
        />
      </motion.div>
    </DashboardLayout>
  );
}
