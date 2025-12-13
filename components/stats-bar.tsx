"use client"

import { Clock, Zap, Database, MessageSquare } from "lucide-react"

interface StatsBarProps {
  responseTime?: number
  sourceCount: number
  messageCount: number
}

export function StatsBar({ responseTime, sourceCount, messageCount }: StatsBarProps) {
  if (messageCount === 0) return null

  return (
    <div className="flex items-center justify-center gap-4 py-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg mb-4">
      <div className="flex items-center gap-1.5">
        <MessageSquare className="w-3.5 h-3.5" />
        <span>{messageCount} {messageCount === 1 ? 'query' : 'queries'}</span>
      </div>
      {responseTime && (
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-yellow-500" />
          <span>{responseTime < 1000 ? `${responseTime}ms` : `${(responseTime / 1000).toFixed(1)}s`}</span>
        </div>
      )}
      {sourceCount > 0 && (
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-green-500" />
          <span>{sourceCount} sources</span>
        </div>
      )}
    </div>
  )
}
