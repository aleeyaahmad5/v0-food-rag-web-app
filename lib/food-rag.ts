// lib/food-rag.ts
// Shared RAG logic for both web API and MCP server

import { z } from "zod"
import { Index } from "@upstash/vector"
import { Groq } from "groq-sdk"

// ============================================================================
// TYPES
// ============================================================================

export const searchQuerySchema = z.object({
  query: z.string().min(1).max(500),
  topK: z.number().int().min(1).max(10).default(3),
  includeAnswer: z.boolean().default(true),
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
// CLIENTS (lazy init)
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
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY })
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
 * Search the food knowledge base and optionally generate an AI answer
 */
export async function searchFoodKnowledge(params: SearchQuery): Promise<SearchResult> {
  const { query, topK, includeAnswer } = searchQuerySchema.parse(params)

  // 1. Vector search
  const results = await getVectorIndex().query<VectorMetadata>({
    data: query,
    topK,
    includeMetadata: true,
  })

  // 2. Format sources
  const sources: Source[] = results
    .map((r) => ({
      title: r.metadata?.title || r.metadata?.type || "Food Knowledge",
      content: r.metadata?.original_text || r.metadata?.text || "",
      score: r.score || 0,
      region: r.metadata?.region,
    }))
    .filter((s) => s.content)

  // 3. Generate AI answer if requested
  let answer: string | undefined

  if (includeAnswer && sources.length > 0) {
    const context = sources.map((s) => s.content).join("\n\n")

    const completion = await getGroqClient().chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: `You are a helpful food knowledge assistant. Answer based on this context:

${context}

Question: ${query}

Provide a clear, helpful answer. If the context doesn't have the info, say so.`,
        },
      ],
      temperature: 0.7,
      max_completion_tokens: 1024,
    })

    answer = completion.choices[0]?.message?.content?.trim()
  }

  return { answer, sources }
}

/**
 * List available food topics
 */
export async function listFoodTopics(): Promise<string[]> {
  return [
    "Recipes & Cooking",
    "Nutrition & Health",
    "World Cuisines",
    "Ingredients & Substitutions",
    "Dietary Restrictions",
    "Food Safety",
    "Kitchen Tips",
    "Meal Planning",
    "Baking & Pastry",
    "Food Science",
  ]
}
