// app/api/rag/route.ts
// Web API endpoint - uses shared RAG logic

import { type NextRequest, NextResponse } from "next/server"
import { searchFoodKnowledge } from "@/lib/food-rag"

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json()

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Question is required" }, { status: 400 })
    }

    // Use shared RAG logic
    const result = await searchFoodKnowledge({
      query: question,
      topK: 3,
      includeAnswer: true,
    })

    // Format response for web UI (backward compatible)
    return NextResponse.json({
      answer: result.answer || "No relevant information found.",
      sources: result.sources.map((s) => ({
        text: s.content,
        relevance: s.score,
        region: s.region || "",
      })),
    })
  } catch (error) {
    console.error("RAG API Error:", error)
    
    const message = error instanceof Error ? error.message : "Unknown error"
    
    if (message.includes("authentication")) {
      return NextResponse.json({ error: "Authentication failed." }, { status: 401 })
    }
    if (message.includes("rate limit")) {
      return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 })
    }
    if (message.includes("Missing")) {
      return NextResponse.json({ error: message }, { status: 500 })
    }

    return NextResponse.json({ error: "Failed to process your question." }, { status: 500 })
  }
}
