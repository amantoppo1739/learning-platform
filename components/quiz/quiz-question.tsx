"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizQuestionProps {
  question: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  };
  onAnswer: (answerIndex: number) => void;
  isAnswered: boolean;
  userAnswer?: number;
}

export function QuizQuestion({ question, onAnswer, isAnswered, userAnswer }: QuizQuestionProps) {
  return (
    <div>
      {/* Question */}
      <h3 className="text-xl font-semibold mb-6 leading-relaxed">
        {question.question}
      </h3>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isCorrect = index === question.correctAnswer;
          const isSelected = userAnswer === index;
          const showFeedback = isAnswered;

          return (
            <button
              key={index}
              onClick={() => !isAnswered && onAnswer(index)}
              disabled={isAnswered}
              className={cn(
                "w-full text-left p-4 rounded-lg border-2 transition-all",
                "hover:border-purple-500 disabled:cursor-not-allowed",
                !showFeedback && "border-border/40 hover:bg-zinc-800/50",
                showFeedback && isCorrect && "border-green-500 bg-green-500/10",
                showFeedback && isSelected && !isCorrect && "border-red-500 bg-red-500/10",
                showFeedback && !isSelected && !isCorrect && "border-border/20 opacity-60"
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex-1">{option}</span>
                {showFeedback && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                )}
                {showFeedback && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {isAnswered && (
        <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-sm font-semibold text-blue-400 mb-2">Explanation:</p>
          <p className="text-sm leading-relaxed">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}

