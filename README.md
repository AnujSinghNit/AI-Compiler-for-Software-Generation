# AI Compiler for Software Generation

**AI Compiler for Software Generation** is a deterministic orchestration engine designed to bridge the gap between high-level human intent and executable technical specifications. Unlike standard LLM wrappers, this system treats software generation like a compilation process, passing your requirements through multiple validation layers to produce a consistent, bug-free application blueprint. It was built to solve the "hallucination" problem in AI-driven coding by enforcing strict architectural rules and automated self-healing logic.

## 🚀 Overview
Building software often starts with a messy set of requirements. This project automates the transition from "idea" to "architecture" by synthesizing natural language into a structured specification. It doesn't just write snippets; it designs the entire stack—including database schemas, API routes, and UI hierarchies. The engine ensures that if you ask for a "Payment System," it creates the necessary database columns, auth roles, and API endpoints automatically, then validates them to ensure they all link together correctly.

## ✨ Features
- **NLU Requirement Extraction**: Deep parsing of user prompts to identify entities, roles, and business logic.
- **Multi-Stage Compilation**: A structured pipeline that moves from Intent -> Architecture -> App Specification.
- **Automated Self-Healing**: Detects logical inconsistencies (like a missing foreign key) and applies repairs automatically.
- **Full-Stack Schema Generation**: Produces complete blueprints for SQL/NoSQL databases and RESTful API maps.
- **Real-time Monitoring**: A high-fidelity dashboard that lets you watch the compiler "think" and design your system.

## 🛠 Tech Stack
- **Frontend**: Next.js 16 (App Router), Vanilla CSS (Custom Design System), Lucide Icons.
- **Orchestration**: TypeScript, Zod (Schema Validation), Vitest (Unit Testing).
- **AI Core**: Google Gemini 1.5 Pro & OpenAI GPT-4o integration.
- **Environment**: Node.js, NPM.

## ⚙️ How It Works
1. **Intent Phase**: The user enters a product description. The engine identifies key "nouns" (entities) and "verbs" (actions).
2. **Design Phase**: The system synthesizes a formal architecture, mapping out how data should flow between pages.
3. **Spec Phase**: A granular JSON specification is generated, defining every field type and API requirement.
4. **Validation Phase**: The compiler runs 50+ integrity checks to ensure the design is technically sound.
5. **Finalization**: The system outputs a validated specification ready for a code-gen or deployment layer.

## ⚡ Installation & Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/AnujSinghNit/AI-Compiler-for-Software-Generation.git
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Environment Variables**:
   Create a `.env.local` file in the root and add:
   ```env
   GEMINI_API_KEY=your_key_here
   ```
4. **Launch the Dashboard**:
   ```bash
   npm run dev
   ```

## 🎮 Usage
- **Step 1**: Type your application idea into the "Product Intent" box (e.g., "A school management system with student grades and attendance").
- **Step 2**: Click **"Run Build"**.
- **Step 3**: Monitor the **Pipeline Stages** on the left to see the compiler process your intent.
- **Step 4**: View the generated **Architecture** and **JSON Spec** in the dashboard tabs.

## 🔮 Future Improvements
- **Direct Export**: One-click export to a production-ready React/Node.js codebase.
- **Database Visualizer**: An interactive ER diagram to visualize the generated schemas.
- **Multi-Agent Collaboration**: Using separate agents for Security, UX, and Database optimization.

---

## 📐 Project Architecture

```ascii
      +-------------------------+
      |    User Input (NLU)     |
      +------------+------------+
                   |
                   v
      +------------+------------+
      |   Next.js Dashboard     | <--- Real-time State Updates
      +------------+------------+
                   |
           [ API Requests ]
                   |
                   v
      +------------+------------+      +---------------------+
      |  Compilation Engine     +----->|  LLM Layer (Gemini) |
      +------------+------------+      +---------------------+
                   |
       [ Deterministic Pipeline ]
       |           |           |
       v           v           v
  +---------+  +---------+  +---------+
  | Intent  |  | Design  |  | Repair  |
  | Mapping |  | Logic   |  | Engine  |
  +---------+  +---------+  +---------+
                   |
                   v
      +------------+------------+
      |  Validated App Spec     |
      | (DB / API / UI Schema)  |
      +-------------------------+
```

**Data Flow Summary:**
1. **Input**: User intent is captured via the Next.js frontend.
2. **Orchestration**: The TypeScript engine sends the intent to the LLM layer for initial synthesis.
3. **Refinement**: The raw AI output is passed through Zod validation and a custom Repair Engine to fix any hallucinated errors.
4. **Output**: The final, validated specification is displayed to the user and can be used for downstream generation.
