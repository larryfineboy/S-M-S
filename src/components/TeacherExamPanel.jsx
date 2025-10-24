import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ExamEntries from "./ExamEntries";
import TermSessionModal from "./TermSessionModal";
import {
  Ban,
  CaseSensitive,
  CirclePlus,
  CircleX,
  Settings2,
} from "lucide-react";

const TeacherExamPanel = ({ user }) => {
  const [activeTab, setActiveTab] = useState("create"); // create | rejected | scheduled
  const [isResubmit, setIsResubmit] = useState(false);

  const [questions, setQuestions] = useState([]);

  //Question Tags
  const [term, setTerm] = useState("");
  const [session, setSession] = useState("");
  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState(user?.assignedClass || "");
  const [showModal, setShowModal] = useState(false);

  // const [approvedQuestions, setApprovedQuestions] = useState([]);
  const [rejectedQuestions, setRejectedQuestions] = useState([]);
  const [scheduledExams, setScheduledExams] = useState([]);
  const [viewingEntries, setViewingEntries] = useState(null);

  // Fetch rejected questions
  // Comment should come with rejected questions
  useEffect(() => {
    if (activeTab === "rejected") {
      fetch(`/api/questions?status=rejected&className=${user.assignedClass}`)
        .then((res) => res.json())
        .then(setRejectedQuestions)
        .catch(
          () => toast.error("Failed to load rejected questions"),
          setRejectedQuestions(() => [
            {
              questionId: `Q${2}`,
              content: `Sample Question ${2}?`,
              answerType: "truefalse",
              options: ["Option A", "Option B", "Option C", "Option D"],
              correctAnswer: "True",
              subject: "Mathematics",
              term: "Second Term",
              session: "2024/2025",
              className: user.assignedClass || "",
              comment: "Why is a Math question, using true or false?",
              status: "rejected",
            },
          ])
        );
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

  //Fetch saved questions for selected tags
  useEffect(() => {
    if (activeTab === "create" && subject && session) {
      const saved = localStorage.getItem(
        `${term}_${session}_${subject}_${className}`
      );
      if (saved) setQuestions(JSON.parse(saved));
    }
  }, [term, session, subject, activeTab, className]);

  // --- CREATE QUESTION LOGIC ---
  const addQuestion = () => {
    if (!subject || !term || !session || !className) {
      toast.warn(
        "Please set subject, term, and session before adding questions."
      );
      return;
    }

    if (isResubmit) {
      toast.info("New questions can't be added to rejected questions");
      return;
    }

    setQuestions((prev) => [
      ...prev,
      {
        content: "",
        answerType: "multichoice",
        options: ["", "", "", ""],
        correctAnswer: "",
      },
    ]);
  };

  const handleQuestionChange = (index, field, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const removeQuestion = (idx) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const submitQuestions = async () => {
    if (!questions.length) {
      toast.warn("Add at least one question");
      return;
    }
    if (questions[0].status === "rejected" || isResubmit) {
      resubmitQuestion(questions[0]);

      setIsResubmit(false);
      setQuestions([]);
      return;
    }

    const newQuestions = questions.map((q) => ({
      ...q,
      subject,
      term,
      session,
      className,
      createdBy: user?.userId || "TCH_DEMO",
      status: "pending",
    }));

    try {
      const res = await fetch("/api/questions/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newQuestions }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit questions");
      }
      toast.success("Questions submitted for approval");
      setQuestions([]);
      localStorage.removeItem(`${term}_${session}_${subject}_${className}`);
    } catch {
      toast.error("Failed to submit questions");
    }
  };

  const handleResubmit = async (q) => {
    // setTerm(q.term);
    // setSession(q.session);
    // setSubject(q.subject);
    setIsResubmit(true);
    setQuestions([q]);
    setActiveTab("create");
  };

  // --- RESUBMIT REJECTED QUESTION ---
  const resubmitQuestion = async (q) => {
    try {
      const res = await fetch(`/api/questions/resubmit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(q),
      });

      if (!res.ok) {
        throw new Error("Failed to submit questions");
      }

      toast.success("Question resubmitted for approval");
      setRejectedQuestions((prev) =>
        prev.filter((item) => item.questionId !== q.questionId)
      );
    } catch {
      toast.error("Failed to resubmit");
    }
  };

  useEffect(() => {
    if (session && subject)
      localStorage.setItem(
        `${term}_${session}_${subject}_${className}`,
        JSON.stringify(questions)
      );
  }, [questions, session, term, subject, className]);

  const handleModalSubmit = ({ term, session, className }) => {
    setTerm(term);
    setSession(session);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Mini Navbar */}
      <nav className="flex gap-4 p-3 bg-white shadow justify-around rounded">
        {[
          ["create", "Create Questions"],
          ["rejected", "Rejected"],
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
      <div className="p-6 bg-white rounded shadow">
        {/* CREATE TAB */}
        {activeTab === "create" && (
          <div className="space-y-6">
            <div className="text-violet-600 font-semibold space-y-3 border-b-2 p-4">
              <button
                className="flex gap-3 p-2 rounded bg-violet-200 hover:bg-violet-300"
                onClick={() => setShowModal(true)}
              >
                <Settings2 /> Setup
              </button>

              <label>SUBJECT</label>
              <input
                placeholder="MATHEMATICS"
                value={subject.toUpperCase()}
                onChange={(e) => setSubject(e.target.value)}
                className="border p-2 rounded focus:outline-0 focus:ring-1 m-2"
              />
              <label>CLASS</label>
              <input
                value={className}
                disabled
                className="border p-2 rounded focus:outline-0 focus:ring-1 m-2"
              />
              <label>TERM</label>
              <input
                value={term}
                disabled
                className="border p-2 rounded focus:outline-0 focus:ring-1 m-2"
              />
              <label>SESSION</label>
              <input
                value={session}
                disabled
                className="border p-2 rounded focus:outline-0 focus:ring-1 m-2"
              />
            </div>

            {questions.map((q, i) => (
              <div key={i} className="border-b-2 p-4 space-y-3 text-violet-600">
                <div className="flex justify-between gap-3">
                  <span className="flex text-blue-600 items-center gap-3">
                    <h4 className="font-semibold">{i + 1}.</h4>
                    <CaseSensitive size={25} />
                  </span>

                  <button
                    className="text-red-600 rounded-full p-2 bg-red-200 hover:bg-red-300"
                    onClick={() => removeQuestion(i)}
                  >
                    <CircleX />
                  </button>
                </div>

                <div className="text-gray-700 font-medium mb-1">Question</div>
                <textarea
                  placeholder="Question"
                  value={q.content}
                  onChange={(e) =>
                    handleQuestionChange(i, "content", e.target.value)
                  }
                  className="w-full border text-blue-600 bg-blue-100 font-semibold rounded px-2 py-1 min-h-[80px] focus:outline-0 focus:ring-1 focus:ring-blue-400"
                />

                <div className="text-gray-700 font-medium mb-1">
                  Select Answer Type
                </div>
                <select
                  value={q.answerType}
                  onChange={(e) =>
                    handleQuestionChange(i, "answerType", e.target.value)
                  }
                  className="border p-2 text-blue-500 font-semibold rounded focus:outline-0 focus:ring-1"
                >
                  <option
                    value="multichoice"
                    className="text-green-600 hover:bg-green-100"
                  >
                    Multiple Choice
                  </option>
                  <option
                    value="text"
                    className="text-violet-600 hover:bg-violet-100"
                  >
                    Text
                  </option>
                  <option
                    value="truefalse"
                    className="text-blue-600 hover:bg-blue-100"
                  >
                    True / False
                  </option>
                </select>

                {q.answerType === "multichoice" && (
                  <>
                    <div className="text-gray-700 font-medium mb-1">
                      Options
                    </div>
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
                          className="border text-blue-600 bg-blue-100 font-semibold rounded p-2 focus:outline-0 focus:ring-1 focus:ring-blue-400"
                        />
                      ))}
                    </div>
                  </>
                )}

                <div className="text-gray-700 font-medium mb-1">
                  Enter the Correct Answer
                </div>
                <input
                  placeholder="i.e, Option 1, True, 24"
                  value={q.correctAnswer}
                  onChange={(e) =>
                    handleQuestionChange(i, "correctAnswer", e.target.value)
                  }
                  className="border text-blue-600 bg-blue-100 font-semibold rounded p-2 focus:outline-0 focus:ring-1 focus:ring-blue-400"
                />
              </div>
            ))}

            <div className="flex gap-3 justify-between">
              <button
                onClick={addQuestion}
                className="bg-violet-200 text-violet-600 p-2 rounded-full hover:bg-violet-300"
              >
                <CirclePlus />
              </button>
              <button
                onClick={submitQuestions}
                className="bg-green-600 text-white px-4 py-2 rounded font-semibold"
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {/* REJECTED TAB */}
        {activeTab === "rejected" && (
          <div className="space-y-3">
            {rejectedQuestions.length === 0 ? (
              <p className="text-gray-500">No rejected questions</p>
            ) : (
              rejectedQuestions.map((q) => (
                <>
                  <Ban className="text-red-600" />
                  <div
                    key={q.questionId}
                    onClick={() => handleResubmit(q)}
                    className="border text-red-600 p-3 rounded bg-red-200 space-y-2 font-semibold cursor-pointer"
                  >
                    <p className="text-gray-700 font-semibold ">{q.content}</p>
                    <p className="text-sm">
                      <span className="text-violet-600 font-semibold">
                        Admin comment:{" "}
                      </span>
                      {q.comment}
                    </p>
                  </div>
                </>
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
                  onClick={() => setViewingEntries(exam.examId)}
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
        {showModal && (
          <TermSessionModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSubmit={handleModalSubmit}
            userRole={user.role}
            assignedClass={className}
          />
        )}
      </div>
    </div>
  );
};

export default TeacherExamPanel;
