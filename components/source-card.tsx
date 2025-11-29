import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen } from "lucide-react"

interface SourceCardProps {
  source: {
    text: string
    relevance: number
    region: string
  }
  index: number
}

export function SourceCard({ source, index }: SourceCardProps) {
  const relevancePercent = Math.round(source.relevance * 100)

  return (
    <Card className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 p-3">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            <div className="p-1.5 bg-gradient-to-br from-amber-400 to-orange-400 rounded flex-shrink-0 mt-0.5">
              <BookOpen className="w-3 h-3 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">Source {index}</p>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{source.text}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          {source.region && (
            <Badge
              variant="secondary"
              className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
            >
              {source.region}
            </Badge>
          )}
          <Badge
            variant="secondary"
            className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
          >
            {relevancePercent}% match
          </Badge>
        </div>
      </div>
    </Card>
  )
}
