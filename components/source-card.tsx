import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, MapPin, TrendingUp } from "lucide-react"

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
  
  // Determine relevance color
  const getRelevanceColor = (percent: number) => {
    if (percent >= 80) return "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
    if (percent >= 60) return "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
    return "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800"
  }

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-700 border-slate-200/50 dark:border-slate-600/50 p-3 hover:shadow-md transition-shadow duration-200 rounded-xl">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            <div className="p-1.5 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex-shrink-0 mt-0.5 shadow-sm">
              <BookOpen className="w-3 h-3 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">Source {index}</p>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-3">{source.text}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          {source.region && (
            <Badge
              variant="secondary"
              className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1"
            >
              <MapPin className="w-2.5 h-2.5" />
              {source.region}
            </Badge>
          )}
          <Badge
            variant="secondary"
            className={`text-xs flex items-center gap-1 border ${getRelevanceColor(relevancePercent)}`}
          >
            <TrendingUp className="w-2.5 h-2.5" />
            {relevancePercent}% match
          </Badge>
        </div>
      </div>
    </Card>
  )
}
