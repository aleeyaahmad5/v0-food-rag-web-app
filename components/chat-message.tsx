import { Card } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { SourceCard } from "./source-card"
import { MessageCircle, AlertCircle, Sparkles } from "lucide-react"

interface ChatMessageProps {
  message: {
    question: string
    answer: string
    sources: Array<{ text: string; relevance: number; region: string }>
    isLoading?: boolean
    error?: string
  }
  isLoading?: boolean
  error?: string
}

export function ChatMessage({ message, isLoading = false, error = undefined }: ChatMessageProps) {
  return (
    <div className="space-y-4">
      {/* User Question */}
      <div className="flex justify-end">
        <Card className="max-w-xs bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 border-0 p-4 rounded-xl">
          <p className="text-slate-900 dark:text-amber-50 text-sm font-medium">{message.question}</p>
        </Card>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex-shrink-0 mt-1">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <Card className="flex-1 bg-white dark:bg-slate-800 border-amber-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2">
              <Spinner className="w-4 h-4" />
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Searching knowledge base and generating response...
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-500 rounded-lg flex-shrink-0 mt-1">
            <AlertCircle className="w-4 h-4 text-white" />
          </div>
          <Card className="flex-1 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 p-4">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </Card>
        </div>
      )}

      {/* Response */}
      {message.answer && !isLoading && (
        <div className="space-y-4">
          {/* AI Response */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex-shrink-0 mt-1">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <Card className="flex-1 bg-white dark:bg-slate-800 border-amber-200 dark:border-slate-700 p-4">
              <p className="text-slate-900 dark:text-slate-100 text-sm leading-relaxed whitespace-pre-wrap">
                {message.answer}
              </p>
            </Card>
          </div>

          {/* Sources */}
          {message.sources.length > 0 && (
            <div className="ml-11 space-y-3">
              <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
                <MessageCircle className="w-3 h-3" />
                Sources
              </h3>
              <div className="space-y-2">
                {message.sources.map((source, i) => (
                  <SourceCard key={i} source={source} index={i + 1} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
