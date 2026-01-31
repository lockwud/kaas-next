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
                    src="/outer-bg.png"
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
                className="relative z-10 w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row m-4"
            >

                {/* Left Side (Image) */}
                <div className="hidden lg:block lg:w-1/2 relative bg-gray-100">
                    <div className="absolute inset-0">
                        <Image
                            src="/auth-bg.png"
                            alt="Workspace"
                            fill
                            className="object-cover"
                        />
                        {/* Floating Logo Card Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center justify-center w-28 h-28">
                                <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center transform -rotate-12">
                                    <div className="w-7 h-7 bg-black rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side (Form) */}
                <div className="w-full lg:w-1/2 p-8 md:p-12 flex items-center justify-center bg-white">
                    <div className="w-full max-w-md space-y-6">
                        {children}
                    </div>
                </div>

            </motion.div>
        </div>
    );
}
