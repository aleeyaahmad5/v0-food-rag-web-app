# 🔌 Food RAG MCP Server - Design Document

> Detailed technical design for building an MCP server that allows AI assistants to search the Upstash Vector database

---

## 📋 Executive Summary

This document outlines the design for creating a **Model Context Protocol (MCP) server** that exposes the Food RAG vector database as a tool for AI assistants like Claude Desktop. The MCP will allow users to:

1. **Search food knowledge** directly from Claude Desktop
2. **Query the vector database** using natural language
3. **Get sourced answers** with relevance scores

---

## 🏗️ Architecture Overview

### Reference Architecture (from rolldice-mcpserver)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MCP SERVER ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Claude Desktop                                                             │
│        │                                                                     │
│        │ MCP Protocol (JSON-RPC 2.0)                                        │
│        ▼                                                                     │
│   ┌─────────────┐     npx mcp-remote     ┌──────────────────────┐          │
│   │  mcp-remote │ ─────────────────────▶ │  /api/[transport]    │          │
│   │   (bridge)  │                        │  (MCP Handler)       │          │
│   └─────────────┘                        └──────────────────────┘          │
│                                                    │                        │
│                                                    ▼                        │
│                                          ┌──────────────────────┐          │
│                                          │  Shared Logic        │          │
│                                          │  /lib/food-rag.ts    │          │
│                                          └──────────────────────┘          │
│                                                    │                        │
│                              ┌─────────────────────┼─────────────────────┐  │
│                              ▼                     ▼                     ▼  │
│                    ┌──────────────┐      ┌──────────────┐      ┌─────────┐ │
│                    │   Upstash    │      │    Groq      │      │  Web    │ │
│                    │  Vector DB   │      │    LLM       │      │   UI    │ │
│                    └──────────────┘      └──────────────┘      └─────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Our Food RAG MCP Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       FOOD RAG MCP ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Claude Desktop ◄────── "Search for healthy breakfast recipes"             │
│        │                                                                     │
│        │ JSON-RPC 2.0 via mcp-remote                                        │
│        ▼                                                                     │
│   /api/mcp/[transport]/route.ts                                             │
│        │                                                                     │
│        ├──▶ Tool: search_food_knowledge                                     │
│        │         │                                                           │
│        │         ├──▶ Query Upstash Vector DB                               │
│        │         │         └──▶ Get relevant food documents                 │
│        │         │                                                           │
│        │         ├──▶ (Optional) Call Groq LLM                              │
│        │         │         └──▶ Generate contextual answer                  │
│        │         │                                                           │
│        │         └──▶ Return sources + answer                               │
│        │                                                                     │
│        └──▶ Tool: list_food_topics                                          │
│                   └──▶ Return available food categories                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Dependencies to Add

```json
// package.json additions
{
  "dependencies": {
    "mcp-handler": "^0.0.12",    // MCP protocol handler for Next.js
    "zod": "^3.25.0"              // Already have - for schema validation
  }
}
```

**Claude Desktop requires:**
```bash
# Users will need to run this (installed automatically via npx)
npx mcp-remote <your-server-url>/api/mcp
```

---

## 📁 New Files to Create

### 1. Shared Logic: `lib/food-rag.ts`

```typescript
// lib/food-rag.ts
import { z } from "zod"
import { Index } from "@upstash/vector"
import Groq from "groq-sdk"

// ============================================================================
// SCHEMAS
// ============================================================================

export const searchQuerySchema = z.object({
  query: z.string().min(1).max(500).describe("The food-related question to search for"),
  topK: z.number().int().min(1).max(10).default(3).describe("Number of results to return"),
  includeAnswer: z.boolean().default(true).describe("Whether to generate an AI answer")
})

export type SearchQuery = z.infer<typeof searchQuerySchema>

export const searchResultSchema = z.object({
  answer: z.string().optional(),
  sources: z.array(z.object({
    title: z.string(),
    content: z.string(),
    score: z.number()
  }))
})

export type SearchResult = z.infer<typeof searchResultSchema>

// ============================================================================
// VECTOR DATABASE CLIENT
// ============================================================================

const vectorIndex = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
})

// ============================================================================
// GROQ CLIENT
// ============================================================================

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Search the food knowledge base
 */
export async function searchFoodKnowledge(params: SearchQuery): Promise<SearchResult> {
  const { query, topK, includeAnswer } = searchQuerySchema.parse(params)
  
  // 1. Query vector database
  const results = await vectorIndex.query({
    data: query,
    topK,
    includeMetadata: true,
  })
  
  // 2. Format sources
  const sources = results.map((result) => ({
    title: (result.metadata?.title as string) || "Food Knowledge",
    content: (result.metadata?.content as string) || (result.metadata?.text as string) || "",
    score: result.score,
  }))
  
  // 3. Generate AI answer if requested
  let answer: string | undefined
  
  if (includeAnswer && sources.length > 0) {
    const context = sources.map(s => s.content).join("\n\n")
    
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a helpful food and culinary expert. Answer questions based on the provided context. Be concise and accurate. If the context doesn't contain relevant information, say so.`
        },
        {
          role: "user", 
          content: `Context:\n${context}\n\nQuestion: ${query}`
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    })
    
    answer = completion.choices[0]?.message?.content || undefined
  }
  
  return { answer, sources }
}

