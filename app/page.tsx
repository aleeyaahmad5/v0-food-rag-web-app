"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { ChatMessage } from "@/components/chat-message"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SendIcon } from "lucide-react"

interface Message {
  id: string
  question: string
  answer: string
  sources: Array<{ text: string; relevance: number; region: string }>
  isLoading?: boolean
  error?: string
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const question = input.trim()
    setInput("")
    setIsLoading(true)

    // Add loading message
    const loadingMessageId = Date.now().toString()
    setMessages((prev) => [
      ...prev,
      {
        id: loadingMessageId,
        question,
        answer: "",
        sources: [],
        isLoading: true,
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

      // Replace loading message with actual response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessageId
            ? {
                ...msg,
                answer: data.answer,
                sources: data.sources || [],
                isLoading: false,
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
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800">
      <Header />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8">
        {/* Welcome Message */}
        {messages.length === 0 && (
          <div className="space-y-8 mb-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 dark:from-amber-300 dark:to-orange-300 bg-clip-text text-transparent">
                Welcome to Food RAG
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                Ask anything about foods, ingredients, and culinary knowledge
              </p>
            </div>

            {/* Example Questions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "What fruits are popular in tropical regions?",
                "Tell me about spicy foods",
                "What makes a banana unique?",
                "Are there any sour fruits?",
              ].map((example, i) => (
                <button
                  key={i}
                  onClick={() => setInput(example)}
                  className="p-4 text-left rounded-lg border border-amber-200 bg-white dark:bg-slate-800 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-slate-700 transition-colors duration-200"
                >
                  <p className="text-sm text-slate-700 dark:text-slate-200">{example}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-6">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} isLoading={message.isLoading} error={message.error} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="border-t border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-800 sticky bottom-0 w-full">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about foods, ingredients, recipes..."
              disabled={isLoading}
              className="flex-1 bg-slate-100 dark:bg-slate-700 border-0"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              size="icon"
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
            >
              {isLoading ? <Spinner className="w-4 h-4" /> : <SendIcon className="w-4 h-4" />}
            </Button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  )
}
