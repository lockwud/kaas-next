"use client";

import Link from "next/link";
import AuthLayout from "../../components/AuthLayout";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { motion, Variants } from "framer-motion";

export default function ForgotPassword() {
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

    return (
        <AuthLayout>
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className=" text-left"
            >
                <motion.div variants={itemVariants} className="flex gap-4 mb-8">
                    <Link href="/Login">
                        <Button variant="ghost" className="px-8  text-gray-400 hover:text-gray-900">Back onto Login</Button>
                    </Link>
                </motion.div>

                <motion.h1 variants={itemVariants} className="text-3xl font-bold tracking-tight text-gray-900">Forgot Password ?</motion.h1>
                <motion.p variants={itemVariants} className="text-sm text-gray-500">
                    Enter your email address to reset your password
                </motion.p>
            </motion.div>

            <motion.form
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4 mt-8"
                onSubmit={(e) => {
                    e.preventDefault();
                    // Handle password reset logic here
                    alert("Password reset link sent (mock)");
                }}
            >
                <motion.div variants={itemVariants} className="space-y-4">
                    <Input
                        id="email"
                        placeholder="Enter Email Address"
                        type="email"
                        required
                    />
                </motion.div>

                <motion.div variants={itemVariants} className="flex justify-end pt-3">
                    <Button type="submit" className="w-full rounded-full">
                        Send Reset Link
                    </Button>
                </motion.div>
            </motion.form>
        </AuthLayout>
    );
}
