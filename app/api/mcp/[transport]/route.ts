// app/api/mcp/[transport]/route.ts
// MCP Server endpoint for Claude Desktop integration

import { createMcpHandler } from "mcp-handler"
import { 
  searchFoodKnowledge, 
  listFoodTopics,
  searchFoodTool,
  listTopicsTool 
} from "@/lib/food-rag"

const handler = createMcpHandler(
  (server) => {
    // ========================================================================
    // Tool: search_food_knowledge
    // ========================================================================
    server.tool(
      searchFoodTool.name,
      searchFoodTool.description,
      searchFoodTool.schema,
      async ({ query, topK = 3, includeAnswer = true }) => {
        try {
          const result = await searchFoodKnowledge({ 
            query: query as string, 
            topK: (topK as number) || 3, 
            includeAnswer: (includeAnswer as boolean) ?? true 
          })
          
          // Format response for MCP
          let responseText = ""
          
          if (result.answer) {
            responseText += `## Answer\n\n${result.answer}\n\n`
          }
          
          if (result.sources.length > 0) {
            responseText += `## Sources (${result.sources.length} found)\n\n`
            result.sources.forEach((source, i) => {
              const relevancePercent = (source.score * 100).toFixed(1)
              responseText += `### ${i + 1}. ${source.title}\n`
              responseText += `**Relevance:** ${relevancePercent}%`
              if (source.region) {
                responseText += ` | **Region:** ${source.region}`
              }
              responseText += `\n\n${source.content}\n\n---\n\n`
            })
          } else {
            responseText = "No relevant information found in the food knowledge base. Try rephrasing your question or asking about a different food topic."
          }
          
          return {
            content: [{
              type: "text" as const,
              text: responseText
            }]
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
          return {
            content: [{
              type: "text" as const,
              text: `❌ Error searching food knowledge: ${errorMessage}`
            }],
            isError: true
          }
        }
      }
    )
    
    // ========================================================================
    // Tool: list_food_topics
    // ========================================================================
    server.tool(
      listTopicsTool.name,
      listTopicsTool.description,
      listTopicsTool.schema,
      async () => {
        try {
          const topics = await listFoodTopics()
          
          let responseText = `## Available Food Topics\n\n`
          responseText += `The Food RAG knowledge base can answer questions about:\n\n`
          topics.forEach((topic, i) => {
            responseText += `${i + 1}. **${topic}**\n`
          })
          responseText += `\n---\n\n`
          responseText += `💡 **Tip:** Use the \`search_food_knowledge\` tool with a specific question to get detailed answers with sources.`
          
          return {
            content: [{
              type: "text" as const,
              text: responseText
            }]
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
          return {
            content: [{
              type: "text" as const,
              text: `❌ Error listing topics: ${errorMessage}`
            }],
            isError: true
          }
        }
      }
    )
  },
  {
    // Server options (empty - mcp-handler uses defaults)
  },
  {
    // Handler options
    basePath: "/api/mcp",
    maxDuration: 60,
    verboseLogs: process.env.NODE_ENV === "development",
  }
)

// Export handlers for Next.js App Router
export { handler as GET, handler as POST }
