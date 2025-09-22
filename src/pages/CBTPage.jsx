import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const CBTPage = ({ user }) => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const activeExam = state?.exam;

  useEffect(() => {
    if (!activeExam) {
      navigate("/exams");
      return;
    }
    setTimeLeft(activeExam.timeLimit * 60);
    const saved = localStorage.getItem(
      `exam_${activeExam.examId}_${user.userId}`
    );
    if (saved) setAnswers(JSON.parse(saved));
  }, [activeExam, navigate, user.userId]);

  useEffect(() => {
    if (!timeLeft || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(t);
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
    const attempted = Object.keys(answers).length;
    if (
      !window.confirm(
        `You attempted ${attempted} of ${activeExam.questions.length} questions. Submit now?`
      )
    )
      return;

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

      navigate("/exams");
    } catch {
      toast.error("Failed to submit exam");
    }
  };

  if (!activeExam) return <div className="p-6 text-center">No active exam</div>;

  const q = activeExam.questions[currentIndex];

  return (
    <div className="min-h-screen flex">
      {/* Question Area */}
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-purple-700">
              {activeExam.subject} CBT
            </h2>
            <p className="text-sm text-gray-600">
              {activeExam.class} • {activeExam.term} • {activeExam.session}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <p className="font-mono text-red-600">
              {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60).toString().padStart(2, "0")}
            </p>
            <button
              onClick={submitExam}
              className="mt-6 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Submit Exam
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow space-y-3">
        <p className="text-lg leading-relaxed">
          {currentIndex + 1}. {q.content}
        </p>

        {q.answerType === "multichoice" &&
          q.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(q.questionId, opt)}
              className={`block w-full text-left p-3 border rounded mb-2 ${
                answers[q.questionId] === opt
                  ? "bg-blue-200 border-blue-500"
                  : "border-gray-300 hover:border-blue-300"
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
              className={`block w-full text-left p-3 border rounded mb-2 ${
                answers[q.questionId] === opt
                  ? "bg-blue-100 border-blue-500"
                  : "border-gray-300 hover:border-blue-300"
              }`}
            >
              {opt}
            </button>
          ))}

        {q.answerType === "text" && (
          <input
            type="text"
            value={answers[q.questionId] || ""}
            onChange={(e) => handleAnswer(q.questionId, e.target.value)}
            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        )}
      </div>

      <div className="flex justify-between mt-4">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="px-4 py-2 border rounded bg-gray-100"
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
          className="px-4 py-2 border rounded bg-gray-100"
        >
          Next
        </button>
      </div>

      {/* Side Navigation */}
      <div className="flex gap-2 flex-wrap w-24 border-l rounded bg-white p-3 space-y-2 sticky top-0 max-h-screen overflow-y-auto">
        {activeExam.questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-full py-2 rounded text-sm font-mono ${
              i === currentIndex
                ? "bg-blue-600 text-white"
                : answers[activeExam.questions[i].questionId]
                ? "bg-green-200"
                : "bg-gray-100"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CBTPage;
