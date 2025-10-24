import React, { useState } from "react";
import "./Tooltip.css"; // We'll create this file next

const Tooltip = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="tooltip-container"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && <span className="tooltip-text">{content}</span>}
    </div>
  );
};

export default Tooltip;
