# AI Compiler for Software Generation

**AI Compiler for Software Generation** (formerly Nexus Builder) is a deterministic orchestration engine designed to transform natural language product intents into fully validated, executable software specifications. It bridges the gap between high-level human requirements and low-level technical architecture.

## 🏗️ System Architecture

The engine operates as a **Multi-Stage Compilation Pipeline**, ensuring that every design decision is validated before proceeding to the next layer of the stack.

### 1. Intent Analysis Layer (`intent.ts`)
- **Role**: Natural Language Understanding (NLU).
- **Function**: Extracts core entities, user roles, business rules, and technical constraints from the user's prompt.
- **Output**: Structured `UserIntent` object.

### 2. Architecture Synthesis Layer (`design.ts`)
- **Role**: High-level system design.
- **Function**: Maps the intent to a formal software architecture. It defines the database schema, API routing map, and UI page hierarchy.
- **Output**: `Architecture` specification.

### 3. Specification Generation Layer (`generator.ts`)
- **Role**: Code & Config Synthesis.
- **Function**: Transforms the architecture into a granular `AppSpec`. This includes detailed field types, validation rules for every form, and specific logic for every API endpoint.
- **Output**: `AppSpec` (The "Binary" of our software generation).

### 4. Deterministic Refinement (`refine.ts`)
- **Role**: Optimization.
- **Function**: Performs cross-layer checks (e.g., ensuring a UI field has a corresponding database column). It fills in missing technical details like timestamps, UUIDs, and foreign key relationships.

### 5. Self-Healing & Repair (`repair.ts`)
- **Role**: Resiliency.
- **Function**: If any stage fails validation (via `validation.ts`), the Repair Engine analyzes the failure and applies automated fixes to the specification without requiring a full re-generation.

### 6. Validation & Integrity (`validation.ts`)
- **Role**: Quality Assurance.
- **Function**: Runs a suite of 50+ architectural checks to ensure the generated software is 100% consistent and bug-free.

---

## 🚀 Key Features

- **Deterministic Logic**: Unlike standard AI prompts, this compiler uses a structured pipeline that ensures consistent results every time.
- **Self-Repairing**: Automatically fixes architectural mismatches during the build process.
- **Vibrant Dashboard**: A professional, high-fidelity UI for monitoring the compilation stages in real-time.
- **Provider Agnostic**: Supports **Gemini Pro 1.5** and **GPT-4o**, with a local deterministic fallback mode.

---

## 🛠️ Getting Started

### 1. Installation
```bash
npm install
```

### 2. Configuration
Create a `.env.local` file and add your API keys:
```env
GEMINI_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the compiler dashboard.

### 4. Run Benchmarks
To evaluate the compiler's performance against the edge-case dataset:
```bash
npm test
```

## 📜 License
Internal Development - All Rights Reserved.
