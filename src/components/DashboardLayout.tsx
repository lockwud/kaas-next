"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
    LayoutDashboard,
    School,
    Settings,
    Bell,
    Menu,
    Search,
    PlusCircle,
    Users,
    Calendar,
    BookOpen,
    LifeBuoy,
    Building2,
    CreditCard,
    UserCircle,
    Briefcase,
    ChevronDown,
    ChevronRight,
} from "lucide-react";
import { Button } from "./ui/Button";
import { usePathname } from "next/navigation";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
    const pathname = usePathname();

    // Helper to check if a route is active
    const isActive = (path: string) => pathname === path;

    // Helper to check if any child of My School is active
    const isMySchoolActive = [
        "/AdminDashboard/MySchool",
        "/AdminDashboard/MySchool/Dashboard",
        "/AdminDashboard/MySchool/Supports",
        // Add other paths as they are implemented
    ].includes(pathname);

    // Helper to check if any child of School Management is active
    const isSchoolManagementActive = [
        "/AdminDashboard",
        "/AdminDashboard/AddBranch",
        "/AdminDashboard/Academics",
        "/AdminDashboard/Sessions"
    ].includes(pathname);

    // State for collapsible sections
    const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
        "mySchool": isMySchoolActive,
        "schoolManagement": isSchoolManagementActive
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? "w-64" : "w-20"
                    } bg-[#0F172A] text-white duration-500 flex flex-col fixed h-full z-20 border-r border-slate-800 shadow-2xl`}
            >
                {/* Logo Area */}
                <div className={`h-20 flex items-center border-b border-slate-800/60 mb-4 transition-all duration-300 ${isSidebarOpen ? 'px-6 mx-4' : 'justify-center mx-2'}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/20 shrink-0">
                            <div className="w-5 h-5 bg-[#0F172A] rounded-lg" />
                        </div>
                        {isSidebarOpen && <span className="font-bold text-xl tracking-tight text-slate-100 whitespace-nowrap overflow-hidden">Synx Ghana</span>}
                    </div>
                </div>

                {/* User Profile Snippet */}
                <div className={`mb-6 transition-all duration-300 ${isSidebarOpen ? 'px-4' : 'px-2'}`}>
                    <div className={`bg-slate-800/40 rounded-xl border border-slate-700/50 backdrop-blur-sm flex items-center gap-3 group hover:bg-slate-800/60 transition-colors cursor-pointer ${isSidebarOpen ? 'p-3' : 'p-2 justify-center'}`}>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-bold text-slate-900 shadow-md shrink-0">
                            JD
                        </div>
                        {isSidebarOpen && (
                            <div className="overflow-hidden">
                                <div className="text-sm font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
                                    John Doremon
                                </div>
                                <div className="text-xs text-slate-500 truncate">
                                    Super Admin
                                </div>
                            </div>
                        )}
                    </div>
                </div>


                {/* Navigation */}
                <nav className="flex-1 py-4 space-y-1 overflow-y-auto scrollbar-hide">
                    {/* Section 1 */}
                    <div className="px-4 py-2">
                        {isSidebarOpen && <p className="text-xs text-gray-400 uppercase mb-2">Main</p>}
                        <Link href="/AdminDashboard/SuperAdmin">
                            <NavItem
                                icon={<Users size={20} />}
                                label="Go To Super Admin"
                                isOpen={isSidebarOpen}
                                isActive={isActive("/AdminDashboard/SuperAdmin")}
                            />
                        </Link>
                    </div>

                    {/* My School Section (Collapsible) */}
                    <div className="px-4 py-2">
                        <NavItem
                            icon={<School size={20} />}
                            label="My School"
                            isOpen={isSidebarOpen}
                            isActiveParent={isMySchoolActive || isActive("/AdminDashboard/MySchool")}
                            hasChildren
                            isExpanded={expandedSections["mySchool"]}
                            onClick={() => toggleSection("mySchool")}
                        />
                        {isSidebarOpen && expandedSections["mySchool"] && (
                            <div className="ml-4 pl-4 border-l border-gray-700 mt-2 space-y-1">
                                <Link href="/AdminDashboard/MySchool/Dashboard">
                                    <NavItem icon={<LayoutDashboard size={18} />} label="Management Dashboard" isOpen={true} isSubItem isActive={isActive("/AdminDashboard/MySchool/Dashboard")} />
                                </Link>
                                <Link href="/AdminDashboard/MySchool">
                                    <NavItem icon={<Users size={18} />} label="Users Management" isOpen={true} isSubItem isActive={isActive("/AdminDashboard/MySchool")} />
                                </Link>
                                <Link href="#">
                                    <NavItem icon={<LifeBuoy size={18} />} label="Supports" isOpen={true} isSubItem />
                                </Link>
                                <Link href="#">
                                    <NavItem icon={<Building2 size={18} />} label="Organization" isOpen={true} isSubItem />
                                </Link>
                                <Link href="#">
                                    <NavItem icon={<Settings size={18} />} label="Settings" isOpen={true} isSubItem />
                                </Link>
                                <Link href="#">
                                    <NavItem icon={<CreditCard size={18} />} label="Billing" isOpen={true} isSubItem />
                                </Link>
                                <Link href="#">
                                    <NavItem icon={<UserCircle size={18} />} label="Profiles" isOpen={true} isSubItem />
                                </Link>
                                <Link href="#">
                                    <NavItem icon={<Briefcase size={18} />} label="Organization Profile" isOpen={true} isSubItem />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* School Management Section (Collapsible) */}
                    <div className="px-4 py-2">
                        <NavItem
                            icon={<Settings size={20} />}
                            label="School Management"
                            isOpen={isSidebarOpen}
                            isActiveParent={isSchoolManagementActive}
                            hasChildren
                            isExpanded={expandedSections["schoolManagement"]}
                            onClick={() => toggleSection("schoolManagement")}
                        />
                        {isSidebarOpen && expandedSections["schoolManagement"] && (
                            <div className="ml-4 pl-4 border-l border-gray-700 mt-2 space-y-1">
                                <Link href="/AdminDashboard">
                                    <NavItem
                                        icon={<LayoutDashboard size={18} />}
                                        label="Dashboard"
                                        isOpen={true}
                                        isSubItem
                                        isActive={isActive("/AdminDashboard")}
                                    />
                                </Link>
                                <Link href="/AdminDashboard/AddBranch">
                                    <NavItem
                                        icon={<PlusCircle size={18} />}
                                        label="Add Branch"
                                        isOpen={true}
                                        isSubItem
                                        isActive={isActive("/AdminDashboard/AddBranch")}
                                    />
                                </Link>
                                <Link href="/AdminDashboard/Academics">
                                    <NavItem
                                        icon={<Users size={18} />}
                                        label="Class"
                                        isOpen={true}
                                        isSubItem
                                        isActive={isActive("/AdminDashboard/Academics")}
                                    />
                                </Link>
                                <Link href="/AdminDashboard/Sessions">
                                    <NavItem
                                        icon={<Calendar size={18} />}
                                        label="Sessions"
                                        isOpen={true}
                                        isSubItem
                                        isActive={isActive("/AdminDashboard/Sessions")}
                                    />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Section 3 - Academics */}
                    <div className="px-4 py-2">
                        <Link href="/AdminDashboard/Academics">
                            <NavItem
                                icon={<BookOpen size={20} />}
                                label="Academics"
                                isOpen={isSidebarOpen}
                                isActive={isActive("/AdminDashboard/Academics")}
                            />
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"}`}>

                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <Menu size={20} className="text-gray-600" />
                        </button>
                        <h1 className="text-xl font-semibold text-gray-800">Delhi Public School</h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <span className="text-sm text-gray-500 hidden md:block">
                            Free Trial - <span className="text-orange-500 font-bold">30 Days Trial</span>
                            <a href="#" className="ml-2 font-semibold text-gray-900 hover:underline">Buy Now</a>
                        </span>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 shadow-md p-2 rounded-full bg-gray-100 cursor-pointer">
                                <div className="w-8 h-8 bg-gray-200 rounded-full bg-[url('https://i.pravatar.cc/150?u=a042581f4e29026704d')] bg-cover"></div>
                                <span className="text-sm font-medium text-gray-700 hidden md:block">John Doremon</span>
                                <ChevronDown size={20}/>
                            </div>
                            <button className="p-2 hover:bg-gray-100 rounded-full relative">
                                <Bell size={20} className="text-gray-600" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-8">
                    {children}
                </main>

            </div>
        </div>
    );
}



// ... existing code ...

function NavItem({ icon, label, isOpen, isActive, isActiveParent, isSubItem, hasChildren, isExpanded, onClick }: any) {
    const baseClasses = "flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 font-medium justify-between group relative overflow-hidden";
    const activeClasses = isActive
        ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-900/20"
        : isActiveParent
            ? "bg-slate-800/80 text-emerald-400 border border-slate-700/50"
            : "text-slate-400 hover:text-emerald-100 hover:bg-slate-800/50";
    const subItemClasses = isSubItem ? "text-sm py-2" : "";

    return (
        <div
            className={`${baseClasses} ${activeClasses} ${subItemClasses}`}
            onClick={onClick}
        >
            <div className="flex items-center gap-3 relative z-10">
                {icon}
                {isOpen && <span>{label}</span>}
            </div>
            {hasChildren && isOpen && (
                <div className={`text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown size={16} />
                </div>
            )}
        </div>
    );
}
