
import React, { useState, useEffect } from "react";

export const ProgressBar = ({ label }: { label?: string }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev; // Stall at 90% until done
        return prev + Math.random() * 5;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto my-4">
      {label && <p className="text-center text-sm font-bold text-gray-600 dark:text-gray-300 mb-2 font-display">{label}</p>}
      <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700 overflow-hidden shadow-inner">
        <div 
          className="bg-purple-500 h-4 rounded-full transition-all duration-300 ease-out flex items-center justify-center" 
          style={{ width: `${progress}%` }}
        >
          <div className="w-full h-full opacity-30 bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress-stripes_1s_linear_infinite]"></div>
        </div>
      </div>
    </div>
  );
};
