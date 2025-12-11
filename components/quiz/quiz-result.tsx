"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trophy, RotateCw, X, CheckCircle2, XCircle } from "lucide-react";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizResultProps {
  questions: Question[];
  userAnswers: number[];
  score: number;
  onRetry: () => void;
  onClose: () => void;
  onSave: () => void;
}

export function QuizResult({ questions, userAnswers, score, onRetry, onClose, onSave }: QuizResultProps) {
  const percentage = (score / questions.length) * 100;
  
  useEffect(() => {
    // Auto-save result when component mounts
    onSave();
  }, []);

  const getGrade = () => {
    if (percentage >= 90) return { text: "Excellent!", color: "text-green-500", emoji: "🎉" };
    if (percentage >= 70) return { text: "Good Job!", color: "text-blue-500", emoji: "👍" };
    if (percentage >= 50) return { text: "Not Bad!", color: "text-yellow-500", emoji: "💪" };
    return { text: "Keep Learning!", color: "text-orange-500", emoji: "📚" };
  };

  const grade = getGrade();

  return (
    <div className="p-6">
      {/* Score Header */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-3xl font-bold mb-2">
          Quiz Complete! {grade.emoji}
        </h2>
        <p className={`text-2xl font-semibold ${grade.color} mb-1`}>
          {grade.text}
        </p>
        <p className="text-4xl font-bold mb-2">
          {score}/{questions.length}
        </p>
        <p className="text-muted-foreground">
          {percentage.toFixed(0)}% Correct
        </p>
      </div>

      {/* Question Review */}
      <div className="mb-6 max-h-96 overflow-y-auto space-y-4">
        {questions.map((question, index) => {
          const isCorrect = userAnswers[index] === question.correctAnswer;
          
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                isCorrect
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-red-500/30 bg-red-500/5"
              }`}
            >
              <div className="flex items-start gap-3 mb-2">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm mb-2">{question.question}</p>
                  <p className="text-xs text-muted-foreground">
                    Your answer: <span className={isCorrect ? "text-green-400" : "text-red-400"}>
                      {question.options[userAnswers[index]]}
                    </span>
                  </p>
                  {!isCorrect && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Correct answer: <span className="text-green-400">
                        {question.options[question.correctAnswer]}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={onClose} variant="outline" className="flex-1">
          <X className="w-4 h-4 mr-2" />
          Close
        </Button>
        <Button onClick={onRetry} className="flex-1 gap-2">
          <RotateCw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
}

