// app/actions/mcp-actions.ts
// Server actions for testing MCP functionality from the web UI

'use server'

import { 
  searchFoodKnowledge, 
  listFoodTopics,
  searchFoodTool,
  listTopicsTool,
  type SearchQuery,
  type SearchResult
} from "@/lib/food-rag"

/**
 * Server action to search food knowledge
 */
export async function searchFood(params: SearchQuery): Promise<{
  success: boolean
  result?: SearchResult
  error?: { code: number; message: string }
}> {
  try {
    const result = await searchFoodKnowledge(params)
    return { success: true, result }
  } catch (error) {
    console.error("searchFood error:", error)
    return {
      success: false,
      error: {
        code: -32602,
        message: error instanceof Error ? error.message : "Search failed"
      }
    }
  }
}

/**
 * Server action to list topics
 */
export async function getTopics(): Promise<{
  success: boolean
  topics?: string[]
  error?: { code: number; message: string }
}> {
  try {
    const topics = await listFoodTopics()
    return { success: true, topics }
  } catch (error) {
    console.error("getTopics error:", error)
    return {
      success: false,
      error: {
        code: -32602,
        message: error instanceof Error ? error.message : "Failed to get topics"
      }
    }
  }
}

/**
 * Server action to list available MCP tools (for health check)
 */
export async function listMcpTools(): Promise<{
  success: boolean
  result?: {
    tools: Array<{
      name: string
      description: string
      inputSchema: object
    }>
  }
  error?: { code: number; message: string }
}> {
  return {
    success: true,
    result: {
      tools: [
        {
          name: searchFoodTool.name,
          description: searchFoodTool.description,
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'The food-related question to search for',
                minLength: 1,
                maxLength: 500
              },
              topK: {
                type: 'number',
                description: 'Number of results (1-10)',
                default: 3,
                minimum: 1,
                maximum: 10
              },
              includeAnswer: {
                type: 'boolean',
                description: 'Generate AI answer',
                default: true
              }
            },
            required: ['query']
          }
        },
        {
          name: listTopicsTool.name,
          description: listTopicsTool.description,
          inputSchema: {
            type: 'object',
            properties: {},
            required: []
          }
        }
      ]
    }
  }
}

/**
 * Server action to check MCP server health
 */
export async function checkMcpHealth(): Promise<{
  success: boolean
  status: 'online' | 'offline'
  message: string
}> {
  try {
    // Try to get topics as a health check
    const topics = await listFoodTopics()
    if (topics && topics.length > 0) {
      return {
        success: true,
        status: 'online',
        message: `MCP server is healthy. ${topics.length} topics available.`
      }
    }
    return {
      success: false,
      status: 'offline',
      message: 'MCP server responded but returned no topics'
    }
  } catch (error) {
    return {
      success: false,
      status: 'offline',
      message: error instanceof Error ? error.message : 'Health check failed'
    }
  }
}
