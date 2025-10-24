import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ExamEntries from "./ExamEntries";
import TermSessionModal from "./TermSessionModal";
import Tooltip from "../ui/ToolTip";
import {
  CalendarClock,
  CircleCheckBig,
  Settings2,
  CircleX,
  History,
  Pen,
  Trash,
  Eye,
  SquarePen,
} from "lucide-react";

const AdminExamPanel = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [pending, setPending] = useState([]);
  // const [approved, setApproved] = useState([]);
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

  const [showModal, setShowModal] = useState(false);

  const [comment, setComment] = useState(null);
  const [showCommentBox, setShowCommentBox] = useState(false);

  const [editingExam, setEditingExam] = useState(null);
  const [viewingEntries, setViewingEntries] = useState(null);

  useEffect(() => {
    if (activeTab === "scheduled") {
      fetch("/api/exams")
        .then((res) => res.json())
        .then(setScheduled)
        .catch(
          () => toast.error("Failed to load scheduled exams"),
          setScheduled(() => [
            {
              examId: "MS245",
              subject: "MATHEMATICS",
              className: "JSS1",
              term: "Second Term",
              session: "2024/2025",
              scheduledDate: new Date().toISOString(),
              timeLimit: 30,
              numQuestions: 45,
              questions: [
                {
                  questionId: `Q${2}`,
                  content: `Sample Question ${2}?`,
                  answerType: "multichoice",
                  options: ["Option A", "Option B", "Option C", "Option D"],
                  correctAnswer: "Option B",
                  subject: "MATHEMATICS",
                  term: "Second Term",
                  session: "2024/2025",
                  className: "JSS1",
                  status: "approved",
                },
              ],
            },
          ])
        );
    }
    if (activeTab === "pending") {
      fetch("/api/questions?status=pending")
        .then((res) => res.json())
        .then(setPending)
        .catch(
          () => toast.error("Failed to load pending questions"),
          setPending(() => [
            {
              questionId: `Q${2}`,
              content: `Sample Question ${2}?`,
              answerType: "multichoice",
              options: ["Option A", "Option B", "Option C", "Option D"],
              correctAnswer: "Option B",
              subject: "Mathematics",
              term: "Second Term",
              session: "2024/2025",
              className: "JSS1",
              status: "pending",
            },
          ])
        );
    }
  }, [activeTab]);

  // -------------------- PENDING --------------------
  const approveQuestion = async (questionId) => {
    await fetch(`/api/questions/${questionId}/approve`, { method: "PATCH" });
    setPending((p) => p.filter((q) => q.questionId !== questionId));
    toast.success("Question approved");
  };

  const rejectQuestion = async (questionId, comment) => {
    await fetch(`/api/questions/${questionId}/reject`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment }),
    });
    setPending((p) => p.filter((q) => q.questionId !== questionId));
    toast.info("Question rejected");
  };

  const approveAll = async (subject, className) => {
    const qs = pending.filter(
      (q) => q.subject === subject && q.className === className
    );

    await Promise.all(
      qs.map((q) =>
        fetch(`/api/questions/${q.questionId}/approve`, { method: "PATCH" })
      )
    );
    setPending((p) =>
      p.filter((q) => !(q.subject === subject && q.className === className))
    );

    toast.success(
      `Approved all ${qs.length} questions in ${subject} for ${className}`
    );
  };

  const fetchQuestions = async (subject, className, term) => {
    const res = await fetch(
      `/api/questions?status=approved&subject=${subject}&className=${className}&term=${term}`
    );
    return await res.json();
  };

  // -------------------- SCHEDULE --------------------
  const selectQuestions = async (
    numQuestions,
    subject,
    className,
    term,
    session
  ) => {
    const approved = await fetchQuestions(subject, className, term);
    if (!approved) return toast.error("Error fetching Questions");

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
      return toast.warn("Fill all fields");

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

  const handleModalSubmit = ({ term, session, className }) => {
    setExamSetup((prev) => ({
      ...prev,
      ["term"]: term,
      ["session"]: session,
      ["className"]: className,
    }));
  };

  const openEntries = async (examId) => {
    setViewingEntries(examId);
  };

  const grouped = pending.reduce((acc, q) => {
    if (!acc[q.className]) acc[q.className] = {};
    if (!acc[q.className][q.subject]) acc[q.className][q.subject] = [];
    acc[q.className][q.subject].push(q);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6">
      {/* Mini Nav */}
      <nav className="flex gap-4 p-3 bg-white shadow justify-around rounded">
        {[
          ["pending", "Pending Questions"],
          ["create", "Create Exam"],
          ["scheduled", "Scheduled Exams"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            // We add the `group` class here to enable group-hover effects
            className={`relative px-3 py-1 text-violet-600 font-bold group ${
              activeTab === key ? "text-violet-600" : ""
            }`}
          >
            {label}
            {/* This span will act as the expanding border */}
            <span
              className={`absolute inset-x-0 bottom-[-2px] h-[2px] rounded-full bg-violet-600 transition-transform duration-500 origin-left ${
                activeTab === key
                  ? "scale-x-100" // active state
                  : "scale-x-0 group-hover:scale-x-100" // inactive state
              }`}
            ></span>
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <div className="p-6 bg-white rounded shadow">
        {/* --- PENDING --- */}
        {activeTab === "pending" && (
          <div className="space-y-6">
            {pending.length === 0 ? (
              <p className="text-gray-500 font-semibold">
                No pending questions for approval
              </p>
            ) : (
              Object.entries(grouped).map(([className, subjects]) =>
                Object.entries(subjects).map(([subject, qs]) => (
                  <div
                    key={`${className}-${subject}`}
                    className=" p-4 rounded space-y-2"
                  >
                    <div className="flex justify-between items-center border-b-2 text-violet-600 p-4">
                      <h3 className="font-bold ">
                        {className} | {subject}
                      </h3>
                      <button
                        onClick={() => approveAll(subject, className)}
                        className="bg-green-600 text-white px-3 py-2 rounded font-semibold"
                      >
                        Approve All
                      </button>
                    </div>
                    {qs.map((q) => (
                      <div
                        key={q.questionId}
                        className=" p-3 border border-blue-700 rounded space-y-2 text-gray-600 font-semibold"
                      >
                        <div className="flex justify-between">
                          <div>
                            <div className="font-medium">{q.content}</div>
                            <div className="text-sm ">Type: {q.answerType}</div>
                            {q.answerType === "multichoice" ? (
                              <div className="flex gap-2 mt-1">
                                {q.options?.map((o, i) => (
                                  <div
                                    key={i}
                                    className={`p-2 rounded text-sm ${
                                      o === q.correctAnswer
                                        ? "bg-green-100 text-green-600"
                                        : "bg-gray-100"
                                    }`}
                                  >
                                    {o}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="py-3">
                                Correct Answer:{" "}
                                <span className="bg-green-100 text-green-600 p-2 rounded text-md space-y-3">
                                  {q.correctAnswer}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => approveQuestion(q.questionId)}
                              className=" text-green-600 p-2 "
                            >
                              <Tooltip content={"Approve"}>
                                <CircleCheckBig />
                              </Tooltip>
                            </button>
                            <button
                              onClick={() => setShowCommentBox(true)}
                              className=" text-red-600 p-2 "
                            >
                              <Tooltip content={"Reject"}>
                                <CircleX />
                              </Tooltip>
                            </button>
                          </div>
                        </div>
                        {showCommentBox && (
                          <div
                            key={q.questionId}
                            className="flex gap-2 justify-between max-h-10"
                          >
                            <textarea
                              placeholder="Reason for rejection"
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              className="w-full border text-blue-600 bg-blue-100 font-semibold rounded px-2 py-1 focus:outline-0 focus:ring-1 focus:ring-blue-400"
                            />
                            <button
                              onClick={() => {
                                rejectQuestion(q.questionId, comment);
                                setShowCommentBox(false);
                              }}
                              className="bg-blue-500 text-white px-3 py-1 rounded"
                            >
                              Submit
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))
              )
            )}
          </div>
        )}

        {/* --- SCHEDULE --- */}
        {activeTab === "create" && (
          <div className="space-y-4 text-violet-700">
            <div className="flex justify-between">
              <CalendarClock />
              <button
                className="flex gap-3 p-2 rounded bg-violet-200 hover:bg-violet-300 font-semibold"
                onClick={() => setShowModal(true)}
              >
                <Settings2 /> Setup
              </button>
            </div>

            <div className=" p-4 space-y-4 border-t-2 border-b-2">
              {Object.keys(examSetup).map((field) => (
                <div className="flex gap-3 items-center">
                  <label className="font-semibold text-md py-3">
                    {field === "timeLimit"
                      ? "Time Limit (mins)"
                      : field === "numQuestions"
                      ? "No. of Questions"
                      : field.toUpperCase()}
                  </label>
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
                    value={
                      field === "subject"
                        ? examSetup[field].toUpperCase()
                        : examSetup[field]
                    }
                    disabled={
                      field === "className" ||
                      field === "term" ||
                      field === "session"
                        ? true
                        : false
                    }
                    onChange={(e) =>
                      setExamSetup((prev) => ({
                        ...prev,
                        [field]: e.target.value,
                      }))
                    }
                    className=" border text-blue-600 bg-blue-100 font-semibold rounded px-2 py-1 focus:outline-0 focus:ring-1 focus:ring-blue-400"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={scheduleExam}
              className="border bg-blue-200 text-blue-600 px-4 py-2 rounded font-semibold"
            >
              Schedule
            </button>
          </div>
        )}

        {/* SCHEDULED TAB */}
        {activeTab === "scheduled" && (
          <div className="space-y-4">
            <History />
            {scheduled.length === 0 ? (
              <p className="text-gray-500 font-semibold">No scheduled exams</p>
            ) : (
              scheduled.map((ex) => (
                <div
                  key={ex.examId}
                  className="border p-3 rounded flex justify-between font-semibold"
                >
                  <div>
                    <p className="font-medium">
                      {ex.subject} | {ex.className}
                    </p>
                    <p className="text-sm text-gray-600">
                      {ex.term} | {ex.session} | {ex.scheduledDate}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(ex)}
                      className="text-yellow-500 hover:text-yellow-600 p-2"
                    >
                      <Tooltip content={"Edit"}>
                        <Pen size={21} />
                      </Tooltip>
                    </button>
                    <button
                      onClick={() => deleteExam(ex.examId)}
                      className="text-red-500 hover:text-red-600 p-2"
                    >
                      <Tooltip content={"Delete"}>
                        <Trash size={21} />
                      </Tooltip>
                    </button>
                    <button
                      onClick={() => openEntries(ex.examId)}
                      className="text-blue-500 hover:text-blue-600 p-2"
                    >
                      <Tooltip content={"View submitted entries"}>
                        <Eye size={21} />
                      </Tooltip>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* --- EDIT MODAL --- */}
      {editingExam && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow space-y-3 w-96">
            <div className="flex justify-between">
              <h3 className="font-bold text-violet-700 mb-2 flex gap-3">
                <SquarePen /> Edit Exam
              </h3>
              <button
                onClick={() => setEditingExam(null)}
                className="text-red-600 hover:bg-red-100 p-2 rounded-full"
              >
                <CircleX />
              </button>
            </div>
            {["date", "time", "timeLimit", "numQuestions"].map((f) => (
              <>
                <label className="font-semibold">
                  {f === "numQuestions" ? "No. of Questions" : f.toUpperCase()}
                </label>
                <input
                  key={f}
                  type={
                    f === "date" ? "date" : f === "time" ? "time" : "number"
                  }
                  value={editingExam[f]}
                  onChange={(e) =>
                    setEditingExam((prev) => ({ ...prev, [f]: e.target.value }))
                  }
                  className="w-full border text-blue-600 bg-blue-100 font-semibold rounded px-2 py-1 focus:outline-0 focus:ring-1 focus:ring-blue-400"
                />
              </>
            ))}
            <div className="flex gap-2 justify-end">
              <button
                onClick={saveEdit}
                className=" text-violet-600 border hover:bg-violet-200 px-3 py-1 rounded font-semibold"
              >
                Save
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
      {showModal && (
        <TermSessionModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleModalSubmit}
          userRole={"admin"}
        />
      )}
    </div>
  );
};

export default AdminExamPanel;
