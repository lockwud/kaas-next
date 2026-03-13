"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "../../components/AuthLayout";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { motion } from "framer-motion";
import { UsersRound, Building2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";

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

type RegisterStep = "personal" | "school";

export default function Register() {
  const { success, error: toastError } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState<RegisterStep>("personal");
  const [errorMessage, setErrorMessage] = React.useState("");

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

  const onFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrorMessage("");
  };

  const goToNextStep = () => {
    if (currentStep === "personal") {
      if (!form.proprietorFullName || !form.email || !form.password) {
        setErrorMessage("Please fill in all required fields");
        return;
      }
      if (!form.email.includes("@")) {
        setErrorMessage("Please enter a valid email address");
        return;
      }
      if (form.password.length < 6) {
        setErrorMessage("Password must be at least 6 characters");
        return;
      }
      setErrorMessage("");
      setCurrentStep("school");
    }
  };

  const goToPreviousStep = () => {
    setCurrentStep("personal");
    setErrorMessage("");
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    if (!form.schoolName || !form.schoolPhone || !form.schoolAddress || !form.schoolState || !form.schoolDistrict || !form.schoolRegistrationNumber || !form.branchName || !form.branchCode) {
      setErrorMessage("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

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
      localStorage.setItem("kaas_user_email", form.email);
      localStorage.setItem("kaas_user_name", form.proprietorFullName);
      localStorage.setItem("kaas_user_role", "Administrator");
      localStorage.setItem("kaas_school_name", form.schoolName);

      success("School setup completed successfully!");
      router.push("/AdminDashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to register right now.";
      setErrorMessage(message);
      toastError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Set Up Your School</h1>
          <p className="mt-1 text-sm text-slate-500">Complete the steps below to register your school</p>
        </div>

        {/* Step Indicator */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentStep("personal")}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              currentStep === "personal"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            <UsersRound size={16} />
            Personal Details
          </button>
          <div className="h-px w-8 bg-slate-300" />
          <button
            type="button"
            onClick={goToNextStep}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              currentStep === "school"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            <Building2 size={16} />
            School Details
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="max-h-[60vh] overflow-y-auto p-6">
            <form onSubmit={submit}>
              {currentStep === "personal" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Personal Details</h2>
                    <p className="text-sm text-slate-500">Enter your personal information to create an account</p>
                  </div>

                  <div className="mt-4 space-y-4">
                    <Input
                      name="proprietorFullName"
                      label="Full Name"
                      placeholder="e.g. Ade Kola"
                      value={form.proprietorFullName}
                      onChange={onFieldChange}
                      required
                    />
                    <Input
                      name="email"
                      label="Email Address"
                      placeholder="you@school.com"
                      type="email"
                      value={form.email}
                      onChange={onFieldChange}
                      required
                    />
                    <Input
                      name="password"
                      label="Password"
                      placeholder="Create a password"
                      type="password"
                      value={form.password}
                      onChange={onFieldChange}
                      required
                    />
                  </div>

                  {errorMessage && (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                      {errorMessage}
                    </p>
                  )}

                  <div className="mt-6 flex justify-end pt-2">
                    <Button type="button" onClick={goToNextStep} className="px-8">
                      Next Step
                    </Button>
                  </div>
                </motion.div>
              )}

              {currentStep === "school" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">School Details</h2>
                    <p className="text-sm text-slate-500">Enter your school information to complete setup</p>
                  </div>

                  <div className="mt-4 space-y-4">
                    <Input
                      name="schoolName"
                      label="School Name"
                      placeholder="KaaS Academy"
                      value={form.schoolName}
                      onChange={onFieldChange}
                      required
                    />
                    <Input
                      name="schoolPhone"
                      label="School Phone"
                      placeholder="+234..."
                      value={form.schoolPhone}
                      onChange={onFieldChange}
                      required
                    />
                    <Input
                      name="schoolAddress"
                      label="Address"
                      placeholder="12 Palm Street"
                      value={form.schoolAddress}
                      onChange={onFieldChange}
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        name="schoolState"
                        label="State"
                        placeholder="Lagos"
                        value={form.schoolState}
                        onChange={onFieldChange}
                        required
                      />
                      <Input
                        name="schoolDistrict"
                        label="District"
                        placeholder="Ikeja"
                        value={form.schoolDistrict}
                        onChange={onFieldChange}
                        required
                      />
                    </div>
                    <Input
                      name="schoolRegistrationNumber"
                      label="School Registration Number"
                      placeholder="KAAS-REG-001"
                      value={form.schoolRegistrationNumber}
                      onChange={onFieldChange}
                      required
                    />
                    <Input
                      name="schoolTaxNumber"
                      label="Tax Number (Optional)"
                      placeholder="KAAS-TAX-001"
                      value={form.schoolTaxNumber}
                      onChange={onFieldChange}
                    />
                    
                    <div className="border-t border-slate-200 pt-4">
                      <h3 className="mb-3 text-sm font-semibold text-slate-900">Branch Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          name="branchName"
                          label="Branch Name"
                          placeholder="Main Campus"
                          value={form.branchName}
                          onChange={onFieldChange}
                          required
                        />
                        <Input
                          name="branchCode"
                          label="Branch Code"
                          placeholder="MAIN"
                          value={form.branchCode}
                          onChange={onFieldChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {errorMessage && (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                      {errorMessage}
                    </p>
                  )}

                  <div className="mt-6 flex items-center justify-between pt-2">
                    <Button type="button" variant="outline" onClick={goToPreviousStep} className="px-6">
                      Back
                    </Button>
                    <Button type="submit" isLoading={isLoading} className="px-8">
                      {isLoading ? "Setting up..." : "Complete Setup"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </form>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/Login" className="font-medium text-emerald-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
