import React from "react";

export const Progress = ({ value, className = "" }) => {
  return (
    <div
      className={`w-full bg-gray-200 rounded-full overflow-hidden ${className}`}
    >
      <div
        className="h-full bg-indigo-600 transition-all duration-300 ease-in-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};
