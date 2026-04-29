# AI Compiler for Software Generation

A deterministic engine designed to turn natural language into validated, production-ready software architectures. It uses a multi-stage compilation pipeline to generate database schemas, API maps, and UI structures that are technically consistent and ready for execution.

## 🚀 Key Features
- **Intent Synthesis**: Translates human language into structured technical requirements.
- **Self-Healing Pipeline**: Automatically detects and fixes architectural gaps during the build process.
- **Full-Stack Specs**: Generates comprehensive JSON blueprints for DB, API, and UI layers.
- **Live Dashboard**: Real-time monitoring of the compilation stages via a premium UI.

## 🛠 Tech Stack
- **Engine**: TypeScript, Zod, Vitest.
- **Frontend**: Next.js 16 (App Router), Vanilla CSS.
- **AI Core**: Google Gemini 1.5 Pro / GPT-4o.

## ⚡ Quick Start
1. `npm install`
2. Add `GEMINI_API_KEY` to `.env.local`.
3. `npm run dev`

---

## 📐 Project Architecture

```ascii
[ User Input ] --> [ Next.js Dashboard ]
                          |
                          v
             [ AI Orchestration Engine ]
            /            |            \
     (LLM Layer)   (Zod Validation)   (Self-Healing)
            \            |            /
                         v
             [ Final App Specification ]
             /           |           \
     { DB Schema }   { API Map }   { UI Pages }
```

**Flow:**
1. **Frontend**: Collects user intent through a React-based dashboard.
2. **Engine**: Processes intent through a multi-stage validation pipeline.
3. **Synthesis**: Generates a unified JSON spec for the entire application stack.
