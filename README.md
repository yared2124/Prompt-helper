# ⚡ promptHelper — AI-Native Prompt Architect

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-14.2-black?logo=next.js" alt="Next.js"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript" alt="TypeScript"></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css" alt="Tailwind CSS"></a>
  <a href="https://ai.google.dev/"><img src="https://img.shields.io/badge/Powered%20By-Gemini%203.7%20Flash-4285F4?logo=google" alt="Gemini"></a>
  <a href="https://jestjs.io/"><img src="https://img.shields.io/badge/Tests-79%20Passed-brightgreen?logo=jest" alt="Jest Tests"></a>
</p>

<p align="center">
  <strong>Stop wasting tokens with casual, ambiguous prompts.</strong><br>
  Tell <em>promptHelper</em> what you want in plain words — we transform it into an optimized, model-specific prompt tailored for Claude, ChatGPT, Gemini, DeepSeek, and more.
</p>

---

## 🌟 Why promptHelper?

Different foundation models adhere to fundamentally different prompting idioms:
- **Claude** adheres with extreme fidelity to semantic XML structures (`<context>`, `<instructions>`, `<requirements>`).
- **ChatGPT / OpenAI** thrives on Markdown headings, role definitions, and strict JSON schemas.
- **DeepSeek** excels when rigorous chain-of-thought and mathematical/algorithmic logic are enforced.
- **Gemini** leverages multi-turn contextual reasoning, data tables, and structured guidelines.

**promptHelper bridges this gap automatically.**

---

## 🚀 Key Features

- 🎯 **10 AI Foundation Models**: Claude 3.7 Sonnet, ChatGPT (GPT-4o), Gemini 3.7 Flash, DeepSeek-R1, Grok-2, Mistral Large, LLaMA 3.3, Perplexity, Cohere Command R+, and Qwen 2.5.
- 📂 **12 Specialized Domains**: Coding & Dev, Education, Creative Writing, Research & Analysis, Business, Art & Design, Data & Analytics, AI & Automation, Health, Language, Legal, and Productivity.
- 🧠 **4 Prompting Strategies**:
  - **Standard Smart**: Balanced clarity, role definition, and output formatting.
  - **Token Saver**: 30%–50% token compression eliminating filler while preserving technical depth.
  - **Production Strict**: Strict types, edge-case handling, error states, and unit test requirements.
  - **Deep Reasoning**: Chain-of-thought analysis, step-by-step logic, and self-verification.
- 📊 **Real-time Prompt Analytics**: Token count before & after, savings percentage, and automated detection of roles, constraints, and output schemas.
- 💾 **Local Prompt Library**: Save, organize, export (JSON), and copy generated prompts directly in your browser with zero server database overhead.
- 🎨 **Adaptive Design System**: Dark/Light mode with glowing per-model aesthetics, glassmorphism blur, and full mobile responsiveness.
- 🛡️ **Production-Hardened**: Security headers, non-printable character sanitization, 25s timeouts, multi-model fallback chain, and custom error boundaries.

---

## 🧪 Testing & Reliability

The project features an automated testing suite built with **Jest** and **React Testing Library**:

- **79 Unit & Integration Tests (100% Pass Rate)**
- Pure utility tests (`estimateTokens`, `sanitizeInput`, `withTimeout`)
- Schema & data integrity validation for all models, domains, and strategies
- React component UI and accessibility testing
- API route verification with simulated Gemini client responses

```bash
npm test
```

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **AI Engine**: [Google Gemini 3.7 Flash API](https://ai.google.dev/) (`@google/genai`)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/)

---

## 📁 Project Structure

```
Prompt-helper/
├── __tests__/                  ← Jest & RTL test suites (79 tests)
│   ├── api-generate.test.ts
│   ├── components.test.tsx
│   ├── data.test.ts
│   ├── setup.ts
│   ├── types.test.ts
│   └── utils.test.ts
├── app/
│   ├── api/generate/route.ts   ← Gemini API endpoint with fallback chain
│   ├── error.tsx               ← Client-side error boundary
│   ├── loading.tsx             ← Hydration skeleton
│   ├── not-found.tsx           ← Branded 404 page
│   ├── opengraph-image.tsx     ← Edge-rendered dynamic OG image
│   ├── robots.ts               ← SEO robots exclusion
│   ├── sitemap.ts              ← Dynamic sitemap
│   ├── layout.tsx              ← Root layout with serif & sans fonts
│   └── page.tsx                ← Interactive application page
├── components/                 ← Reusable UI components
├── data/                       ← Models & domain data configurations
├── hooks/                      ← Custom React hooks (library & generator)
├── types/                      ← TypeScript interfaces
└── jest.config.ts              ← Jest testing configuration
```

---

## 🏁 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/yared2124/Prompt-helper.git
cd Prompt-helper
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
> Get a free API key at [Google AI Studio](https://aistudio.google.com/).

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
