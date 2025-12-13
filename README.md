# 🍽️ Food RAG - AI-Powered Culinary Assistant

<div align="center">

![Food RAG Banner](https://img.shields.io/badge/🍕_Food_RAG-AI_Culinary_Assistant-blue?style=for-the-badge)

**An intelligent food knowledge assistant powered by Retrieval-Augmented Generation (RAG)**

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_App-success?style=for-the-badge)](https://v0-food-rag-web-app.vercel.app)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/aleeya-ahmads-projects/v0-food-rag-web-app)

![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?style=flat-square&logo=tailwind-css)
![Upstash](https://img.shields.io/badge/Upstash-Vector_DB-00E9A3?style=flat-square)
![Groq](https://img.shields.io/badge/Groq-LLM-orange?style=flat-square)

</div>

---

## 📖 About The Project

Food RAG is a modern, full-stack web application that leverages **Retrieval-Augmented Generation (RAG)** to provide accurate, context-aware answers about food, ingredients, recipes, and cuisines from around the world. Unlike traditional chatbots, RAG combines the power of large language models with a curated knowledge base, ensuring responses are grounded in factual information.

### 🎯 Key Highlights

- **RAG Architecture**: Combines vector similarity search with LLM generation for accurate, sourced responses
- **Real-time AI Responses**: Powered by Groq's ultra-fast inference engine
- **Beautiful Modern UI**: Responsive design with smooth animations and dark mode support
- **Production Ready**: Deployed on Vercel with optimized performance

---

## ✨ Features

### 🤖 Core AI Features
| Feature | Description |
|---------|-------------|
| **RAG Pipeline** | Vector-based retrieval from Upstash combined with Groq LLM generation |
| **Source Citations** | Every answer includes relevant sources with relevance scores |
| **Context-Aware** | Maintains conversation context for follow-up questions |

### 💬 Chat Experience
| Feature | Description |
|---------|-------------|
| **Chat History** | Save, switch between, and manage multiple conversations |
| **Persistent Storage** | Chats automatically saved to localStorage |
| **Voice Input** | Speak your questions using Web Speech API |
| **Export & Share** | Download chats as Markdown/JSON or copy to clipboard |

### 🎨 User Interface
| Feature | Description |
|---------|-------------|
| **Particle Background** | Animated canvas-based particle effects |
| **Dark/Light Mode** | System-aware theme with manual toggle |
| **Responsive Design** | Optimized for desktop, tablet, and mobile |
| **Keyboard Shortcuts** | Power user shortcuts (Ctrl+K, Ctrl+Shift+N, etc.) |
| **Smooth Animations** | Fade-in, slide-up, and typing effects |

### 📊 Analytics & Feedback
| Feature | Description |
|---------|-------------|
| **Stats Bar** | Track query count, response time, and source count |
| **Feedback Buttons** | Thumbs up/down on AI responses |
| **Response Timing** | See how fast each response was generated |

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) with App Router & Turbopack
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) + Custom Animations
- **Components**: Custom UI components with shadcn/ui patterns
- **Icons**: [Lucide React](https://lucide.dev/)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes)

### Backend & AI
- **Vector Database**: [Upstash Vector](https://upstash.com/docs/vector/overall/getstarted)
- **LLM Provider**: [Groq](https://groq.com/) (Llama model)
- **API Routes**: Next.js Route Handlers

### DevOps
- **Deployment**: [Vercel](https://vercel.com/)
- **Version Control**: Git + GitHub
- **Package Manager**: pnpm

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Upstash account (for Vector DB)
- Groq API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aleeyaahmad5/v0-food-rag-web-app.git
   cd v0-food-rag-web-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your API keys:
   ```env
   UPSTASH_VECTOR_REST_URL=your_upstash_vector_url
   UPSTASH_VECTOR_REST_TOKEN=your_upstash_vector_token
   GROQ_API_KEY=your_groq_api_key
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` | Focus search input |
| `Ctrl + Shift + N` | Start new chat |
| `Enter` | Send message |
| `?` | Toggle shortcuts help |
| `Esc` | Close dialogs |

---

## 📁 Project Structure

```
v0-food-rag-web-app/
├── app/
│   ├── api/rag/          # RAG API endpoint
│   ├── globals.css       # Global styles & animations
│   ├── layout.tsx        # Root layout with providers
│   └── page.tsx          # Main chat interface
├── components/
│   ├── ui/               # Base UI components
│   ├── chat-history.tsx  # Chat history sidebar
│   ├── chat-message.tsx  # Message display component
│   ├── header.tsx        # App header with controls
│   ├── footer.tsx        # App footer
│   ├── particle-background.tsx  # Animated background
│   ├── keyboard-shortcuts.tsx   # Shortcuts modal
│   ├── export-share.tsx  # Export functionality
│   ├── feedback-buttons.tsx     # Like/dislike buttons
│   └── stats-bar.tsx     # Statistics display
├── lib/
│   └── utils.ts          # Utility functions
└── public/               # Static assets
```

---

## 🔧 How RAG Works

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   User      │────▶│  Upstash     │────▶│   Groq      │
│   Query     │     │  Vector DB   │     │   LLM       │
└─────────────┘     │  (Retrieval) │     │ (Generation)│
                    └──────────────┘     └─────────────┘
                           │                    │
                           ▼                    ▼
                    ┌──────────────┐     ┌─────────────┐
                    │  Relevant    │────▶│  Contextual │
                    │  Sources     │     │  Response   │
                    └──────────────┘     └─────────────┘
```

1. **Query Processing**: User question is converted to embeddings
2. **Vector Search**: Upstash finds semantically similar documents
3. **Context Building**: Relevant sources are compiled with the query
4. **LLM Generation**: Groq generates a response using retrieved context
5. **Response Delivery**: Answer + sources displayed to user

---

## 🎨 Screenshots

### Light Mode
> Clean, modern interface with gradient accents and particle effects

### Dark Mode
> Eye-friendly dark theme for comfortable nighttime use

### Chat History
> Organize and switch between multiple conversations

### Mobile Responsive
> Fully optimized for mobile devices

---

## 📈 Performance

- ⚡ **Fast Response Times**: Groq's LPU delivers sub-second inference
- 🎯 **Accurate Retrieval**: Vector similarity ensures relevant sources
- 📱 **Lighthouse Score**: 90+ on Performance, Accessibility, Best Practices
- 🌐 **Edge Deployment**: Vercel Edge for global low-latency access

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Aleeya Ahmad**

- GitHub: [@aleeyaahmad5](https://github.com/aleeyaahmad5)

---

## 🙏 Acknowledgments

- [Upstash](https://upstash.com/) for the serverless vector database
- [Groq](https://groq.com/) for lightning-fast LLM inference
- [Vercel](https://vercel.com/) for seamless deployment
- [shadcn/ui](https://ui.shadcn.com/) for component patterns
- [Lucide](https://lucide.dev/) for beautiful icons

---

<div align="center">

**⭐ Star this repo if you found it helpful!**

Made with ❤️ and lots of ☕

</div>
