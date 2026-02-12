"use client";

import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { Button } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";
import { Table } from "../../../components/ui/Table";
import { motion } from "framer-motion";
import { branches, getBranchName, uploadJobs, uploadTemplates, users } from "../../../lib/school-data";
import { Download, Upload } from "lucide-react";

interface UploadRow {
  id: string;
  template: string;
  fileName: string;
  branch: string;
  status: string;
  uploadedBy: string;
  rows: string;
}

export default function DataCenterPage() {
  const [selectedBranch, setSelectedBranch] = React.useState("all");

  const rows: UploadRow[] = uploadJobs
    .filter((job) => (selectedBranch === "all" ? true : job.branchId === selectedBranch))
    .map((job) => ({
      id: job.id,
      template: uploadTemplates.find((template) => template.id === job.templateId)?.name ?? "Unknown",
      fileName: job.fileName,
      branch: getBranchName(job.branchId),
      status: job.status,
      uploadedBy: users.find((user) => user.id === job.uploadedBy)?.fullName ?? "Unknown",
      rows: `${job.successfulRows}/${job.totalRows}`,
    }));

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Data Center</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage bulk uploads with Excel templates and monitor import progress by branch.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <div className="grid md:grid-cols-3 gap-3">
            <Select
              label="Branch"
              value={selectedBranch}
              onChange={(event) => setSelectedBranch(event.target.value)}
              options={[{ value: "all", label: "All Branches" }, ...branches.map((branch) => ({ value: branch.id, label: branch.name }))]}
            />
            <Select
              label="Template"
              options={uploadTemplates.map((template) => ({
                value: template.id,
                label: template.name,
              }))}
            />
            <div className="flex gap-2">
              <Button variant="outline" className="w-full h-11 text-xs border-gray-200 text-gray-600">
                <Download size={14} className="mr-1" /> Download Template
              </Button>
              <Button className="w-full h-11 text-xs">
                <Upload size={14} className="mr-1" /> Upload Excel
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {uploadTemplates.map((template) => (
              <div key={template.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50">
                <p className="font-semibold text-gray-800">{template.name}</p>
                <p className="text-gray-500 mt-1">Columns: {template.requiredColumns.join(", ")}</p>
              </div>
            ))}
          </div>
        </div>

        <Table
          columns={[
            { header: "Template", accessor: "template" },
            { header: "File", accessor: "fileName" },
            { header: "Branch", accessor: "branch" },
            { header: "Status", accessor: "status" },
            { header: "Uploaded By", accessor: "uploadedBy" },
            { header: "Rows", accessor: "rows" },
          ]}
          data={rows}
        />
      </motion.div>
    </DashboardLayout>
  );
}
