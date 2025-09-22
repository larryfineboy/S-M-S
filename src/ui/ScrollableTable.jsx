// ScrollableTable.jsx
import React from "react";
import "./grades-table.css"; // custom css

const ScrollableTable = ({ children }) => (
  <div
    className={`w-full overflow-x-auto hide-scrollbar ${
      window.innerWidth <= 768 ? "max-w-screen-sm" : "max-w-screen-lg"
    }`}
  >
    <div className="inline-block min-w-full align-middle">{children}</div>
  </div>
);

export default ScrollableTable;
