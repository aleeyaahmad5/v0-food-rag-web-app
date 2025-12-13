"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { ChatMessage } from "@/components/chat-message"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ParticleBackground } from "@/components/particle-background"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import { StatsBar } from "@/components/stats-bar"
import { ChatHistory, ChatSession } from "@/components/chat-history"
// Track sidebar open state for layout shift
function useSidebarState() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])
  return { sidebarOpen, setSidebarOpen, isMobile }
}
import { SendIcon, Sparkles, ChefHat, Salad, Apple, Flame, Mic, MicOff } from "lucide-react"

interface Message {
  id: string
  question: string
  answer: string
  sources: Array<{ text: string; relevance: number; region: string }>
  isLoading?: boolean
  error?: string
  timestamp?: Date
  responseTime?: number
}

const exampleQuestions = [
  { icon: Apple, text: "What fruits are popular in tropical regions?", color: "text-red-500" },
  { icon: Flame, text: "Tell me about spicy foods and their origins", color: "text-orange-500" },
  { icon: Salad, text: "What are some healthy vegetable options?", color: "text-green-500" },
  { icon: ChefHat, text: "What makes different cuisines unique?", color: "text-purple-500" },
]

export default function Home() {
  const { sidebarOpen, setSidebarOpen, isMobile } = useSidebarState()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [totalSources, setTotalSources] = useState(0)
  const [lastResponseTime, setLastResponseTime] = useState<number | undefined>()
  const [chats, setChats] = useState<ChatSession[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load chats from localStorage on mount
  useEffect(() => {
    const savedChats = localStorage.getItem("food-rag-chats")
    if (savedChats) {
      try {
        const parsed = JSON.parse(savedChats)
        setChats(parsed.map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
          })),
        })))
      } catch (e) {
        console.error("Failed to parse saved chats:", e)
      }
    }
  }, [])

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem("food-rag-chats", JSON.stringify(chats))
    }
  }, [chats])

  // Update current chat when messages change
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: messages.filter((m) => !m.isLoading),
                title: messages[0]?.question || "New Chat",
                updatedAt: new Date(),
              }
            : chat
        )
      )
    }
  }, [messages, currentChatId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Calculate total sources
  useEffect(() => {
    const total = messages.reduce((acc, msg) => acc + (msg.sources?.length || 0), 0)
    setTotalSources(total)
  }, [messages])

  const handleNewChat = useCallback(() => {
    // Save current chat if it has messages
    if (currentChatId && messages.length > 0) {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? { ...chat, messages: messages.filter((m) => !m.isLoading), updatedAt: new Date() }
            : chat
        )
      )
    }

    // Create new chat
    const newChat: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setChats((prev) => [newChat, ...prev])
    setCurrentChatId(newChat.id)
    setMessages([])
    setTotalSources(0)
    setLastResponseTime(undefined)
    inputRef.current?.focus()
  }, [currentChatId, messages])

  const handleSelectChat = useCallback((chat: ChatSession) => {
    // Save current chat before switching
    if (currentChatId && messages.length > 0 && currentChatId !== chat.id) {
      setChats((prev) =>
        prev.map((c) =>
          c.id === currentChatId
            ? { ...c, messages: messages.filter((m) => !m.isLoading), updatedAt: new Date() }
            : c
        )
      )
    }

    setCurrentChatId(chat.id)
    setMessages(chat.messages)
    const total = chat.messages.reduce((acc, msg) => acc + (msg.sources?.length || 0), 0)
    setTotalSources(total)
    const lastMsg = chat.messages[chat.messages.length - 1]
    setLastResponseTime(lastMsg?.responseTime)
    inputRef.current?.focus()
  }, [currentChatId, messages])

  const handleDeleteChat = useCallback((chatId: string) => {
    setChats((prev) => {
      const newChats = prev.filter((c) => c.id !== chatId)
      // Update localStorage
      if (newChats.length === 0) {
        localStorage.removeItem("food-rag-chats")
      }
      return newChats
    })
    
    // If deleted the current chat, clear messages
    if (chatId === currentChatId) {
      setCurrentChatId(null)
      setMessages([])
      setTotalSources(0)
      setLastResponseTime(undefined)
    }
  }, [currentChatId])

  const handleClearChat = handleNewChat

  const handleFocusInput = () => {
    inputRef.current?.focus()
  }

  // Voice input handler
  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice input is not supported in your browser. Try Chrome!")
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.lang = "en-US"
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      inputRef.current?.focus()
    }

    recognition.start()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const question = input.trim()
    setInput("")
    setIsLoading(true)
    const startTime = Date.now()

    // Add loading message
    const loadingMessageId = Date.now().toString()

    // Create new chat if none exists
    if (!currentChatId) {
      const newChat: ChatSession = {
        id: loadingMessageId + "-chat",
        title: question,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setChats((prev) => [newChat, ...prev])
      setCurrentChatId(newChat.id)
    }

    setMessages((prev) => [
      ...prev,
      {
        id: loadingMessageId,
        question,
        answer: "",
        sources: [],
        isLoading: true,
        timestamp: new Date(),
      },
    ])

    try {
      const response = await fetch("/api/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()
      const responseTime = Date.now() - startTime
      setLastResponseTime(responseTime)

      // Replace loading message with actual response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessageId
            ? {
                ...msg,
                answer: data.answer,
                sources: data.sources || [],
                isLoading: false,
                responseTime,
              }
            : msg,
        ),
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessageId
            ? {
                ...msg,
                error: errorMessage,
                isLoading: false,
              }
            : msg,
        ),
      )
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative">
      <ParticleBackground />
      <KeyboardShortcuts onNewChat={handleNewChat} onFocusInput={handleFocusInput} />

      {/* Chat History Sidebar */}

      <ChatHistory
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        chats={chats}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <Header onClearChat={handleClearChat} messageCount={messages.length} messages={messages} />

      {/* Shift main content if sidebar is open and not mobile */}
      <main
        className={
          `flex-1 w-full max-w-3xl mx-auto px-4 py-8 relative z-10 transition-all` +
          (sidebarOpen && !isMobile ? ' ml-72' : '')
        }
        style={{
          marginLeft: sidebarOpen && !isMobile ? 288 : undefined
        }}
      >
        {/* Stats Bar */}
        <StatsBar 
          responseTime={lastResponseTime} 
          sourceCount={totalSources} 
          messageCount={messages.length} 
        />

        {/* Welcome Message */}
        {messages.length === 0 && (
          <div className="space-y-8 mb-12 animate-fade-in">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-blue-900/30 mb-4 animate-bounce-slow">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 dark:from-blue-300 dark:via-indigo-300 dark:to-purple-300 bg-clip-text text-transparent">
                Welcome to Food RAG
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                Your AI-powered culinary companion. Ask anything about foods, ingredients, recipes, and cuisines from around the world!
              </p>
            </div>

            {/* Feature badges */}
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full">
                💬 Chat History
              </span>
              <span className="px-3 py-1 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full">
                🎤 Voice Input
              </span>
              <span className="px-3 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full">
                ⌨️ Keyboard Shortcuts
              </span>
              <span className="px-3 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full">
                📤 Export Chat
              </span>
              <span className="px-3 py-1 text-xs font-medium bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded-full">
                🌙 Dark Mode
              </span>
            </div>

            {/* Example Questions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exampleQuestions.map((example, i) => (
                <button
                  key={i}
                  onClick={() => setInput(example.text)}
                  className="group p-4 text-left rounded-xl border border-slate-200/50 bg-white/80 dark:bg-slate-800/80 dark:border-slate-700/30 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100 dark:hover:shadow-blue-900/20 hover:scale-[1.02] hover:border-blue-300 dark:hover:border-blue-600 backdrop-blur-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-600 group-hover:from-blue-100 group-hover:to-indigo-100 dark:group-hover:from-blue-900/50 dark:group-hover:to-indigo-900/50 transition-colors`}>
                      <example.icon className={`w-5 h-5 ${example.color} transition-transform group-hover:scale-110`} />
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">{example.text}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Quick tip */}
            <div className="text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 inline-block px-4 py-2 rounded-full">
                💡 Tip: Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded text-xs font-mono mx-1">?</kbd> for keyboard shortcuts
              </p>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-6">
          {messages.map((message, index) => (
            <div key={message.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <ChatMessage message={message} isLoading={message.isLoading} error={message.error} />
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="border-t border-slate-200/50 dark:border-slate-700/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md sticky bottom-0 w-full shadow-lg shadow-slate-100/20 dark:shadow-slate-900/50 z-20">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about foods, ingredients, recipes..."
                disabled={isLoading}
                className="flex-1 bg-slate-100/80 dark:bg-slate-700/80 border-0 pr-12 py-6 rounded-xl focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 transition-all placeholder:text-slate-400"
              />
              {/* Voice input button */}
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                  isListening 
                    ? "bg-red-100 text-red-500 animate-pulse" 
                    : "text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                }`}
                title={isListening ? "Listening..." : "Voice input"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              size="icon"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white h-12 w-12 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? <Spinner className="w-5 h-5" /> : <SendIcon className="w-5 h-5" />}
            </Button>
          </form>
          <p className="text-xs text-center text-slate-400 mt-2">
            Press <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono mx-1">Enter</kbd> to send • <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono mx-1">Ctrl+K</kbd> to focus
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}
