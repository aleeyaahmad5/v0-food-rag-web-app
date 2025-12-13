# 🤖 AI Agent Instructions

> Technical documentation for AI agents working on this codebase

---

## � Project Documentation & Config Files

| File | Type | Summary |
|------|------|---------|
| [`README.md`](README.md) | 📖 Documentation | Portfolio-ready project overview with badges, features, tech stack, installation guide, keyboard shortcuts, and architecture diagram |
| [`agents.md`](agents.md) | 🤖 AI Instructions | This file - technical documentation for AI agents with architecture, patterns, and coding guidelines |
| [`package.json`](package.json) | 📦 Dependencies | npm/pnpm config with all dependencies (React 19, Next.js 16, Tailwind 4, Upstash, Groq, Radix UI, Lucide icons) and scripts (`dev`, `build`, `lint`, `start`) |
| [`tsconfig.json`](tsconfig.json) | ⚙️ TypeScript | Strict TypeScript config with ES6 target, path aliases (`@/*`), JSX support, and Next.js plugin |
| [`next.config.mjs`](next.config.mjs) | ⚙️ Next.js | Next.js config with `ignoreBuildErrors: true` for TypeScript and unoptimized images |
| [`postcss.config.mjs`](postcss.config.mjs) | 🎨 PostCSS | PostCSS config using `@tailwindcss/postcss` plugin for Tailwind 4 |
| [`components.json`](components.json) | 🧩 shadcn/ui | shadcn/ui config: New York style, RSC enabled, TypeScript, Tailwind with CSS variables, Lucide icons, path aliases |
| [`.env.example`](.env.example) | 🔐 Environment | Template for environment variables with detailed comments for Upstash Vector DB, Groq API, and optional configs |
| [`.gitignore`](.gitignore) | 🚫 Git | Files/folders to exclude from version control (node_modules, .next, .env, etc.) |
| [`docs/MCP_DESIGN.md`](docs/MCP_DESIGN.md) | 🔌 MCP Design | Comprehensive design document for building an MCP server to expose vector search to Claude Desktop |

### Quick Reference: What Each Config Controls

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONFIGURATION HIERARCHY                       │
├─────────────────────────────────────────────────────────────────┤
│  package.json         → Dependencies, scripts, project metadata │
│  ├── tsconfig.json    → TypeScript compiler settings            │
│  ├── next.config.mjs  → Next.js framework settings              │
│  ├── postcss.config   → CSS processing (Tailwind)               │
│  └── components.json  → shadcn/ui component generation          │
│                                                                  │
│  .env.example         → Environment variable template            │
│  .env.local           → Actual secrets (NEVER commit!)          │
│                                                                  │
│  README.md            → Human documentation                      │
│  agents.md            → AI agent documentation                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## �📋 Project Summary

**Food RAG** is a Next.js web application that implements **Retrieval-Augmented Generation (RAG)** for answering food-related questions. It combines vector similarity search (Upstash) with LLM generation (Groq) to provide accurate, sourced responses.

### Core Problem Solved
Traditional chatbots hallucinate or provide outdated information. RAG solves this by:
1. Storing curated knowledge in a vector database
2. Retrieving relevant context based on user queries
3. Generating responses grounded in actual sources

---

## 🏗️ Architecture Overview

```
┌────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                       │
├────────────────────────────────────────────────────────────────┤
│  app/page.tsx          │  Main chat interface & state mgmt     │
│  components/*.tsx      │  UI components (header, chat, etc.)   │
│  app/globals.css       │  Tailwind + custom animations         │
└────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ POST /api/rag
┌────────────────────────────────────────────────────────────────┐
│                      API LAYER (Route Handler)                  │
├────────────────────────────────────────────────────────────────┤
│  app/api/rag/route.ts  │  RAG pipeline orchestration           │
│    1. Receive query    │                                        │
│    2. Vector search    │  → Upstash Vector DB                  │
│    3. Build context    │  → Combine sources + query            │
│    4. LLM generation   │  → Groq API                           │
│    5. Return response  │  → JSON with answer + sources         │
└────────────────────────────────────────────────────────────────┘
                          │                    │
                          ▼                    ▼
              ┌──────────────────┐  ┌──────────────────┐
              │  Upstash Vector  │  │    Groq LLM      │
              │  (Knowledge DB)  │  │  (Generation)    │
              └──────────────────┘  └──────────────────┘
```

---

## 📁 Key Files & Purposes

### Entry Points
| File | Purpose |
|------|---------|
| `app/page.tsx` | Main chat UI, state management, localStorage persistence |
| `app/api/rag/route.ts` | RAG API endpoint - vector search + LLM generation |
| `app/layout.tsx` | Root layout, ThemeProvider, metadata |

### Components
| File | Purpose |
|------|---------|
| `components/chat-history.tsx` | Sidebar for managing multiple chat sessions |
| `components/chat-message.tsx` | Renders individual messages (user/assistant) |
| `components/header.tsx` | Top bar with logo, theme toggle, keyboard shortcuts |
| `components/source-card.tsx` | Displays RAG source citations with relevance scores |
| `components/particle-background.tsx` | Canvas-based animated background |
| `components/keyboard-shortcuts.tsx` | Modal showing available shortcuts |
| `components/export-share.tsx` | Export chats as Markdown/JSON |
| `components/feedback-buttons.tsx` | Thumbs up/down for responses |
| `components/stats-bar.tsx` | Query count, response time stats |
| `components/typing-effect.tsx` | Animated text typing effect |

