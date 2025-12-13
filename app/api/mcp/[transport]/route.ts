// app/api/mcp/[transport]/route.ts
// MCP Server for Claude Desktop / VS Code Copilot integration

import { createMcpHandler } from "mcp-handler"
import { z } from "zod"
import { searchFoodKnowledge, listFoodTopics } from "@/lib/food-rag"

const handler = createMcpHandler(
  (server) => {
    // Tool: search_food_knowledge - Main RAG search
    server.tool(
      "search_food_knowledge",
      "Search the food knowledge base for recipes, nutrition, cooking tips. Returns sources with AI-generated answer.",
      {
        query: z.string().min(1).max(500).describe("Food-related question"),
        topK: z.number().min(1).max(10).default(3).optional().describe("Number of results (default: 3)"),
      },
      async ({ query, topK = 3 }) => {
        try {
          const result = await searchFoodKnowledge({
            query: String(query),
            topK: Number(topK) || 3,
            includeAnswer: true,
          })

          let text = result.answer ? `## Answer\n\n${result.answer}\n\n` : ""

          if (result.sources.length > 0) {
            text += `## Sources\n\n`
            result.sources.forEach((s, i) => {
              text += `**${i + 1}. ${s.title}** (${(s.score * 100).toFixed(0)}% match)\n${s.content}\n\n`
            })
          } else {
            text = "No relevant information found. Try a different food-related question."
          }

          return { content: [{ type: "text" as const, text }] }
        } catch (error) {
          return {
            content: [{ type: "text" as const, text: `Error: ${error instanceof Error ? error.message : "Search failed"}` }],
            isError: true,
          }
        }
      }
    )

    // Tool: list_food_topics - Discovery tool
    server.tool(
      "list_food_topics",
      "List available food topics in the knowledge base.",
      {},
      async () => {
        const topics = await listFoodTopics()
        const text = `## Food Topics\n\n${topics.map((t, i) => `${i + 1}. ${t}`).join("\n")}\n\n💡 Use \`search_food_knowledge\` to ask questions.`
        return { content: [{ type: "text" as const, text }] }
      }
    )
  },
  {},
  { basePath: "/api/mcp", maxDuration: 60 }
)

export { handler as GET, handler as POST }
