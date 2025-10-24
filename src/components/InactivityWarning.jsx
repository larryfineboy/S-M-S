import { useAuth } from "../context/AuthContext";
import ConfirmModal from "./ConfirmModal";

function InactivityWarning() {
  const { showWarning, setShowWarning, logout } = useAuth();

  if (!showWarning) return null;

  return (
    <div>
      <ConfirmModal
        message={
          "You will be logged out soon due to inactivity. Do you wish to Logout"
        }
        onConfirm={logout}
        onCancel={() => setShowWarning(false)}
      />
      {/* <div className="bg-white p-6 rounded shadow-lg text-center">
        <p className="text-lg font-semibold mb-4 text-red-600">
          
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
      </div> */}
    </div>
  );
}

export default InactivityWarning;
