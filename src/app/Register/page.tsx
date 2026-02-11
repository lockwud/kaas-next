"use client";

import Link from "next/link";
import AuthLayout from "../../components/AuthLayout";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { motion, Variants } from "framer-motion";
import { Select } from "@/components/ui/Select";

export default function Register() {
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
                        <Button variant="ghost" className="px-8  text-gray-400 hover:text-gray-900">Login</Button>
                    </Link>
                    <Button variant="primary" className="px-8 rounded-full">Register</Button>
                </motion.div>

                <motion.h1 variants={itemVariants} className="text-3xl font-bold tracking-tight text-gray-900">Welcome</motion.h1>
                <motion.p variants={itemVariants} className="text-sm text-gray-500">
                    Please register to your account
                </motion.p>
            </motion.div>

            <motion.form
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4 mt-8"
                onSubmit={(e) => e.preventDefault()}
            >
                <motion.div variants={itemVariants} className="space-y-4">
                    <Input
                        id="email"
                        placeholder="Enter Email Address"
                        type="email"
                        required
                    />
                    <Input
                        id="orgName"
                        placeholder="Enter Your Organization Name"
                        type="text"
                        required
                    />
                    <Input
                        id="schoolName"
                        placeholder="Enter Your School Name"
                        type="text"
                        required
                    />

                    <select name="dropdown" id="dropdown" className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 duration-200 border-gray-200">
                        <option value="select-one" >Select your role</option>
                        <option value="Headmaster">Headmaster</option>
                        <option value="Tutor">Tutor</option>
                        <option value="Student">Student</option>
                    </select>
                </motion.div>

                <motion.div variants={itemVariants} className="flex justify-end pt-3    ">
                    <Button type="submit" className="w-32 rounded-full">
                        Register
                    </Button>
                </motion.div>
            </motion.form>
        </AuthLayout>
    );
}