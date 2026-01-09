// components/FullReportTemplate.jsx
import React, { useMemo, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { printReport } from "../hooks/printReport";
import { Calendar, Download, Save, FileSpreadsheet } from "lucide-react";
import ReportHeader from "../ui/ReportHeader.png";
import ApprovedStamp from "../ui/ApprovedStamp.png";
import profile from "../ui/profile.jpg";

const INDICATOR_OPTIONS = [
  { value: "Excellent", color: "text-green-600 font-semibold" },
  { value: "Good", color: "text-blue-600 font-semibold" },
  { value: "Satisfactory", color: "text-yellow-600 font-semibold" },
  { value: "Poor", color: "text-red-600 font-semibold" },
];

const MAX_TEST = 40;
const MAX_EXAM = 60;

const clamp = (v, min, max) => {
  const n = Number.isFinite(+v) ? +v : 0;
  return Math.max(min, Math.min(max, n));
};

const gradeOf = (total) => {
  if (total > 74) return "A";
  if (total > 59) return "B";
  if (total > 49) return "C";
  if (total > 44) return "D";
  return "F";
};

export default function FullReportTemplate({
  report, // a single full report object for one student
  mode = "read", // "read" | "edit"
  onClose, // () => void
  onSave, // (payload) => Promise<void> | void
  role,
}) {
  // Local editable copy (so cancel doesn’t mutate parent)
  const [editable, setEditable] = useState(report || {});
  const isRead = mode === "read";

  useEffect(() => setEditable(report || {}), [report]);

  // --- Derived values ---
  const subjects = editable?.subjectRecords || [];

  const totals = useMemo(() => {
    const totalScore = subjects.reduce(
      (sum, s) => sum + (Number(s.total) || 0),
      0
    );
    const maxTotal = (subjects.length || 0) * 100;
    const percentage = maxTotal ? (totalScore / maxTotal) * 100 : 0;
    return {
      totalScore,
      percentage: Math.round(percentage * 10) / 10,
      maxTotal,
    };
  }, [subjects]);

  // --- Change handlers for grades ---
  const updateScore = (index, field, value) => {
    if (isRead) return;
    const next = { ...editable };
    const row = { ...next.subjectRecords[index] };
    if (field === "test") row.test = clamp(value, 0, MAX_TEST);
    if (field === "exam") row.exam = clamp(value, 0, MAX_EXAM);
    row.total = clamp((row.test || 0) + (row.exam || 0), 0, 100);
    next.subjectRecords = next.subjectRecords.map((s, i) =>
      i === index ? row : s
    );
    setEditable(next);
  };

  // --- Attendance & Calendar ---
  const updateAttendance = (patch) => {
    if (isRead) return;
    setEditable((p) => ({
      ...p,
      attendance: { ...(p.attendance || {}), ...patch },
    }));
  };

  // --- Indicators ---
  const updateIndicator = (key, value) => {
    if (isRead) return;
    setEditable((p) => ({
      ...p,
      indicators: { ...(p.indicators || {}), [key]: value },
    }));
  };

  // --- Comments ---
  const updateComment = (who, value) => {
    if (isRead) return;
    setEditable((p) => ({
      ...p,
      comments: { ...(p.comments || {}), [who]: value },
    }));
  };

  const quickSuggestions = {
    teacher: [
      "Shows consistent effort and participates actively in class.",
      "Demonstrates strong understanding; continue to practice regularly.",
      "Needs to focus more on assignments and time management.",
    ],
    headTeacher: [
      "Promoted to next class. Maintain this excellent standard.",
      "Satisfactory performance; improvement expected next term.",
      "Commendable conduct and academic growth this term.",
    ],
  };

  const addQuickComment = (who, text) => {
    if (isRead) return;
    updateComment(who, text);
  };

  // --- Save ---
  const handleSave = async () => {
    const payload = {
      ...editable,
      totalScore: totals.totalScore,
      percentage: totals.percentage,
      status: editable?.status || "draft",
      type: "full",
    };
    await onSave?.(payload);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 bg-opacity-50 overflow-y-auto">
      <div className="mx-auto my-6 w-full max-w-3xl bg-white rounded shadow">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b ">
          <div className="font-bold text-indigo-900 flex items-center justify-center gap-2">
            <FileSpreadsheet size={18} />
            {editable?.title || `${editable?.term} Report`}
            {role !== "student" && (
              <span className="ml-2 text-xs text-gray-500">
                {isRead ? "(View Mode)" : "(Edit Mode)"}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => printReport("report-content")}
              className="px-3 py-2 rounded border text-green-600 bg-green-100 text-sm flex items-center justify-center gap-2 font-semibold"
            >
              <Download size={18} />
              <span>PDF</span>
            </button>
            {!isRead && (
              <button
                onClick={handleSave}
                className="px-3 py-2 rounded border text-violet-600 bg-violet-100 text-sm flex items-center justify-center gap-2"
              >
                <Save size={18} />
                <span className="font-semibold">Save</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-2 rounded bg-red-400 text-white text-sm"
            >
              Close
            </button>
          </div>
        </div>

        {/* Printable body */}
        <div id="report-content" className="relative p-4 space-y-6">
          <div className="w-full rounded bg-gray-100 overflow-hidden flex-shrink-0">
            <img
              src={ReportHeader}
              alt="student"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Header: Student + Report meta (read-only) */}
          <div className="p-4 shadow">
            <div className="font-bold text-indigo-900 mb-3">STUDENT DATA</div>
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                {editable?.photoUrl || profile ? (
                  <img
                    src={editable.photoUrl || profile}
                    alt="student"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    Photo
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-10 text-sm">
                <div>
                  <div className="font-semibold text-indigo-900">
                    {editable?.studentName ||
                      `${editable?.firstName || ""} ${
                        editable?.lastName || ""
                      }`}
                  </div>
                  <div className="text-gray-600 font-semibold">
                    ID: {editable?.studentId}
                  </div>
                  <div className="text-gray-600 font-semibold">
                    Class: {editable?.className}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 font-semibold">
                    Term: {editable?.term}
                  </div>
                  <div className="text-gray-600 font-semibold">
                    Session: {editable?.session}
                  </div>
                  <div className="text-gray-600 font-semibold">
                    Teacher: {editable?.teacherId}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance & School Calendar */}
          <div className=" p-4 shadow rounded">
            <div className="font-bold text-indigo-900 mb-3 flex">
              <span className="flex items-center justify-center gap-2">
                <Calendar size={18} />
                <span>ATTENDANCE & SCHOOL CALENDAR</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <label className="w-20 text-gray-700 font-semibold">
                  Times Present
                </label>
                {isRead ? (
                  <span className="px-2 py-1 text-blue-600 font-bold w-20">
                    {editable?.attendance?.presentDays || ""}
                  </span>
                ) : (
                  <input
                    type="number"
                    disabled={isRead}
                    className=" px-2 py-1 w-20 text-blue-600 bg-blue-100 border rounded focus:outline-0 focus:ring-1 focus:ring-blue-400 font-semibold"
                    value={editable?.attendance?.presentDays || ""}
                    onChange={(e) =>
                      updateAttendance({
                        presentDays: clamp(e.target.value, 0, 300),
                      })
                    }
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="w-20 text-gray-700 font-semibold">
                  Total Days Open
                </label>
                {isRead ? (
                  <span className="px-2 py-1 text-blue-600 font-bold w-20">
                    {editable?.attendance?.totalDays || ""}
                  </span>
                ) : (
                  <input
                    type="number"
                    disabled={isRead}
                    className=" px-2 py-1 w-20 text-blue-600 bg-blue-100 border rounded focus:outline-0 focus:ring-1 focus:ring-blue-400 font-semibold"
                    value={editable?.attendance?.totalDays || ""}
                    onChange={(e) =>
                      updateAttendance({
                        totalDays: clamp(e.target.value, 0, 300),
                      })
                    }
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="w-20 text-gray-700 font-semibold">
                  Next Term Resumption
                </label>
                {isRead ? (
                  <span className="px-2 py-1 text-blue-600 font-bold w-30">
                    {editable?.attendance?.resumptionDate || ""}
                  </span>
                ) : (
                  <input
                    type="date"
                    disabled={isRead}
                    className="border rounded px-2 py-1 w-40 text-green-600 bg-green-100 focus:outline-0 focus:ring-1 focus:ring-green-400 font-semibold"
                    value={editable?.attendance?.resumptionDate || ""}
                    onChange={(e) =>
                      updateAttendance({ resumptionDate: e.target.value })
                    }
                  />
                )}
              </div>
            </div>
          </div>

          {/* Grades Table */}
          <div className=" p-4 justify-center shadow rounded">
            <div className="font-bold text-indigo-900 mb-3">GRADES</div>
            <table className="mt-4 mb-6 text-black font-bold border border-gray-400">
              <thead className=" text-indigo-900 bg-gray-100">
                <tr>
                  <th className="border border-gray-400 px-2 py-1">Subject</th>
                  <th className="border border-gray-400 px-2 py-1">
                    Test ({MAX_TEST})
                  </th>
                  <th className="border border-gray-400 px-2 py-1">
                    Exam ({MAX_EXAM})
                  </th>
                  <th className="border border-gray-400 px-2 py-1">Total</th>
                  <th className="border border-gray-400 px-2 py-1 text-red-600">
                    Grade{" "}
                  </th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s, i) => (
                  <tr key={i}>
                    <td className="border border-gray-400 px-2 py-1 text-center">
                      {s.subject}
                    </td>
                    <td className="border border-gray-400 px-2 py-1 text-center">
                      <input
                        type="number"
                        disabled={isRead}
                        className="rounded px-2 py-1 w-full text-center"
                        value={s.test ?? ""}
                        onChange={(e) => updateScore(i, "test", e.target.value)}
                        onWheel={(e) => e.currentTarget.blur()}
                      />
                    </td>
                    <td className="border border-gray-400 px-2 py-1 text-center">
                      <input
                        type="number"
                        disabled={isRead}
                        className="rounded px-2 py-1 w-full text-center"
                        value={s.exam ?? ""}
                        onChange={(e) => updateScore(i, "exam", e.target.value)}
                        onWheel={(e) => e.currentTarget.blur()}
                      />
                    </td>
                    <td className="border border-gray-400 px-2 py-1 text-center">
                      {Number(s.total) || 0}
                    </td>
                    <td
                      className={`border border-gray-400 px-2 py-1 text-center ${
                        gradeOf(Number(s.total) || 0) === "A"
                          ? "text-violet-700"
                          : gradeOf(Number(s.total) || 0) === "B"
                          ? "text-blue-700"
                          : gradeOf(Number(s.total) || 0) === "C"
                          ? "text-yellow-400"
                          : gradeOf(Number(s.total) || 0) === "D"
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}
                    >
                      {gradeOf(Number(s.total) || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Overall */}
            <div className="mt-4 text-sm">
              <div className="flex flex-wrap gap-4">
                <div className="px-3 py-2 rounded bg-gray-100">
                  <span className="text-gray-600">Overall Score: </span>
                  <span className="font-semibold text-violet-800">
                    {totals.totalScore} / {totals.maxTotal}
                  </span>
                </div>
                <div className="px-3 py-2 rounded bg-gray-100">
                  <span className="text-gray-600">Percentage: </span>
                  <span className="font-semibold text-blue-700">
                    {totals.percentage}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Indicators */}
          <div className=" p-4 shadow bg-white rounded">
            <div className="font-bold text-indigo-900 mb-3">
              PERFORMANCE INDICATORS
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              {[
                "attendance",
                "behavior",
                "participation",
                "collaboration",
                "punctuality",
                "proactiveness",
              ].map((key) => (
                <div key={key} className="flex items-center gap-3">
                  <label className="w-20 capitalize text-gray-700 font-semibold">
                    {key}
                  </label>
                  {isRead ? (
                    <span
                      className={`px-2 py-1 rounded font-semibold ${
                        editable?.indicators?.[key] === "Excellent"
                          ? "text-green-600"
                          : editable?.indicators?.[key] === "Good"
                          ? "text-blue-600"
                          : editable?.indicators?.[key] === "Satisfactory"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {editable?.indicators?.[key] || ""}
                    </span>
                  ) : (
                    <select
                      disabled={isRead}
                      className={`border rounded px-2 py-1 w-full font-semibold outline-none ${
                        editable?.indicators?.[key] === "Excellent"
                          ? "text-green-600"
                          : editable?.indicators?.[key] === "Good"
                          ? "text-blue-600"
                          : editable?.indicators?.[key] === "Satisfactory"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                      value={editable?.indicators?.[key] || ""}
                      onChange={(e) => updateIndicator(key, e.target.value)}
                    >
                      <option value="" disabled>
                        Select
                      </option>
                      {INDICATOR_OPTIONS.map((opt) => (
                        <option
                          key={opt.value}
                          value={opt.value}
                          className={opt.color}
                        >
                          {opt.value}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="  p-4 shadow rounded">
            <div className="font-bold text-indigo-900 mb-3">COMMENTS</div>
            <div className="flex gap-4 justify-around text-sm">
              {/* Class Teacher */}
              <div className="w-full">
                <div className="text-gray-700 font-medium mb-1">
                  Class Teacher’s Comment
                </div>
                <textarea
                  disabled={isRead}
                  className="w-full border text-blue-600 bg-blue-100 font-semibold rounded px-2 py-1 min-h-[80px] focus:outline-0 focus:ring-1 focus:ring-blue-400"
                  value={editable?.comments?.teacher || ""}
                  onChange={(e) => updateComment("teacher", e.target.value)}
                />
                {!isRead && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <p className="text-green-600 font-semibold">
                      Quick Comments...
                    </p>
                    {quickSuggestions.teacher.map((t, i) => (
                      <button
                        key={i}
                        className="px-2 py-1 text-xs rounded text-gray-500 font-semibold cursor-pointer"
                        onClick={() => addQuickComment("teacher", t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Head Teacher */}
              <div className="w-full">
                <div className="text-gray-700 font-medium mb-1">
                  Head Teacher / Principal’s Comment
                </div>
                <textarea
                  disabled={isRead ? isRead : role === "admin" ? false : true}
                  className="w-full border text-violet-600 bg-violet-100 font-semibold rounded px-2 py-1 min-h-[80px] focus:outline-0 focus:ring-1 focus:ring-violet-400"
                  value={editable?.comments?.headTeacher || ""}
                  onChange={(e) => updateComment("headTeacher", e.target.value)}
                />
                {role === "admin" && !isRead && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <p className="text-green-600 font-semibold">
                      Quick Comments...
                    </p>
                    {quickSuggestions.headTeacher.map((t, i) => (
                      <button
                        key={i}
                        className="px-2 py-1 text-xs rounded text-gray-500 font-semibold cursor-pointer"
                        onClick={() => addQuickComment("headTeacher", t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          {report.status === "approved" && (
            <img
              src={ApprovedStamp}
              alt="Approval Stamp"
              className="w-100 h-100 absolute top-10 right-4 -rotate-30"
            />
          )}
        </div>
        {/* /Printable body */}
      </div>
    </div>
  );
}
