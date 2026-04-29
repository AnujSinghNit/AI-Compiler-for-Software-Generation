# Nexus Builder

**Nexus Builder** is a deterministic engine for generating full-stack application architectures from natural language intent. It transforms product descriptions into validated, executable application specifications.

## Core Features

- **Intent Analysis**: Extracts requirements and identifies conflicts from natural language prompts.
- **Architectural Design**: Designs entities, roles, and system flows based on intent.
- **Spec Generation**: Compiles detailed UI, API, and Database schemas.
- **Self-Healing**: A multi-stage validation and repair pipeline that ensures 100% execution readiness.
- **Benchmarking**: Integrated performance analysis against a standardized dataset.

## Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set Environment Variables**:
   Create a `.env` file with your API keys (optional):
   ```bash
   GEMINI_API_KEY=your_key
   OPENAI_API_KEY=your_key
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

Open `http://localhost:3000` to access the Nexus Builder dashboard.

## Development

### Core Logic
The engine is located in `src/lib/engine/`. It follows a strictly decoupled pipeline:
- `intent.ts`: Parsing and conflict detection.
- `design.ts`: Architectural mapping.
- `generator.ts`: Schema compilation.
- `validation.ts` & `repair.ts`: Integrity checks and automated fixes.

### Benchmarks
Run the evaluation suite to measure performance:
```bash
npm run test
npm run eval
```

Evaluation reports are generated in `artifacts/benchmarks/`.

## Architecture Principles

1. **Determinism**: The engine provides a fallback mode that works without external LLMs, ensuring reliability.
2. **Layered Validation**: We validate not just schema but cross-layer dependencies (e.g., ensuring API endpoints match database columns).
3. **Targeted Repair**: Instead of regenerating entire specifications, the system identifies and fixes specific issues, drastically reducing latency and cost.
4. **Execution Simulation**: The final output includes an execution report proving sitemap and API connectivity.
