import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ExamEntries from "./ExamEntries";

const AdminExamPanel = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [examSetup, setExamSetup] = useState({
    subject: "",
    className: "",
    term: "",
    session: "",
    date: "",
    time: "",
    timeLimit: 30,
    numQuestions: 10,
  });

  const [editingExam, setEditingExam] = useState(null);
  const [viewingEntries, setViewingEntries] = useState(null);

  useEffect(() => {
    fetch("/api/questions?status=pending")
      .then((res) => res.json())
      .then(setPending);
    fetch("/api/questions?status=approved")
      .then((res) => res.json())
      .then(setApproved);
    fetch("/api/exams")
      .then((res) => res.json())
      .then(setScheduled);
  }, []);

  // -------------------- PENDING --------------------
  const approveQuestion = async (id) => {
    await fetch(`/api/questions/${id}/approve`, { method: "PATCH" });
    setPending((p) => p.filter((q) => q.questionId !== id));
    toast.success("Question approved");
  };

  const rejectQuestion = async (id, comment) => {
    await fetch(`/api/questions/${id}/reject`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment }),
    });
    setPending((p) => p.filter((q) => q.questionId !== id));
    toast.info("Question rejected");
  };

  const approveAllInSubject = async (subject) => {
    const qs = pending.filter((q) => q.subject === subject);
    await Promise.all(
      qs.map((q) =>
        fetch(`/api/questions/${q.questionId}/approve`, { method: "PATCH" })
      )
    );
    setPending((p) => p.filter((q) => q.subject !== subject));
    toast.success(`Approved all ${qs.length} questions in ${subject}`);
  };

  // -------------------- SCHEDULE --------------------
  const selectQuestions = (numQuestions, subject, className, term, session) => {
    const current = approved.filter(
      (q) =>
        q.subject === subject &&
        q.term === term &&
        q.session === session &&
        q.className === className
    );
    const previous = approved.filter(
      (q) =>
        q.subject === subject &&
        q.term === term &&
        q.session !== session &&
        q.className === className
    );

    let neededCurrent = Math.ceil(numQuestions * 0.7);
    let neededPrev = numQuestions - neededCurrent;

    if (current.length < neededCurrent) {
      neededPrev += neededCurrent - current.length;
      neededCurrent = current.length;
    }
    if (previous.length < neededPrev) {
      neededCurrent += neededPrev - previous.length;
      neededPrev = previous.length;
    }

    if (neededCurrent + neededPrev < numQuestions) {
      toast.warn("Not enough questions available, selecting all available");
    }

    return [
      ...current.slice(0, neededCurrent),
      ...previous.slice(0, neededPrev),
    ];
  };

  const scheduleExam = async () => {
    const {
      subject,
      className,
      term,
      session,
      date,
      time,
      timeLimit,
      numQuestions,
    } = examSetup;

    if (!subject || !className || !term || !session || !date || !time)
      return toast.error("Fill all fields");

    const selected = selectQuestions(
      numQuestions,
      subject,
      className,
      term,
      session
    );
    if (selected.length === 0) return toast.error("No questions found");

    await fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject,
        className,
        term,
        session,
        scheduledDate: `${date}T${time}`,
        timeLimit,
        questions: selected.map((q) => q.questionId),
      }),
    });
    toast.success("Exam scheduled");
  };

  // -------------------- EDIT --------------------
  const openEdit = (exam) => {
    setEditingExam({
      ...exam,
      date: exam.scheduledDate.split("T")[0],
      time: exam.scheduledDate.split("T")[1]?.slice(0, 5),
    });
  };

  const saveEdit = async () => {
    const {
      examId,
      subject,
      className,
      term,
      session,
      date,
      time,
      timeLimit,
      numQuestions,
    } = editingExam;

    const selected = selectQuestions(
      numQuestions,
      subject,
      className,
      term,
      session
    );
    if (selected.length === 0) return toast.error("No questions available");

    await fetch(`/api/exams/${examId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scheduledDate: `${date}T${time}`,
        timeLimit,
        questions: selected.map((q) => q.questionId),
      }),
    });
    toast.success("Exam updated");
    setEditingExam(null);
  };

  const deleteExam = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    await fetch(`/api/exams/${id}`, { method: "DELETE" });
    setScheduled((s) => s.filter((e) => e.examId !== id));
    toast.info("Exam deleted");
  };

  const openEntries = async (examId) => {
    setViewingEntries(examId);
  };

  return (
    <div className="relative">
      {/* Mini Nav */}
      <div className="flex gap-4 border-b bg-white sticky top-0 z-10 px-6 py-3 shadow">
        {["pending", "approved", "schedule", "scheduled"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1  font-medium ${
              activeTab === tab
                ? "bg-violet-200 text-violet-600 border-violet-600 border-b-2"
                : "text-gray-700 hover:bg-violet-100"
            }`}
          >
            {tab === "pending"
              ? "Pending Questions"
              : tab === "approved"
              ? "Approved Questions"
              : tab === "schedule"
              ? "Schedule Exam"
              : "Scheduled Exams"}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="p-6 bg-white rounded shadow">
        {/* --- PENDING --- */}
        {activeTab === "pending" && (
          <div className="space-y-6">
            {Object.entries(
              pending.reduce((acc, q) => {
                acc[q.subject] = acc[q.subject] || [];
                acc[q.subject].push(q);
                return acc;
              }, {})
            ).map(([subject, qs]) => (
              <div key={subject} className="border p-4 rounded space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-purple-700">{subject}</h3>
                  <button
                    onClick={() => approveAllInSubject(subject)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Approve All
                  </button>
                </div>
                {qs.map((q) => (
                  <div
                    key={q.questionId}
                    className="p-3 border rounded space-y-2"
                  >
                    <p className="font-medium">{q.content}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveQuestion(q.questionId)}
                        className="bg-green-500 text-white px-2 py-1 rounded"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const c = prompt("Reason for rejection?");
                          if (c) rejectQuestion(q.questionId, c);
                        }}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* --- APPROVED --- */}
        {activeTab === "approved" && (
          <div className="space-y-3">
            {approved.map((q) => (
              <div key={q.questionId} className="border p-3 rounded">
                <p>{q.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* --- SCHEDULE --- */}
        {activeTab === "schedule" && (
          <div className="space-y-4 text-violet-700">
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(examSetup).map((field) => (
                <input
                  key={field}
                  type={
                    field === "date"
                      ? "date"
                      : field === "time"
                      ? "time"
                      : "text"
                  }
                  placeholder={field}
                  value={examSetup[field]}
                  onChange={(e) =>
                    setExamSetup((prev) => ({
                      ...prev,
                      [field]: e.target.value,
                    }))
                  }
                  className="border p-2 rounded"
                />
              ))}
            </div>
            <button
              onClick={scheduleExam}
              className="bg-purple-600 text-white px-4 py-2 rounded"
            >
              Schedule
            </button>
          </div>
        )}

        {/* --- SCHEDULED --- */}
        {activeTab === "scheduled" && (
          <div className="space-y-4">
            {scheduled.map((ex) => (
              <div
                key={ex.examId}
                className="border p-3 rounded flex justify-between"
              >
                <div>
                  <p className="font-medium">{ex.subject}</p>
                  <p className="text-sm text-gray-600">
                    {ex.term} | {ex.session} | {ex.scheduledDate}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(ex)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteExam(ex.examId)}
                    className="bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => openEntries(ex.examId)}
                    className="bg-blue-600 text-white px-2 py-1 rounded"
                  >
                    View Entries
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- EDIT MODAL --- */}
      {editingExam && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow space-y-3 w-96">
            <h3 className="font-bold text-purple-700 mb-2">Edit Exam</h3>
            {["date", "time", "timeLimit", "numQuestions"].map((f) => (
              <input
                key={f}
                type={f === "date" ? "date" : f === "time" ? "time" : "number"}
                value={editingExam[f]}
                onChange={(e) =>
                  setEditingExam((prev) => ({ ...prev, [f]: e.target.value }))
                }
                className="border p-2 rounded w-full"
              />
            ))}
            <div className="flex gap-2 justify-end">
              <button
                onClick={saveEdit}
                className="bg-purple-600 text-white px-3 py-1 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setEditingExam(null)}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>
            </div>
          </div>
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

export default AdminExamPanel;
