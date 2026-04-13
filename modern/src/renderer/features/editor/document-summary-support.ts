import type { DocumentWordCount, HeadingItem } from './types'

export const extractHeadingItems = (markdown: string): HeadingItem[] => {
  return markdown
    .split(/\r?\n/)
    .filter(line => /^#{1,6}\s/.test(line))
    .map(line => ({
      depth: line.match(/^#+/)?.[0].length ?? 1,
      text: line.replace(/^#{1,6}\s*/, '')
    }))
}

export const calculateWordCount = (markdown: string): DocumentWordCount => {
  const words = markdown.trim().match(/\S+/g)

  return {
    word: words ? words.length : 0,
    paragraph: markdown.split(/\n{2,}/).filter(line => line.trim()).length,
    character: markdown.length,
    all: markdown.length
  }
}

export const summarizeMarkdown = (markdown: string) => {
  return {
    headings: extractHeadingItems(markdown),
    lineCount: markdown.length === 0 ? 1 : markdown.split(/\r?\n/).length,
    wordCount: calculateWordCount(markdown)
  }
}
