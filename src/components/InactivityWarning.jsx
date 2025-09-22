import { useAuth } from "../context/AuthContext";

function InactivityWarning() {
  const { showWarning, setShowWarning, logout } = useAuth();

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white p-6 rounded shadow-lg text-center">
        <p className="text-lg font-semibold mb-4 text-red-600">
          You will be logged out soon due to inactivity.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => setShowWarning(false)}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Stay Logged In
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Logout Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default InactivityWarning;
