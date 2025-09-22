import React, { useState, useEffect, useContext } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles/customCalendar.css";
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
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setEventTitle("");
    setStartTime("");
    setEndTime("");
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md mt-3">
      <h3 className="text-l font-bold mb-4 text-purple-700">Upcoming Events</h3>
      <div className={window.innerWidth >= 768 ? "flex flex-1 gap-10" : "p-1"}>
        <Calendar onClickDay={handleDayClick} className="text-purple-700" />

        <div className="mt-6">
          <h4 className="text-lg font-bold text-purple-600 mb-3">
            Events for {selectedDate.toDateString()}
          </h4>

          {events[selectedDate.toDateString()] ? (
            <ul className="space-y-2 text-purple-500 list-disc ml-5">
              {events[selectedDate.toDateString()].map((e, i) => (
                <li key={i} className="hover:text-purple-700">
                  {e}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 mt-2">No events for this day</p>
          )}

          {userRole === "admin" && (
            <button
              className="mt-6 bg-purple-500 text-white px-5 py-2 rounded-xl hover:bg-purple-600 transition"
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
          <div className="bg-white rounded-xl p-6 w-96 space-y-4">
            <h3 className="text-xl font-bold text-purple-600">Create Event</h3>

            <input
              type="text"
              placeholder="Event Title"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              className="w-full border-2 border-purple-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-500"
            />

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm text-gray-600">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full border-2 border-purple-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-500"
                />
              </div>

              <div className="flex-1">
                <label className="text-sm text-gray-600">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full border-2 border-purple-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded bg-red-100 hover:bg-red-500 hover:text-white text-red-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEvent}
                className="px-4 py-2 rounded bg-purple-500 hover:bg-purple-600 text-white"
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
