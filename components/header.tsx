"use client"

import { UtensilsCrossed, Moon, Sun, Trash2, Github, Home, Menu } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { ExportShare } from "@/components/export-share"

interface Message {
  question: string
  answer: string
  sources: Array<{ text: string; relevance: number; region: string }>
  timestamp?: Date
}

  onClearChat?: () => void
  messageCount?: number
  messages?: Message[]
  onOpenSidebar?: () => void
}

export function Header({ onClearChat, messageCount = 0, messages = [], onOpenSidebar }: HeaderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="border-b border-slate-200/50 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 shadow-sm">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Hamburger menu */}
          {onOpenSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenSidebar}
              className="h-9 w-9 text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors mr-2"
              title="Open chat history"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          <button 
            onClick={onClearChat}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
            title="Go to home"
          >
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/30 transition-transform hover:scale-105">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
                Food RAG
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">AI-Powered Food Intelligence</p>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Home button */}
          {messageCount > 0 && onClearChat && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearChat}
              className="h-9 w-9 text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="New chat"
            >
              <Home className="w-4 h-4" />
            </Button>
          )}

          {/* Export & Share */}
          <ExportShare messages={messages} />

          {/* Message count badge */}
          {messageCount > 0 && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
              {messageCount} {messageCount === 1 ? 'message' : 'messages'}
            </span>
          )}

          {/* Clear chat button */}
          {messageCount > 0 && onClearChat && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearChat}
              className="h-9 w-9 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}

          {/* GitHub link */}
          <a 
            href="https://github.com/aleeyaahmad5/v0-food-rag-web-app" 
            target="_blank" 
            rel="noopener noreferrer" 
            title="View on GitHub"
            className="h-9 w-9 inline-flex items-center justify-center rounded-md text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Github className="w-4 h-4" />
          </a>

          {/* Theme toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="h-9 w-9 text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
