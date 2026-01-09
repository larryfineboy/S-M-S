// ClassReportsModal.jsx
import React, { useEffect, useState } from "react";
import { XCircle, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import FullReportTemplate from "./FullReportTemplate";

const ClassReportsModal = ({
  isOpen,
  onClose,
  selectedClass,
  term,
  session,
}) => {
  const [reports, setReports] = useState([]);
  const [students, setStudents] = useState([]);
  // State view/edit
  const [openedFullReport, setOpenedFullReport] = useState(null);
  const [fullMode, setFullMode] = useState("read"); // "read" | "edit"

  // Demo fallback data
  const demoStudents = [
    { studentId: "DBCS00124", firstName: "John", lastName: "Doe" },
    { studentId: "DBCS00125", firstName: "Jane", lastName: "Smith" },
    { studentId: "DBCS00126", firstName: "Michael", lastName: "Lee" },
  ];

  const demoReports = [
    {
      id: "rep001",
      studentId: "DBCS00124",
      term: "First Term",
      session: "2024/2025",
      studentName: "John Doe",
      className: "JSS2",
      teacherId: "TCH001EA",
      dateRecorded: "2025-06-14T20:32:50",
      subjectRecords: [
        { subject: "Mathematics", test: 15, exam: 70, total: 85 },
        { subject: "English", test: 18, exam: 65, total: 83 },
      ],
      type: "grades",
      attendance: {
        totalDays: 90,
        presentDays: 85,
        resumptionDate: "2025-10-10",
      },
    },
  ];

  useEffect(() => {
    if (isOpen) {
      const fetchReports = async () => {
        try {
          const res = await fetch(
            `/api/reports/full?className=${selectedClass}&term=${term}&session=${session}`
          );
          const data = await res.json();
          setReports(data || []);
        } catch (err) {
          setReports(demoReports);
        }
      };

      const fetchStudents = async () => {
        try {
          const res = await fetch(`/api/students?className=${selectedClass}`);
          const data = await res.json();
          setStudents(data);
        } catch (err) {
          setStudents(demoStudents);
        }
      };

      fetchReports();
      fetchStudents();
    }
  }, [isOpen, selectedClass, term, session]);

  const saveReport = async (report) => {
    try {
      const res = await fetch("/api/reports/full", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report),
      });

      if (!res.ok) throw new Error("Unable to save changes");
      const saved = await res.json();
      setReports((prev) =>
        prev.map((r) =>
          r.studentId === saved.studentId &&
          r.term === saved.term &&
          r.session === saved.session
            ? saved
            : r
        )
      );
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const approveReport = (rep) => {
    //update to server
    const approved = {
      ...rep,
      status: "approved",
      approvedDate: new Date().toISOString(),
    };

    saveReport(approved);
  };

  const approveAll = () => {
    reports.forEach((r) => {
      if (r.status !== "approved") {
        approveReport(r);
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative">
        <button
          className="absolute top-3 right-3 text-red-500 hover:text-red-700"
          onClick={onClose}
        >
          <XCircle size={24} />
        </button>

        <h3 className="text-xl font-bold text-purple-700 mb-4">
          Full Reports - {selectedClass} | {term} | {session}
        </h3>

        <button
          onClick={approveAll}
          className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          <CheckCircle className="inline-block mr-2" size={18} /> Approve All
        </button>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {reports.length === 0 ? (
            <span className="text-gray-500 italic">No Reports Available</span>
          ) : (
            students.map((student) => {
              const studentReport = reports.find(
                (r) => r.studentId === student.studentId
              );

              return (
                <div
                  key={student.studentId}
                  className="flex justify-between items-center border p-3 rounded"
                >
                  <span className="font-medium text-purple-700">
                    {student.firstName} {student.lastName} ({student.studentId})
                  </span>

                  {studentReport ? (
                    <div className="flex gap-2">
                      <button
                        className="px-2 py-1 bg-green-600 text-white rounded"
                        onClick={() => {
                          setOpenedFullReport(studentReport);
                          setFullMode("read");
                        }}
                      >
                        View
                      </button>
                      <button
                        className="px-2 py-1 bg-yellow-500 text-white rounded"
                        onClick={() => {
                          setOpenedFullReport(studentReport);
                          setFullMode("edit");
                        }}
                      >
                        Edit
                      </button>

                      {studentReport.status !== "approved" && (
                        <button
                          className="px-2 py-1 bg-green-600 text-white rounded"
                          onClick={() => approveReport(studentReport)}
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-500 italic">No records</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      {openedFullReport && (
        <FullReportTemplate
          report={openedFullReport}
          mode={fullMode}
          onClose={() => setOpenedFullReport(null)}
          onSave={async (payload) => {
            await saveReport(payload);
            setOpenedFullReport(null);
          }}
        />
      )}
    </div>
  );
};

export default ClassReportsModal;
