"use client";

import React from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { DashboardCard } from "../../../components/DashboardCard";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { CalendarDays, Layers, Sparkles, UserRoundPlus, UsersRound, X } from "lucide-react";
import { createClassRecord, hasDuplicateClass, loadClasses, saveClasses } from "../../../lib/classes-storage";
import { createStudentDirectoryRecord, loadStudentsDirectory, saveStudentsDirectory } from "../../../lib/students-storage";
import { students, users } from "../../../lib/school-data";

const normalize = (value: string) => value.trim().toLowerCase();
const ACADEMIC_YEAR_START_MONTH = 7; // August

const getCurrentAcademicYear = (date = new Date()) => {
  const year = date.getFullYear();
  const startYear = date.getMonth() >= ACADEMIC_YEAR_START_MONTH ? year : year - 1;
  return `${startYear}/${startYear + 1}`;
};

const buildAcademicYearOptions = (currentAcademicYear: string) => {
  const currentStartYear = Number(currentAcademicYear.split("/")[0]);
  return Array.from({ length: 5 }, (_, index) => {
    const year = currentStartYear - 2 + index;
    return `${year}/${year + 1}`;
  });
};

type CreationMode = "single" | "group";
type StudentStep = "profile" | "guardian";

export default function AcademicsDashboard() {
  const router = useRouter();

  const [isClassModalOpen, setIsClassModalOpen] = React.useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = React.useState(false);

  const [creationMode, setCreationMode] = React.useState<CreationMode>("single");
  const [className, setClassName] = React.useState("");
  const [section, setSection] = React.useState("");
  const [groupClassName, setGroupClassName] = React.useState("");
  const [groupSourceSections, setGroupSourceSections] = React.useState<string[]>([]);
  const [groupTargetSection, setGroupTargetSection] = React.useState("");
  const [teacherAssignmentMode, setTeacherAssignmentMode] = React.useState<"now" | "later">("later");
  const [teacherId, setTeacherId] = React.useState("");

  const [studentStep, setStudentStep] = React.useState<StudentStep>("profile");
  const [studentName, setStudentName] = React.useState("");
  const [studentClassAssignmentMode, setStudentClassAssignmentMode] = React.useState<"now" | "later">("later");
  const [selectedClassId, setSelectedClassId] = React.useState("");
  const [admissionDate, setAdmissionDate] = React.useState(new Date().toISOString().slice(0, 10));
  const currentAcademicYear = React.useMemo(() => getCurrentAcademicYear(), []);
  const academicYearOptions = React.useMemo(() => buildAcademicYearOptions(currentAcademicYear), [currentAcademicYear]);
  const [academicYearMode, setAcademicYearMode] = React.useState<"configured" | "custom">("configured");
  const [configuredAcademicYear, setConfiguredAcademicYear] = React.useState(currentAcademicYear);
  const [customAcademicYear, setCustomAcademicYear] = React.useState("");
  const [guardianName, setGuardianName] = React.useState("");
  const [guardianRelationship, setGuardianRelationship] = React.useState("");
  const [guardianContact, setGuardianContact] = React.useState("");
  const [guardianOptionalContact, setGuardianOptionalContact] = React.useState("");
  const [houseAddress, setHouseAddress] = React.useState("");
  const [emergencyContactName, setEmergencyContactName] = React.useState("");
  const [emergencyRelationship, setEmergencyRelationship] = React.useState("");
  const [emergencyPhone, setEmergencyPhone] = React.useState("");
  const [previousAcademicHistory, setPreviousAcademicHistory] = React.useState("");
  const [healthRecords, setHealthRecords] = React.useState("");

  const [errorMessage, setErrorMessage] = React.useState("");
  const [studentErrorMessage, setStudentErrorMessage] = React.useState("");

  const [classDirectory, setClassDirectory] = React.useState(loadClasses());

  const cards = [
    { title: "Assessments", path: "/AdminDashboard/Academics/Assessments" },
    { title: "Terminal Reports", path: "/AdminDashboard/Academics/Reports" },
    { title: "Classes", path: "/AdminDashboard/Academics/Classes" },
    { title: "Students", path: "/AdminDashboard/Academics/Students" },
    { title: "Sections" },
    { title: "Subjects" },
    { title: "Time Table" },
    { title: "Attendance" },
    { title: "Student Leaves" },
    { title: "Study Materials" },
    { title: "Home Work" },
    { title: "Notice Board" },
    { title: "Events" },
    { title: "Live Classes (Go Pro)" },
  ];

  const classTeachers = React.useMemo(() => users.filter((user) => user.role === "class_teacher"), []);

  const classSectionMap = React.useMemo(() => {
    const map = new Map<string, Set<string>>();

    students.forEach((student) => {
      const key = student.className.trim();
      const sections = map.get(key) ?? new Set<string>();
      sections.add(student.section.trim());
      map.set(key, sections);
    });

    return map;
  }, []);

  const groupClassOptions = React.useMemo(
    () => Array.from(classSectionMap.keys()).map((name) => ({ value: name, label: name })),
    [classSectionMap],
  );

  const availableGroupSections = React.useMemo(() => {
    if (!groupClassName) {
      return [];
    }

    return Array.from(classSectionMap.get(groupClassName) ?? []).sort();
  }, [classSectionMap, groupClassName]);

  const classOptions = React.useMemo(
    () =>
      classDirectory.map((item) => ({
        value: item.id,
        label: `${item.className}${item.section}`,
      })),
    [classDirectory],
  );

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const refreshClassDirectory = React.useCallback(() => {
    setClassDirectory(loadClasses());
  }, []);

  const closeClassModal = () => {
    setIsClassModalOpen(false);
    setCreationMode("single");
    setClassName("");
    setSection("");
    setGroupClassName("");
    setGroupSourceSections([]);
    setGroupTargetSection("");
    setTeacherAssignmentMode("later");
    setTeacherId("");
    setErrorMessage("");
  };

  const openClassModal = () => {
    setIsClassModalOpen(true);
    setErrorMessage("");
  };

  const closeStudentModal = () => {
    setIsStudentModalOpen(false);
    setStudentStep("profile");
    setStudentName("");
    setStudentClassAssignmentMode("later");
    setSelectedClassId("");
    setAdmissionDate(new Date().toISOString().slice(0, 10));
    setAcademicYearMode("configured");
    setConfiguredAcademicYear(currentAcademicYear);
    setCustomAcademicYear("");
    setGuardianName("");
    setGuardianRelationship("");
    setGuardianContact("");
    setGuardianOptionalContact("");
    setHouseAddress("");
    setEmergencyContactName("");
    setEmergencyRelationship("");
    setEmergencyPhone("");
    setPreviousAcademicHistory("");
    setHealthRecords("");
    setStudentErrorMessage("");
  };

  const openStudentModal = () => {
    refreshClassDirectory();
    setIsStudentModalOpen(true);
    setStudentErrorMessage("");
  };

  const toggleSourceSection = (value: string) => {
    setGroupSourceSections((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  };

  const handleAdd = (cardTitle: string, cardPath?: string) => {
    if (cardTitle === "Classes") {
      openClassModal();
      return;
    }

    if (cardTitle === "Students") {
      openStudentModal();
      return;
    }

    if (cardPath) {
      router.push(cardPath);
      return;
    }

    console.log(`Add ${cardTitle}`);
  };

  const createClass = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const existing = loadClasses();

    let finalClassName = "";
    let finalSection = "";
    let sourceSections: string[] | undefined;

    if (creationMode === "single") {
      finalClassName = className.trim();
      finalSection = section.trim();

      if (!finalClassName || !finalSection) {
        setErrorMessage("Class name and section are required.");
        return;
      }
    } else {
      finalClassName = groupClassName.trim();
      finalSection = groupTargetSection.trim();
      sourceSections = groupSourceSections;

      if (!finalClassName || !finalSection) {
        setErrorMessage("Base class and new section are required.");
        return;
      }

      if (groupSourceSections.length < 2) {
        setErrorMessage("Select at least two source sections to merge.");
        return;
      }

      if (groupSourceSections.some((sectionName) => normalize(sectionName) === normalize(finalSection))) {
        setErrorMessage("New section must be different from selected source sections.");
        return;
      }
    }

    if (hasDuplicateClass(existing, finalClassName, finalSection)) {
      setErrorMessage("Class and section already exist.");
      return;
    }

    if (teacherAssignmentMode === "now" && !teacherId) {
      setErrorMessage("Select a class teacher or choose assign later.");
      return;
    }

    const assignedTeacher = classTeachers.find((teacher) => teacher.id === teacherId);
    const next = [
      createClassRecord(finalClassName, finalSection, {
        classTeacherId: teacherAssignmentMode === "now" ? assignedTeacher?.id : undefined,
        classTeacherName: teacherAssignmentMode === "now" ? assignedTeacher?.fullName : undefined,
        sourceSections,
      }),
      ...existing,
    ];

    saveClasses(next);
    refreshClassDirectory();
    closeClassModal();
  };

  const createStudent = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const selectedAcademicYear =
      academicYearMode === "configured" ? configuredAcademicYear : customAcademicYear.trim();

    const trimmedName = studentName.trim();
    if (!trimmedName) {
      setStudentErrorMessage("Student name is required.");
      return;
    }

    if (!admissionDate || !selectedAcademicYear) {
      setStudentErrorMessage("Admission date and academic year are required.");
      return;
    }

    if (!guardianName.trim() || !guardianRelationship.trim() || !guardianContact.trim()) {
      setStudentErrorMessage("Guardian name, relationship, and contact are required.");
      return;
    }

    if (!houseAddress.trim()) {
      setStudentErrorMessage("House address is required.");
      return;
    }

    if (!emergencyContactName.trim() || !emergencyRelationship.trim() || !emergencyPhone.trim()) {
      setStudentErrorMessage("Emergency contact details are required.");
      return;
    }

    if (studentClassAssignmentMode === "now" && !selectedClassId) {
      setStudentErrorMessage("Select a class or choose assign later.");
      return;
    }

    const selectedClass = classDirectory.find((item) => item.id === selectedClassId);

    const existing = loadStudentsDirectory();
    const next = [
      createStudentDirectoryRecord({
        fullName: trimmedName,
        classAssignmentMode: studentClassAssignmentMode,
        className: selectedClass?.className,
        section: selectedClass?.section,
        admissionDate,
        academicYear: selectedAcademicYear,
        guardianName,
        guardianRelationship,
        guardianPrimaryContact: guardianContact,
        guardianSecondaryContact: guardianOptionalContact,
        houseAddress,
        emergencyContactName,
        emergencyContactRelationship: emergencyRelationship,
        emergencyContactPhone: emergencyPhone,
        previousAcademicHistory,
        healthRecords,
      }),
      ...existing,
    ];

    saveStudentsDirectory(next);
    closeStudentModal();
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Academics</h2>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="h-[calc(100vh-11rem)] overflow-hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
      >
        {cards.map((card) => (
          <motion.div key={card.title} variants={itemVariants}>
            <DashboardCard
              title={card.title}
              compact
              onView={() => (card.path ? router.push(card.path) : console.log(`View ${card.title}`))}
              onAdd={() => handleAdd(card.title, card.path)}
            />
          </motion.div>
        ))}
      </motion.div>

      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Create Class</h3>
                <p className="text-xs text-slate-500">Add a class directly or build one by grouping student sections.</p>
              </div>
              <button
                type="button"
                onClick={closeClassModal}
                aria-label="Close modal"
                className="rounded-full p-1 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={createClass} className="space-y-5 px-6 py-5">
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setCreationMode("single")}
                  className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    creationMode === "single" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Sparkles size={14} />
                  Create Directly
                </button>
                <button
                  type="button"
                  onClick={() => setCreationMode("group")}
                  className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    creationMode === "group" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Layers size={14} />
                  Group Sections
                </button>
              </div>

              {creationMode === "single" ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input label="Class Name" value={className} onChange={(event) => setClassName(event.target.value)} placeholder="JHS 1" required />
                  <Input label="Section" value={section} onChange={(event) => setSection(event.target.value)} placeholder="C" required />
                </div>
              ) : (
                <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Select
                      label="Base Class Name"
                      value={groupClassName}
                      onChange={(event) => {
                        setGroupClassName(event.target.value);
                        setGroupSourceSections([]);
                      }}
                      options={groupClassOptions}
                    />
                    <Input label="New Section" value={groupTargetSection} onChange={(event) => setGroupTargetSection(event.target.value)} placeholder="C" required />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-700">Source Sections to Combine</p>
                    <p className="mt-1 text-xs text-slate-500">Select at least two sections from the same class name.</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {availableGroupSections.length > 0 ? (
                        availableGroupSections.map((option) => {
                          const active = groupSourceSections.includes(option);
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => toggleSourceSection(option)}
                              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                active
                                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                  : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
                              }`}
                            >
                              {groupClassName}
                              {option}
                            </button>
                          );
                        })
                      ) : (
                        <p className="text-xs text-slate-500">Choose a base class to load available sections.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center gap-2 text-slate-800">
                  <UserRoundPlus size={16} />
                  <p className="text-sm font-semibold">Class Teacher Assignment</p>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setTeacherAssignmentMode("later")}
                    className={`rounded-md px-3 py-2 text-xs font-medium ${
                      teacherAssignmentMode === "later" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                    }`}
                  >
                    Assign Later
                  </button>
                  <button
                    type="button"
                    onClick={() => setTeacherAssignmentMode("now")}
                    className={`rounded-md px-3 py-2 text-xs font-medium ${
                      teacherAssignmentMode === "now" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                    }`}
                  >
                    Assign Now
                  </button>
                </div>

                {teacherAssignmentMode === "now" && (
                  <div className="mt-3">
                    <Select
                      label="Class Teacher"
                      value={teacherId}
                      onChange={(event) => setTeacherId(event.target.value)}
                      options={classTeachers.map((teacher) => ({ value: teacher.id, label: teacher.fullName }))}
                      required
                    />
                  </div>
                )}
              </div>

              {errorMessage && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{errorMessage}</p>}

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <Button type="button" variant="outline" className="h-10 px-4" onClick={closeClassModal}>
                  Cancel
                </Button>
                <Button type="submit" className="h-10 px-4">
                  Save Class
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isStudentModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Register Student</h3>
                <p className="text-xs text-slate-500">Capture profile, guardian, emergency, and optional history/health details.</p>
              </div>
              <button
                type="button"
                onClick={closeStudentModal}
                aria-label="Close modal"
                className="rounded-full p-1 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={createStudent} className="space-y-5 px-6 py-5">
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setStudentStep("profile")}
                  className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    studentStep === "profile" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <UsersRound size={14} />
                  Profile & Class
                </button>
                <button
                  type="button"
                  onClick={() => setStudentStep("guardian")}
                  className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    studentStep === "guardian" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <UserRoundPlus size={14} />
                  Guardian & Health
                </button>
              </div>

              {studentStep === "profile" ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input label="Student Name" value={studentName} onChange={(event) => setStudentName(event.target.value)} placeholder="Student full name" required />

                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="text-sm font-semibold text-slate-800">Academic Year</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
                      <button
                        type="button"
                        onClick={() => setAcademicYearMode("configured")}
                        className={`rounded-md px-3 py-2 text-xs font-medium ${
                          academicYearMode === "configured" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                        }`}
                      >
                        Use Configured
                      </button>
                      <button
                        type="button"
                        onClick={() => setAcademicYearMode("custom")}
                        className={`rounded-md px-3 py-2 text-xs font-medium ${
                          academicYearMode === "custom" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                        }`}
                      >
                        Provide Manually
                      </button>
                    </div>

                    {academicYearMode === "configured" ? (
                      <div className="mt-3">
                        <Select
                          label="Academic Year (Configured)"
                          value={configuredAcademicYear}
                          onChange={(event) => setConfiguredAcademicYear(event.target.value)}
                          options={academicYearOptions.map((year) => ({ value: year, label: year }))}
                        />
                      </div>
                    ) : (
                      <div className="mt-3">
                        <Input
                          label="Academic Year (Manual)"
                          value={customAcademicYear}
                          onChange={(event) => setCustomAcademicYear(event.target.value)}
                          placeholder={currentAcademicYear}
                          required
                        />
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-800">Admission Date</p>
                      <button
                        type="button"
                        onClick={() => setAdmissionDate(new Date().toISOString().slice(0, 10))}
                        className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
                      >
                        Today
                      </button>
                    </div>
                    <label className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-emerald-600">
                      <CalendarDays size={15} className="text-slate-400" />
                      <input
                        type="date"
                        value={admissionDate}
                        onChange={(event) => setAdmissionDate(event.target.value)}
                        className="w-full bg-transparent text-sm text-slate-700 outline-none"
                        required
                      />
                    </label>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-3 md:col-span-2">
                    <p className="text-sm font-semibold text-slate-800">Class Assignment</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
                      <button
                        type="button"
                        onClick={() => setStudentClassAssignmentMode("later")}
                        className={`rounded-md px-3 py-2 text-xs font-medium ${
                          studentClassAssignmentMode === "later" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                        }`}
                      >
                        Assign Later
                      </button>
                      <button
                        type="button"
                        onClick={() => setStudentClassAssignmentMode("now")}
                        className={`rounded-md px-3 py-2 text-xs font-medium ${
                          studentClassAssignmentMode === "now" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                        }`}
                      >
                        Assign Now
                      </button>
                    </div>

                    {studentClassAssignmentMode === "now" && (
                      <div className="mt-3">
                        <Select
                          label="Select Class"
                          value={selectedClassId}
                          onChange={(event) => setSelectedClassId(event.target.value)}
                          options={classOptions}
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input label="Guardian Name" value={guardianName} onChange={(event) => setGuardianName(event.target.value)} placeholder="Guardian full name" required />
                  <Input label="Relationship" value={guardianRelationship} onChange={(event) => setGuardianRelationship(event.target.value)} placeholder="Mother, Father, Aunt..." required />
                  <Input label="Guardian Contact" value={guardianContact} onChange={(event) => setGuardianContact(event.target.value)} placeholder="Primary phone" required />
                  <Input label="Optional Contact" value={guardianOptionalContact} onChange={(event) => setGuardianOptionalContact(event.target.value)} placeholder="Secondary phone (optional)" />
                  <Input label="Emergency Contact Name" value={emergencyContactName} onChange={(event) => setEmergencyContactName(event.target.value)} placeholder="Who to call if guardian unavailable" required />
                  <Input label="Emergency Relationship" value={emergencyRelationship} onChange={(event) => setEmergencyRelationship(event.target.value)} placeholder="Uncle, Sister..." required />
                  <Input label="Emergency Contact" value={emergencyPhone} onChange={(event) => setEmergencyPhone(event.target.value)} placeholder="Emergency phone" required />

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">House Address</label>
                    <textarea
                      className="w-full min-h-20 rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                      value={houseAddress}
                      onChange={(event) => setHouseAddress(event.target.value)}
                      placeholder="Digital or physical home address"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Previous Academic History (Optional)</label>
                    <textarea
                      className="w-full min-h-20 rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                      value={previousAcademicHistory}
                      onChange={(event) => setPreviousAcademicHistory(event.target.value)}
                      placeholder="Previous school or academic notes"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Health Records (Optional)</label>
                    <textarea
                      className="w-full min-h-20 rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                      value={healthRecords}
                      onChange={(event) => setHealthRecords(event.target.value)}
                      placeholder="Allergies, conditions, special care notes"
                    />
                  </div>
                </div>
              )}

              {studentErrorMessage && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{studentErrorMessage}</p>}

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <Button type="button" variant="outline" className="h-10 px-4" onClick={closeStudentModal}>
                  Cancel
                </Button>
                <Button type="submit" className="h-10 px-4">
                  Save Student
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
