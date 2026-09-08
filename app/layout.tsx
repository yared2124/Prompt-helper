import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://prompt-helper.vercel.app"),
  title: "promptHelper — AI Prompt Architect & Token Optimizer",
  description:
    "Transform casual goals into high-impact, token-efficient prompts tailored for Claude, ChatGPT, Gemini, DeepSeek, and more. Built with Next.js 14 and Gemini 3.7 Flash.",
  keywords: [
    "Prompt Engineering",
    "Token Optimizer",
    "Claude Prompts",
    "ChatGPT Prompt Helper",
    "Gemini 3.7 Flash",
    "DeepSeek R1 Prompts",
    "Developer Tools",
    "Next.js Portfolio",
  ],
  authors: [{ name: "promptHelper Team" }],
  openGraph: {
    title: "promptHelper — AI Prompt Architect & Token Optimizer",
    description:
      "Craft production-grade, token-efficient prompts for 10+ AI models across 12 domains. Zero fluff, strict XML/Markdown schemas, and direct AI launcher.",
    type: "website",
    locale: "en_US",
    siteName: "promptHelper",
  },
  twitter: {
    card: "summary_large_image",
    title: "promptHelper — AI Prompt Architect & Token Optimizer",
    description:
      "Craft production-grade prompts for Claude, ChatGPT, Gemini, and DeepSeek. Built with Next.js & Gemini 3.7 Flash.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Anti-Flicker Theme Script: sets .dark class synchronously before render */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('prompthelper_theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${lora.variable} ${inter.className} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
