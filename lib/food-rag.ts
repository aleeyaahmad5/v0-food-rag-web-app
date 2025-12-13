// lib/food-rag.ts
// Shared logic for Food RAG - used by both MCP server and web API

import { z } from "zod"
import { Index } from "@upstash/vector"
import { Groq } from "groq-sdk"

// ============================================================================
// SCHEMAS
// ============================================================================

export const searchQuerySchema = z.object({
  query: z.string().min(1).max(500).describe("The food-related question to search for"),
  topK: z.number().int().min(1).max(10).default(3).describe("Number of results to return"),
  includeAnswer: z.boolean().default(true).describe("Whether to generate an AI answer")
})

export type SearchQuery = z.infer<typeof searchQuerySchema>

export interface Source {
  title: string
  content: string
  score: number
  region?: string
}

export interface SearchResult {
  answer?: string
  sources: Source[]
}

// ============================================================================
// CLIENTS (lazy initialization)
// ============================================================================

let vectorIndex: Index | null = null
let groqClient: Groq | null = null

function getVectorIndex(): Index {
  if (!vectorIndex) {
    if (!process.env.UPSTASH_VECTOR_REST_URL || !process.env.UPSTASH_VECTOR_REST_TOKEN) {
      throw new Error("Missing Upstash Vector environment variables")
    }
    vectorIndex = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN,
    })
  }
  return vectorIndex
}

function getGroqClient(): Groq {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("Missing GROQ_API_KEY environment variable")
    }
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    })
  }
  return groqClient
}

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

interface VectorMetadata {
  original_text?: string
  text?: string
  region?: string
  type?: string
  title?: string
  [key: string]: unknown
}

/**
 * Search the food knowledge base
 */
export async function searchFoodKnowledge(params: SearchQuery): Promise<SearchResult> {
  const { query, topK, includeAnswer } = searchQuerySchema.parse(params)
  
  const index = getVectorIndex()
  
  // 1. Query vector database
  const results = await index.query<VectorMetadata>({
    data: query,
    topK,
    includeMetadata: true,
  })
  
  // 2. Format sources
  const sources: Source[] = results
    .map((result) => {
      const metadata = result.metadata as VectorMetadata | undefined
      return {
        title: metadata?.title || metadata?.type || "Food Knowledge",
        content: metadata?.original_text || metadata?.text || "",
        score: result.score || 0,
        region: metadata?.region,
      }
    })
    .filter((source) => source.content)
  
  // 3. Generate AI answer if requested
  let answer: string | undefined
  
  if (includeAnswer && sources.length > 0) {
    const groq = getGroqClient()
    const context = sources.map(s => s.content).join("\n\n")
    
    const prompt = `You are a helpful food knowledge assistant. Use the following context to answer the user's question about food, ingredients, or culinary topics. If the information is not in the context, say you don't have enough information to answer accurately.

Context:
${context}

Question: ${query}

Answer: Provide a clear, helpful answer based on the context provided.`

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_completion_tokens: 1024,
    })
    
    answer = completion.choices[0]?.message?.content?.trim() || undefined
  }
  
  return { answer, sources }
}

/**
 * List available food topics/categories
 */
export async function listFoodTopics(): Promise<string[]> {
  // Predefined topics based on the knowledge base
  return [
    "Recipes & Cooking Techniques",
    "Nutrition & Health Benefits",
    "Food Science & Chemistry",
    "World Cuisines & Culture",
    "Ingredients & Substitutions",
    "Dietary Restrictions & Allergies",
    "Food Safety & Storage",
    "Kitchen Tips & Equipment",
    "Meal Planning & Prep",
    "Baking & Pastry"
  ]
}

// ============================================================================
// TOOL DEFINITIONS (for MCP)
// ============================================================================

export const searchFoodTool = {
  name: "search_food_knowledge",
  description: "Search the food knowledge base for recipes, nutrition info, cooking tips, and culinary information. Returns relevant sources and an AI-generated answer based on the retrieved context.",
  schema: {
    query: z.string().min(1).max(500).describe("The food-related question to search for"),
    topK: z.number().int().min(1).max(10).default(3).optional().describe("Number of results to return (1-10, default: 3)"),
    includeAnswer: z.boolean().default(true).optional().describe("Whether to generate an AI answer (default: true)"),
  }
} as const

export const listTopicsTool = {
  name: "list_food_topics", 
  description: "List available food topics and categories in the knowledge base. Use this to see what kinds of food-related questions can be answered.",
  schema: {}
} as const
