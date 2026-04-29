# AI Compiler for Software Generation

This project is a deterministic engine that turns natural language into validated software architectures. Instead of just "guessing" code, it runs a multi-stage compilation pipeline to design databases, API routes, and UI structures that actually work together.

## 🚀 What it does
- **Architectural Synthesis**: Converts a simple sentence into a full technical spec.
- **Self-Healing Engine**: Automatically detects and fixes schema mismatches.
- **Pipeline Monitoring**: Real-time dashboard to watch the compiler design your app.
- **Provider Choice**: Swappable LLM cores (Gemini 1.5 Pro / GPT-4o).

## 🛠 Tech Stack
- **Engine**: TypeScript, Zod, Vitest.
- **Frontend**: Next.js 16 (App Router), Lucide, Vanilla CSS.
- **AI**: Google Generative AI / OpenAI SDKs.

## ⚡ Quick Start
1. **Clone & Install**: `npm install`
2. **Configure**: Add `GEMINI_API_KEY` to `.env.local`.
3. **Launch**: `npm run dev`

Visit `localhost:3000` to start building.
