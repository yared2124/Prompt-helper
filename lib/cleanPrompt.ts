export function cleanPromptFormatting(text: string): string {
  if (!text) return "";

  let cleaned = text;

  // 0. Remove raw JSON object wrappers or escaped string artifacts if present
  // e.g. '{\n  "enhancedPrompt": "ROLE:\n...' -> 'ROLE:\n...'
  cleaned = cleaned.replace(/^\s*\{\s*"enhancedPrompt"\s*:\s*"?/i, "");
  // Remove trailing JSON keys or closing brackets if truncated or raw JSON
  cleaned = cleaned.replace(/"\s*(?:,\s*"tips"[\s\S]*)?\}?\s*$/i, "");
  cleaned = cleaned.replace(/"\s*$/i, "");

  // If text contains escaped literal newlines ("\n") and escaped quotes, unescape them
  if (cleaned.includes("\\n") || cleaned.includes('\\"')) {
    cleaned = cleaned
      .replace(/\\r\\n/g, "\n")
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"')
      .replace(/\\t/g, "  ")
      .replace(/\\\\/g, "\\");
  }

  return cleaned
    // 1. Remove markdown heading hashes at the beginning of lines: e.g. "### Role:" -> "ROLE:"
    .replace(/^#{1,6}\s*(?!include\b)(.+)$/gm, (_match, title) => {
      const trimmed = title.trim();
      return trimmed.endsWith(":") ? trimmed.toUpperCase() : `${trimmed.toUpperCase()}:`;
    })
    // 2. Remove all other stray hashes (e.g. "Step #1" -> "Step 1") while preserving #include
    .replace(/(?!#include\b)#+/g, "")
    // 3. Convert bullet asterisks at the start of lines to clean hyphens
    .replace(/^(\s*)\*\s+/gm, "$1- ")
    // 4. Remove all remaining asterisks (bold, italics, decorators)
    .replace(/\*+/g, "")
    // 5. Clean up multiple blank lines
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
