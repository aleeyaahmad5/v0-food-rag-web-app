"use client"

import { UtensilsCrossed, Moon, Sun, Trash2, Github, Plus, MessageSquare, Clock, ChevronDown } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState, useRef } from "react"
import { ExportShare } from "@/components/export-share"
import { ChatSession } from "@/components/chat-history"

interface Message {
  question: string
  answer: string
  sources: Array<{ text: string; relevance: number; region: string }>
  timestamp?: Date
}

interface HeaderProps {
  onClearChat?: () => void
  onNewChat?: () => void
  messageCount?: number
  messages?: Message[]
  chats?: ChatSession[]
  currentChatId?: string | null
  onSelectChat?: (chat: ChatSession) => void
  onDeleteChat?: (chatId: string) => void
}

export function Header({ 
  onClearChat, 
  onNewChat,
  messageCount = 0, 
  messages = [],
  chats = [],
  currentChatId,
  onSelectChat,
  onDeleteChat
}: HeaderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setHistoryOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const formatDate = (date: Date) => {
    const now = new Date()
    const chatDate = new Date(date)
    const diffDays = Math.floor((now.getTime() - chatDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    return chatDate.toLocaleDateString()
  }

  const truncateTitle = (title: string, maxLength: number = 25) => {
    if (title.length <= maxLength) return title
    return title.slice(0, maxLength) + "..."
  }

  return (
    <header className="border-b border-slate-200/50 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 shadow-sm">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Chat History Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="ghost"
              onClick={() => setHistoryOpen(!historyOpen)}
              className="h-9 px-3 text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-1.5"
              title="Chat history"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">History</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${historyOpen ? 'rotate-180' : ''}`} />
            </Button>

            {/* Dropdown Menu */}
            {historyOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-50 animate-fade-in overflow-hidden">
                {/* New Chat Button */}
                <div className="p-2 border-b border-slate-200 dark:border-slate-700">
                  <Button
                    onClick={() => {
                      onNewChat?.()
                      setHistoryOpen(false)
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Chat
                  </Button>
                </div>

                {/* Chat List */}
                <div className="max-h-80 overflow-y-auto">
                  {chats.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 dark:text-slate-400">
                      <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No chats yet</p>
                      <p className="text-xs mt-1">Start a new conversation!</p>
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {chats.map((chat) => (
                        <div
                          key={chat.id}
                          className={`group relative rounded-lg transition-all ${
                            currentChatId === chat.id
                              ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent"
                          }`}
                        >
                          <button
                            onClick={() => {
                              onSelectChat?.(chat)
                              setHistoryOpen(false)
                            }}
                            className="w-full text-left p-2.5"
                          >
                            <div className="flex items-center gap-2">
                              <MessageSquare className={`w-4 h-4 flex-shrink-0 ${
                                currentChatId === chat.id
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-slate-400"
                              }`} />
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${
                                  currentChatId === chat.id
                                    ? "text-blue-900 dark:text-blue-100"
                                    : "text-slate-900 dark:text-slate-100"
                                }`}>
                                  {truncateTitle(chat.title)}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {formatDate(chat.updatedAt)}
                                  </span>
                                  <span className="text-xs text-slate-400">•</span>
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {chat.messages.length} msgs
                                  </span>
                                </div>
                              </div>
                            </div>
                          </button>
                          
                          {/* Delete button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeleteChat?.(chat.id)
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                            title="Delete chat"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {chats.length > 0 && (
                  <div className="p-2 border-t border-slate-200 dark:border-slate-700 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {chats.length} {chats.length === 1 ? 'conversation' : 'conversations'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Logo */}
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
          {/* New Chat button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewChat}
            className="h-9 w-9 text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            title="New chat (Ctrl+N)"
          >
            <Plus className="w-4 h-4" />
          </Button>

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
