import React, { useEffect, useState } from "react";

const ExamEntries = ({ examId, onClose }) => {
  const [entries, setEntries] = useState([]);

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
        <>
          <h3 className="font-bold text-violet-700 mb-3">Submitted Entries</h3>
          {entries.length === 0 ? (
            <p className="text-gray-500">No submissions yet.</p>
          ) : (
            entries.map((e) => (
              <div key={e.studentId} className="border p-3 rounded mb-2">
                <p className="font-medium">
                  {e.studentName} ({e.studentId})
                </p>
                <p className="text-sm text-gray-600">
                  Score: {e.score}/{e.total}
                </p>
              </div>
            ))
          )}
          <div className="text-right mt-3">
            <button
              onClick={onClose}
              className="bg-red-500 text-white hover:bg-red-200 hover:text-red-600 font-semibold px-3 py-1 border rounded"
            >
              Close
            </button>
          </div>
        </>
      </div>
    </div>
  );
};

export default ExamEntries;
