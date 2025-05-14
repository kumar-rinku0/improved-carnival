"use client";

import * as React from "react";

export interface ToggleGroupProps {
  value: "AM" | "PM";
  onChange: (val: "AM" | "PM") => void;
}

export const ToggleGroup: React.FC<ToggleGroupProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="inline-flex border rounded overflow-hidden">
      <button
        type="button"
        onClick={() => onChange("AM")}
        className={`px-3 py-1 border-r ${
          value === "AM" ? "bg-primary text-white" : "bg-white text-gray-700"
        } focus:outline-none`}
      >
        AM
      </button>
      <button
        type="button"
        onClick={() => onChange("PM")}
        className={`px-3 py-1 ${
          value === "PM" ? "bg-primary text-white" : "bg-white text-gray-700"
        } focus:outline-none`}
      >
        PM
      </button>
    </div>
  );
};

export default ToggleGroup;
