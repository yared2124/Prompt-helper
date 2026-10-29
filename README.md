# promptHelper

Turn a rough request into a structured, model-specific prompt, then refine it and test it before you use it.

[Live demo](https://prompt-helper.vercel.app) · [Report an issue](https://github.com/yared2124/Prompt-helper/issues)

---

## Overview

Prompts that work well on one model often work poorly on another. Claude responds well to XML-tagged sections, ChatGPT to labelled headings, and DeepSeek to explicit reasoning steps. promptHelper takes a plain-language goal and rewrites it into a prompt shaped for the model you choose.

You pick a target model, a domain, and an optimization strategy. The app generates the prompt, lets you refine it, and lets you run it against a live model so you can compare it with your original wording.

## Features

- **10 target models.** Claude, ChatGPT, Gemini, DeepSeek, Grok, Mistral, LLaMA, Perplexity, Cohere and Qwen, each with its own prompt structure.
- **12 domains.** Coding, education, creative writing, research, business, art and design, data, AI and automation, health, language, legal and finance, and productivity.
- **4 strategies.** Standard Smart, Token Saver, Production Strict and Deep Reasoning.
- **AI refinement.** One-click adjustments (make more concise, add edge cases, add examples, beginner friendly, strict schema only, deep reasoning) or your own instruction, with undo.
- **Live sandbox.** Run the generated prompt and compare its output with the output of your original request.
- **Analysis.** Estimated token counts before and after, and checks for a role, constraints and an output format.
- **Local library.** Save prompts in your browser, then import or export them as JSON. Nothing is stored on a server.
- **Export and launch.** Copy the prompt, download it as Markdown or JSON, or copy it and open the target model's website.
- **Light and dark themes.** The choice is saved in your browser.

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| AI | Google Gemini via `@google/genai` |
| Icons | lucide-react |
| Testing | Jest and React Testing Library |
| Hosting and analytics | Vercel, Vercel Analytics, Speed Insights |

## Getting started

### Requirements

- Node.js 18.17 or later
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### Installation

```bash
git clone https://github.com/yared2124/Prompt-helper.git
cd Prompt-helper
npm install
```

### Configuration

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your_api_key_here
```

The key is read only on the server, in the API routes. Never prefix it with `NEXT_PUBLIC_`.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run the test suite |
| `npm run test:coverage` | Run tests with a coverage report |

## Project structure

```
app/
  api/
    generate/      Build a prompt from a request
    refine/        Apply a refinement instruction to a prompt
    test-prompt/   Run a prompt against the model (sandbox)
  layout.tsx       Root layout, fonts, metadata, theme script
  page.tsx         Main application page
components/        UI components (selectors, input, output, library)
data/              Model, domain, strategy and refinement definitions
hooks/             usePromptGenerator, useLibrary
lib/               cleanPrompt (output formatting), rateLimit
types/             Shared TypeScript types
__tests__/         Jest test suites
```

## API

All routes accept `POST` with a JSON body and return JSON. Errors have the shape `{ "error": "message" }`.

### `POST /api/generate`

| Field | Type | Notes |
| --- | --- | --- |
| `userInput` | string | Required, 3 to 2,000 characters |
| `aiModelId` | string | Required, for example `claude` |
| `domainId` | string | Required, for example `coding` |
| `strategyId` | string | Optional, defaults to the standard strategy |
| `targetModel` | string | Optional specific model variant |

Returns `enhancedPrompt`, `tips`, token estimates and analysis metrics.

### `POST /api/refine`

| Field | Type | Notes |
| --- | --- | --- |
| `currentPrompt` | string | Required, up to 12,000 characters |
| `refinementInstruction` | string | Required, up to 1,000 characters |
| `aiModelId`, `domainId` | string | Optional context |

### `POST /api/test-prompt`

| Field | Type | Notes |
| --- | --- | --- |
| `prompt` | string | Required, up to 6,000 characters |
| `originalInput` | string | Optional, up to 2,000 characters |
| `compareOriginal` | boolean | Also run the original request for comparison |

### Rate limits

Requests are limited per client IP: 10 per minute on `generate` and `refine`, and 5 per minute on `test-prompt`. Over the limit, the API returns `429` with a `Retry-After` header. The limiter is in memory, so for a public deployment also add a rate-limit rule in your host's firewall.

## Testing

```bash
npm test
```

The suite covers utility functions, data integrity for models, domains and strategies, the prompt-formatting logic, the rate limiter, UI components, and the API routes using a mocked Gemini client.

## Deployment

The project is set up for [Vercel](https://vercel.com/).

1. Import the repository.
2. Add `GEMINI_API_KEY` under Environment Variables.
3. Deploy.

## Security notes

- The Gemini key stays on the server and is never sent to the browser.
- Inputs are length-limited and stripped of control characters.
- Responses include `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` and `Permissions-Policy` headers.
- Saved prompts live only in your browser's local storage.
- Prompts you generate or test are sent to Google's Gemini API, so don't enter secrets or confidential data.

## Known limitations

- Token counts are estimates (about 4 characters per token), not exact tokenizer results.
- Generated prompts are often longer than the original request. The goal is clarity and structure, not shorter text.
- The sandbox runs prompts on Gemini, so its output shows how a prompt performs there, not on every target model.
- Output quality depends on the model and can vary between runs, so review a prompt before relying on it.

## Contributing

Issues and pull requests are welcome. Before opening a pull request, please run:

```bash
npm run lint
npm test
```

## License

Released under the [MIT License](LICENSE).

© 2026 prompt Helper. All rights reserved.