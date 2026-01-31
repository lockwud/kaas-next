"use client";

import Link from "next/link";
import AuthLayout from "../../components/AuthLayout";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { motion, Variants } from "framer-motion";

export default function Login() {
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

            <motion.form
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-2 mt-8"
                onSubmit={(e) => e.preventDefault()}
            >
                <motion.div variants={itemVariants} className="space-y-4">
                    <Input
                        id="email"
                        placeholder="Username or Email"
                        type="email"
                        required
                    />
                    <Input
                        id="password"
                        placeholder="Password"
                        type="password"
                        required
                    />
                </motion.div>

                <motion.div variants={itemVariants} className="flex items-center justify-between">
                    <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-gray-500 hover:text-green-600"
                    >
                        Forgot Password
                    </Link>
                    <Button type="submit" className="w-24 rounded-full">
                        OK
                    </Button>
                </motion.div>
            </motion.form>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mt-8 pt-2 text-center space-y-2"
            >
                <motion.div variants={itemVariants}>
                    <Link href="/Register">
                        <Button variant="outline" fullWidth className="rounded-full py-6 text-gray-500 border-gray-200">
                            Register your School in Our App
                        </Button>
                    </Link>
                </motion.div>
                <motion.p variants={itemVariants} className="text-xs text-center text-gray-400">
                    Terms and Conditions & Privacy Policy
                </motion.p>
            </motion.div>

        </AuthLayout>
    );
}