/**
 * List available food topics/categories
 */
export async function listFoodTopics(): Promise<string[]> {
  // This could query the database for unique categories
  // For now, return predefined topics
  return [
    "Recipes & Cooking",
    "Nutrition & Health",
    "Food Science",
    "Cuisines & Culture",
    "Ingredients",
    "Dietary Restrictions",
    "Food Safety",
    "Kitchen Tips"
  ]
}

// ============================================================================
// TOOL DEFINITIONS (for MCP)
// ============================================================================

export const searchFoodTool = {
  name: "search_food_knowledge",
  description: "Search the food knowledge base for recipes, nutrition info, cooking tips, and culinary information. Returns relevant sources and an AI-generated answer.",
  schema: {
    query: searchQuerySchema.shape.query,
    topK: searchQuerySchema.shape.topK,
    includeAnswer: searchQuerySchema.shape.includeAnswer,
  }
} as const

export const listTopicsTool = {
  name: "list_food_topics", 
  description: "List available food topics and categories in the knowledge base",
  schema: {}
} as const
```

### 2. MCP Route Handler: `app/api/mcp/[transport]/route.ts`

```typescript
// app/api/mcp/[transport]/route.ts
import { createMcpHandler } from "mcp-handler"
import { 
  searchFoodKnowledge, 
  listFoodTopics,
  searchFoodTool,
  listTopicsTool 
} from "@/lib/food-rag"

const handler = createMcpHandler(
  (server) => {
    // Register search tool
    server.tool(
      searchFoodTool.name,
      searchFoodTool.description,
      searchFoodTool.schema,
      async ({ query, topK = 3, includeAnswer = true }) => {
        const result = await searchFoodKnowledge({ query, topK, includeAnswer })
        
        // Format response for MCP
        let responseText = ""
        
        if (result.answer) {
          responseText += `**Answer:**\n${result.answer}\n\n`
        }
        
        if (result.sources.length > 0) {
          responseText += `**Sources:**\n`
          result.sources.forEach((source, i) => {
            responseText += `${i + 1}. ${source.title} (relevance: ${(source.score * 100).toFixed(1)}%)\n`
            responseText += `   ${source.content.substring(0, 200)}...\n\n`
          })
        }
        
        return {
          content: [{
            type: "text",
            text: responseText || "No results found for your query."
          }]
        }
      }
    )
    
    // Register list topics tool
    server.tool(
      listTopicsTool.name,
      listTopicsTool.description,
      listTopicsTool.schema,
      async () => {
        const topics = await listFoodTopics()
        
        return {
          content: [{
            type: "text",
            text: `**Available Food Topics:**\n${topics.map(t => `• ${t}`).join('\n')}`
          }]
        }
      }
    )
  },
  {
    // Server options
    name: "food-rag-mcp",
    version: "1.0.0",
  },
  {
    // Handler options
    basePath: "/api/mcp",
    maxDuration: 60,
    verboseLogs: process.env.NODE_ENV === "development",
  }
)

export { handler as GET, handler as POST }
```

### 3. Server Actions (for Web Testing): `app/actions/mcp-actions.ts`

```typescript
// app/actions/mcp-actions.ts
'use server'

import { 
  searchFoodKnowledge, 
  listFoodTopics,
  searchFoodTool,
  listTopicsTool,
  type SearchQuery 
} from "@/lib/food-rag"

/**
 * Server action to search food knowledge
 */
