# AI Compiler for Software Generation

A deterministic engine that turns natural language into validated, production-ready software architectures. Instead of just generating snippets, it builds a complete technical spec including database schemas, API routes, and UI structures by running your intent through a multi-stage validation pipeline.

## 🚀 Key Features
- **NLU Intent Extraction**: Parses human language into structured technical requirements.
- **Self-Healing Pipeline**: Automatically fixes architectural bugs and schema mismatches during generation.
- **Spec Generation**: Outputs a complete JSON blueprint for the entire application stack.
- **Real-time Dashboard**: High-fidelity UI to monitor every step of the compilation process.

## 🛠 Tech Stack
- **Frontend**: Next.js 16 (App Router), Vanilla CSS, Lucide Icons.
- **Engine**: TypeScript, Zod (Validation), Vitest.
- **AI Models**: Google Gemini 1.5 Pro & GPT-4o.

## 🧠 How it Works
1. **Input**: You provide a product description (e.g., "A CRM with dashboard and payments").
2. **Analysis**: The engine breaks this down into core entities and user roles.
3. **Synthesis**: It generates a full architecture, including data models and API endpoints.
4. **Validation**: The "Compiler" checks for logic gaps or missing relationships.
5. **Final Spec**: You get a fully validated, executable JSON specification.

## ⚡ Setup
1. **Clone & Install**:
   ```bash
   npm install
   ```
2. **Environment**: Add your keys to `.env.local`:
   ```env
   GEMINI_API_KEY=your_api_key
   ```
3. **Run**: 
   ```bash
   npm run dev
   ```

---

## 📐 Project Architecture

```ascii
[ User Input ]  -->  [ Next.js Dashboard ]
                           |
                           v
              [ AI Orchestration Engine ]
             /             |             \
    (Gemini/GPT)   (Zod Validation)   (Self-Healing Logic)
             \             |             /
                           v
               [ App Specification JSON ]
               /           |            \
      { Database }    { API Map }    { UI Pages }
```

**Flow Description:**
1. **Frontend**: Collects natural language intent via a React-based dashboard.
2. **Engine**: Hand-off to the TypeScript core which orchestrates LLM calls and validation.
3. **APIs**: The engine synthesizes a full API map based on the detected entities.
4. **Validation**: Zod ensures the generated JSON matches the required software standards.
