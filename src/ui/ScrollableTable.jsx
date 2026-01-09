// ScrollableTable.jsx
import React from "react";
import "./grades-table.css"; // custom css

const ScrollableTable = ({ children }) => (
  <div
    className={` overflow-x-auto hide-scrollbar ${
      window.innerWidth <= 768 ? "w-full" : "max-w-6xl"
    }`}
  >
    <div className="inline-block min-w-full align-middle">{children}</div>
  </div>
);

export default ScrollableTable;
