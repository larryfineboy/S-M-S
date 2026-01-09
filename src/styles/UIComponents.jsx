"use client";
import React, { useState, useRef, useEffect } from "react";

// Themed Button Component
export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const baseStyles =
    "font-medium rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg",
    secondary:
      "bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg",
    success:
      "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Themed Card Component
export function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 border border-gray-200 dark:border-gray-700 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// Themed Input Component
export function Input({ label, error, className = "", ...props }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all duration-200 ${
          error ? "border-red-500 focus:ring-red-500" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}

// Themed Badge Component
export function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default:
      "bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    success:
      "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200",
    warning:
      "bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    danger: "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <span
      className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

// Themed Alert Component
export function Alert({ children, variant = "info", className = "" }) {
  const variants = {
    info: "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200",
    success:
      "bg-green-100 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200",
    warning:
      "bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200",
    danger:
      "bg-red-100 border-red-300 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200",
  };

  return (
    <div
      className={`px-4 py-3 border rounded-lg ${variants[variant]} ${className}`}
    >
      {children}
    </div>
  );
}

// Themed Modal Component
export function Modal({ isOpen, onClose, title, children, className = "" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div
        className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 ${className}`}
      >
        {title && (
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}

// Themed Spinner Component
export function Spinner({ size = "md", className = "" }) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div
      className={`animate-spin rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-purple-600 ${sizes[size]} ${className}`}
    />
  );
}

// Themed Table Component
export function Table({ children, className = "" }) {
  return (
    <div
      className={`overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <table className="w-full">{children}</table>
    </div>
  );
}

export function TableHeader({ children, className = "" }) {
  return (
    <thead
      className={`bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 ${className}`}
    >
      {children}
    </thead>
  );
}

export function TableBody({ children, className = "" }) {
  return <tbody className={className}>{children}</tbody>;
}

export function TableRow({ children, className = "" }) {
  return (
    <tr
      className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${className}`}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, header = false, className = "" }) {
  const baseStyles = "px-4 py-3 text-sm";
  const headerStyles = header
    ? "font-semibold text-gray-900 dark:text-gray-100"
    : "text-gray-700 dark:text-gray-300";

  return (
    <td className={`${baseStyles} ${headerStyles} ${className}`}>{children}</td>
  );
}

// Themed Dropdown/Select Component
export function Select({
  label,
  options,
  error,
  className = "",
  value,
  onChange,
}) {
  // Use ThemeSwitcher-like dropdown UI for selects
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value) || options[0];

  return (
    <div className="space-y-1" ref={ref}>
      {label && (
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
          {label}
        </label>
      )}

      <div className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => setOpen((s) => !s)}
          className="w-full flex items-center justify-between px-3 py-2 border border-violet-600 dark:border-violet-100 rounded focus:outline-none focus:ring-1 focus:ring-violet-600 dark:focus:ring-violet-100 text-violet-600 dark:text-white transition-all duration-200 font-semibold"
        >
          <span>{selected ? selected.label : "Select"}</span>
          <svg
            className={`w-4 h-4 transform transition-transform ${
              open ? "rotate-180" : ""
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 left-0 mt-2 rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 bg-white dark:bg-violet-900 border border-gray-500 dark:border-gray-300">
            {options.map((opt, idx) => (
              <button
                key={opt.value}
                onClick={() => {
                  setOpen(false);
                  if (onChange) onChange(opt.value);
                }}
                className={`w-full text-left px-4 py-2 transition-all duration-200 hover:bg-violet-600 dark:hover:bg-white text-gray-900 dark:text-violet-100 dark:hover:text-violet-800 font-semibold ${
                  selected && selected.value === opt.value
                    ? "bg-violet-800 dark:bg-violet-100 text-violet-100 dark:text-violet-800"
                    : ""
                } ${
                  idx !== options.length - 1
                    ? "border-b border-gray-500 dark:border-gray-300"
                    : ""
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: opt.color || "#7c3aed",
                    }}
                  />
                  <span>{opt.label}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}