### UI Primitives
| File | Purpose |
|------|---------|
| `components/ui/button.tsx` | Button variants (default, outline, ghost) |
| `components/ui/card.tsx` | Card container components |
| `components/ui/input.tsx` | Styled input field |
| `components/ui/badge.tsx` | Status/tag badges |
| `components/ui/spinner.tsx` | Loading spinner |

### Styling
| File | Purpose |
|------|---------|
| `app/globals.css` | Tailwind config, CSS variables, animations |
| `styles/globals.css` | Legacy styles (can be consolidated) |

---

## 🔧 Technical Patterns

### State Management
- **React useState** for local component state
- **localStorage** for chat persistence (no backend DB for chats)
- **Context** via ThemeProvider for dark/light mode

### Data Flow for Chat
```typescript
// 1. User sends message
const handleSend = async (query: string) => {
  // 2. Add user message to state
  setMessages(prev => [...prev, { role: 'user', content: query }])
  
  // 3. Call RAG API
  const response = await fetch('/api/rag', {
    method: 'POST',
    body: JSON.stringify({ query, history: messages })
  })
  
  // 4. Parse response with sources
  const { answer, sources } = await response.json()
  
  // 5. Add assistant message
  setMessages(prev => [...prev, { role: 'assistant', content: answer, sources }])
}
```

### Chat Session Structure
```typescript
interface ChatSession {
  id: string           // UUID
  title: string        // First message or "New Chat"
  messages: Message[]  // Array of user/assistant messages
  createdAt: Date
  updatedAt: Date
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]   // Only for assistant messages
}

interface Source {
  title: string
  content: string
  score: number        // Relevance score 0-1
}
```

### API Response Format
```typescript
// POST /api/rag
// Request
{ query: string, history?: Message[] }

// Response
{
  answer: string,
  sources: Array<{
    title: string,
    content: string,
    score: number
  }>
}
```

---

## 🎨 Styling Conventions

### Color Scheme
- **Primary**: Blue/Indigo gradient (`from-blue-600 to-indigo-600`)
- **Dark mode**: Uses CSS variables and Tailwind's `dark:` prefix
- **Backgrounds**: Subtle gradients with particle effects

### Animation Classes (defined in globals.css)
| Class | Effect |
|-------|--------|
| `animate-fade-in` | Fade in from transparent |
| `animate-fade-in-up` | Fade in + slide up |
| `animate-slide-up` | Slide up from below |
| `animate-slide-right` | Slide in from left |
| `animate-float` | Gentle floating motion |
| `animate-pulse-slow` | Slow pulse effect |

### Component Patterns
- Use `cn()` utility for conditional classes
- Prefer Tailwind classes over inline styles
- Use shadcn/ui patterns for base components

---

## 📝 Instructions for AI Agents

### When Adding New Features

1. **Understand the component hierarchy**
   - `page.tsx` is the main orchestrator
   - Components should be self-contained with clear props

2. **Follow existing patterns**
   - Use TypeScript interfaces for props
   - Use `cn()` for class concatenation
   - Add animations using existing CSS classes

3. **State management**
   - Local state for UI interactions
   - Lift state to `page.tsx` if shared across components
   - Use localStorage for persistence (prefix keys with app name)

### When Modifying the RAG Pipeline

1. **API changes** go in `app/api/rag/route.ts`
2. **Keep response format consistent** - UI depends on `answer` and `sources`
3. **Handle errors gracefully** - return meaningful error messages

### When Updating Styles

1. **Global animations** → `app/globals.css`
2. **Component-specific** → Use Tailwind in the component
3. **Theme colors** → Update CSS variables in globals.css

### Common Tasks

| Task | Location | Notes |
|------|----------|-------|
| Add new keyboard shortcut | `keyboard-shortcuts.tsx` + `page.tsx` | Update both display and handler |
| Add new chat feature | `page.tsx` + `chat-history.tsx` | State lives in page.tsx |
| Modify AI response display | `chat-message.tsx` | Sources in `source-card.tsx` |
| Change theme colors | `globals.css` | Update CSS variables |
| Add new API endpoint | `app/api/[name]/route.ts` | Follow Next.js App Router patterns |

### Environment Variables Required
```env
UPSTASH_VECTOR_REST_URL=    # Upstash Vector DB endpoint
UPSTASH_VECTOR_REST_TOKEN=  # Upstash authentication token
GROQ_API_KEY=               # Groq API key for LLM
```

---

## 🚫 Things to Avoid

1. **Don't break the RAG response format** - UI expects `{ answer, sources }`
2. **Don't remove localStorage logic** - Chat persistence depends on it
3. **Don't use `useEffect` for data fetching** - Use event handlers or Server Components
4. **Don't add heavy dependencies** - Keep bundle size minimal
5. **Don't hardcode API keys** - Always use environment variables

---

## 🔄 Deployment Notes

- **Platform**: Vercel
- **Build Command**: `pnpm build` (Next.js)
- **Auto-deploy**: Pushes to `main` trigger deployment
- **Environment**: Set env vars in Vercel dashboard

---

## 📊 Testing Checklist

Before committing changes, verify:

- [ ] App loads without console errors
- [ ] Dark/light mode toggle works
- [ ] Chat messages send and receive
- [ ] Sources display correctly
- [ ] Chat history saves/loads from localStorage
- [ ] Mobile responsive layout works
- [ ] Keyboard shortcuts function

---

## 🏷️ Commit Convention

Use conventional commits:
```
feat(component): add new feature
fix(api): resolve bug in RAG pipeline
style(ui): update button colors
docs: update README
refactor: reorganize utils
```

---

*Last updated: December 2024*
