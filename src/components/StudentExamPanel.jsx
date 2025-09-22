//StudentExamPanel.jsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const StudentExamPanel = ({ user }) => {
  const [scheduledExams, setScheduledExams] = useState([]);
  const navigate = useNavigate();

  const mockExam = {
    id: examId,
    subject: "Mathematics",
    class: "JSS2",
    term: "Second Term",
    session: "2024/2025",
    timeLimit: 30,
    questions: Array.from({ length: 10 }, (_, i) => ({
      id: `Q${i + 1}`,
      question: `Sample Question ${i + 1}?`,
      answerType: "multiple",
      options: ["Option A", "Option B", "Option C", "Option D"],
    })),
  };

  // Load scheduled exams + attempt status
  useEffect(() => {
    const loadExams = async () => {
      try {
        const res = await fetch(
          `/api/exams?className=${user.className}&session=${user.session}&term=${user.term}`
        );
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
        toast.error("Failed to load exams");
        setScheduledExams([mockExam]);
      }
    };

    loadExams();
  }, []);

  const startExam = async (exam) => {
    const now = new Date();
    const startTime = new Date(exam.scheduledDate);
    if (now < startTime) {
      toast.error("This exam hasn't started yet");
      return;
    }

    // Double-check attempt status
    const attemptRes = await fetch(
      `/api/exams/${exam.examId}/attempt-status?studentId=${user.userId}`
    );
    const { taken } = await attemptRes.json();
    if (taken) {
      toast.info("You have already taken this exam");
      return;
    }

    // Fetch questions
    const res = await fetch(`/api/exams/${exam.examId}/questions`);
    const questions = await res.json();

    // Go to CBT page
    navigate("/cbt", { state: { exam: { ...exam, questions } } });
  };

  const [hiddenCompleted, setHiddenCompleted] = useState({});

  // When marking as completed after CBT submit
  // (This would be triggered from CBTPage via navigate state or localStorage flag)
  useEffect(() => {
    const justCompleted = JSON.parse(
      localStorage.getItem("justCompletedExams") || "[]"
    );
    if (justCompleted.length) {
      const hiddenMap = {};
      justCompleted.forEach((id) => (hiddenMap[id] = true));
      setHiddenCompleted(hiddenMap);
      // Clear them after 2 minutes
      setTimeout(() => setHiddenCompleted({}), 2 * 60 * 1000);
      localStorage.removeItem("justCompletedExams");
    }
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold text-violet-700">Available Exams</h2>
      {scheduledExams.length === 0 ? (
        <p className="text-gray-500">No scheduled exams</p>
      ) : (
        scheduledExams
          .filter((exam) => !hiddenCompleted[exam.examId])
          .map((exam) => (
            <div
              key={exam.examId}
              className="border p-3 rounded flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{exam.subject}</p>
                <p className="text-sm text-gray-600">
                  {exam.term} | {exam.session} | {exam.scheduledDate}
                </p>
                {exam.status === "completed" ? (
                  <p className="text-blue-600 text-xs mt-1">Completed</p>
                ) : (
                  <p className="text-green-600 text-xs mt-1">Available</p>
                )}
              </div>
              <button
                onClick={() => startExam(exam)}
                className="bg-violet-600 text-white px-3 py-1 rounded disabled:opacity-50"
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
