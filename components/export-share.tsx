"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Share2, Check, Link2 } from "lucide-react"

interface Message {
  question: string
  answer: string
  sources: Array<{ text: string; relevance: number; region: string }>
  timestamp?: Date
}

interface ExportShareProps {
  messages: Message[]
}

export function ExportShare({ messages }: ExportShareProps) {
  const [copied, setCopied] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  const exportAsMarkdown = () => {
    const markdown = messages
      .map((msg, i) => {
        let content = `## Question ${i + 1}\n\n**Q:** ${msg.question}\n\n**A:** ${msg.answer}\n`
        if (msg.sources.length > 0) {
          content += `\n### Sources\n`
          msg.sources.forEach((source, j) => {
            content += `${j + 1}. ${source.text} (${Math.round(source.relevance * 100)}% match${source.region ? `, ${source.region}` : ""})\n`
          })
        }
        return content
      })
      .join("\n---\n\n")

    const header = `# Food RAG Chat Export\n\nExported on: ${new Date().toLocaleString()}\n\n---\n\n`
    const blob = new Blob([header + markdown], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `food-rag-chat-${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportAsJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      messages: messages.map((msg) => ({
        question: msg.question,
        answer: msg.answer,
        sources: msg.sources,
        timestamp: msg.timestamp?.toISOString(),
      })),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `food-rag-chat-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyShareLink = async () => {
    // Create a simple shareable summary
    const summary = messages.slice(-3).map(m => `Q: ${m.question.slice(0, 50)}...`).join('\n')
    const shareText = `🍽️ Check out my Food RAG conversation!\n\n${summary}\n\nTry it: ${window.location.href}`
    
    await navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (messages.length === 0) return null

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowOptions(!showOptions)}
        className="h-9 w-9 text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        title="Export & Share"
      >
        <Share2 className="w-4 h-4" />
      </Button>

      {showOptions && (
        <div className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 min-w-[180px] z-50 animate-fade-in">
          <button
            onClick={() => { exportAsMarkdown(); setShowOptions(false) }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export as Markdown
          </button>
          <button
            onClick={() => { exportAsJSON(); setShowOptions(false) }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export as JSON
          </button>
          <hr className="my-2 border-slate-200 dark:border-slate-700" />
          <button
            onClick={() => { copyShareLink(); setShowOptions(false) }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Share Text"}
          </button>
        </div>
      )}
    </div>
  )
}
