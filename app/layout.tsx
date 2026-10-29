import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://prompt-helper.vercel.app"),
  title: "promptHelper",
  description:
    "Turn a rough request into a structured prompt for Claude, ChatGPT, Gemini, DeepSeek and others.",
  openGraph: {
    title: "promptHelper",
    description:
      "Turn a rough request into a structured prompt for the model you use.",
    type: "website",
    siteName: "promptHelper",
  },
  twitter: { card: "summary_large_image", title: "promptHelper" },
};

const themeScript = `
(function () {
  try {
    var saved = localStorage.getItem('prompthelper_theme');
    var dark = saved ? saved === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${sans.variable} ${mono.variable} font-sans antialiased`}>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
