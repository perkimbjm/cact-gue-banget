
import React from "react";
import { Question } from "../types";
import { cn } from "../utils";

export const Quiz = ({ 
  question, 
  selectedAnswer,
  onAnswer, 
  onNext,
  onPrev,
  current, 
  total 
}: { 
  question: Question, 
  selectedAnswer?: string,
  onAnswer: (a: string) => void, 
  onNext: () => void,
  onPrev: () => void,
  current: number, 
  total: number 
}) => {
  
  const isLast = current === total;

  return (
    <div className="max-w-2xl mx-auto w-full p-4 animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-sm font-bold text-purple-700 dark:text-purple-300">Question {current} of {total}</span>
        <div className="w-1/2 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div className="bg-purple-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${(current / total) * 100}%` }}></div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
        <h2 className="text-xl md:text-2xl font-display font-bold text-gray-800 dark:text-white mb-6">
          {question.text}
        </h2>

        {question.type === 'mcq' ? (
          <div className="space-y-3">
            {question.options?.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => onAnswer(opt)}
                className={cn(
                    "w-full text-left p-4 rounded-xl border-2 transition duration-200 font-medium",
                    selectedAnswer === opt 
                        ? "border-purple-500 bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100" 
                        : "border-gray-100 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <textarea
              className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-0 min-h-[150px] dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              placeholder="Ceritain di sini..."
              value={selectedAnswer || ""}
              onChange={(e) => onAnswer(e.target.value)}
            />
          </div>
        )}

        <div className="flex justify-between mt-8 gap-4">
            <button
                onClick={onPrev}
                disabled={current === 1}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 transition-colors"
            >
                Sebelumnya
            </button>

            <button
                onClick={onNext}
                disabled={!selectedAnswer}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all transform hover:scale-105"
            >
                {isLast ? "Lihat Hasil" : "Selanjutnya"}
            </button>
        </div>
      </div>
    </div>
  );
};
