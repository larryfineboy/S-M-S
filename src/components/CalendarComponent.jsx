import React, { useState, useEffect, useContext } from "react";
import CustomCalendar from "../styles/customCalendar";
import { toast } from "react-toastify";
import { NotificationContext } from "../context/NotificationContext";
import { CalendarClock } from "lucide-react";

const CalendarComponent = ({ userRole, userId }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const { addNotification } = useContext(NotificationContext);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (Array.isArray(data)) {
        const eventMap = {};
        data.forEach((e) => {
          const key = new Date(e.date).toDateString();
          eventMap[key] = [
            ...(eventMap[key] || []),
            `${e.title} from ${e.startTime} to ${e.endTime}`,
          ];
        });
        setEvents(eventMap);
      }
    } catch (err) {
      console.error("Failed to load events", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDayClick = (date) => {
    setSelectedDate(date);
  };

  const handleCreateEvent = () => {
    setShowModal(true);
  };

  const handleSaveEvent = async () => {
    if (!eventTitle || !startTime || !endTime) {
      toast.warn("Please fill all fields.");
      return;
    }

    const newEvent = {
      title: eventTitle,
      date: selectedDate.toISOString(),
      startTime,
      endTime,
      createdBy: userId,
    };

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      });

      if (!res.ok) throw new Error("Event creation failed");
      toast.success("Event created!");

      // Update event display
      const dateKey = selectedDate.toDateString();
      setEvents((prev) => ({
        ...prev,
        [dateKey]: [
          ...(prev[dateKey] || []),
          `${eventTitle} from ${startTime} to ${endTime}`,
        ],
      }));

      addNotification({
        userId,
        title: `${(<CalendarClock className="text-purple-600" />)} New Event`,
        content: `${eventTitle} (${startTime} - ${endTime})`,
      });

      setShowModal(false);
      setEventTitle("");
      setStartTime("");
      setEndTime("");
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to create event");
      console.error(err);
      const dateKey = selectedDate.toDateString();
      setEvents((prev) => ({
        ...prev,
        [dateKey]: [
          ...(prev[dateKey] || []),
          `${eventTitle} from ${startTime} to ${endTime}`,
        ],
      }));
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setEventTitle("");
    setStartTime("");
    setEndTime("");
  };

  return (
    <div className="bg-white dark:bg-violet-900 p-4 rounded-lg shadow-md">
      <h3 className=" flex gap-4 text-lg font-bold mb-4 text-violet-600 dark:text-violet-100">
        <CalendarClock />
        Upcoming Events
      </h3>
      <div className="flex flex-col md:flex-row gap-10">
        <div className="text-violet-200 dark:text-violet-800">
          <CustomCalendar
            selectedDate={selectedDate}
            onDayClick={handleDayClick}
          />
        </div>

        <div className="mt-6 w-full md:w-1/2">
          <h4 className="text-lg font-bold text-violet-600 dark:text-violet-100 mb-3">
            Events for {selectedDate.toDateString()}
          </h4>

          {events[selectedDate.toDateString()] ? (
            <ul className="space-y-2 text-violet-800 dark:text-white list-disc ml-5 font-semibold">
              {events[selectedDate.toDateString()].map((e, i) => (
                <li
                  key={i}
                  className="dark:hover:text-violet-100 hover:text-violet-900"
                >
                  {e}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 mt-2">No events for this day</p>
          )}

          {userRole === "admin" && (
            <button
              className="mt-6 bg-violet-900 hover:bg-violet-950 text-white px-5 py-2 rounded-lg transition border-2"
              onClick={handleCreateEvent}
            >
              + Create Event
            </button>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white dark:bg-violet-900 rounded-xl p-6 w-96 space-y-4">
            <h3 className="text-xl font-bold text-violet-600 dark:text-violet-100">
              Create Event
            </h3>

            <input
              type="text"
              placeholder="Event Title"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="w-full border-2 border-violet-600 dark:border-violet-100 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-violet-600 dark:focus:ring-violet-100 text-violet-600 dark:text-white"
            />

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm text-gray-600 dark:text-white font-semibold">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full border-2 border-violet-600 dark:border-violet-100 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-violet-600 dark:focus:ring-violet-100 text-violet-600 dark:text-white"
                />
              </div>

              <div className="flex-1">
                <label className="text-sm text-gray-600 dark:text-white font-semibold">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full border-2 border-violet-600 dark:border-violet-100 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-violet-600 dark:focus:ring-violet-100 text-violet-600 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-md bg-red-100 dark:bg-red-600 hover:bg-red-700 hover:text-white text-red-600 dark:text-white font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEvent}
                className="px-4 py-2 rounded-md bg-violet-600 dark:bg-violet-900 hover:bg-violet-700 text-white font-semibold border-2 border-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarComponent;
