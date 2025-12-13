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


  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [totalSources, setTotalSources] = useState(0)
  const [lastResponseTime, setLastResponseTime] = useState<number | undefined>()
  const [chats, setChats] = useState<ChatSession[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative">
      <ParticleBackground />
      <KeyboardShortcuts onNewChat={handleNewChat} onFocusInput={handleFocusInput} />

      {/* Sidebar as a flex child, never overlaps */}
      <ChatHistory
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        chats={chats}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main content always beside sidebar */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header onClearChat={handleClearChat} messageCount={messages.length} messages={messages} />
        <main
          className={`flex-1 w-full max-w-3xl px-4 py-8 relative z-10 transition-all ${sidebarCollapsed ? 'ml-16' : 'ml-72'}`}
        >
          {/* ...existing code... */}
        </main>
        {/* ...existing code... */}
      </div>
    </div>
  )
}
