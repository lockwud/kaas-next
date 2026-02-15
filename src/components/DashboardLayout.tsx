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
  PanelRight,
  PanelRightIcon,
  PanelRightClose,
  UserPlus,
  GraduationCap,
  DollarSign,
  Package,
  Warehouse,
  MessageSquare,
  Megaphone,
  Wrench,
  Home,
  Truck,
  BookMarked,
  Utensils,
  CalendarClock,
  Shield,
  Database,
  Plug,
  Receipt,
  Wallet,
  TrendingUp,
  PieChart,
  Search,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { branches } from "../lib/school-data";
import { button } from "framer-motion/client";

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
    financeAccounts: false,
    facilityLogistics: false,
    systemSettings: false,
  });

  // Auto-expand sections when navigating to their sub-pages
  React.useEffect(() => {
    const updates: Record<string, boolean> = {};

    // Check if current path is within Finance & Accounts
    if (pathname.startsWith("/AdminDashboard/Finance")) {
      updates.financeAccounts = true;
    }

    // Check if current path is within Facility & Logistics
    if (pathname.startsWith("/AdminDashboard/Facility")) {
      updates.facilityLogistics = true;
    }

    // Check if current path is within System Settings
    if (pathname.startsWith("/AdminDashboard/Settings")) {
      updates.systemSettings = true;
    }

    // Only update if there are changes
    if (Object.keys(updates).length > 0) {
      setExpandedSections(prev => ({ ...prev, ...updates }));
    }
  }, [pathname]);

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
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-linear-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/20 shrink-0">
              <div className="w-5 h-5 bg-[#0F172A] rounded-lg" />
            </div>
            {isSidebarOpen && (
              <span className="font-bold text-xl tracking-wide text-slate-100 whitespace-nowrap overflow-hidden">
                KAAS
              </span>
            )}
          </div>
        </div>

        <div className={`mb-6 transition-all duration-300 ${isSidebarOpen ? "px-4" : "px-2"}`}>
          <div
            className={`bg-slate-800/40 rounded-xl border border-slate-700/50 backdrop-blur-sm flex items-center gap-3 group hover:bg-slate-800/60 transition-colors cursor-pointer ${isSidebarOpen ? "p-3" : "p-2 justify-center"}`}
          >
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center font-bold text-slate-900 shadow-md shrink-0">
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
          {/* CORE OPERATIONS */}
          {isSidebarOpen && (
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Core Operations</h3>
            </div>
          )}
          <div className="px-4 space-y-1">
            <Link href="/AdminDashboard">
              <NavItem
                icon={<Home size={20} />}
                label="Dashboard"
                isOpen={isSidebarOpen}
                isActive={isActive("/AdminDashboard")}
              />
            </Link>
            <Link href="/AdminDashboard/Calendar">
              <NavItem
                icon={<Calendar size={20} />}
                label="Calendar"
                isOpen={isSidebarOpen}
                isActive={isActive("/AdminDashboard/Calendar")}
              />
            </Link>
          </div>

          {/* ACADEMICS */}
          {isSidebarOpen && (
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Academics</h3>
            </div>
          )}
          <div className="px-4 space-y-1">
            <Link href="/AdminDashboard/Classes">
              <NavItem
                icon={<School size={20} />}
                label="Classes & Rooms"
                isOpen={isSidebarOpen}
                isActive={isActive("/AdminDashboard/Classes")}
              />
            </Link>
            <Link href="/AdminDashboard/Academics/Assessments">
              <NavItem
                icon={<Table2 size={20} />}
                label="Assessments"
                isOpen={isSidebarOpen}
                isActive={isActive("/AdminDashboard/Academics/Assessments")}
              />
            </Link>
            <Link href="/AdminDashboard/Enrollment">
              <NavItem
                icon={<UserPlus size={20} />}
                label="Enrollment"
                isOpen={isSidebarOpen}
                isActive={isActive("/AdminDashboard/Enrollment")}
              />
            </Link>
          </div>

          {/* STUDENTS */}
          {isSidebarOpen && (
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Students</h3>
            </div>
          )}
          <div className="px-4 space-y-1">
            <Link href="/AdminDashboard/Students/Directory">
              <NavItem
                icon={<GraduationCap size={20} />}
                label="Directory"
                isOpen={isSidebarOpen}
                isActive={isActive("/AdminDashboard/Students/Directory")}
              />
            </Link>
            <Link href="/AdminDashboard/Students/Guardians">
              <NavItem
                icon={<Users size={20} />}
                label="Guardians"
                isOpen={isSidebarOpen}
                isActive={isActive("/AdminDashboard/Students/Guardians")}
              />
            </Link>
            <Link href="/AdminDashboard/Students/Admissions">
              <NavItem
                icon={<UserPlus size={20} />}
                label="Admissions"
                isOpen={isSidebarOpen}
                isActive={isActive("/AdminDashboard/Students/Admissions")}
              />
            </Link>
          </div>

          {/* HUMAN RESOURCES */}
          {isSidebarOpen && (
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Human Resources</h3>
            </div>
          )}
          <div className="px-4 space-y-1">
            <Link href="/AdminDashboard/HR/StaffDirectory">
              <NavItem
                icon={<Users size={20} />}
                label="Staff Directory"
                isOpen={isSidebarOpen}
                isActive={isActive("/AdminDashboard/HR/StaffDirectory")}
              />
            </Link>
            <Link href="/AdminDashboard/HR/Payroll">
              <NavItem
                icon={<DollarSign size={20} />}
                label="Payroll"
                isOpen={isSidebarOpen}
                isActive={isActive("/AdminDashboard/HR/Payroll")}
              />
            </Link>
          </div>

          {/* FINANCE & ACCOUNTS */}
          {isSidebarOpen && (
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Finance & Accounts</h3>
            </div>
          )}
          <div className="px-4 space-y-1">
            <NavItem
              icon={<CreditCard size={20} />}
              label="Finance & Accounts"
              isOpen={isSidebarOpen}
              hasChildren
              isExpanded={expandedSections.financeAccounts}
              onClick={() => toggleSection("financeAccounts")}
            />
            {isSidebarOpen && expandedSections.financeAccounts && (
              <div className="ml-4 pl-4 border-l border-gray-700 mt-2 space-y-1">
                <Link href="/AdminDashboard/Finance/FeeManagement">
                  <NavItem
                    icon={<Receipt size={18} />}
                    label="Fee Management"
                    isOpen
                    isSubItem
                    isActive={isActive("/AdminDashboard/Finance/FeeManagement")}
                  />
                </Link>
                <Link href="/AdminDashboard/Finance/Invoices">
                  <NavItem
                    icon={<FileText size={18} />}
                    label="Invoices"
                    isOpen
                    isSubItem
                    isActive={isActive("/AdminDashboard/Finance/Invoices")}
                  />
                </Link>
                <Link href="/AdminDashboard/Finance/Payments">
                  <NavItem
                    icon={<Wallet size={18} />}
                    label="Payments"
                    isOpen
                    isSubItem
                    isActive={isActive("/AdminDashboard/Finance/Payments")}
                  />
                </Link>
                <Link href="/AdminDashboard/Finance/Expenses">
                  <NavItem
                    icon={<TrendingUp size={18} />}
                    label="Expenses"
                    isOpen
                    isSubItem
                    isActive={isActive("/AdminDashboard/Finance/Expenses")}
                  />
                </Link>
                <Link href="/AdminDashboard/Finance/Reports">
                  <NavItem
                    icon={<PieChart size={18} />}
                    label="Financial Reports"
                    isOpen
                    isSubItem
                    isActive={isActive("/AdminDashboard/Finance/Reports")}
                  />
                </Link>
                <Link href="/AdminDashboard/Finance/Budget">
                  <NavItem
                    icon={<DollarSign size={18} />}
                    label="Budget Planning"
                    isOpen
                    isSubItem
                    isActive={isActive("/AdminDashboard/Finance/Budget")}
                  />
                </Link>
              </div>
            )}
          </div>

          {/* RESOURCES */}
          {isSidebarOpen && (
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resources</h3>
            </div>
          )}
          <div className="px-4 space-y-1">
            <Link href="/AdminDashboard/Resources/BookStore">
              <NavItem
                icon={<BookOpen size={20} />}
                label="Book Store"
                isOpen={isSidebarOpen}
                isActive={isActive("/AdminDashboard/Resources/BookStore")}
              />
            </Link>
            <Link href="/AdminDashboard/Resources/Inventory">
              <NavItem
                icon={<Package size={20} />}
                label="Inventory"
                isOpen={isSidebarOpen}
                isActive={isActive("/AdminDashboard/Resources/Inventory")}
              />
            </Link>
            <Link href="/AdminDashboard/Resources/Assets">
              <NavItem
                icon={<Warehouse size={20} />}
                label="Assets"
                isOpen={isSidebarOpen}
                isActive={isActive("/AdminDashboard/Resources/Assets")}
              />
            </Link>
          </div>

          {/* FACILITY & LOGISTICS */}
          {isSidebarOpen && (
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Facility & Logistics</h3>
            </div>
          )}
          <div className="px-4 space-y-1">
            <NavItem
              icon={<Building2 size={20} />}
              label="Facility & Logistics"
              isOpen={isSidebarOpen}
              hasChildren
              isExpanded={expandedSections.facilityLogistics}
              onClick={() => toggleSection("facilityLogistics")}
            />
            {isSidebarOpen && expandedSections.facilityLogistics && (
              <div className="ml-4 pl-4 border-l border-gray-700 mt-2 space-y-1">
                <Link href="/AdminDashboard/Facility/Transport">
                  <NavItem
                    icon={<Truck size={18} />}
                    label="Transport"
                    isOpen
                    isSubItem
                    isActive={isActive("/AdminDashboard/Facility/Transport")}
                  />
                </Link>
                <Link href="/AdminDashboard/Facility/Hostel">
                  <NavItem
                    icon={<Building2 size={18} />}
                    label="Hostel"
                    isOpen
                    isSubItem
                    isActive={isActive("/AdminDashboard/Facility/Hostel")}
                  />
                </Link>
                <Link href="/AdminDashboard/Facility/Library">
                  <NavItem
                    icon={<BookMarked size={18} />}
                    label="Library"
                    isOpen
                    isSubItem
                    isActive={isActive("/AdminDashboard/Facility/Library")}
                  />
                </Link>
                <Link href="/AdminDashboard/Facility/Canteen">
                  <NavItem
                    icon={<Utensils size={18} />}
                    label="Canteen"
                    isOpen
                    isSubItem
                    isActive={isActive("/AdminDashboard/Facility/Canteen")}
                  />
                </Link>
                <Link href="/AdminDashboard/Facility/Maintenance">
                  <NavItem
                    icon={<Wrench size={18} />}
                    label="Maintenance"
                    isOpen
                    isSubItem
                    isActive={isActive("/AdminDashboard/Facility/Maintenance")}
                  />
                </Link>
                <Link href="/AdminDashboard/Facility/RoomBooking">
                  <NavItem
                    icon={<CalendarClock size={18} />}
                    label="Room Booking"
                    isOpen
                    isSubItem
                    isActive={isActive("/AdminDashboard/Facility/RoomBooking")}
                  />
                </Link>
              </div>
            )}
          </div>

          {/* COMMUNICATION */}
          {isSidebarOpen && (
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Communication</h3>
            </div>
          )}
          <div className="px-4 space-y-1">
            <Link href="/AdminDashboard/Communication/Announcements">
              <NavItem
                icon={<Megaphone size={20} />}
                label="Announcements"
                isOpen={isSidebarOpen}
                isActive={isActive("/AdminDashboard/Communication/Announcements")}
              />
            </Link>
            <Link href="/AdminDashboard/Communication/Messages">
              <NavItem
                icon={<MessageSquare size={20} />}
                label="Messages"
                isOpen={isSidebarOpen}
                isActive={isActive("/AdminDashboard/Communication/Messages")}
              />
            </Link>
          </div>

          {/* SYSTEM SETTINGS */}
          {isSidebarOpen && (
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">System Settings</h3>
            </div>
          )}
          <div className="px-4 pb-4 space-y-1">
            <NavItem
              icon={<Settings size={20} />}
              label="System Settings"
              isOpen={isSidebarOpen}
              hasChildren
              isExpanded={expandedSections.systemSettings}
              onClick={() => toggleSection("systemSettings")}
            />
            {isSidebarOpen && expandedSections.systemSettings && (
              <div className="ml-4 pl-4 border-l border-gray-700 mt-2 space-y-1">
                <Link href="/AdminDashboard/Settings/SchoolProfile">
                  <NavItem
                    icon={<School size={18} />}
                    label="School Profile"
                    isOpen
                    isSubItem
                    isActive={isActive("/AdminDashboard/Settings/SchoolProfile")}
                  />
                </Link>
                <Link href="/AdminDashboard/Settings/AcademicYear">
                  <NavItem
                    icon={<CalendarClock size={18} />}
                    label="Academic Year"
                    isOpen
                    isSubItem
                    isActive={isActive("/AdminDashboard/Settings/AcademicYear")}
                  />
                </Link>
                <Link href="/AdminDashboard/Settings/UserRoles">
                  <NavItem
                    icon={<Users size={18} />}
                    label="User Roles"
                    isOpen
                    isSubItem
                    isActive={isActive("/AdminDashboard/Settings/UserRoles")}
                  />
                </Link>
                <Link href="/AdminDashboard/Settings/Notifications">
                  <NavItem
                    icon={<Bell size={18} />}
                    label="Notifications"
                    isOpen
                    isSubItem
                    isActive={isActive("/AdminDashboard/Settings/Notifications")}
                  />
                </Link>
                <Link href="/AdminDashboard/Settings/Backup">
                  <NavItem
                    icon={<Database size={18} />}
                    label="Backup & Restore"
                    isOpen
                    isSubItem
                    isActive={isActive("/AdminDashboard/Settings/Backup")}
                  />
                </Link>
                <Link href="/AdminDashboard/Settings/Integration">
                  <NavItem
                    icon={<Plug size={18} />}
                    label="Integration"
                    isOpen
                    isSubItem
                    isActive={isActive("/AdminDashboard/Settings/Integration")}
                  />
                </Link>
                <Link href="/AdminDashboard/Settings/Security">
                  <NavItem
                    icon={<Shield size={18} />}
                    label="Security"
                    isOpen
                    isSubItem
                    isActive={isActive("/AdminDashboard/Settings/Security")}
                  />
                </Link>
              </div>
            )}
          </div>
        </nav>
      </aside>

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "ml-60" : "ml-20"}`}>
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-5 sticky top-0 z-10">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
              <PanelRightClose size={20} className={`text-gray-600 ${isSidebarOpen ? "rotate-180" : ""}`} />
            </button>
            <div className="relative ml-4 flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 border border-gray-200 rounded-full px-3 py-1.5">
              <span className="font-semibold text-gray-700">Branch:</span>
              <span>{branches[0]?.name}</span>
            </div>

            <div className="flex items-center gap-2 shadow-md p-2 rounded-xl bg-gray-100 cursor-pointer">
              <div className="w-8 h-8 bg-gray-200 rounded-full bg-[url('https://i.pravatar.cc/150?u=kaas')] bg-cover" />
              <span className="text-sm font-medium text-gray-700 hidden md:block line-clamp-4">Ade Kola</span>
              <ChevronDown size={18} />
            </div>
            <button className="p-2 hover:bg-gray-100 shadow-md bg-gray-200 rounded-full relative">
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
