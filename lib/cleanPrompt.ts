export function cleanPromptFormatting(text: string): string {
  if (!text) return "";

  return text
    // 1. Remove markdown heading hashes at the beginning of lines: e.g. "### Role:" -> "ROLE:"
    .replace(/^#{1,6}\s*(?!include\b)(.+)$/gm, (_match, title) => {
      const cleaned = title.trim();
      return cleaned.endsWith(":") ? cleaned.toUpperCase() : `${cleaned.toUpperCase()}:`;
    })
    // 2. Convert bullet asterisks at the start of lines to clean hyphens
    .replace(/^(\s*)\*\s+/gm, "$1- ")
    // 3. Remove bold/italic markdown asterisks (e.g. "**Role:**" -> "Role:", "**Note**" -> "Note")
    .replace(/\*{2,3}([^*]+)\*{2,3}/g, "$1")
    .replace(/\*([^*\n\r]+)\*/g, "$1")
    // 4. Remove any remaining stray asterisks used as decorators or bullets
    .replace(/(?<!\d)\s*\*\s*(?!\d)/g, " ")
    .replace(/^\s*#+\s*$/gm, "")
    // 5. Clean up multiple blank lines
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
