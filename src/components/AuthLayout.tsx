import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface AuthLayoutProps {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center relative bg-gray-900">
            {/* Outer Background Image */}
            <div className="absolute inset-0">
                <Image
                    src="/KAASLOGO.jpeg"
                    alt="Background"
                    fill
                    className="object-cover opacity-60 blur-sm"
                    priority
                />
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Centered Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-1/3 bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row m-4"
            >
                {/* Right Side (Form) */}
                <div className="w-full p-8 md:p-12 flex items-center justify-center bg-white">
                    <div className="w-full  space-y-6">
                        {children}
                    </div>
                </div>

            </motion.div>
        </div>
    );
}
