export interface ParsedChapter {
  chapter_number: number;
  title: string;
  slug: string;
  content: string;
  word_count: number;
}

export interface ParseResult {
  chapters: ParsedChapter[];
  errors: string[];
}

/**
 * Parse a multi-chapter markdown/text file.
 *
 * Supported chapter heading formats:
 *   # Chapter 1: Title
 *   ## Chapter 2 - Title
 *   Chapter 3: Title          (bare line, no markdown)
 *   Chapter 4 Title           (bare line, no separator)
 */
const CHAPTER_HEADING = /^(?:#+\s*)?chapter\s+(\d+)(?:[:\-–—]\s*(.+))?$/i;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function parseChapters(raw: string): ParseResult {
  const lines = raw.split(/\r?\n/);
  const errors: string[] = [];
  const chapters: ParsedChapter[] = [];

  let currentNumber: number | null = null;
  let currentTitle = "";
  let contentLines: string[] = [];

  function flush() {
    if (currentNumber === null) return;
    const content = contentLines.join("\n").trim();
    if (!content) {
      errors.push(`Chapter ${currentNumber} has no content.`);
    } else {
      const title = currentTitle || `Chapter ${currentNumber}`;
      chapters.push({
        chapter_number: currentNumber,
        title,
        slug: slugify(title),
        content,
        word_count: countWords(content),
      });
    }
  }

  for (const line of lines) {
    const match = line.trim().match(CHAPTER_HEADING);
    if (match) {
      flush();
      currentNumber = parseInt(match[1], 10);
      currentTitle = match[2]?.trim() ?? `Chapter ${currentNumber}`;
      contentLines = [];
    } else if (currentNumber !== null) {
      contentLines.push(line);
    }
  }

  flush();

  if (chapters.length === 0) {
    errors.push("No chapters found. Make sure each chapter starts with a heading like 'Chapter 1: Title'.");
  }

  return { chapters, errors };
}
