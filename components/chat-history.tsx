"use client"

import { useState, useEffect } from "react"
import { Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface ChatSession {
  id: string
  title: string
  messages: Array<{
    id: string
    question: string
    answer: string
    sources: Array<{ text: string; relevance: number; region: string }>
    timestamp?: Date
    responseTime?: number
  }>
  createdAt: Date
  updatedAt: Date
}

interface ChatHistoryProps {
  currentChatId: string | null
  onSelectChat: (chat: ChatSession) => void
  onNewChat: () => void
  onDeleteChat: (chatId: string) => void
  chats: ChatSession[]
}

export function ChatHistory({ currentChatId, onSelectChat, onNewChat, onDeleteChat, chats }: ChatHistoryProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsCollapsed(true)
      }
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
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

  const truncateTitle = (title: string, maxLength: number = 30) => {
    if (title.length <= maxLength) return title
    return title.slice(0, maxLength) + "..."
  }

  if (isCollapsed) {
    return (
      <div className="fixed left-0 top-0 h-full z-40 flex">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200 dark:border-slate-700 p-2 flex flex-col items-center gap-2 shadow-lg">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(false)}
            className="h-10 w-10 text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title="Open chat history"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewChat}
            className="h-10 w-10 text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title="New chat"
          >
            <Plus className="w-5 h-5" />
          </Button>
          <div className="flex-1 flex flex-col gap-1 overflow-y-auto py-2">
            {chats.slice(0, 10).map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                className={`h-10 w-10 rounded-lg flex items-center justify-center transition-all ${
                  currentChatId === chat.id
                    ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                title={chat.title}
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed left-0 top-0 h-full z-40 flex">
      <div className="w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200 dark:border-slate-700 flex flex-col shadow-xl animate-slide-right">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-900 dark:text-white">Chat History</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(true)}
              className="h-8 w-8 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
          <Button
            onClick={onNewChat}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-2">
          {chats.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No chats yet</p>
              <p className="text-xs mt-1">Start a new conversation!</p>
            </div>
          ) : (
            <div className="space-y-1">
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
                    onClick={() => onSelectChat(chat)}
                    className="w-full text-left p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-lg ${
                        currentChatId === chat.id
                          ? "bg-blue-100 dark:bg-blue-900/50"
                          : "bg-slate-100 dark:bg-slate-800"
                      }`}>
                        <MessageSquare className={`w-4 h-4 ${
                          currentChatId === chat.id
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-slate-500"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          currentChatId === chat.id
                            ? "text-blue-900 dark:text-blue-100"
                            : "text-slate-900 dark:text-slate-100"
                        }`}>
                          {truncateTitle(chat.title)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
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
                      onDeleteChat(chat.id)
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    title="Delete chat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-700 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {chats.length} {chats.length === 1 ? 'conversation' : 'conversations'}
          </p>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isMobile && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </div>
  )
}
