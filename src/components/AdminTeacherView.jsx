// AdminTeacherView.jsx
import React, { useState, useEffect } from "react";
import { Search, PlusCircle, FileText, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import GradesEntryTable from "./GradesEntryTable";
import TermSessionModal from "./TermSessionModal";
import ClassReportsModal from "./ClassReportsModal";
import FullReportTemplate from "./FullReportTemplate";

const AdminTeacherView = ({ role, userId, assignedClass }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showTermSessionModal, setShowTermSessionModal] = useState(false);
  const [showClassReportsModal, setShowClassReportsModal] = useState(false);

  // Selection state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedReportType, setSelectedReportType] = useState(null);
  const [openedReport, setOpenedReport] = useState(null);

  // Term/session selection
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  // Data state
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [availableReports, setAvailableReports] = useState([]);

  const [classList, setClassList] = useState([]);

  // inside AdminTeacherView component:
  const [mode, setMode] = useState("read"); // "read" | "edit"

  // Demo fallbacks (keep same as ReportsPage)
  const demoStudents = [
    {
      studentId: "DBCS00124",
      firstName: "John",
      lastName: "Doe",
      className: "JSS1",
    },
    {
      studentId: "DBCS00125",
      firstName: "Jane",
      lastName: "Smith",
      className: "JSS2",
    },
    {
      studentId: "DBCS00126",
      firstName: "Michael",
      lastName: "Lee",
      className: "JSS2",
    },
  ];

  const demoSubjects = ["Mathematics", "English", "Biology", "Chemistry"];

  const demoReports = [
    {
      id: "rep001",
      studentId: "DBCS00124",
      term: "First Term",
      session: "2024/2025",
      className: "JSS2",
      teacherId: "TCH001EA",
      dateRecorded: "2025-06-14T20:32:50",
      subjectRecords: [
        { subject: "Mathematics", test: 15, exam: 70, total: 85 },
        { subject: "English", test: 18, exam: 65, total: 83 },
      ],
      type: "grades",
    },
  ];

  // --- All the same logic from your ReportsPage (class fetch, students fetch, reports fetch, etc.) ---
  // Copy your current useEffects + handlers here, unchanged.
  // Example for fetching classes:
  useEffect(() => {
    if (role === "admin") {
      const fetchClasses = async () => {
        try {
          const res = await fetch("/api/classes");
          const data = await res.json();
          setClassList(
            data.length
              ? data
              : ["JSS1", "JSS2", "JSS3", "SSS1", "SSS2", "SSS3"]
          );
          setSelectedClass(data[0] || "JSS1");
        } catch (err) {
          setClassList(["JSS1", "JSS2", "JSS3", "SSS1", "SSS2", "SSS3"]);
          setSelectedClass("JSS1");
        }
      };
      fetchClasses();
    } else {
      setSelectedClass(assignedClass);
    }
  }, [role, assignedClass]);

  // (...continue with your student fetching, subjects fetching, search, etc...)
  const switchClass = (cls) => {
    setSelectedClass(cls);
  };

  // Fetch students for class-level
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const endpoint =
          role === "admin"
            ? "/api/students"
            : `/api/students?className=${assignedClass}`;
        const res = await fetch(endpoint);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Invalid students data");
        setStudents(data);
      } catch (err) {
        toast.dismiss();
        toast.error("Failed to load students");
        setStudents(
          role === "admin"
            ? demoStudents
            : demoStudents.filter((s) => s.className == assignedClass)
        );
      }
    };
    fetchStudents();
  }, [role, assignedClass]);

  // Fetch subjects for selected class
  useEffect(() => {
    if (selectedClass) {
      const fetchSubjects = async () => {
        try {
          const res = await fetch(`/api/subjects?class=${selectedClass}`);
          const data = await res.json();
          setSubjects(data);
        } catch (err) {
          setSubjects(demoSubjects);
        }
      };
      fetchSubjects();
      // setFilteredStudents(
      //   students.filter((s) => s.className === selectedClass)
      // );
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && students.length > 0) {
      setFilteredStudents(
        students.filter((s) => s.className === selectedClass)
      );
    }
  }, [selectedClass, students]);

  // Fetch available reports
  useEffect(() => {
    if (!selectedStudent) return;

    const fetchReports = async () => {
      try {
        const res = await fetch(
          `/api/reports?studentId=${selectedStudent.studentId}`
        );
        const data = await res.json();

        // normalize
        const enriched = data.map((rep) => ({
          ...rep,
          type: rep.type || "grades",
        }));

        // set baseline reports
        setAvailableReports(enriched);

        // now process grades reports into full reports
        const gradesReports = enriched.filter((rep) => rep.type === "grades");

        for (const gradesRep of gradesReports) {
          const full = await ensureFullReportForGrades(
            gradesRep,
            selectedStudent
          );
          if (!full) continue;

          setAvailableReports((prev) => {
            const list = Array.isArray(prev) ? [...prev] : [];
            const exists = list.some(
              (r) =>
                r.type === "full" &&
                r.studentId === full.studentId &&
                r.term === full.term &&
                r.session === full.session
            );
            return exists ? list : [...list, full];
          });
        }
      } catch (err) {
        console.error("Fetch failed, using demo data:", err);
        setAvailableReports(demoReports);

        const gradesReports = demoReports.filter(
          (rep) => rep.type === "grades"
        );
        for (const gradesRep of gradesReports) {
          const full = await ensureFullReportForGrades(
            gradesRep,
            selectedStudent
          );
          if (!full) continue;

          setAvailableReports((prev) => {
            const list = Array.isArray(prev) ? [...prev] : [];
            const exists = list.some(
              (r) =>
                r.type === "full" &&
                r.studentId === full.studentId &&
                r.term === full.term &&
                r.session === full.session
            );
            return exists ? list : [...list, full];
          });
        }
      }
    };

    fetchReports();
  }, [selectedStudent]);

  // Search filter
  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();
    if (searchTerm) {
      setFilteredStudents(
        students.filter(
          (student) =>
            student.firstName.toLowerCase().includes(lowerSearch) ||
            student.lastName.toLowerCase().includes(lowerSearch) ||
            student.studentId.toLowerCase().includes(lowerSearch)
        )
      );
    } else {
      setFilteredStudents([]);
    }
  }, [searchTerm, students]);

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setSelectedReportType("grades");
    setSearchTerm("");
  };

  const [linkTo, setLinkTo] = useState("new");

  const handleOpenModal = () => setShowTermSessionModal(true);

  const handleModalSubmit = ({ term, session, className }) => {
    setSelectedTerm(term);
    setSelectedSession(session);
    if (className) setSelectedClass(className);
    setShowTermSessionModal(false);

    const classLevel = !selectedStudent;

    if (linkTo == "new") {
      handleCreateNewRecord(classLevel, term, session, className);
    } else {
      setShowClassReportsModal(true);
    }

    //handle full reports selection
  };

  const handleBack = () => {
    if (openedReport) {
      setOpenedReport(null);
    } else if (selectedReportType) {
      setSelectedReportType(null);
    } else if (selectedStudent) {
      setSelectedStudent(null);
    } else if (selectedClass && role === "admin") {
      setSelectedClass(role != admin ? assignedClass : classList[0] || "JSS1");
    }
  };

  const handleCreateNewRecord = async (
    isClassLevel,
    term,
    session,
    className
  ) => {
    try {
      if (isClassLevel) {
        setSelectedReportType("grades");
        const res = await fetch(
          `/api/reports/grades/class?className=${className}&term=${term}&session=${session}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.records?.length) {
            setOpenedReport(data);
            return;
          }
        }
      } else {
        // Include check for class(report.className === selectedClass) for all new or existing report; May not be necessary as session validates class
        const existing = availableReports.find(
          (rep) =>
            rep.studentId === selectedStudent.studentId &&
            rep.term === term &&
            rep.session === session &&
            rep.type === selectedReportType
        );
        if (existing) {
          setOpenedReport(existing);
          return;
        }
      }
    } catch (err) {
      console.warn(
        "Error checking existing reports, falling back to blank:",
        err
      );
    }

    if (selectedReportType === "full") {
      // only individual flow for now (full is per-student)
      const student = selectedStudent;
      if (!student) return; // you can force a selection or show a toast

      // check if a full report already exists for this term/session
      try {
        const q = `/api/reports/full?studentId=${student.studentId}&term=${term}&session=${session}`;
        const r = await fetch(q);
        if (r.ok) {
          const existing = await r.json();
          if (Array.isArray(existing) && existing.length) {
            setOpenedReport(existing[0]);
            setMode("edit");
            return;
          }
        }
      } catch {}

      // if a grades report exists for same term/session, build from it; else make empty shell
      const existingGrades = availableReports.find(
        (rep) =>
          rep.type === "grades" &&
          rep.studentId === student.studentId &&
          rep.term === term &&
          rep.session === session
      );

      const newFull = existingGrades
        ? buildFullReportFromGrades(existingGrades, student)
        : {
            id: `${student.studentId}-${term}-${session}-full`,
            title: `${term} Full Report`,
            type: "full",
            status: "draft",
            studentId: student.studentId,
            studentName: `${student.firstName} ${student.lastName}`,
            className: student.className,
            term: term,
            session: session,
            teacherId: userId,
            dateRecorded: new Date().toISOString(),
            subjectRecords: (subjects || []).map((sub) => ({
              subject: sub,
              test: "",
              exam: "",
              total: "",
            })),
            attendance: { presentDays: "", totalDays: "", resumptionDate: "" },
            indicators: {},
            comments: {},
            totalScore: 0,
            percentage: 0,
          };

      setOpenedReport(newFull);
      setMode("edit");
      return;
    }

    if (selectedReportType === "grades") {
      // fallback → create blank report
      const blankReport = isClassLevel
        ? {
            records: students
              .filter((s) => s.className === className)
              .map((s) => ({
                studentId: s.studentId,
                term,
                session,
                className,
                teacherId: userId,
                dateRecorded: new Date().toISOString(),
                subjectRecords: subjects.map((sub) => ({
                  subject: sub,
                  test: "",
                  exam: "",
                  total: "",
                })),
              })),
          }
        : {
            studentId: selectedStudent.studentId,
            term,
            session,
            className: selectedStudent.className,
            teacherId: userId,
            dateRecorded: new Date().toISOString(),
            subjectRecords: subjects.map((sub) => ({
              subject: sub,
              test: "",
              exam: "",
              total: "",
            })),
          };

      setOpenedReport(blankReport);
    }
  };

  // Build a Full Report from a Grades report
  const buildFullReportFromGrades = (gradesRep, studentInfo = {}) => ({
    id:
      gradesRep.id ||
      `${gradesRep.studentId}-${gradesRep.term}-${gradesRep.session}-full`,
    title: `${gradesRep.term} Full Report`,
    type: "full",
    status: "draft",
    studentId: gradesRep.studentId,
    studentName:
      studentInfo.studentName ||
      `${studentInfo.firstName || ""} ${studentInfo.lastName || ""}`.trim(),
    className: gradesRep.className,
    term: gradesRep.term,
    session: gradesRep.session,
    teacherId: gradesRep.teacherId,
    dateRecorded: gradesRep.dateRecorded || new Date().toISOString(),
    subjectRecords: (gradesRep.subjectRecords || []).map((s) => ({
      subject: s.subject,
      test: s.test ?? "",
      exam: s.exam ?? "",
      total: s.total ?? "",
    })),
    attendance: { presentDays: "", totalDays: "", resumptionDate: "" },
    indicators: {}, // attendance/behavior/...
    comments: {}, // teacher/headTeacher
    totalScore: 0,
    percentage: 0,
  });

  const ensureFullReportForGrades = async (gradesRep, studentInfo) => {
    try {
      // ask server if full exists
      const r = await fetch(
        `/api/reports/full?studentId=${gradesRep.studentId}&term=${gradesRep.term}&session=${gradesRep.session}`
      );
      if (r.ok) {
        const existing = await r.json();
        if (Array.isArray(existing) && existing.length) return existing[0];
      }
    } catch {}

    // not found → make one (client-side draft, then you can save)
    const fullDraft = buildFullReportFromGrades(gradesRep, studentInfo);
    return fullDraft;
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-purple-600 hover:text-purple-800"
      >
        <ArrowLeft size={18} /> Back
      </button>

      {/* Search */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-3 top-3 text-purple-500" size={18} />
          <input
            type="text"
            placeholder="Search student by name or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 rounded-lg border-purple-300 focus:ring-2 focus:ring-purple-400 text-purple-700"
          />
        </div>
        {!searchTerm && !selectedStudent && (
          <button
            className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded hover:bg-violet-700"
            onClick={() => {
              setLinkTo("new");
              handleOpenModal();
            }}
          >
            <PlusCircle size={18} /> Create Report
          </button>
        )}
      </div>

      {/* Admin class bubbles */}
      {role === "admin" && classList.length > 0 && !selectedStudent && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {classList.map((cls) => (
              <span
                key={cls}
                className={`px-3 py-1 rounded-full cursor-pointer ${
                  selectedClass === cls
                    ? "bg-purple-500 text-white"
                    : "bg-purple-100 text-purple-700"
                }`}
                onClick={() => switchClass(cls)}
              >
                {cls}
              </span>
            ))}
          </div>
        </>
      )}

      {role === "admin" && selectedClass && !selectedStudent && (
        <div className="mb-4">
          <button
            onClick={() => {
              setLinkTo("approved");
              handleOpenModal();
            }}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            <FileText size={18} /> Full Reports - {selectedClass}
          </button>
        </div>
      )}

      {/* Student Cards */}
      {filteredStudents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <div
              key={student.studentId}
              className="bg-white p-4 border rounded shadow hover:shadow-md cursor-pointer"
              onClick={() => {
                handleStudentSelect(student);
                setFilteredStudents([]);
              }}
            >
              <h3 className="font-bold text-purple-700">
                {student.firstName} {student.lastName}
              </h3>
              <p className="text-sm text-gray-500">ID: {student.studentId}</p>
              <p className="text-sm text-purple-500">
                Class: {student.className}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Report type selection for student */}
      {selectedStudent && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-violet-700 mb-2">
            {selectedStudent.firstName} {selectedStudent.lastName}
          </h3>
          <p className="text-sm text-red-500 mb-2">
            Student ID: {selectedStudent.studentId}
          </p>
          <div className="flex gap-2 flex-wrap">
            {["attendance", "grades", "full"].map((type) => (
              <button
                key={type}
                className={`w-40 h-24 rounded shadow border flex flex-col items-center justify-center ${
                  selectedReportType === type
                    ? "bg-violet-600 hover:bg-purple-500 text-white"
                    : "bg-white hover:bg-purple-100 text-purple-700"
                }`}
                onClick={() => setSelectedReportType(type)}
              >
                <FileText className="mb-1" />
                <span className="capitalize">{type}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {(selectedReportType === "grades" || selectedReportType === "full") &&
        !openedReport && (
          <div>
            <button
              className="mt-4 flex items-center gap-2 bg-purple-600 text-white px-3 py-2 rounded"
              onClick={() => {
                setLinkTo("new");
                handleOpenModal();
              }}
            >
              <PlusCircle size={16} /> Create New Record
            </button>
          </div>
        )}

      {/* Available reports list */}
      {selectedReportType && !openedReport && (
        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-bold text-purple-700 mb-3">
            Available {selectedReportType} Reports
          </h4>

          {(() => {
            const filteredReports = availableReports.filter(
              (rep) =>
                rep.type === selectedReportType &&
                rep.studentId === selectedStudent.studentId
            );

            return filteredReports.length > 0 ? (
              <ul className="space-y-2">
                {filteredReports.map((rep) => (
                  <li
                    key={rep.id} //Change the key
                    className="flex justify-between items-center border-b-2 p-2 rounded text-violet-800"
                  >
                    <span className="flex flex-col">
                      <span className="text-xl font-bold">{rep.term}</span>
                      <span className="text-s text-red-500">
                        {rep.session} | {rep.className}
                      </span>
                    </span>
                    <div className="flex gap-2">
                      <button
                        className="px-2 py-1 bg-green-600 text-white rounded"
                        onClick={() => {
                          setOpenedReport(rep);
                          setMode("read");
                        }}
                      >
                        View
                      </button>
                      {(selectedReportType === "grades" ||
                        selectedReportType === "full") && (
                        <button
                          className="px-2 py-1 text-red-400 border border-red-400 rounded cursor-pointer"
                          onClick={() => {
                            setOpenedReport(rep);
                            setMode("edit");
                          }}
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No reports available</p>
            );
          })()}
        </div>
      )}

      {/* Report details with GradesEntryTable */}
      {openedReport && selectedReportType === "grades" && (
        <div className="bg-white p-4 rounded shadow">
          <GradesEntryTable
            students={
              openedReport.records
                ? openedReport.records.map((r) =>
                    students.find((s) => s.studentId === r.studentId)
                  )
                : openedReport.studentId
                ? [
                    students.find(
                      (s) => s.studentId === openedReport.studentId
                    ) || selectedStudent,
                  ]
                : students.filter((s) => s.className === openedReport.className)
            }
            subjects={subjects}
            initialData={
              openedReport.records ? openedReport.records : [openedReport]
            }
            isClassLevel={!!openedReport.records}
            className={
              openedReport.records ? selectedClass : openedReport.className
            }
            term={openedReport.records ? selectedTerm : openedReport.term}
            session={
              openedReport.records ? selectedSession : openedReport.session
            }
            teacherId={openedReport.teacherId}
          />
        </div>
      )}

      {selectedReportType === "attendance" && (
        <p>Attendance view coming soon...</p>
      )}
      {selectedReportType === "full" && openedReport && (
        <div className="bg-white p-4 rounded shadow">
          <FullReportTemplate
            report={openedReport}
            mode={mode}
            role={role}
            onClose={() => setOpenedReport(null)}
            onSave={async (payload) => {
              try {
                const res = await fetch("/api/reports/full", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                });

                if (!res.ok) {
                  const errText = await res.text();
                  console.error("Save failed:", errText);
                  throw new Error("Failed to save full report");
                }

                const saved = await res.json().catch(() => payload);

                setOpenedReport(saved); // now from server
                setAvailableReports((prev) => {
                  const arr = Array.isArray(prev) ? [...prev] : [];
                  const idx = arr.findIndex(
                    (r) =>
                      r.type === "full" &&
                      r.studentId === saved.studentId &&
                      r.term === saved.term &&
                      r.session === saved.session
                  );
                  if (idx >= 0) arr[idx] = saved;
                  else arr.push(saved);
                  return arr;
                });

                setMode("read");
                toast.info(openedReport.id, "saved");
              } catch (e) {
                console.error("Save error:", e);
                toast.info(`${openedReport.id} saved!`);
                setMode("read");
              }
            }}
          />
        </div>
      )}

      {showTermSessionModal && (
        <TermSessionModal
          isOpen={showTermSessionModal}
          onClose={() => setShowTermSessionModal(false)}
          onSubmit={handleModalSubmit}
          userRole={role}
          assignedClass={selectedClass}
        />
      )}

      {showClassReportsModal && (
        <ClassReportsModal
          isOpen={showClassReportsModal}
          onClose={() => setShowClassReportsModal(false)}
          selectedClass={selectedClass}
          term={selectedTerm}
          session={selectedSession}
        />
      )}
    </div>
  );
};

export default AdminTeacherView;
