import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface AuthLayoutProps {
    children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white px-4 py-8">
      <div className="absolute inset-0">
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/KAASLOGO.jpeg"
            alt="Background"
            width={1200}
            height={1200}
            className="h-auto w-[130vw] max-w-[1000px] min-w-[560px] opacity-45"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-linear-gradient-to-b from-white/72 via-white/68 to-slate-50/78" />
      </div>

      <div className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-emerald-100/45 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-sky-100/35 blur-3xl" />

      <div className="relative z-10 flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-md rounded-3xl border border-white/20 bg-white/95 p-8 shadow-2xl backdrop-blur-md sm:p-10"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
