"use client"

import { useState } from "react"
import { ThumbsUp, ThumbsDown } from "lucide-react"

interface FeedbackButtonsProps {
  messageId: string
  onFeedback?: (messageId: string, feedback: "positive" | "negative") => void
}

export function FeedbackButtons({ messageId, onFeedback }: FeedbackButtonsProps) {
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(null)
  const [showThanks, setShowThanks] = useState(false)

  const handleFeedback = (type: "positive" | "negative") => {
    setFeedback(type)
    setShowThanks(true)
    onFeedback?.(messageId, type)
    setTimeout(() => setShowThanks(false), 2000)
  }

  if (showThanks) {
    return (
      <span className="text-xs text-green-500 animate-fade-in">
        Thanks for your feedback! 🎉
      </span>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-slate-400 mr-1">Was this helpful?</span>
      <button
        onClick={() => handleFeedback("positive")}
        className={`p-1.5 rounded-md transition-all ${
          feedback === "positive"
            ? "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400"
            : "text-slate-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30"
        }`}
        title="Helpful"
      >
        <ThumbsUp className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => handleFeedback("negative")}
        className={`p-1.5 rounded-md transition-all ${
          feedback === "negative"
            ? "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400"
            : "text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
        }`}
        title="Not helpful"
      >
        <ThumbsDown className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
