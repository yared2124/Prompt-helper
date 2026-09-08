# PromptCraft — AI Prompt Helper

A beautiful, dark-themed web app that helps you craft perfect, token-efficient prompts for any AI model.

## Features

- 🎯 **10 AI Models** — Claude, ChatGPT, Gemini, Grok, Mistral, LLaMA, Perplexity, Cohere, DeepSeek, Qwen
- 📂 **12 Domains** — Coding, Education, Writing, Research, Business, Art, Data, AI, Health, Language, Legal, Productivity
- ✨ **AI-Powered** — Uses Gemini 2.5 Flash to generate optimized prompts
- 💾 **Browser Library** — Save and manage your prompts (localStorage)
- 📊 **Token Counter** — See before/after token estimates
- 💡 **Expert Tips** — Contextual tips per AI + domain combo
- 🎨 **Glassmorphism UI** — Beautiful dark theme with animated backgrounds

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Add your Gemini API key
```bash
cp .env.local.example .env.local
```
Edit `.env.local` and add your key:
```
GEMINI_API_KEY=your_key_here
```
Get a free key at: https://aistudio.google.com/app/apikey

### 3. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. **Choose AI** — Select which AI you're writing the prompt for (Claude, ChatGPT, Gemini, etc.)
2. **Choose Domain** — Pick your topic area (Coding, Education, Business, etc.)
3. **Describe your goal** — Type what you want in plain language
4. **Generate** — Get a perfectly structured, token-efficient prompt tailored to your chosen AI
5. **Copy & Save** — Copy to clipboard or save to your browser library

## Tech Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** (glassmorphism dark theme)
- **Google Gemini API** (`@google/genai`) — prompt generation engine
- **Lucide React** — icons
- **localStorage** — browser-based prompt library

## Project Structure

```
Prompt-helper/
├── app/
│   ├── api/generate/route.ts   ← Gemini API endpoint
│   ├── layout.tsx
│   ├── page.tsx                ← Main app page
│   └── globals.css
├── components/
│   ├── Header.tsx
│   ├── AISelector.tsx          ← 10 AI model cards
│   ├── DomainSelector.tsx      ← 12 domain chips
│   ├── PromptInput.tsx         ← Goal input + generate button
│   ├── PromptOutput.tsx        ← Enhanced prompt + token stats
│   └── PromptLibrary.tsx       ← Saved prompts drawer
├── data/
│   ├── aiModels.ts             ← AI model configs
│   └── domains.ts              ← Domain categories
├── hooks/
│   ├── usePromptGenerator.ts   ← API call logic
│   └── useLibrary.ts           ← localStorage management
└── types/index.ts              ← TypeScript types
```
