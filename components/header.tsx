import { UtensilsCrossed } from "lucide-react"

export function Header() {
  return (
    <header className="border-b border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
          <UtensilsCrossed className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 dark:from-amber-300 dark:to-orange-300 bg-clip-text text-transparent">
            Food RAG
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">AI-Powered Food Intelligence</p>
        </div>
      </div>
    </header>
  )
}
