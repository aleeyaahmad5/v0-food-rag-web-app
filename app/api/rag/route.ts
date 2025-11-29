import { type NextRequest, NextResponse } from "next/server"
import { Index } from "@upstash/vector"
import { Groq } from "groq-sdk"

// Initialize clients
const upstashIndex = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
})

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

interface VectorResult {
  id: string
  score: number
  metadata?: {
    original_text?: string
    text?: string
    region?: string
    type?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json()

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Question is required" }, { status: 400 })
    }

    // Validate environment variables
    if (!process.env.UPSTASH_VECTOR_REST_URL || !process.env.UPSTASH_VECTOR_REST_TOKEN || !process.env.GROQ_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Missing environment variables. Please configure UPSTASH_VECTOR_REST_URL, UPSTASH_VECTOR_REST_TOKEN, and GROQ_API_KEY",
        },
        { status: 500 },
      )
    }

    // Step 1: Vector search
    const queryResults = await upstashIndex.query<VectorResult>({
      data: question,
      topK: 3,
      includeMetadata: true,
    })

    // Extract documents from results
    const sources = queryResults
      .map((result) => ({
        text: result.metadata?.original_text || result.metadata?.text || `Document ${result.id}`,
        relevance: result.score || 0,
        region: result.metadata?.region || "",
      }))
      .filter((source) => source.text)

    // Handle no results
    if (sources.length === 0) {
      return NextResponse.json({
        answer: "No relevant information found in the knowledge base. Please try rephrasing your question.",
        sources: [],
      })
    }

    // Step 2: Build context from retrieved documents
    const context = sources.map((s) => s.text).join("\n")

    // Step 3: Create prompt for Groq
    const prompt = `You are a helpful food knowledge assistant. Use the following context to answer the user's question about food, ingredients, or culinary topics. If the information is not in the context, say you don't have enough information to answer accurately.

Context:
${context}

Question: ${question}

Answer: Provide a clear, helpful answer based on the context provided.`

    // Step 4: Generate answer with Groq
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

    const answer = completion.choices[0]?.message?.content?.trim() || ""

    return NextResponse.json({
      answer,
      sources,
    })
  } catch (error) {
    console.error("RAG API Error:", error)

    if (error instanceof Error) {
      if (error.message.includes("authentication")) {
        return NextResponse.json(
          {
            error: "Authentication failed. Please check your API credentials.",
          },
          { status: 401 },
        )
      }
      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded. Please try again in a moment.",
          },
          { status: 429 },
        )
      }
    }

    return NextResponse.json(
      {
        error: "Failed to process your question. Please try again later.",
      },
      { status: 500 },
    )
  }
}
