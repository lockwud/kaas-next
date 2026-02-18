"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "../../components/AuthLayout";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { motion, Variants } from "framer-motion";

type RegisterResponse = {
  status: string;
  message: string;
  data: {
    token: string;
    onboardingRequired: boolean;
    user: {
      id: string;
      email: string;
      isActive: boolean;
      createdAt: string;
    };
  };
};

type OnboardResponse = {
  status: string;
  message: string;
  data: {
    school: { id: string; name: string; slug: string };
    branch: { id: string; name: string; code: string };
  };
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

const friendlyFetchError = (error: unknown): string => {
  if (error instanceof TypeError && error.message.toLowerCase().includes("failed to fetch")) {
    return "Unable to reach the API server. Check backend is running and CORS allows this frontend origin.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
};

export default function Register() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");

  const [form, setForm] = React.useState({
    proprietorFullName: "",
    email: "",
    password: "",
    schoolName: "",
    schoolPhone: "",
    schoolAddress: "",
    schoolState: "",
    schoolDistrict: "",
    schoolCountry: "Nigeria",
    schoolTimezone: "Africa/Lagos",
    schoolRegistrationNumber: "",
    schoolTaxNumber: "",
    branchName: "Main Campus",
    branchCode: "MAIN",
  });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.12,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  };

  const onFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const registerResponse = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const registerPayload = (await registerResponse.json()) as Partial<RegisterResponse> & { message?: string };
      if (!registerResponse.ok || !registerPayload?.data?.token) {
        throw new Error(registerPayload?.message ?? "Registration failed");
      }

      const token = registerPayload.data.token;

      const onboardingResponse = await fetch(`${API_BASE}/onboarding/school`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          proprietorFullName: form.proprietorFullName,
          school: {
            name: form.schoolName,
            email: form.email,
            phone: form.schoolPhone,
            address: form.schoolAddress,
            state: form.schoolState,
            district: form.schoolDistrict,
            country: form.schoolCountry,
            timezone: form.schoolTimezone,
            registrationNumber: form.schoolRegistrationNumber,
            taxNumber: form.schoolTaxNumber || undefined,
          },
          branch: {
            code: form.branchCode,
            name: form.branchName,
            email: form.email,
            phone: form.schoolPhone,
            address: form.schoolAddress,
            state: form.schoolState,
            district: form.schoolDistrict,
            country: form.schoolCountry,
            timezone: form.schoolTimezone,
            registrationNumber: `${form.schoolRegistrationNumber}-BR1`,
            taxNumber: form.schoolTaxNumber || undefined,
          },
        }),
      });

      const onboardingPayload = (await onboardingResponse.json()) as Partial<OnboardResponse> & { message?: string };
      if (!onboardingResponse.ok || !onboardingPayload?.data?.school?.id) {
        throw new Error(onboardingPayload?.message ?? "School onboarding failed");
      }

      localStorage.setItem("kaas_token", token);
      localStorage.setItem("kaas_school_id", onboardingPayload.data.school.id);
      localStorage.setItem("kaas_branch_id", onboardingPayload.data.branch.id);
      localStorage.setItem("kaas_user_name", form.proprietorFullName);
      localStorage.setItem("kaas_user_email", form.email);
      localStorage.setItem("kaas_user_role", "Proprietor");
      localStorage.setItem("kaas_school_name", form.schoolName);

      setSuccessMessage("Registration and school onboarding completed.");
      router.push("/AdminDashboard");
    } catch (error) {
      setErrorMessage(friendlyFetchError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="text-left">
        <motion.div variants={itemVariants} className="flex gap-4 mb-6">
          <Link href="/Login">
            <Button variant="ghost" className="px-8 text-gray-400 hover:text-gray-900">
              Login
            </Button>
          </Link>
          <Button variant="primary" className="px-8 rounded-full">
            Register
          </Button>
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-3xl font-bold tracking-tight text-gray-900">
          Set Up Your School
        </motion.h1>
        <motion.p variants={itemVariants} className="text-sm text-gray-500 mt-1">
          Quick onboarding in two steps: Personal details and School details.
        </motion.p>
      </motion.div>

      <motion.form
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-5 mt-8"
        onSubmit={submit}
      >
        <motion.section variants={itemVariants} className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Personal Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="proprietorFullName" label="Full Name" placeholder="e.g. Ade Kola" value={form.proprietorFullName} onChange={onFieldChange} required />
            <Input name="email" label="Email" placeholder="you@school.com" type="email" value={form.email} onChange={onFieldChange} required />
            <Input name="password" label="Password" placeholder="Create password" type="password" value={form.password} onChange={onFieldChange} required />
          </div>
        </motion.section>

        <motion.section variants={itemVariants} className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">School Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="schoolName" label="School Name" placeholder="KaaS Academy" value={form.schoolName} onChange={onFieldChange} required />
            <Input name="schoolPhone" label="School Phone" placeholder="+234..." value={form.schoolPhone} onChange={onFieldChange} required />
            <Input name="schoolAddress" label="Address" placeholder="12 Palm Street" value={form.schoolAddress} onChange={onFieldChange} required />
            <Input name="schoolState" label="State" placeholder="Lagos" value={form.schoolState} onChange={onFieldChange} required />
            <Input name="schoolDistrict" label="District" placeholder="Ikeja" value={form.schoolDistrict} onChange={onFieldChange} required />
            <Input name="schoolRegistrationNumber" label="Registration Number" placeholder="KAAS-REG-001" value={form.schoolRegistrationNumber} onChange={onFieldChange} required />
            <Input name="branchName" label="First Branch Name" placeholder="Main Campus" value={form.branchName} onChange={onFieldChange} required />
            <Input name="branchCode" label="First Branch Code" placeholder="MAIN" value={form.branchCode} onChange={onFieldChange} required />
            <Input name="schoolTaxNumber" label="Tax Number (Optional)" placeholder="KAAS-TAX-001" value={form.schoolTaxNumber} onChange={onFieldChange} />
          </div>
        </motion.section>

        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
        {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

        <motion.div variants={itemVariants} className="flex justify-end pt-2">
          <Button type="submit" className="w-44 rounded-full" isLoading={isLoading}>
            {isLoading ? "Submitting" : "Create Account"}
          </Button>
        </motion.div>
      </motion.form>
    </AuthLayout>
  );
}
