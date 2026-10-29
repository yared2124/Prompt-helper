export function cleanPromptFormatting(text: string): string {
  if (!text) return "";
  return text
    .replace(/^#{1,6}\s+(.+)$/gm, (_m, title: string) => {
      const t = title.trim();
      return t.endsWith(":") ? t.toUpperCase() : `${t.toUpperCase()}:`;
    })
    .replace(/^(\s*)\*\s+/gm, "$1- ")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
