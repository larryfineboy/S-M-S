import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const StudentExamPanel = ({ user }) => {
  const [scheduledExams, setScheduledExams] = useState([]);
  const navigate = useNavigate();

  const mockExam = {
    examId: "mock-1",
    subject: "Mathematics",
    className: "JSS2",
    term: "Second Term",
    session: "2024/2025",
    timeLimit: 30,
    scheduledDate: new Date().toISOString(),
    questions: Array.from({ length: 55 }, (_, i) => ({
      questionId: `Q${i + 1}`,
      content: `Sample Question ${i + 1}?`,
      answerType: "truefalse",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: "True",
    })),
  };

  // Load scheduled exams + attempt status
  useEffect(() => {
    const loadExams = async () => {
      try {
        const res = await fetch(
          `/api/exams?className=${user.className}&session=${user.session}&term=${user.term}`
        ); //fetch current term and session, user property does not include term nor session
        let data = await res.json();

        // Check attempt status for each exam
        const withStatus = await Promise.all(
          data.map(async (exam) => {
            const attemptRes = await fetch(
              `/api/exams/${exam.examId}/attempt-status?studentId=${user.userId}`
            );
            const { taken } = await attemptRes.json();
            return taken ? { ...exam, status: "completed" } : exam;
          })
        );

        setScheduledExams(withStatus);
      } catch {
        toast.dismiss();
        toast.error("Failed to load exams");
        setScheduledExams([mockExam]);
      }
    };

    loadExams();
  }, [user.className, user.session, user.term, user.userId]);

  const startExam = async (exam) => {
    try {
      const now = new Date();

      // ✅ Only check time if scheduledDate exists
      if (exam.scheduledDate) {
        const startTime = new Date(exam.scheduledDate);
        if (now < startTime) {
          toast.error("This exam hasn't started yet");
          return;
        }
      }

      // ✅ Double-check attempt status (skip if mock)
      if (exam.examId) {
        const attemptRes = await fetch(
          `/api/exams/${exam.examId}/attempt-status?studentId=${user.userId}`
        );
        const { taken } = await attemptRes.json();
        if (taken) {
          toast.info("You have already taken this exam");
          return;
        }
      }

      // ✅ Fetch questions (or use mock fallback)
      let questions = exam.questions;
      if (!questions || !questions.length) {
        if (exam.examId) {
          const res = await fetch(`/api/exams/${exam.examId}/questions`);
          if (!res.ok) throw new Error("No questions found");
          questions = await res.json();

          questions = questions.map((q, idx) => ({
            questionId: q.questionId || q.id || `Q${idx + 1}`,
            content: q.content || q.question,
            answerType:
              q.answerType === "multiple" ? "multichoice" : q.answerType,
            options: q.options || [],
            correctAnswer: q.correctAnswer || null,
          }));
        } else {
          // mock fallback
          questions = Array.from({ length: 10 }, (_, i) => ({
            questionId: `Q${i + 1}`,
            content: `Sample Question ${i + 1}?`,
            answerType: "multichoice",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: "Option B",
          }));
        }
      }

      // ✅ Store exam persistently
      localStorage.setItem(
        "activeExam",
        JSON.stringify({ ...exam, questions })
      );

      // ✅ Navigate to CBT
      navigate("/cbt");
      // navigate("/cbt", { state: { activeExam: { ...exam, questions } } });
    } catch (err) {
      console.error(err);
      toast.error(err || "Failed to start exam");
      // let questions = exam.questions;
      localStorage.setItem("activeExam", JSON.stringify(exam));
      navigate("/cbt");
      // navigate("/cbt", { state: { activeExam: { ...exam, questions } } });
    }
  };

  const [hiddenCompleted, setHiddenCompleted] = useState({});

  useEffect(() => {
    const justCompleted = JSON.parse(
      localStorage.getItem("justCompletedExams") || "[]"
    );
    if (justCompleted.length) {
      const hiddenMap = {};
      justCompleted.forEach((id) => (hiddenMap[id] = true));
      setHiddenCompleted(hiddenMap);
      setTimeout(() => setHiddenCompleted({}), 2 * 60 * 1000);
      localStorage.removeItem("justCompletedExams");
    }
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold text-violet-700">
        Available Exams - {new Date().toDateString()}
      </h2>
      {scheduledExams.length === 0 ? (
        <p className="text-gray-500">No scheduled exams</p>
      ) : (
        scheduledExams
          .filter((exam) => !hiddenCompleted[exam.examId])
          .map((exam) => (
            <div
              key={exam.examId}
              className=" p-3 rounded flex justify-between items-center bg-white shadow"
            >
              <div>
                <p className="font-semibold text-violet-500 text-lg">
                  {exam.subject}
                </p>
                <p className="text-sm text-gray-600 font-semibold">
                  {exam.term} | {exam.session}
                </p>
                {exam.status === "completed" ? (
                  <p className="text-blue-600 text-xs mt-1">Completed</p>
                ) : (
                  <p className="text-green-600 text-xs mt-1">Available</p>
                )}
              </div>
              <button
                onClick={() => startExam(exam)}
                className="bg-violet-600 text-white px-3 py-1 rounded disabled:bg-violet-100"
                disabled={exam.status === "completed"}
              >
                Start
              </button>
            </div>
          ))
      )}
    </div>
  );
};

export default StudentExamPanel;
