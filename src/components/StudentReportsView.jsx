//Student Reports View.jsx
import React, { useState, useEffect } from "react";
import FullReportTemplate from "./FullReportTemplate";
import { printReport } from "../hooks/printReport";
import { Eye, Calendar, FileSpreadsheet, Download } from "lucide-react";

const StudentReportsView = ({ studentId }) => {
  const [selectedSession, setSelectedSession] = useState("all");
  const [viewingReport, setViewingReport] = useState(null);
  const [approvedReports, setApprovedReports] = useState([]);

  // Demo fallback data
  const demoReports = [
    {
      id: 1,
      title: "First Term Report",
      type: "full",
      status: "approved",
      approvedDate: "2024-11-15",

      // Metadata
      studentId: "DBCS00124",
      studentName: "John Doe",
      className: "JSS2",
      term: "First Term",
      session: "2024/2025",
      teacherId: "TCH001EA",
      dateRecorded: "2024-11-10T20:32:50",

      // Grades
      subjectRecords: [
        { subject: "Mathematics", test: 15, exam: 50, total: 65 },
        { subject: "English", test: 18, exam: 65, total: 83 },
        { subject: "Basic Science", test: 20, exam: 60, total: 80 },
        // ...
      ],

      // Attendance (future)
      attendance: {
        totalDays: 90,
        presentDays: 85,
        resumptionDate: "",
      },

      //Performance
      indicators: {
        attendance: "Excellent",
        behavior: "Good",
        participation: "Satisfactory",
        collaboration: "Excellent",
        punctuality: "Good",
        proactiveness: "Poor",
      },

      // Teacher/Head Comments
      comments: {
        teacher:
          "John is hardworking and shows great improvement in Mathematics.",
        headTeacher: "Promoted to next class. Keep up the good work.",
      },

      // Overall stats
      totalScore: 248,
      percentage: 82.6,
    },
    {
      id: 2,
      title: "Second Term Report",
      type: "full",
      status: "approved",
      approvedDate: "2025-11-15",

      // Metadata
      studentId: "DBCS00124",
      studentName: "John Doe",
      className: "JSS2",
      term: "Second Term",
      session: "2025/2026",
      teacherId: "TCH001EA",
      dateRecorded: "2024-11-10T20:32:50",

      // Grades
      subjectRecords: [
        { subject: "Mathematics", test: 15, exam: 32, total: 47 },
        { subject: "English", test: 18, exam: 65, total: 83 },
        { subject: "Basic Science", test: 10, exam: 60, total: 70 },
        // ...
      ],

      // Attendance (future)
      // Attendance (future)
      attendance: {
        totalDays: 90,
        presentDays: 85,
        resumptionDate: 11 / 2 / 2025,
      },

      //Performance
      indicators: {
        attendance: "Excellent",
        behavior: "Good",
        participation: "Satisfactory",
        collaboration: "Excellent",
        punctuality: "Good",
        proactiveness: "Poor",
      },

      // Teacher/Head Comments
      comments: {
        teacher:
          "John is hardworking and shows great improvement in Mathematics.",
        headTeacher: "Promoted to next class. Keep up the good work.",
      },

      // Overall stats
      totalScore: 248,
      percentage: 82.6,
    },
  ];

  // Fetch reports for the selected student
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(`/api/reports/full?studentId=${studentId}`);
        if (!res.ok) throw new Error("Failed to fetch reports");
        const data = await res.json();
        setApprovedReports(data.filter((rep) => rep.status === "approved"));
      } catch (err) {
        setApprovedReports(demoReports);
      }
    };
    if (studentId) fetchReports();
  }, [studentId]);

  // Filtering
  const filteredReports =
    selectedSession && selectedSession !== "all"
      ? approvedReports.filter((report) => report.session === selectedSession)
      : approvedReports;

  const sessions = Array.from(new Set(approvedReports.map((r) => r.session)));

  const groupedReports = filteredReports.reduce((acc, report) => {
    if (!acc[report.session]) acc[report.session] = [];
    acc[report.session].push(report);
    return acc;
  }, {});

  if (viewingReport) {
    return (
      <FullReportTemplate
        report={viewingReport}
        isRead={true}
        role={"student"}
        onClose={() => setViewingReport(null)}
      />
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Filter Controls */}
      <div className="rounded p-4 mb-6 bg-white shadow text-violet-800">
        <h3 className="font-bold mb-3 flex items-center space-x-2">
          <Calendar size={18} /> <span>Filter Reports</span>
        </h3>
        <div className="flex items-center gap-4">
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">Select Academic Session</option>
            <option value="all">All Sessions</option>
            {sessions.map((session) => (
              <option key={session} value={session}>
                {session}
              </option>
            ))}
          </select>
          {selectedSession && (
            <button
              className="px-3 py-2 bg-red-400 text-white rounded"
              onClick={() => setSelectedSession("all")}
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Reports Display */}
      {Object.keys(groupedReports).length === 0 ? (
        <div className="border rounded p-6 text-center text-gray-500">
          <p className="font-semibold mb-2">No Reports Found</p>
          <p>No approved reports available for the selected criteria.</p>
        </div>
      ) : (
        Object.entries(groupedReports).map(([session, reports]) => (
          <div
            key={session}
            className="rounded p-4 mb-6 bg-white shadow text-violet-700"
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold">Academic Session: {session}</h4>
              <span className="text-sm text-gray-500">
                {reports.length} Report{reports.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reports.map((report) => (
                <div
                  key={report.term}
                  className="border rounded p-4 hover:shadow transition"
                >
                  <div className="flex justify-between mb-2">
                    <span className="font-medium flex items-center space-x-2">
                      <FileSpreadsheet size={18} /> <span>{report.title}</span>
                    </span>
                    <span className="text-green-600 text-sm bg-green-200 rounded-full p-1">
                      Approved
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3 space-y-1">
                    <div>Term: {report.term}</div>
                    <div>Type: {report.type}</div>
                    <div>
                      Approved:{" "}
                      {new Date(report.approvedDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewingReport(report)}
                      className="flex-1 px-3 py-1 bg-blue-500 text-white rounded flex items-center justify-center space-x-2"
                    >
                      <Eye size={18} />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => {
                        setViewingReport(report);
                        setTimeout(() => {
                          printReport("report-content");
                          setViewingReport(null);
                        }, 300);
                      }}
                      className="px-3 py-1 bg-violet-200 rounded flex items-center space-x-2"
                    >
                      <Download size={18} />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default StudentReportsView;
