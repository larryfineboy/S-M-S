import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ExamEntries from "./ExamEntries";

const TeacherExamPanel = ({ user }) => {
  const [activeTab, setActiveTab] = useState("create"); // create | approved | rejected | scheduled

  const [newQuestions, setNewQuestions] = useState([
    {
      content: "",
      answerType: "multichoice", // text | truefalse
      options: ["", "", "", ""],
      correctAnswer: "",
      subject: "",
      term: "",
      session: "",
      className: user.assignedClass || "",
    },
  ]);

  const [approvedQuestions, setApprovedQuestions] = useState([]);
  const [rejectedQuestions, setRejectedQuestions] = useState([]);
  const [scheduledExams, setScheduledExams] = useState([]);
  const [viewingEntries, setViewingEntries] = useState(null);

  // Fetch approved questions
  useEffect(() => {
    if (activeTab === "approved") {
      fetch(`/api/questions?status=approved&className=${user.assignedClass}`)
        .then((res) => res.json())
        .then(setApprovedQuestions)
        .catch(() => toast.error("Failed to load approved questions"));
    }
  }, [activeTab]);

  // Fetch rejected questions
  useEffect(() => {
    if (activeTab === "rejected") {
      fetch(`/api/questions?status=rejected&className=${user.assignedClass}`)
        .then((res) => res.json())
        .then(setRejectedQuestions)
        .catch(() => toast.error("Failed to load rejected questions"));
    }
  }, [activeTab]);

  // Fetch scheduled exams
  useEffect(() => {
    if (activeTab === "scheduled") {
      fetch(`/api/exams?className=${user.assignedClass}`)
        .then((res) => res.json())
        .then(setScheduledExams)
        .catch(() => toast.error("Failed to load scheduled exams"));
    }
  }, [activeTab]);

  // --- CREATE QUESTION LOGIC ---
  const addQuestion = () => {
    setNewQuestions((prev) => [
      ...prev,
      {
        content: "",
        answerType: "multichoice",
        options: ["", "", "", ""],
        correctAnswer: "",
        subject: "",
        term: "",
        session: "",
        className: user.assignedClass || "",
      },
    ]);
  };

  const handleQuestionChange = (index, field, value) => {
    setNewQuestions((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const submitQuestions = async () => {
    try {
      await fetch("/api/questions/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: newQuestions }),
      });
      toast.success("Questions submitted for approval");
      setNewQuestions([
        {
          content: "",
          answerType: "multichoice",
          options: ["", "", "", ""],
          correctAnswer: "",
          subject: "",
          term: "",
          session: "",
          className: user.assignedClass || "",
        },
      ]);
    } catch {
      toast.error("Failed to submit questions");
    }
  };

  // --- RESUBMIT REJECTED QUESTION ---
  const resubmitQuestion = async (q) => {
    try {
      await fetch(`/api/questions/${q.questionId}/resubmit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(q),
      });
      toast.success("Question resubmitted for approval");
      setRejectedQuestions((prev) =>
        prev.filter((item) => item.questionId !== q.questionId)
      );
    } catch {
      toast.error("Failed to resubmit");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Mini Navbar */}
      <nav className="flex gap-4 border-b pb-2">
        {[
          ["create", "Create Questions"],
          ["approved", "Approved"],
          ["rejected", "Rejected"],
          ["scheduled", "Scheduled Exams"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-3 py-1 rounded-t ${
              activeTab === key
                ? "bg-purple-600 text-white"
                : "bg-purple-100 text-purple-600"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* CREATE TAB */}
      {activeTab === "create" && (
        <div className="space-y-6">
          {newQuestions.map((q, i) => (
            <div key={i} className="border p-4 rounded space-y-3 bg-purple-50">
              <input
                placeholder="Question"
                value={q.content}
                onChange={(e) =>
                  handleQuestionChange(i, "content", e.target.value)
                }
                className="w-full border p-2 rounded"
              />

              <select
                value={q.answerType}
                onChange={(e) =>
                  handleQuestionChange(i, "answerType", e.target.value)
                }
                className="border p-2 rounded"
              >
                <option value="multichoice">Multiple Choice</option>
                <option value="text">Text</option>
                <option value="truefalse">True / False</option>
              </select>

              {q.answerType === "multichoice" && (
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt, oi) => (
                    <input
                      key={oi}
                      placeholder={`Option ${oi + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const updated = [...q.options];
                        updated[oi] = e.target.value;
                        handleQuestionChange(i, "options", updated);
                      }}
                      className="border p-2 rounded"
                    />
                  ))}
                </div>
              )}

              <input
                placeholder="Correct Answer"
                value={q.correctAnswer}
                onChange={(e) =>
                  handleQuestionChange(i, "correctAnswer", e.target.value)
                }
                className="border p-2 rounded"
              />

              <div className="grid grid-cols-2 gap-2">
                {["subject", "term", "session"].map((f) => (
                  <input
                    key={f}
                    placeholder={f}
                    value={q[f]}
                    onChange={(e) => handleQuestionChange(i, f, e.target.value)}
                    className="border p-2 rounded"
                  />
                ))}
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            <button
              onClick={addQuestion}
              className="bg-purple-600 text-white px-4 py-2 rounded"
            >
              + Add Another
            </button>
            <button
              onClick={submitQuestions}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Submit All
            </button>
          </div>
        </div>
      )}

      {/* APPROVED TAB */}
      {activeTab === "approved" && (
        <div className="space-y-3">
          {approvedQuestions.length === 0 ? (
            <p className="text-gray-500">No approved questions</p>
          ) : (
            approvedQuestions.map((q) => (
              <div
                key={q.questionId}
                className="border p-3 rounded bg-purple-50"
              >
                {q.content}
              </div>
            ))
          )}
        </div>
      )}

      {/* REJECTED TAB */}
      {activeTab === "rejected" && (
        <div className="space-y-3">
          {rejectedQuestions.length === 0 ? (
            <p className="text-gray-500">No rejected questions</p>
          ) : (
            rejectedQuestions.map((q) => (
              <div
                key={q.questionId}
                className="border p-3 rounded bg-red-50 space-y-2"
              >
                <p>{q.content}</p>
                <textarea
                  className="border w-full p-2 rounded"
                  value={q.content}
                  onChange={(e) =>
                    setRejectedQuestions((prev) =>
                      prev.map((item) =>
                        item.questionId === q.questionId
                          ? { ...item, content: e.target.value }
                          : item
                      )
                    )
                  }
                />
                <button
                  onClick={() => resubmitQuestion(q)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Resubmit
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* SCHEDULED TAB */}
      {activeTab === "scheduled" && (
        <div className="space-y-3">
          {scheduledExams.length === 0 ? (
            <p className="text-gray-500">No scheduled exams</p>
          ) : (
            scheduledExams.map((exam) => (
              <div
                key={exam.examId}
                className="border p-3 rounded bg-yellow-50"
                onClick={setViewingEntries(exam.examId)}
              >
                <p className="font-medium">{exam.subject}</p>
                <p className="text-sm text-gray-600">
                  {exam.term} | {exam.session} | {exam.scheduledDate}
                </p>
              </div>
            ))
          )}
        </div>
      )}
      {/* --- VIEW ENTRIES --- */}
      {viewingEntries && (
        <ExamEntries
          examId={viewingEntries}
          onClose={() => setViewingEntries(null)}
        />
      )}
    </div>
  );
};

export default TeacherExamPanel;
