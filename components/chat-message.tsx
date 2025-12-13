"use client"

import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { SourceCard } from "./source-card"
import { FeedbackButtons } from "./feedback-buttons"
import { MessageCircle, AlertCircle, Sparkles, User, Copy, Check, Clock } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface ChatMessageProps {
  message: {
    id?: string
    question: string
    answer: string
    sources: Array<{ text: string; relevance: number; region: string }>
    isLoading?: boolean
    error?: string
    timestamp?: Date
    responseTime?: number
  }
  isLoading?: boolean
  error?: string
}

export function ChatMessage({ message, isLoading = false, error = undefined }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const [showSources, setShowSources] = useState(true)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.answer)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatTime = (date?: Date) => {
    if (!date) return ""
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-4">
      {/* User Question */}
      <div className="flex justify-end">
        <div className="flex items-start gap-2 max-w-[85%]">
          <div className="flex flex-col items-end">
            <Card className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/80 dark:to-indigo-900/80 border-0 p-4 rounded-2xl rounded-tr-sm shadow-md">
              <p className="text-slate-900 dark:text-blue-50 text-sm font-medium">{message.question}</p>
            </Card>
            {message.timestamp && (
              <span className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(message.timestamp)}
              </span>
            )}
          </div>
          <div className="p-2 bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-full flex-shrink-0 mt-1">
            <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex-shrink-0 mt-1 shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <Card className="flex-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 p-4 rounded-2xl rounded-tl-sm">
            <div className="flex items-center gap-3">
              <div className="flex space-x-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Searching knowledge base...
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-500 rounded-full flex-shrink-0 mt-1 shadow-lg shadow-red-200 dark:shadow-red-900/30">
            <AlertCircle className="w-4 h-4 text-white" />
          </div>
          <Card className="flex-1 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 p-4 rounded-2xl rounded-tl-sm">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            <p className="text-xs text-red-500 dark:text-red-400 mt-2">Please try again or rephrase your question.</p>
          </Card>
        </div>
      )}

      {/* Response */}
      {message.answer && !isLoading && (
        <div className="space-y-4">
          {/* AI Response */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex-shrink-0 mt-1 shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 space-y-2">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 p-4 rounded-2xl rounded-tl-sm shadow-md">
                <p className="text-slate-900 dark:text-slate-100 text-sm leading-relaxed whitespace-pre-wrap">
                  {message.answer}
                </p>
              </Card>
              {/* Action buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-7 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 mr-1 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                  {message.responseTime && (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {message.responseTime < 1000 
                        ? `${message.responseTime}ms` 
                        : `${(message.responseTime / 1000).toFixed(1)}s`}
                    </span>
                  )}
                </div>
                <FeedbackButtons messageId={message.id || Date.now().toString()} />
              </div>
            </div>
          </div>

          {/* Sources */}
          {message.sources.length > 0 && (
            <div className="ml-11 space-y-3">
              <button
                onClick={() => setShowSources(!showSources)}
                className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2 hover:text-blue-500 transition-colors"
              >
                <MessageCircle className="w-3 h-3" />
                Sources ({message.sources.length})
                <span className={`transition-transform ${showSources ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {showSources && (
                <div className="grid gap-2 animate-fade-in">
                  {message.sources.map((source, i) => (
                    <SourceCard key={i} source={source} index={i + 1} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
