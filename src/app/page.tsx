import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center w-full max-w-xl p-6 bg-white rounded-2xl shadow-lg">
        <div className="flex items-center justify-center bg-white">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-5">
              <div className="overflow-hidden">
                <Image
                  src="/KAASLOGO.jpeg"
                  alt="Kaas Logo"
                  width={100}
                  height={100}
                  className="w-30 h-30 object-cover rounded-full "
                  priority
                />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-xl font-bold text-green-700 mb-1">
              Kaas Montessori
            </h1>
            <p className="text-blue-900 text-sm font-medium mb-2">
              School Management System
            </p>

            {/* Dots */}
            <div className="flex justify-center gap-2 mb-5">
              <span className="w-2 h-2 rounded-full bg-green-700" />
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="w-2 h-2 rounded-full bg-yellow-300" />
            </div>

            {/* Terms */}
            <label className="flex items-center justify-center gap-2 mb-6 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 accent-green-700"
              />
              <span className="text-green-700 text-sm font-medium">
                Accept Terms & Conditions
              </span>
            </label>

            {/* Buttons */}
            <div className="flex gap-3">
              <Link href="/Login" className="flex-2">
                <button
                  type="button"
                  className="w-full whitespace-nowrap border-2 border-green-700 text-green-700 rounded-full p-2 text-sm font-semibold transition hover:bg-green-700 hover:text-white"
                >
                  Already Have an Account
                </button>
              </Link>

              <Link href="/Register" className="flex-1">
                <button
                  type="button"
                  className="w-full whitespace-nowrap flex items-center justify-center gap-1 bg-yellow-400 text-green-900 rounded-full p-2 text-sm font-bold transition hover:bg-yellow-500"
                >
                  NEXT <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

            {/* Footer */}
            <p className="mt-8 text-xs text-green-700">
              powered by <span className="font-semibold">synxdev</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
