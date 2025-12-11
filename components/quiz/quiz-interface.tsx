"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QuizQuestion } from "./quiz-question";
import { QuizResult } from "./quiz-result";
import { Loader2, Brain } from "lucide-react";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizInterfaceProps {
  topic: string;
  language: string;
  onClose: () => void;
}

export function QuizInterface({ topic, language, onClose }: QuizInterfaceProps) {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const generateQuiz = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          language,
          numQuestions: 5,
        }),
      });

      const data = await response.json();
      if (data.quiz?.questions) {
        setQuestions(data.quiz.questions);
        setQuizStarted(true);
      } else {
        alert("Failed to generate quiz. Please try again.");
        onClose();
      }
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      alert("Failed to generate quiz. Please try again.");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answerIndex: number) => {
    setUserAnswers([...userAnswers, answerIndex]);
    
    if (currentQuestionIndex < questions.length - 1) {
      // Move to next question after a short delay
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 600);
    } else {
      // Show results
      setTimeout(() => {
        setShowResult(true);
      }, 600);
    }
  };

  const calculateScore = () => {
    return userAnswers.reduce((score, answer, index) => {
      return answer === questions[index].correctAnswer ? score + 1 : score;
    }, 0);
  };

  const saveQuizResult = async () => {
    const score = calculateScore();
    try {
      await fetch("/api/quiz/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          topic,
          score,
          totalQuestions: questions.length,
          quizData: { questions, userAnswers },
        }),
      });
    } catch (error) {
      console.error("Failed to save quiz result:", error);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowResult(false);
    generateQuiz();
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">
          Generating quiz questions...
        </p>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="p-8 text-center">
        <Brain className="w-16 h-16 mx-auto mb-4 text-purple-500" />
        <h2 className="text-2xl font-bold mb-2">Test Your Knowledge</h2>
        <p className="text-muted-foreground mb-6">
          Ready to take a quiz on <span className="font-semibold">{topic}</span> in {language}?
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={generateQuiz} className="gap-2">
            <Brain className="w-4 h-4" />
            Start Quiz
          </Button>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <QuizResult
        questions={questions}
        userAnswers={userAnswers}
        score={calculateScore()}
        onRetry={handleRetry}
        onClose={onClose}
        onSave={saveQuizResult}
      />
    );
  }

  return (
    <div className="p-6">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete</span>
        </div>
        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <QuizQuestion
        question={questions[currentQuestionIndex]}
        onAnswer={handleAnswer}
        isAnswered={userAnswers.length > currentQuestionIndex}
        userAnswer={userAnswers[currentQuestionIndex]}
      />
    </div>
  );
}

