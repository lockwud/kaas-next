"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AuthLayout from "../../components/AuthLayout";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { motion, Variants } from "framer-motion";
import { apiRequest } from "@/lib/api-client";
import { extractSessionTokens, setRoleKey, setSessionTokens } from "@/lib/auth-session";
import { useToast } from "@/hooks/useToast";

type LoginResponse = {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  onboardingRequired: boolean;
  user: {
    id: string;
    email: string;
    schoolId?: string;
    branchId?: string;
    role?: string;
    isActive: boolean;
  };
};

const formatRole = (role?: string): string => {
  if (!role) {
    return "General Manager";
  }

  return role
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export default function Login() {
  const { error: toastError } = useToast();
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
      const payload = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const tokens = extractSessionTokens(payload);
      if (!tokens) {
        throw new Error("Login response did not include a valid access token.");
      }

      const fallbackName = email.split("@")[0] || "User";

      setSessionTokens(tokens);
      localStorage.setItem("kaas_user_email", payload.user.email);
      localStorage.setItem("kaas_user_name", fallbackName);
      localStorage.setItem("kaas_user_role", formatRole(payload.user.role));
      setRoleKey(payload.user.role ?? "");
      localStorage.setItem("kaas_school_id", payload.user.schoolId ?? "");
      localStorage.setItem("kaas_branch_id", payload.user.branchId ?? "");
      localStorage.setItem("kaas_school_name", "Kaas School");

      if (payload.onboardingRequired) {
        router.push("/Register");
        return;
      }

      router.push("/AdminDashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to login right now.";
      setErrorMessage(message);
      toastError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-7 text-left">
        <motion.div variants={itemVariants} className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200">
          <Image
            src="/KAASLOGO.jpeg"
            alt="Kaas logo"
            width={48}
            height={48}
            className="rounded-full object-cover"
            priority
          />
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Kaas Portal</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sign in to continue</h1>
          <p className="text-sm text-slate-500">
            Use your assigned staff email and password to access your dashboard.
          </p>
        </motion.div>

        <motion.form variants={containerVariants} className="space-y-4" onSubmit={submit}>
          <motion.div variants={itemVariants}>
            <Input
              id="email"
              label="Email Address"
              placeholder="name@school.com"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Input
              id="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
            />
          </motion.div>

          {errorMessage && (
            <motion.p variants={itemVariants} className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {errorMessage}
            </motion.p>
          )}

          <motion.div variants={itemVariants} className="flex items-center justify-end">
            <Link href="/forgot-password" className="text-sm font-medium text-slate-500 transition-colors hover:text-emerald-700">
              Forgot password?
            </Link>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Button type="submit" fullWidth className="h-12 rounded-xl text-sm font-semibold" isLoading={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </motion.div>
        </motion.form>

        <motion.p variants={itemVariants} className="text-center text-xs text-slate-400">
          Authorized school staff access only.
        </motion.p>
      </motion.div>
    </AuthLayout>
  );
}
