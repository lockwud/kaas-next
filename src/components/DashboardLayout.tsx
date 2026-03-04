"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bell,
  BookOpen,
  Building2,
  Calendar,
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  School,
  ShieldAlert,
  Settings,
  Table2,
  UserCircle,
  FileText,
  Users2,
  Users,
  BookOpenText,
  CalendarCheck,
  UserPen,
  Video,
  Megaphone,
  Layers,
  Clock,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { AppRole, clearAuthSession, getAccessToken, getRoleKey } from "@/lib/auth-session";
import { canAccessPath } from "@/lib/rbac";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
  const [isAuthReady, setIsAuthReady] = React.useState(false);
  const [currentRole, setCurrentRole] = React.useState<AppRole>("guest");
  const [isAccessDenied, setIsAccessDenied] = React.useState(false);
  const [profileName, setProfileName] = React.useState("User");
  const [profileRole, setProfileRole] = React.useState("General Manager");
  const [profileSchool, setProfileSchool] = React.useState("Kaas Montessori School");
  const pathname = usePathname();
  const profileMenuRef = React.useRef<HTMLDivElement | null>(null);

  const toInitials = React.useCallback((value: string) => {
    const parts = value
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!parts.length) {
      return "U";
    }

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }, []);

  const isActive = (path: string) => pathname === path;
  const isAcademicsActive = pathname.startsWith("/AdminDashboard/Academics");
  const isAcademicsSubpage = pathname.startsWith("/AdminDashboard/Academics/");

  const isMySchoolActive = [
    "/AdminDashboard/MySchool",
    "/AdminDashboard/MySchool/Dashboard",
    "/AdminDashboard/Supports",
    "/AdminDashboard/Organization",
    "/AdminDashboard/Settings",
    "/AdminDashboard/Billing",
    "/AdminDashboard/Profiles",
  ].includes(pathname) || pathname.startsWith("/AdminDashboard/Settings/");

  const isSchoolManagementActive = [
    "/AdminDashboard",
    "/AdminDashboard/Academics",
    "/AdminDashboard/Academics/Classes",
    "/AdminDashboard/Academics/Students",
    "/AdminDashboard/Sessions",
    "/AdminDashboard/Academics/Assessments",
    "/AdminDashboard/Academics/Reports",
    "/AdminDashboard/DataCenter",
    "/AdminDashboard/Academics/Sections",
    "/AdminDashboard/Academics/Subjects",
    "/AdminDashboard/Academics/TimeTable",
    "/AdminDashboard/Academics/Attendance",
    "/AdminDashboard/Academics/Leaves",
    "/AdminDashboard/Academics/Materials",
    "/AdminDashboard/Academics/Homework",
    "/AdminDashboard/Academics/NoticeBoard",
    "/AdminDashboard/Academics/Events",
    "/AdminDashboard/Academics/LiveClasses",
  ].includes(pathname);

  const isStudentsActive = [
    "/AdminDashboard/Admission",
    "/AdminDashboard/Directory",
    "/AdminDashboard/Guardians"
  ].includes(pathname)

  const isFinanceActive = [
    "/AdminDashboard/Budget",
    "/AdminDashboard/Expenses",
    "/AdminDashboard/FeeManagement",
    "/AdminDashboard/Invoices",
    "/AdminDashboard/Payments",
    "/AdminDashboard/Reports"
  ].includes(pathname)

  const isFacility = [
    "/AdminDashboard/Canteen",
    "/AdminDashboard/Hostel",
    "/AdminDashboard/Library",
    "/AdminDashboard/Maintenance",
    "/AdminDashboard/RoomBooking",
    "/AdminDashboard/Transport"
  ].includes(pathname)

  const isHR = [
    "/AdminDashboard/Payroll",
    "/AdminDashboard/StaffDirectory"
  ].includes(pathname)

  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    mySchool: isMySchoolActive,
    schoolManagement: isSchoolManagementActive,
    academics: isAcademicsActive,
    students: isStudentsActive,
    finance: isFinanceActive,
    facility: isFacility,
    HR: isHR
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  React.useEffect(() => {
    const token = getAccessToken();
    const storedName = localStorage.getItem("kaas_user_name")?.trim();
    const storedEmail = localStorage.getItem("kaas_user_email")?.trim();
    const storedRole = localStorage.getItem("kaas_user_role")?.trim();
    const storedSchool = localStorage.getItem("kaas_school_name")?.trim();

    if (!token) {
      router.replace("/Login");
      return;
    }

    const emailLocalPart = storedEmail?.split("@")[0]?.replace(/[._-]+/g, " ");
    const fallbackFromEmail = emailLocalPart
      ? emailLocalPart
        .split(" ")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
      : "User";

    const defaultGuestName = "User";
    const defaultGuestRole = "General Manager";

    setProfileName(storedName || fallbackFromEmail || defaultGuestName);
    setProfileRole(storedRole || defaultGuestRole);
    setProfileSchool(storedSchool || "Kaas Montessori School");
    setCurrentRole(getRoleKey());
    setIsAuthReady(true);
  }, [router]);

  React.useEffect(() => {
    if (!isAuthReady) return;
    const token = getAccessToken();
    if (!token) return;

    const role = getRoleKey();
    setCurrentRole(role);
    setIsAccessDenied(!canAccessPath(pathname, role));
  }, [isAuthReady, pathname]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const profileInitials = React.useMemo(() => toInitials(profileName), [profileName, toInitials]);

  const logout = () => {
    clearAuthSession();
    router.replace("/Login");
  };

  if (!isAuthReady) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  const canAccessMySchoolDashboard = canAccessPath("/AdminDashboard/MySchool/Dashboard", currentRole);
  const canAccessUsersManagement = canAccessPath("/AdminDashboard/MySchool", currentRole);
  const canAccessSupports = canAccessPath("/AdminDashboard/Supports", currentRole);
  const canAccessOrganization = canAccessPath("/AdminDashboard/Organization", currentRole);
  const canAccessSettings = canAccessPath("/AdminDashboard/Settings", currentRole);
  const canAccessBilling = canAccessPath("/AdminDashboard/Billing", currentRole);
  const canAccessProfiles = canAccessPath("/AdminDashboard/Profiles", currentRole);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside
        className={`${isSidebarOpen ? "w-64" : "w-20"} bg-[#0F172A] text-white duration-500 flex flex-col fixed h-full z-20 border-r border-slate-800 shadow-2xl`}
      >
        <div
          className={`h-20 flex items-center border-b border-slate-800/60 mb-4 transition-all duration-300 ${isSidebarOpen ? "px-6 mx-4" : "justify-center mx-2"}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white p-1 flex items-center justify-center shadow-lg shrink-0 overflow-hidden">
              <Image
                src="/KAASLOGO.jpeg"
                alt="School logo"
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            </div>
            {isSidebarOpen && (
              <span className="font-bold text-xl tracking-tight text-slate-100 whitespace-nowrap overflow-hidden">
                Kaas
              </span>
            )}
          </div>
        </div>

        <nav className="flex-1 py-4 space-y-1 overflow-y-auto scrollbar-hide">
          {/* System */}
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
              <div className="ml-4 pl-4 border-l border-gray-700 mt-2 space-y-1 flex flex-col gap-2">
                {canAccessMySchoolDashboard && (
                  <Link href="/AdminDashboard/MySchool/Dashboard">
                    <NavItem
                      icon={<LayoutDashboard size={18} />}
                      label="Management Dashboard"
                      isOpen
                      isSubItem
                      isActive={isActive("/AdminDashboard/MySchool/Dashboard")}
                    />
                  </Link>
                )}
                {canAccessUsersManagement && (
                  <Link href="/AdminDashboard/MySchool">
                    <NavItem
                      icon={<Users2 size={18} />}
                      label="Users Management"
                      isOpen
                      isSubItem
                      isActive={isActive("/AdminDashboard/MySchool")}
                    />
                  </Link>
                )}
                {canAccessSupports && (
                  <Link href="/AdminDashboard/Supports">
                    <NavItem icon={<LifeBuoy size={18} />} label="Supports" isOpen isSubItem isActive={isActive("/AdminDashboard/Supports")} />
                  </Link>
                )}
                {canAccessOrganization && (
                  <Link href="/AdminDashboard/Organization">
                    <NavItem icon={<Building2 size={18} />} label="Organization" isOpen isSubItem isActive={isActive("/AdminDashboard/Organization")} />
                  </Link>
                )}
                {canAccessSettings && (
                  <Link href="/AdminDashboard/Settings">
                    <NavItem icon={<Settings size={18} />} label="Settings Hub" isOpen isSubItem isActive={isActive("/AdminDashboard/Settings")} />
                  </Link>
                )}
                {canAccessBilling && (
                  <Link href="/AdminDashboard/Billing">
                    <NavItem icon={<CreditCard size={18} />} label="Billing" isOpen isSubItem isActive={isActive("/AdminDashboard/Billing")} />
                  </Link>
                )}
                {canAccessProfiles && (
                  <Link href="/AdminDashboard/Profiles">
                    <NavItem icon={<UserCircle size={18} />} label="Profiles" isOpen isSubItem isActive={isActive("/AdminDashboard/Profiles")} />
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Workflow */}
          <div className="px-4 py-2 gap-4">
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
              <div className="ml-4 pl-4 border-l border-gray-700 mt-2 flex flex-col gap-2">
                <Link href="/AdminDashboard">
                  <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" isOpen isSubItem isActive={isActive("/AdminDashboard")} />
                </Link>

                <NavItem
                  icon={<BookOpen size={18} />}
                  label="Academics"
                  isOpen
                  isSubItem
                  isActiveParent={isAcademicsActive}
                  hasChildren
                  isExpanded={expandedSections.academics}
                  onClick={() => toggleSection("academics")}
                />

                {expandedSections.academics && (
                  <div className="ml-3 pl-3 border-l border-slate-700/60 space-y-2">
                    <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Structure</p>
                    <Link href="/AdminDashboard/Academics">
                      <NavItem icon={<BookOpen size={16} />} label="Overview" isOpen isSubItem isActive={isActive("/AdminDashboard/Academics")} />
                    </Link>
                    <Link href="/AdminDashboard/Academics/Classes">
                      <NavItem icon={<School size={16} />} label="Classes" isOpen isSubItem isActive={isActive("/AdminDashboard/Academics/Classes")} />
                    </Link>
                    <Link href="/AdminDashboard/Academics/Students">
                      <NavItem icon={<Users size={16} />} label="Students" isOpen isSubItem isActive={isActive("/AdminDashboard/Academics/Students")} />
                    </Link>
                    <Link href="/AdminDashboard/Academics/Sections">
                      <NavItem icon={<Layers size={16} />} label="Sections" isOpen isSubItem isActive={isActive("/AdminDashboard/Academics/Sections")} />
                    </Link>
                    <Link href="/AdminDashboard/Academics/Subjects">
                      <NavItem icon={<BookOpenText size={16} />} label="Subjects" isOpen isSubItem isActive={isActive("/AdminDashboard/Academics/Subjects")} />
                    </Link>

                    <p className="px-2 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Learning</p>
                    <Link href="/AdminDashboard/Academics/TimeTable">
                      <NavItem icon={<Clock size={16} />} label="Time Table" isOpen isSubItem isActive={isActive("/AdminDashboard/Academics/TimeTable")} />
                    </Link>
                    <Link href="/AdminDashboard/Academics/Attendance">
                      <NavItem icon={<CalendarCheck size={16} />} label="Attendance" isOpen isSubItem isActive={isActive("/AdminDashboard/Academics/Attendance")} />
                    </Link>
                    <Link href="/AdminDashboard/Academics/Leaves">
                      <NavItem icon={<UserPen size={16} />} label="Student Leaves" isOpen isSubItem isActive={isActive("/AdminDashboard/Academics/Leaves")} />
                    </Link>
                    <Link href="/AdminDashboard/Academics/Materials">
                      <NavItem icon={<BookOpen size={16} />} label="Study Materials" isOpen isSubItem isActive={isActive("/AdminDashboard/Academics/Materials")} />
                    </Link>
                    <Link href="/AdminDashboard/Academics/Homework">
                      <NavItem icon={<FileText size={16} />} label="Home Work" isOpen isSubItem isActive={isActive("/AdminDashboard/Academics/Homework")} />
                    </Link>

                    <p className="px-2 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Assessment & Engagement</p>
                    <Link href="/AdminDashboard/Academics/Assessments">
                      <NavItem icon={<Table2 size={16} />} label="Assessments" isOpen isSubItem isActive={isActive("/AdminDashboard/Academics/Assessments")} />
                    </Link>
                    <Link href="/AdminDashboard/Academics/Reports">
                      <NavItem icon={<FileText size={16} />} label="Terminal Reports" isOpen isSubItem isActive={isActive("/AdminDashboard/Academics/Reports")} />
                    </Link>
                    <Link href="/AdminDashboard/Academics/NoticeBoard">
                      <NavItem icon={<Megaphone size={16} />} label="Notice Board" isOpen isSubItem isActive={isActive("/AdminDashboard/Academics/NoticeBoard")} />
                    </Link>
                    <Link href="/AdminDashboard/Academics/Events">
                      <NavItem icon={<Calendar size={16} />} label="Events" isOpen isSubItem isActive={isActive("/AdminDashboard/Academics/Events")} />
                    </Link>
                    <Link href="/AdminDashboard/Academics/LiveClasses">
                      <NavItem icon={<Video size={16} />} label="Live Classes" isOpen isSubItem isActive={isActive("/AdminDashboard/Academics/LiveClasses")} />
                    </Link>
                  </div>
                )}

                <Link href="/AdminDashboard/Sessions">
                  <NavItem icon={<Calendar size={18} />} label="Sessions" isOpen isSubItem isActive={isActive("/AdminDashboard/Sessions")} />
                </Link>
                <Link href="/AdminDashboard/DataCenter">
                  <NavItem icon={<Table2 size={18} />} label="Data Center" isOpen isSubItem isActive={isActive("/AdminDashboard/DataCenter")} />
                </Link>
              </div>
            )}
          </div>

          {/* Student */}
          {/* <div className="px-4 py-2 gap-4">
            <NavItem
              icon={<Users2 size={20} />}
              label="Students"
              isOpen={isSidebarOpen}
              isActiveParent={isStudentsActive}
              hasChildren
              isExpanded={expandedSections.students}
              onClick={() => toggleSection("students")}
            />
            {isSidebarOpen && expandedSections.students && (
              <div className="ml-4 pl-4 border-l border-gray-700 mt-2 flex flex-col gap-2">
                <Link href="/Admissions">
                  <NavItem icon={<BookOpen size={18} />} label="Admission" isOpen isSubItem isActive={isActive("/AdminDashboard/Admissions")} />
                </Link>
                <Link href="/AdminDashboard/StudentDirectoryPage">
                  <NavItem icon={<Folder size={18} />} label="Directory" isOpen isSubItem isActive={isActive("/AdminDashboard/StudentDirectoryPage")} />
                </Link>
                <Link href="/AdminDashboard/Guardian">
                  <NavItem icon={<UserCircle size={18} />} label="Guardians" isOpen isSubItem isActive={isActive("/AdminDashboard/Guardian")} />
                </Link>
              </div>
            )}
          </div> */}

          {/* Finance */}
          {/* <div className="px-4 py-2 gap-4">
            <NavItem 
            icon={<LucideWallet size={20}/>}
              label="Finances"
              isOpen={isSidebarOpen}
              isActive={isFinanceActive}
              hasChildren
              isExpanded={expandedSections.finance}
              onClick={()=> toggleSection("finance")}
            />
            {isSidebarOpen && expandedSections.finance && (
              <div className="ml-4 pl-4 border-l border-gray-700 mt-2 flex flex-col gap-2">
                <Link href="/AdminDashboard/Budget">
                  <NavItem icon={<LucideWalletCards size={18} />} label="Budget" isOpen isSubItem isActive={isActive("/AdminDashboard/Budget")} />
                </Link>
                <Link href="/AdminDashboard/Expenses">
                  <NavItem icon={<ChartBarDecreasing size={18} />} label="Expenses" isOpen isSubItem isActive={isActive("/AdminDashboard/Expenses")} />
                </Link>
                <Link href="/AdminDashboard/FeeManagement">
                  <NavItem icon={<CreditCardIcon size={18} />} label="Fee Management" isOpen isSubItem isActive={isActive("/AdminDashboard/FeeManagement")} />
                </Link>
                <Link href="/AdminDashboard/Invoices">
                  <NavItem icon={<ClipboardCheck size={18} />} label="Invoices" isOpen isSubItem isActive={isActive("/AdminDashboard/Invoices")} />
                </Link>
                <Link href="/AdminDashboard/Payment">
                  <NavItem icon={<ChartColumnDecreasing size={18} />} label="Payment" isOpen isSubItem isActive={isActive("/AdminDashboard/Payment")} />
                </Link>
                <Link href="/AdminDashboard/Reports">
                  <NavItem icon={<ChartLine size={18} />} label="Reports" isOpen isSubItem isActive={isActive("/AdminDashboard/Reports")} />
                </Link>
              </div>
            )}
          </div> */}

          {/* Facility */}
          {/* <div className="px-4 py-2 gap-4">
            <NavItem
              icon={<School2 size={20}/>}
              label="Facility"
              isOpen= {isSidebarOpen}
              isActive={isFacility}
              hasChildren
              isExpanded={expandedSections.facility}
              onClick={()=> toggleSection("facility")}
             />
             {isSidebarOpen && expandedSections.facility && (
              <div className="ml-4 pl-4 border-l border-gray-700 mt-2 flex flex-col gap-2">
                <Link href="/AdminDashboard/Canteen">
                  <NavItem icon={<ForkKnifeCrossedIcon size={18} />} label="Canteen" isOpen isSubItem isActive={isActive("/AdminDashboard/Canteen")} />
                </Link>
                <Link href="/AdminDashboard/Hostel">
                  <NavItem icon={<MapPinHouse size={18} />} label="Hostel" isOpen isSubItem isActive={isActive("/AdminDashboard/Hostel")} />
                </Link>
                <Link href="/AdminDashboard/Library">
                  <NavItem icon={<BookOpenText size={18} />} label="Library" isOpen isSubItem isActive={isActive("/AdminDashboard/Library")} />
                </Link>
                <Link href="/AdminDashboard/Maintenance">
                  <NavItem icon={<ToolCase size={18} />} label="Maintenance" isOpen isSubItem isActive={isActive("/AdminDashboard/Maintenance")} />
                </Link>
                <Link href="/AdminDashboard/RoomBooking">
                  <NavItem icon={<CalendarCheck size={18} />} label="RoomBooking" isOpen isSubItem isActive={isActive("/AdminDashboard/RoomBooking")} />
                </Link>
                <Link href="/AdminDashboard/Transport">
                  <NavItem icon={<CarTaxiFront size={18} />} label="Transport" isOpen isSubItem isActive={isActive("/AdminDashboard/Transport")} />
                </Link>
              </div>
             )}
          </div> */}

          {/* HR */}
          {/* <div className="px-4 py-2 gap-4">
            <NavItem
              icon={<UserPen size={20}/>}
              label="Staff (HR)"
              isOpen= {isSidebarOpen}
              isActive={isHR}
              hasChildren
              isExpanded={expandedSections.HR}
              onClick={()=> toggleSection("HR")}
            />
            {isSidebarOpen && expandedSections.HR && (
              <div className="ml-4 pl-4 border-l border-gray-700 mt-2 flex flex-col gap-2">
                <Link href="/AdminDashboard/Payroll">
                  <NavItem icon={<IdCardLanyard size={18} />} label="Payroll" isOpen isSubItem isActive={isActive("/AdminDashboard/Payroll")} />
                </Link>
                <Link href="/AdminDashboard/StaffDirectory">
                  <NavItem icon={<IdCardIcon size={18} />} label="StaffDirectory" isOpen isSubItem isActive={isActive("/AdminDashboard/StaffDirectory")} />
                </Link>
              </div>
            )}
          </div> */}

          {/* Resources */}
          {/* Communications */}
          {/* Settings */}
        </nav>
      </aside>

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"}`}>
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isSidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
            </button>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                className="flex items-center p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Open profile menu"
                title="Open profile menu"
              >
                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center justify-center">
                  {profileInitials}
                </div>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 top-12 w-52 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-900/10 overflow-hidden z-30">
                  <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50/70">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">User</p>
                    <p className="text-[11px] font-semibold text-slate-800 uppercase tracking-wide mt-1 truncate">{profileSchool}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{profileRole}</p>
                  </div>

                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                  >
                    <UserCircle size={13} />
                    Profile
                  </button>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                  >
                    <Settings size={13} />
                    Change Password
                  </button>
                  <button
                    type="button"
                    onClick={logout}
                    className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 border-t border-slate-100 flex items-center gap-2 transition-colors"
                  >
                    <LogOut size={13} />
                    Logout
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              className="p-2 hover:bg-gray-100 rounded-full relative"
              aria-label="View notifications"
              title="View notifications"
            >
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        <main className="relative overflow-y-auto h-full p-8">
          {isAccessDenied ? (
            <div className="mx-auto flex h-full max-w-3xl items-center justify-center">
              <div className="w-full rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center shadow-sm">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <ShieldAlert size={22} />
                </div>
                <h2 className="text-xl font-semibold text-rose-900">Forbidden</h2>
                <p className="mt-2 text-sm text-rose-700">
                  You do not have permission to access this page with your current role.
                </p>
              </div>
            </div>
          ) : children}
        </main>
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
