"use client"
import React, { useState } from "react";

const RangeSlider: React.FC = () => {
  const [min, max] = [5, 11];
  const [values, setValues] = useState({ start: 5, end: 11 });
  const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  const handleStartChange = (value: number) => {
    if (value < values.end) {
      setValues((prev) => ({ ...prev, start: value }));
    }
  };

  const handleEndChange = (value: number) => {
    if (value > values.start) {
      setValues((prev) => ({ ...prev, end: value }));
    }
  };

  const percentage = (value: number) => ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full max-w-md mx-auto my-8 p-4">
      <div className="relative h-6">
        {/* Slider Track */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-300 dark:bg-gray-700 rounded-full transform -translate-y-1/2"></div>

        {/* Selected Range */}
        <div
          className="absolute top-1/2 h-1 bg-blue-500 dark:bg-blue-400 rounded-full transform -translate-y-1/2 transition-all"
          style={{
            left: `${percentage(values.start)}%`,
            width: `${percentage(values.end) - percentage(values.start)}%`,
          }}
        ></div>

        {/* Start Thumb */}
        <input
          type="range"
          min={min}
          max={max}
          value={values.start}
          step={1}
          onChange={(e) => handleStartChange(Number(e.target.value))}
          className="absolute w-full h-6 appearance-none bg-transparent pointer-events-auto"
          style={{
            left: 0,
          }}
        />
        <div
          className="absolute top-1/2 h-6 w-6 bg-blue-500 dark:bg-blue-400 rounded-full shadow-md transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform"
          style={{ left: `${percentage(values.start)}%` }}
        ></div>

        {/* End Thumb */}
        <input
          type="range"
          min={min}
          max={max}
          value={values.end}
          step={1}
          onChange={(e) => handleEndChange(Number(e.target.value))}
          className="absolute w-full h-6 appearance-none bg-transparent pointer-events-auto"
        />
        <div
          className="absolute top-1/2 h-6 w-6 bg-blue-500 dark:bg-blue-400 rounded-full shadow-md transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform"
          style={{ left: `${percentage(values.end)}%` }}
        ></div>
      </div>

      {/* Values */}
      <div className="flex justify-between mt-4 text-sm text-gray-600 dark:text-gray-300">
        <span>Start: {values.start}</span>
        <span>End: {values.end}</span>
      </div>
    </div>
  );
};

export default RangeSlider;
