"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "../../components/AuthLayout";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { motion, Variants } from "framer-motion";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

type LoginResponse = {
  status: string;
  message: string;
  data: {
    token: string;
    onboardingRequired: boolean;
    user: {
      id: string;
      email: string;
      schoolId?: string;
      branchId?: string;
      role?: string;
    };
  };
};

const friendlyFetchError = (error: unknown): string => {
  if (error instanceof TypeError && error.message.toLowerCase().includes("failed to fetch")) {
    return "Unable to reach the API server. Check backend is running and CORS allows this frontend origin.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to login right now.";
};

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json()) as Partial<LoginResponse> & { message?: string };
      if (!response.ok || !payload?.data?.token) {
        throw new Error(payload?.message ?? "Login failed");
      }

      localStorage.setItem("kaas_token", payload.data.token);

      if (payload.data.onboardingRequired) {
        router.push("/Register");
        return;
      }

      if (payload.data.user.schoolId) {
        localStorage.setItem("kaas_school_id", payload.data.user.schoolId);
      }
      if (payload.data.user.branchId) {
        localStorage.setItem("kaas_branch_id", payload.data.user.branchId);
      }

      router.push("/AdminDashboard");
    } catch (error) {
      setErrorMessage(friendlyFetchError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className=" text-left">
        <motion.div variants={itemVariants} className="flex gap-4 mb-8">
          <Button variant="primary" className="px-8 rounded-full">Login</Button>
          <Link href="/Register">
            <Button variant="ghost" className="px-8 rounded-full text-gray-400 hover:text-gray-900">Register</Button>
          </Link>
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-3xl font-bold tracking-tight text-gray-900">Welcome</motion.h1>
        <motion.p variants={itemVariants} className="text-sm text-gray-500">
          Please login to your account
        </motion.p>
      </motion.div>

      <motion.form variants={containerVariants} initial="hidden" animate="visible" className="space-y-2 mt-8" onSubmit={submit}>
        <motion.div variants={itemVariants} className="space-y-4">
          <Input
            id="email"
            placeholder="Username or Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Input
            id="password"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <Link href="/forgot-password" className="text-sm font-medium text-gray-500 hover:text-green-600">
            Forgot Password
          </Link>
          <Button type="submit" className="w-24 rounded-full" isLoading={isLoading}>
            {isLoading ? "..." : "OK"}
          </Button>
        </motion.div>
      </motion.form>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mt-8 pt-2 text-center space-y-2">
        <motion.p variants={itemVariants} className="text-xs text-center text-gray-400">
          Terms and Conditions & Privacy Policy
        </motion.p>
      </motion.div>
    </AuthLayout>
  );
}
