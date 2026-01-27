import { CheckCircle, ArrowRight } from "lucide-react";
import Image from "next/image";
import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center w-full max-w-xl px-6 py-12 bg-white rounded-2xl shadow-lg">
        <div className="mb-8 flex flex-col items-center">
          <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-yellow-300/20 mb-6">
            {/* Custom logo shape using Lucide icons or SVG */}
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="24" fill="#FFD23F" />
              <path d="M36 24C36 31.732 28.8366 38 20 38C19.3347 38 18.6772 37.9702 18.0292 37.9116C25.1634 37.9116 31 31.732 31 24C31 16.268 25.1634 10.0884 18.0292 10.0884C18.6772 10.0298 19.3347 10 20 10C28.8366 10 36 16.268 36 24Z" fill="#02070fff" />
            </svg>
          </div>
          <h1 className="text-3xl font-serif font-bold text-blue-950 text-center mb-2">Easy School Management</h1>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-blue-950" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-blue-950" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          </div>
        </div>
        <form className="w-full flex flex-col items-center">
          <label className="flex items-center mb-8 cursor-pointer select-none">
            <input type="checkbox" className="form-checkbox accent-blue-950 w-5 h-5 mr-2" defaultChecked />
            <span className="text-blue-950 text-sm font-medium">Accept Terms & Conditions</span>
          </label>
          <div className="flex w-full gap-4 justify-center">
            <button
              type="button"
              className="flex-1 border-2 border-yellow-400 text-blue-950 rounded-full py-2 px-4 font-semibold duration-300 hover:bg-blue-950 hover:text-white hover:border-blue-950"
            >
              Already Have an Account
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-yellow-400 text-blue-950 rounded-full py-2 px-8 font-bold duration-300 hover:bg-blue-950 hover:text-yellow-400"
            >
              NEXT <ArrowRight size={20}/>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// Removed stray JSX code that was outside the Home component
