"use client";

import React from "react";
import Link from "next/link";
import {
  Bell,
  BookOpen,
  Building2,
  Calendar,
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  PlusCircle,
  School,
  Settings,
  Table2,
  UserCircle,
  Users,
  FileText,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { branches } from "../lib/school-data";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;
  const isAcademicsActive = pathname.startsWith("/AdminDashboard/Academics");

  const isMySchoolActive = [
    "/AdminDashboard/MySchool",
    "/AdminDashboard/MySchool/Dashboard",
    "/AdminDashboard/MySchool/Supports",
  ].includes(pathname);

  const isSchoolManagementActive = [
    "/AdminDashboard",
    "/AdminDashboard/AddBranch",
    "/AdminDashboard/Academics",
    "/AdminDashboard/Sessions",
    "/AdminDashboard/Academics/Assessments",
    "/AdminDashboard/Academics/Reports",
    "/AdminDashboard/DataCenter",
  ].includes(pathname);

  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    mySchool: isMySchoolActive,
    schoolManagement: isSchoolManagementActive,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside
        className={`${isSidebarOpen ? "w-64" : "w-20"} bg-[#0F172A] text-white duration-500 flex flex-col fixed h-full z-20 border-r border-slate-800 shadow-2xl`}
      >
        <div
          className={`h-20 flex items-center border-b border-slate-800/60 mb-4 transition-all duration-300 ${isSidebarOpen ? "px-6 mx-4" : "justify-center mx-2"}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/20 shrink-0">
              <div className="w-5 h-5 bg-[#0F172A] rounded-lg" />
            </div>
            {isSidebarOpen && (
              <span className="font-bold text-xl tracking-tight text-slate-100 whitespace-nowrap overflow-hidden">
                Kaas 
              </span>
            )}
          </div>
        </div>

        <div className={`mb-6 transition-all duration-300 ${isSidebarOpen ? "px-4" : "px-2"}`}>
          <div
            className={`bg-slate-800/40 rounded-xl border border-slate-700/50 backdrop-blur-sm flex items-center gap-3 group hover:bg-slate-800/60 transition-colors cursor-pointer ${isSidebarOpen ? "p-3" : "p-2 justify-center"}`}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-bold text-slate-900 shadow-md shrink-0">
              CO
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <div className="text-sm font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
                  Clement Obeng
                </div>
                <div className="text-xs text-slate-500 truncate">Proprietor</div>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 py-4 space-y-1 overflow-y-auto scrollbar-hide">
          <div className="px-4 py-2">
            <NavItem
              icon={<School size={20} />}
              label="System"
              isOpen={isSidebarOpen}
              isActiveParent={isMySchoolActive || isActive("/AdminDashboard/MySchool")}
              hasChildren
              isExpanded={expandedSections.mySchool}
              onClick={() => toggleSection("mySchool")}
            />
            {isSidebarOpen && expandedSections.mySchool && (
              <div className="ml-4 pl-4 border-l border-gray-700 mt-2 space-y-1">
                <Link href="/AdminDashboard/MySchool/Dashboard">
                  <NavItem
                    icon={<LayoutDashboard size={18} />}
                    label="Management Dashboard"
                    isOpen
                    isSubItem
                    isActive={isActive("/AdminDashboard/MySchool/Dashboard")}
                  />
                </Link>
                <Link href="/AdminDashboard/MySchool">
                  <NavItem
                    icon={<Users size={18} />}
                    label="Users Management"
                    isOpen
                    isSubItem
                    isActive={isActive("/AdminDashboard/MySchool")}
                  />
                </Link>
                <Link href="#">
                  <NavItem icon={<LifeBuoy size={18} />} label="Supports" isOpen isSubItem />
                </Link>
                <Link href="#">
                  <NavItem icon={<Building2 size={18} />} label="Organization" isOpen isSubItem />
                </Link>
                <Link href="#">
                  <NavItem icon={<Settings size={18} />} label="Settings" isOpen isSubItem />
                </Link>
                <Link href="#">
                  <NavItem icon={<CreditCard size={18} />} label="Billing" isOpen isSubItem />
                </Link>
                <Link href="#">
                  <NavItem icon={<UserCircle size={18} />} label="Profiles" isOpen isSubItem />
                </Link>
              </div>
            )}
          </div>

          <div className="px-4 py-2">
            <NavItem
              icon={<Settings size={20} />}
              label="Workflows"
              isOpen={isSidebarOpen}
              isActiveParent={isSchoolManagementActive}
              hasChildren
              isExpanded={expandedSections.schoolManagement}
              onClick={() => toggleSection("schoolManagement")}
            />
            {isSidebarOpen && expandedSections.schoolManagement && (
              <div className="ml-4 pl-4 border-l border-gray-700 mt-2 space-y-1">
                <Link href="/AdminDashboard">
                  <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" isOpen isSubItem isActive={isActive("/AdminDashboard")} />
                </Link>
                <Link href="/AdminDashboard/AddBranch">
                  <NavItem icon={<PlusCircle size={18} />} label="Add Branch" isOpen isSubItem isActive={isActive("/AdminDashboard/AddBranch")} />
                </Link>
                <Link href="/AdminDashboard/Academics">
                  <NavItem icon={<BookOpen size={18} />} label="Academics" isOpen isSubItem isActive={isAcademicsActive} />
                </Link>
                <Link href="/AdminDashboard/Sessions">
                  <NavItem icon={<Calendar size={18} />} label="Sessions" isOpen isSubItem isActive={isActive("/AdminDashboard/Sessions")} />
                </Link>
                <Link href="/AdminDashboard/Academics/Assessments">
                  <NavItem icon={<Table2 size={18} />} label="Assessments" isOpen isSubItem isActive={isActive("/AdminDashboard/Academics/Assessments")} />
                </Link>
                <Link href="/AdminDashboard/Academics/Reports">
                  <NavItem icon={<FileText size={18} />} label="Terminal Reports" isOpen isSubItem isActive={isActive("/AdminDashboard/Academics/Reports")} />
                </Link>
                <Link href="/AdminDashboard/DataCenter">
                  <NavItem icon={<Table2 size={18} />} label="Data Center" isOpen isSubItem isActive={isActive("/AdminDashboard/DataCenter")} />
                </Link>
              </div>
            )}
          </div>
        </nav>
      </aside>

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"}`}>
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
              <Menu size={20} className="text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Kaas</h1>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 border border-gray-200 rounded-full px-3 py-1.5">
              <span className="font-semibold text-gray-700">Branch:</span>
              <span>{branches[0]?.name}</span>
            </div>

            <div className="flex items-center gap-2 shadow-md p-2 rounded-full bg-gray-100 cursor-pointer">
              <div className="w-8 h-8 bg-gray-200 rounded-full bg-[url('https://i.pravatar.cc/150?u=kaas')] bg-cover" />
              <span className="text-sm font-medium text-gray-700 hidden md:block">Ade Kola</span>
              <ChevronDown size={18} />
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-full relative">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  isOpen,
  isActive,
  isActiveParent,
  isSubItem,
  hasChildren,
  isExpanded,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isOpen: boolean;
  isActive?: boolean;
  isActiveParent?: boolean;
  isSubItem?: boolean;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onClick?: () => void;
}) {
  const baseClasses =
    "flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 font-medium justify-between group relative overflow-hidden";
  const activeClasses = isActive
    ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-900/20"
    : isActiveParent
      ? "bg-slate-800/80 text-emerald-400 border border-slate-700/50"
      : "text-slate-400 hover:text-emerald-100 hover:bg-slate-800/50";
  const subItemClasses = isSubItem ? "text-sm py-2" : "";

  return (
    <div className={`${baseClasses} ${activeClasses} ${subItemClasses}`} onClick={onClick}>
      <div className="flex items-center gap-3 relative z-10">
        {icon}
        {isOpen && <span>{label}</span>}
      </div>
      {hasChildren && isOpen && (
        <div className={`text-slate-500 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
          <ChevronDown size={16} />
        </div>
      )}
    </div>
  );
}
