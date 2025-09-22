import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { ArrowLeft, Save } from "lucide-react";
import ScrollableTable from "../ui/ScrollableTable";
import "../ui/grades-table.css";

const GradesEntryTable = ({
  students = [],
  subjects = [],
  initialData = [],
  isClassLevel = false,
  className,
  term,
  session,
  teacherId,
  onSubmitSuccess,
  onBack, // optional back handler
}) => {
  const [grades, setGrades] = useState({});

  useEffect(() => {
    const mapped = {};
    if (initialData && initialData.length > 0) {
      if (isClassLevel) {
        initialData.forEach((record) => {
          mapped[record.studentId] = {};
          record.subjectRecords.forEach((s) => {
            mapped[record.studentId][s.subject] = {
              test: s.test,
              exam: s.exam,
              total: s.total,
            };
          });
        });
      } else {
        const studentId = initialData.studentId || initialData[0]?.studentId;
        if (studentId) {
          mapped[studentId] = {};
          (initialData.subjectRecords || initialData[0].subjectRecords).forEach(
            (s) => {
              mapped[studentId][s.subject] = {
                test: s.test,
                exam: s.exam,
                total: s.total,
              };
            }
          );
        }
      }
      setGrades(mapped);
    } else {
      const mappedEmpty = {};
      students.forEach((s) => {
        mappedEmpty[s.studentId] = {};
        subjects.forEach((subj) => {
          mappedEmpty[s.studentId][subj] = { test: "", exam: "", total: "" };
        });
      });
      setGrades(mappedEmpty);
    }
  }, [initialData, students, subjects, isClassLevel]);

  const handleChange = (studentId, subject, field, value) => {
    let parsed = parseInt(value) || 0;

    // Enforce max limits
    if (field === "test" && parsed > 40) parsed = 40;
    if (field === "exam" && parsed > 60) parsed = 60;

    const updated = {
      ...grades[studentId]?.[subject],
      [field]: parsed,
      total:
        (field === "test" ? parsed : grades[studentId]?.[subject]?.test || 0) +
        (field === "exam" ? parsed : grades[studentId]?.[subject]?.exam || 0),
    };

    // Ensure total does not exceed 100
    if (updated.total > 100) updated.total = 100;

    setGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subject]: updated,
      },
    }));
  };

  const handleSave = async () => {
    const dateRecorded = new Date().toISOString();

    if (!term || !session) {
      toast.warning("Term and session are required!");
      return;
    }

    const records = isClassLevel
      ? students.map((s) => ({
          studentId: s.studentId,
          type: "grades",
          term,
          session,
          className,
          teacherId,
          dateRecorded,
          subjectRecords: subjects.map((subject) => ({
            subject,
            ...grades[s.studentId][subject],
          })),
        }))
      : [
          {
            studentId: students[0]?.studentId,
            type: "grades",
            term,
            session,
            className,
            teacherId,
            dateRecorded,
            subjectRecords: subjects.map((subject) => ({
              subject,
              ...grades[students[0].studentId][subject],
            })),
          },
        ];

    try {
      const res = await fetch("/api/reports/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isClassLevel ? { records } : records[0]),
      });

      if (!res.ok) throw new Error("Failed to save reports");

      toast.success("Reports saved successfully!");
      onSubmitSuccess?.();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to submit report");
    }
  };

  if (!subjects.length || !Object.keys(grades).length)
    return <p className="text-center text-gray-400 py-6">No data available.</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-purple-50 p-3 rounded border">
        <div>
          <h2 className="text-lg font-bold text-purple-700">Grades Report</h2>
          <p className="text-sm text-gray-600">
            Class: {className} | Term: {term} | Session: {session}
          </p>
        </div>
        <div className="flex space-x-2">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center px-3 py-1 border rounded text-purple-700 hover:bg-purple-100"
            >
              <ArrowLeft size={16} className="mr-1" /> Back
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex items-center px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            <Save size={16} className="mr-1" /> Save Grades
          </button>
        </div>
      </div>

      {/* Table */}
      <ScrollableTable>
        <table className="min-w-max border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100 text-violet-800">
              {isClassLevel && (
                <th className="border p-2 text-left min-w-[150px]">Student</th>
              )}
              {subjects.map((subject) => (
                <th
                  key={subject}
                  colSpan={3}
                  className="border p-2 text-center min-w-[150px]"
                >
                  {subject}
                </th>
              ))}
            </tr>
            <tr className="bg-white text-xs text-violet-800">
              {isClassLevel && <th className="border p-1"></th>}
              {subjects.map((subject) => (
                <React.Fragment key={subject}>
                  <th className="border p-1">Test (≤40)</th>
                  <th className="border p-1">Exam (≤60)</th>
                  <th className="border p-1">Total</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {(isClassLevel ? students : [students[0]]).map((student) => (
              <tr
                key={student.studentId}
                className="hover:bg-gray-50 transition-colors text-black"
              >
                {isClassLevel && (
                  <td className="sticky-col border p-2 font-medium">
                    {student.firstName} {student.lastName}
                    <div className="text-xs text-gray-600">
                      ID: {student.studentId}
                    </div>
                  </td>
                )}
                {subjects.map((subject) => (
                  <React.Fragment key={subject}>
                    <td className="border p-1">
                      <input
                        type="number"
                        min="0"
                        max="40"
                        value={grades[student.studentId]?.[subject]?.test || ""}
                        onChange={(e) =>
                          handleChange(
                            student.studentId,
                            subject,
                            "test",
                            e.target.value
                          )
                        }
                        className="w-16 px-1 border rounded text-center"
                      />
                    </td>
                    <td className="border p-1">
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={grades[student.studentId]?.[subject]?.exam || ""}
                        onChange={(e) =>
                          handleChange(
                            student.studentId,
                            subject,
                            "exam",
                            e.target.value
                          )
                        }
                        className="w-16 px-1 border rounded text-center"
                      />
                    </td>
                    <td className="border p-1 text-center font-medium bg-gray-50">
                      {grades[student.studentId]?.[subject]?.total || 0}
                    </td>
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollableTable>
    </div>
  );
};

export default GradesEntryTable;
