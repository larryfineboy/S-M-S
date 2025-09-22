import React, { useEffect, useState } from "react";

const ExamEntries = ({ examId, onClose }) => {
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    const fetchEntries = async () => {
      const res = await fetch(`/api/exams/${examId}/entries`);
      const data = await res.json();
      setEntries(data);
    };
    if (examId) fetchEntries();
  }, [examId]);

  if (!examId) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-[700px] max-h-[80vh] overflow-y-auto">
        {!selectedEntry ? (
          <>
            <h3 className="font-bold text-purple-700 mb-3">
              Submitted Entries
            </h3>
            {entries.length === 0 ? (
              <p className="text-gray-500">No submissions yet.</p>
            ) : (
              entries.map((e) => (
                <div
                  key={e.studentId}
                  className="border p-3 rounded mb-2 flex justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {e.studentName} ({e.studentId})
                    </p>
                    <p className="text-sm text-gray-600">
                      Score: {e.score}/{e.total}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedEntry(e)}
                    className="bg-blue-600 text-white px-2 py-1 rounded"
                  >
                    View
                  </button>
                </div>
              ))
            )}
            <div className="text-right mt-3">
              <button onClick={onClose} className="px-3 py-1 border rounded">
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="font-bold text-purple-700 mb-3">Attempt Details</h3>
            <div className="border p-4 rounded mb-4">
              <p className="font-medium mb-2">
                {selectedEntry.studentName} ({selectedEntry.studentId})
              </p>
              {selectedEntry.questions?.map((q, idx) => (
                <div key={idx} className="border-b py-2">
                  <p className="font-medium">{q.content}</p>
                  <p className="text-sm">
                    Your answer: <strong>{q.givenAnswer}</strong>
                  </p>
                  <p className="text-sm">
                    Correct answer: <strong>{q.correctAnswer}</strong>
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      q.isCorrect ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {q.isCorrect ? "Correct" : "Incorrect"}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-3 py-1 border rounded"
              >
                Back
              </button>
              <button onClick={onClose} className="px-3 py-1 border rounded">
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExamEntries;