export async function searchFood(params: SearchQuery) {
  try {
    const result = await searchFoodKnowledge(params)
    return { success: true, result }
  } catch (error) {
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
export async function getTopics() {
  try {
    const topics = await listFoodTopics()
    return { success: true, topics }
  } catch (error) {
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
 * Server action to list available tools (for health check)
 */
export async function listTools() {
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
                description: 'The food-related question to search for'
              },
              topK: {
                type: 'number',
                description: 'Number of results (1-10)',
                default: 3
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
```

---

## 🔧 Claude Desktop Configuration

### Windows
Location: `%APPDATA%\Claude\claude_desktop_config.json`

### macOS
Location: `~/Library/Application Support/Claude/claude_desktop_config.json`

### Local Development Config
```json
{
  "mcpServers": {
    "food-rag": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "http://localhost:3000/api/mcp"
      ]
    }
  }
}
```

### Production Config (Vercel Deployment)
```json
{
  "mcpServers": {
    "food-rag": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://v0-food-rag-web-app-aleeya-ahmads-projects.vercel.app/api/mcp"
      ]
    }
  }
}
```

---

## 📊 MCP Tool Specifications

### Tool 1: `search_food_knowledge`

| Property | Value |
|----------|-------|
| **Name** | `search_food_knowledge` |
| **Description** | Search the food knowledge base for recipes, nutrition info, cooking tips, and culinary information |
| **Parameters** | `query` (required), `topK` (optional, default: 3), `includeAnswer` (optional, default: true) |
| **Returns** | AI-generated answer + source citations with relevance scores |

**Example Usage in Claude:**
```
User: "Search for healthy breakfast recipes"
Claude: [calls search_food_knowledge with query="healthy breakfast recipes"]
```

### Tool 2: `list_food_topics`

| Property | Value |
|----------|-------|
| **Name** | `list_food_topics` |
| **Description** | List available food topics and categories in the knowledge base |
| **Parameters** | None |
| **Returns** | List of available topic categories |

**Example Usage in Claude:**
```
User: "What food topics can you search?"
Claude: [calls list_food_topics]
```

---

## 🚀 Implementation Steps

### Phase 1: Core Setup
- [ ] Install `mcp-handler` dependency
- [ ] Create `lib/food-rag.ts` with shared logic
- [ ] Create `app/api/mcp/[transport]/route.ts`
- [ ] Test locally with `npm run dev`

### Phase 2: Server Actions
- [ ] Create `app/actions/mcp-actions.ts`
- [ ] Update web UI to use server actions (optional)
- [ ] Add MCP testing interface to web app (optional)

### Phase 3: Claude Desktop Integration
- [ ] Test with local Claude Desktop config
- [ ] Deploy to Vercel
- [ ] Test with production Claude Desktop config
- [ ] Update documentation

### Phase 4: Documentation
- [ ] Add setup guide to README
- [ ] Create Claude Desktop config instructions
- [ ] Document available tools and usage examples

---

## 🧪 Testing Checklist

### Local Testing
- [ ] MCP endpoint responds at `/api/mcp`
- [ ] `search_food_knowledge` returns results
- [ ] `list_food_topics` returns categories
- [ ] Error handling works correctly

### Claude Desktop Testing
- [ ] Hammer icon (🔨) appears in Claude Desktop
- [ ] Tools are discoverable
- [ ] Natural language queries work
- [ ] Sources are properly cited

### Production Testing
- [ ] Vercel deployment works
- [ ] Production URL is accessible
- [ ] Claude Desktop connects successfully
- [ ] Response times are acceptable

---

## 🔒 Security Considerations

1. **API Key Protection**: Ensure `GROQ_API_KEY` and `UPSTASH_*` tokens are in `.env.local` only
2. **Rate Limiting**: Consider adding rate limits to prevent abuse
3. **Input Validation**: All inputs validated via Zod schemas
4. **CORS**: Next.js handles CORS appropriately for MCP

---

## 📈 Future Enhancements

1. **Additional Tools**:
   - `get_recipe_details` - Get full recipe by ID
   - `compare_ingredients` - Compare nutritional values
   - `suggest_substitutes` - Ingredient substitution suggestions

2. **Caching**: Add Redis caching for frequent queries

3. **Analytics**: Track tool usage and popular queries

4. **Multi-modal**: Add image search capabilities

---

## 📚 References

- [Model Context Protocol Docs](https://modelcontextprotocol.io/)
- [mcp-handler npm package](https://www.npmjs.com/package/mcp-handler)
- [mcp-remote npm package](https://www.npmjs.com/package/mcp-remote)
- [Reference Implementation](https://github.com/gocallum/rolldice-mcpserver)
- [Upstash Vector Docs](https://upstash.com/docs/vector)
- [Groq API Docs](https://console.groq.com/docs)

---

*Document Version: 1.0.0 | Last Updated: December 2024*
