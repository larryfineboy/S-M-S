import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ReportHeader from "../ui/ReportHeader.png";
import ConfirmModal from "../components/ConfirmModal";

const CBTPage = ({ user }) => {
  // const { state } = useLocation();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [activeExam, setActiveExam] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const storedExam = localStorage.getItem("activeExam");
    if (storedExam) {
      setActiveExam(JSON.parse(storedExam));
    } else {
      navigate("/exams");
    }
  }, [navigate]);

  // const activeExam = state?.activeExam;

  useEffect(() => {
    if (!activeExam) {
      // navigate("/exams");
      return;
    }
    const now = Date.now();
    const end = activeExam.endTime;
    const diff = Math.max(0, Math.floor((end - now) / 1000)); // seconds left
    setTimeLeft(diff);

    if (diff <= 0) {
      submitExam(); // auto-submit if time is already up
    }
    // setTimeLeft(activeExam.timeLimit * 60);
    const saved = localStorage.getItem(
      `exam_${activeExam.examId}_${user.userId}`
    );
    if (saved) setAnswers(JSON.parse(saved));
  }, [activeExam, navigate, user.userId]);

  useEffect(() => {
    if (!timeLeft) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          submitExam();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Auto-save answers to localStorage on change
  useEffect(() => {
    if (activeExam)
      localStorage.setItem(
        `exam_${activeExam.examId}_${user.userId}`,
        JSON.stringify(answers)
      );
  }, [answers, activeExam, user.userId]);

  const handleAnswer = (qId, ans) => {
    setAnswers((prev) => ({ ...prev, [qId]: ans }));
  };

  const submitExam = async () => {
    // const attempted = Object.keys(answers).length;
    // if (
    //   !window.confirm(
    //     `You attempted ${attempted} of ${activeExam.questions.length} questions. Submit now?`
    //   )
    // )
    //   return;

    let correct = 0;
    activeExam.questions.forEach((q) => {
      if (answers[q.questionId] === q.correctAnswer) correct++;
    });
    const score = Math.round((correct / activeExam.questions.length) * 60);

    try {
      // 🔍 Check if report already exists
      const res = await fetch(
        `/api/reports/grades?studentId=${user.userId}&className=${user.className}&term=${activeExam.term}&session=${activeExam.session}`
      );
      let existing = [];
      if (res.ok) existing = await res.json();

      if (existing.length > 0) {
        const report = existing[0];
        let subjectRecords = [...report.subjectRecords];
        const existingSubject = subjectRecords.find(
          (r) => r.subject === activeExam.subject
        );

        if (existingSubject) {
          // Update only exam + total, preserve test
          existingSubject.exam = score;
          existingSubject.total = existingSubject.test + score;
        } else {
          subjectRecords.push({
            subject: activeExam.subject,
            test: 0,
            exam: score,
            total: score,
          });
        }

        await fetch(`/api/reports/grades/${report.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...report, subjectRecords }),
        });
      } else {
        await fetch("/api/reports/grades", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: user.userId,
            className: user.className,
            teacherId: activeExam.teacherId,
            term: activeExam.term,
            session: activeExam.session,
            dateRecorded: new Date().toISOString(),
            subjectRecords: [
              {
                subject: activeExam.subject,
                test: 0,
                exam: score,
                total: score,
              },
            ],
          }),
        });
      }

      // Save as exam entry
      await fetch(`/api/exams/${activeExam.examId}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: user.userId,
          studentName: `${user.firstName} ${user.lastName}`,
          className: user.className,
          subject: activeExam.subject,
          term: activeExam.term,
          session: activeExam.session,
          score,
          total: activeExam.questions.length,
        }),
      });

      // Mark as completed
      await fetch(`/api/exams/${activeExam.examId}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: user.userId }),
      });

      toast.success("Exam submitted successfully");

      const completedList = JSON.parse(
        localStorage.getItem("justCompletedExams") || "[]"
      );
      completedList.push(activeExam.examId);
      localStorage.setItem("justCompletedExams", JSON.stringify(completedList));
      localStorage.removeItem("activeExam");
      localStorage.removeItem(`exam_${activeExam.examId}_${user.userId}`);

      navigate("/exams");
    } catch {
      toast.error("Failed to submit exam");
      localStorage.removeItem("activeExam");
      localStorage.removeItem(`exam_${activeExam.examId}_${user.userId}`);
      const completedList = JSON.parse(
        localStorage.getItem("justCompletedExams") || "[]"
      );
      completedList.push(activeExam.examId);
      localStorage.setItem("justCompletedExams", JSON.stringify(completedList));
      navigate("/exams");
    }
  };

  if (!activeExam) {
    return <div className="p-6 text-center text-gray-500">Loading exam...</div>;
  }

  if (!activeExam.questions || activeExam.questions.length === 0) {
    return (
      <div className="p-6 text-center text-red-600">No questions available</div>
    );
  }

  const q = activeExam.questions[currentIndex];

  return (
    <div className="p-6 space-y-6 bg-gray-100 h-screen">
      {/* <div className="w-full rounded bg-gray-100 overflow-hidden flex-shrink-0">
        <img
          src={ReportHeader}
          alt="student"
          className="w-full h-full object-cover"
        />
      </div> */}
      {/* Question Area */}
      <div className="flex-1 p-6 bg-white shadow rounded">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-purple-700">
              {activeExam.subject} CBT
            </h2>
            <p className="text-md text-gray-600 font-semibold">
              {activeExam.className} • {activeExam.term} • {activeExam.session}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <p
              className={`font-mono font-semibold text-3xl ${
                timeLeft < 5 * 60 ? "text-red-600" : "text-blue-600"
              }`}
            >
              {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60).toString().padStart(2, "0")}
            </p>
            <button
              onClick={() => setShowConfirmation(true)}
              className="mt-6 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold"
            >
              Submit Exam
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-around flex-wrap space-y-4">
        <div>
          <div
            className={`bg-white p-4 rounded shadow space-y-3 ${
              window.innerWidth <= 768 ? "max-w-full" : "min-w-3xl"
            }`}
          >
            <p className="text-lg leading-relaxed font-semibold text-gray-700">
              {currentIndex + 1}. {q.content}
            </p>

            {q.answerType === "multichoice" &&
              q.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(q.questionId, opt)}
                  className={`block w-lg text-left p-3 border rounded mb-2 text-gray-600 font-semibold ${
                    answers[q.questionId] === opt
                      ? "bg-blue-200 border-blue-500"
                      : "border-gray-300 hover:bg-blue-300 hover:border-blue-400"
                  }`}
                >
                  {opt}
                </button>
              ))}

            {q.answerType === "truefalse" &&
              ["True", "False"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(q.questionId, opt)}
                  className={`block w-md text-left p-3 border rounded mb-2 font-semibold ${
                    answers[q.questionId] === opt
                      ? "bg-blue-200 border-blue-500"
                      : "border-gray-300 hover:bg-blue-300 hover:border-blue-400"
                  } ${opt === "True" ? "text-blue-500" : "text-red-500"}`}
                >
                  {opt}
                </button>
              ))}

            {q.answerType === "text" && (
              <input
                type="text"
                value={answers[q.questionId] || ""}
                onChange={(e) => handleAnswer(q.questionId, e.target.value)}
                placeholder="Type here. Keep your answer short."
                className="border border-blue-400 bg-blue-100 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-semibold text-gray-700"
              />
            )}
          </div>

          <div className="flex justify-between mt-4">
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 border rounded disabled:bg-gray-100 text-white bg-blue-600"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentIndex((i) =>
                  Math.min(activeExam.questions.length - 1, i + 1)
                )
              }
              disabled={currentIndex === activeExam.questions.length - 1}
              className="px-4 py-2 border rounded disabled:bg-gray-100 text-white bg-green-600"
            >
              Next
            </button>
          </div>
        </div>

        {/* Side Navigation */}
        <div className="flex gap-2 w-100 flex-wrap border-l font-semibold rounded bg-white p-3 sticky top-0 max-h-screen">
          {activeExam.questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-9.5 h-10 rounded text-md font-mono ${
                i === currentIndex
                  ? "bg-blue-600 text-white"
                  : answers[activeExam.questions[i].questionId]
                  ? "bg-green-600 text-white"
                  : "bg-red-200 text-gray-600"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
      {showConfirmation && (
        <ConfirmModal
          message={`You attempted ${Object.keys(answers).length} of ${
            activeExam.questions.length
          } questions. Submit now`}
          onConfirm={submitExam}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
};

export default CBTPage;
