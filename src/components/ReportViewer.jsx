// ReportViewer.jsx
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { printReport } from "../hooks/printReport";
import React, { useRef } from "react";
import generatePDF from "react-to-pdf";

const ReportViewer = ({ report, onClose }) => {
  if (!report) return null;
  const targetRef = useRef();

  // Pure helper
  const getGradeValue = (total) => {
    if (total > 74) return "A";
    if (total > 59) return "B";
    if (total > 49) return "C";
    if (total > 44) return "D";
    return "F";
  };

  const handleDownloadPDF = () => {
    const input = document.getElementById("report-content"); // ID of the element to capture

    console.log("Running");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      pdf.addImage(imgData, "PNG", 0, 0); // Add image to PDF at position (0,0)
      pdf.save("my-component.pdf");
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg w-full max-w-4xl p-6 overflow-y-auto hide-scrollbar max-h-screen relative">
        <button
          className="absolute top-3 right-3 px-2 py-1 text-red-600 rounded font-bold"
          onClick={onClose}
        >
          X
        </button>
        {/* Report Content */}
        <div ref={targetRef} id="report-content" className="p-4">
          <h2 className="text-2xl font-bold text-purple-700 mb-4">
            {report.title}
          </h2>
          <p className="text-gray-600">
            Student: {report.studentName} ({report.studentId})
          </p>
          <p className="text-gray-600">
            Class: {report.className} | Term: {report.term} | Session:{" "}
            {report.session}
          </p>
          {/* Example Grades Table */}
          <table className="mt-4 mb-6 text-black font-bold border border-gray-400 min-w-full">
            <thead className=" text-violet-600 bg-gray-100">
              <tr>
                <th className="border border-gray-400 px-2 py-1">Subject</th>
                <th className="border border-gray-400 px-2 py-1">Test</th>
                <th className="border border-gray-400 px-2 py-1">Exam</th>
                <th className="border border-gray-400 px-2 py-1">Total</th>
                <th className="border border-gray-400 px-2 py-1">Grade </th>
              </tr>
            </thead>
            <tbody>
              {report.subjectRecords.map((s, i) => (
                <tr key={i}>
                  <td className="border border-gray-400 px-2 py-1 text-center">
                    {s.subject}
                  </td>
                  <td className="border border-gray-400 px-2 py-1 text-center">
                    {s.test}
                  </td>
                  <td className="border border-gray-400 px-2 py-1 text-center">
                    {s.exam}
                  </td>
                  <td className="border border-gray-400 px-2 py-1 text-center">
                    {s.total}
                  </td>
                  <td
                    className={`border border-gray-400 px-2 py-1 text-center ${
                      getGradeValue(s.total) === "A"
                        ? "text-violet-700"
                        : getGradeValue(s.total) === "B" ||
                          getGradeValue(s.total) === "C"
                        ? "text-blue-700"
                        : "text-red-700"
                    }`}
                  >
                    {getGradeValue(s.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Attendance */}
          {report.attendance && (
            <div className="border rounded p-4 mb-6 text-violet-700">
              <h3 className="font-bold mb-2">Attendance</h3>
              <p>Total Days: {report.attendance.totalDays}</p>
              <p>Present: {report.attendance.presentDays}</p>
              <p>Absent: {report.attendance.absentDays}</p>
            </div>
          )}
          {/* Teacher Comments */}
          <div className="border rounded p-4 mb-6 text-violet-700">
            <h3 className="font-bold mb-2">Comments</h3>
            <p>
              <strong>Teacher:</strong> {report.comments?.teacher}
            </p>
            <p>
              <strong>Head Teacher:</strong> {report.comments?.headTeacher}
            </p>
          </div>
          {/* Overall Performance */}
          <div className="border rounded p-4 mb-6 text-violet-700">
            <h3 className="font-bold mb-2">Overall Performance</h3>
            <p>
              Total Score: <strong>{report.totalScore}</strong>
            </p>
            <p>
              Percentage: <strong>{report.percentage}%</strong>
            </p>
            <p>
              Position: <strong>{report.position}</strong>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-white text-blue-700 border-1 rounded hover:bg-blue-100"
          >
            Download PDF
          </button>
          <button
            onClick={() => printReport("report-content")}
            className="px-4 py-2 bg-white0 text-green-600 border-1 rounded hover:bg-green-100"
          >
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportViewer;
