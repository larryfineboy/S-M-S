import React, { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function CustomCalendar({ selectedDate, onDayClick }) {
  const modifiersStyles = {
    selected: {
      borderRadius: "9999px", // rounded-full
      backgroundColor: "var(--selected-bg)",
      color: "var(--selected-text)",
    },
    today: {
      borderRadius: "9999px",
      backgroundColor: "#dc2626", // sharp red
      color: "white",
    },
  };

  return (
    <div className="custom-day-picker dark:bg-white p-4 rounded-lg bg-violet-950 shadow-md">
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={onDayClick}
        modifiersStyles={modifiersStyles}
      />

      <style>{`
        /* Light mode variables */
        .custom-day-picker {
          --selected-bg: #ffffff;
          --selected-text: #4c1d95; /* dark purple */
        }

        /* Dark mode variables (when .dark is on a parent) */
        .dark .custom-day-picker {
          --selected-bg: #4c1d95; /* dark purple */
          --selected-text: #ffffff;
        }

        /* Hover effect for all days */
        .custom-day-picker .rdp-day:hover {
          background-color: rgba(0, 0, 0, 0.5);
          border-radius: 9999px;
        }

        /* Chevron arrow buttons */
        .rdp-button_previous, .rdp-button_next {
          background-color: #ffffff;
          border-radius: 50%;
          color: #4c1d95; /* dark purple */
          margin: 0 4px;
        }
      `}</style>
    </div>
  );
}
