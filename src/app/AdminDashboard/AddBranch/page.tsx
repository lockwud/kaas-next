"use client";

import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";
import { motion, Variants } from "framer-motion";
import { branches as initialBranches } from "../../../lib/school-data";
import { Branch } from "../../../types/school";
import { Download, Upload } from "lucide-react";

interface BranchFormState {
  billingName: string;
  organizationWebsite: string;
  timezone: string;
  email: string;
  contactNumber: string;
  registrationNumber: string;
  organizationCode: string;
  address: string;
  state: string;
  district: string;
  country: string;
  pincode: string;
  taxNumber: string;
  gstInfo: string;
}

const defaultForm: BranchFormState = {
  billingName: "",
  organizationWebsite: "",
  timezone: "Africa/Lagos",
  email: "",
  contactNumber: "",
  registrationNumber: "",
  organizationCode: "",
  address: "",
  state: "",
  district: "",
  country: "Nigeria",
  pincode: "",
  taxNumber: "",
  gstInfo: "",
};

export default function AddBranch() {
  const [form, setForm] = React.useState<BranchFormState>(defaultForm);
  const [branchList, setBranchList] = React.useState<Branch[]>(initialBranches);

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" },
    },
  };

  const onFieldChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onCreateBranch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.billingName || !form.organizationCode || !form.email || !form.contactNumber) {
      return;
    }

    const branch: Branch = {
      id: `branch_${Date.now()}`,
      schoolId: "school_001",
      code: form.organizationCode.trim().toUpperCase(),
      name: form.billingName,
      email: form.email,
      phone: form.contactNumber,
      address: form.address,
      state: form.state,
      district: form.district,
      country: form.country,
      timezone: form.timezone,
      registrationNumber: form.registrationNumber,
      taxNumber: form.taxNumber,
      isActive: true,
    };

    setBranchList((prev) => [branch, ...prev]);
    setForm(defaultForm);
  };

  return (
    <DashboardLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Create School Branch</h2>
              <p className="text-sm text-gray-500 mt-1">
                One school can run multiple branches. Every user, class, student, and report is scoped by `branchId`.
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="h-10 text-xs border-gray-200 text-gray-600">
                <Download size={14} className="mr-1" />
                Download Branch Template
              </Button>
              <Button type="button" variant="outline" className="h-10 text-xs border-gray-200 text-gray-600">
                <Upload size={14} className="mr-1" />
                Upload Excel
              </Button>
            </div>
          </div>

          <form className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-6" onSubmit={onCreateBranch}>
            <div className="space-y-5">
              <Input label="Branch Name" name="billingName" value={form.billingName} onChange={onFieldChange} placeholder="Main Campus" />
              <Input
                label="Organization Website"
                name="organizationWebsite"
                value={form.organizationWebsite}
                onChange={onFieldChange}
                placeholder="www.school.com"
              />
              <Select
                label="Time-zone"
                name="timezone"
                value={form.timezone}
                onChange={onFieldChange}
                options={[
                  { value: "Africa/Lagos", label: "Africa/Lagos" },
                  { value: "Africa/Accra", label: "Africa/Accra" },
                  { value: "UTC", label: "UTC" },
                ]}
              />
              <Input label="Email" type="email" name="email" value={form.email} onChange={onFieldChange} placeholder="admin@school.com" />
              <Input
                label="Contact Number"
                name="contactNumber"
                value={form.contactNumber}
                onChange={onFieldChange}
                placeholder="+234 8012345678"
              />
              <Input
                label="Registration Number"
                name="registrationNumber"
                value={form.registrationNumber}
                onChange={onFieldChange}
                placeholder="REG-12345"
              />
              <Input
                label="Organization Code"
                name="organizationCode"
                value={form.organizationCode}
                onChange={onFieldChange}
                placeholder="MAIN"
              />
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Address</label>
                <textarea
                  className="w-full min-h-28 rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
                  placeholder="Enter full address"
                  name="address"
                  value={form.address}
                  onChange={onFieldChange}
                />
              </div>
              <Input label="State" name="state" value={form.state} onChange={onFieldChange} placeholder="Lagos" />
              <Input label="District" name="district" value={form.district} onChange={onFieldChange} placeholder="Ikeja" />
              <Select
                label="Country"
                name="country"
                value={form.country}
                onChange={onFieldChange}
                options={[
                  { value: "Nigeria", label: "Nigeria" },
                  { value: "Ghana", label: "Ghana" },
                ]}
              />
              <Input label="Pincode" name="pincode" value={form.pincode} onChange={onFieldChange} placeholder="100001" />
              <Input label="Tax Number" name="taxNumber" value={form.taxNumber} onChange={onFieldChange} placeholder="TAX-8899" />
              <Input label="GST / VAT Info" name="gstInfo" value={form.gstInfo} onChange={onFieldChange} placeholder="VAT Number" />
            </div>

            <div className="lg:col-span-2 flex justify-end pt-4 mt-2 border-t border-gray-100">
              <Button type="submit" className="w-44 rounded-full">
                Save Branch
              </Button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Registered Branches</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="p-3 text-left">Code</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Location</th>
                  <th className="p-3 text-left">Contact</th>
                  <th className="p-3 text-left">Timezone</th>
                </tr>
              </thead>
              <tbody>
                {branchList.map((branch) => (
                  <tr key={branch.id} className="border-t border-gray-100">
                    <td className="p-3 font-semibold text-gray-800">{branch.code}</td>
                    <td className="p-3 text-gray-700">{branch.name}</td>
                    <td className="p-3 text-gray-600">{branch.district}, {branch.state}</td>
                    <td className="p-3 text-gray-600">{branch.email}</td>
                    <td className="p-3 text-gray-600">{branch.timezone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
