"use client"

import { useEffect, useState } from "react"
import { Keyboard } from "lucide-react"

interface KeyboardShortcutsProps {
  onNewChat: () => void
  onFocusInput: () => void
}

export function KeyboardShortcuts({ onNewChat, onFocusInput }: KeyboardShortcutsProps) {
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K: Focus input
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        onFocusInput()
      }
      // Ctrl/Cmd + Shift + N: New chat
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "N") {
        e.preventDefault()
        onNewChat()
      }
      // Escape: Close help
      if (e.key === "Escape") {
        setShowHelp(false)
      }
      // ?: Show shortcuts help
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault()
          setShowHelp((prev) => !prev)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onNewChat, onFocusInput])

  const shortcuts = [
    { keys: ["Ctrl", "K"], description: "Focus search input" },
    { keys: ["Ctrl", "Shift", "N"], description: "Start new chat" },
    { keys: ["Enter"], description: "Send message" },
    { keys: ["?"], description: "Toggle shortcuts help" },
    { keys: ["Esc"], description: "Close dialogs" },
    { keys: ["←"], description: "Open chat history sidebar" },
  ]

  return (
    <>
      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-6 right-6 p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-500 hover:border-blue-300 transition-all hover:scale-110 z-20"
        title="Keyboard shortcuts (?)"
        style={{ pointerEvents: 'auto' }}
      >
        <Keyboard className="w-5 h-5" />
      </button>

      {showHelp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowHelp(false)}>
          <div 
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <Keyboard className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Keyboard Shortcuts</h3>
            </div>
            
            <div className="space-y-3">
              {shortcuts.map((shortcut, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-300">{shortcut.description}</span>
                  <div className="flex gap-1">
                    {shortcut.keys.map((key, j) => (
                      <kbd
                        key={j}
                        className="px-2 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded border border-slate-300 dark:border-slate-600"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="mt-6 w-full py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
            >
              Close (Esc)
            </button>
          </div>
        </div>
      )}
    </>
  )
}
